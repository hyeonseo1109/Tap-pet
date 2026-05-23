import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@shared/api";
import { xpLevel } from "@entities/character/lib/xpLevel";
import {
  getPetXp,
  stageLabel,
  xpCategoryLabels,
  getCategoryXp,
  type XpCategory,
  type Pet,
} from "@entities/character/model";
import * as styles from "./style.css";

type FriendProfile = {
  id: string;
  nickname: string;
  share_details: boolean;
  main_pet?: Pet;
};

type FriendWidgetProps = {
  onlineFriendIds: Set<string>;
  hiddenOverlayIds: Set<string>;
  onShowFriend: (id: string) => void;
  onFriendsChange?: () => void;
};

export const FriendWidget = ({
  onlineFriendIds,
  hiddenOverlayIds,
  onShowFriend,
  onFriendsChange,
}: FriendWidgetProps) => {
  const [searchNickname, setSearchNickname] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchSuccess, setSearchSuccess] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const isComposingRef = useRef(false);

  const loadFriends = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsLoadingFriends(false);
      return;
    }

    const { data: friendRows, error: friendsError } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", user.id);

    if (friendsError) {
      console.error("[grow-pet] friends load error", friendsError);
      setIsLoadingFriends(false);
      return;
    }

    if (!friendRows || friendRows.length === 0) {
      setFriends([]);
      setIsLoadingFriends(false);
      return;
    }

    const friendIds = friendRows.map((r: { friend_id: string }) => r.friend_id);

    const { data: profiles, error: profilesError } = await supabase
      .from("users_profile")
      .select("id, nickname, share_details")
      .in("id", friendIds);

    if (profilesError || !profiles) {
      setIsLoadingFriends(false);
      return;
    }

    const enriched: FriendProfile[] = await Promise.all(
      profiles.map(
        async (profile: {
          id: string;
          nickname: string;
          share_details: boolean | null;
        }) => {
          const { data: pets } = await supabase
            .from("pets")
            .select("*")
            .eq("owner_id", profile.id)
            .eq("is_main", true)
            .limit(1);

          return {
            id: profile.id,
            nickname: profile.nickname,
            share_details: profile.share_details ?? true,
            main_pet: pets?.[0] as Pet | undefined,
          };
        },
      ),
    );

    setFriends(enriched);
    setIsLoadingFriends(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await loadFriends();
      if (cancelled) return;
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddFriend = async () => {
    const trimmed = searchNickname.trim().replace(/\s+/g, " ").normalize("NFC");

    if (!trimmed) {
      setSearchError("닉네임을 입력해 주세요.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setIsSearching(true);
    setSearchError("");
    setSearchSuccess("");

    const { data: targetProfile, error: searchErr } = await supabase
      .from("users_profile")
      .select("id, nickname")
      .ilike("nickname", trimmed)
      .maybeSingle();

    if (searchErr) {
      setSearchError("검색 중 오류가 발생했어요: " + searchErr.message);
      setIsSearching(false);
      return;
    }

    if (!targetProfile) {
      setSearchError("해당 닉네임의 유저를 찾을 수 없어요.");
      setIsSearching(false);
      return;
    }

    if (targetProfile.id === user.id) {
      setSearchError("자기 자신은 친구로 추가할 수 없어요.");
      setIsSearching(false);
      return;
    }

    const { data: existing } = await supabase
      .from("friends")
      .select("id")
      .eq("user_id", user.id)
      .eq("friend_id", targetProfile.id)
      .maybeSingle();

    if (existing) {
      setSearchError("이미 친구로 등록된 유저예요.");
      setIsSearching(false);
      return;
    }

    const { error: insertError } = await supabase.from("friends").insert([
      { user_id: user.id, friend_id: targetProfile.id },
      { user_id: targetProfile.id, friend_id: user.id },
    ]);

    if (insertError) {
      setSearchError("친구 추가 중 오류가 발생했어요: " + insertError.message);
      setIsSearching(false);
      return;
    }

    setSearchSuccess(`${targetProfile.nickname}님을 친구로 추가했어요!`);
    setSearchNickname("");
    setIsSearching(false);
    void loadFriends();
    onFriendsChange?.();
  };

  const handleRemoveFriend = async (friendId: string) => {
    const ok = confirm("친구를 삭제하시겠습니까?");
    if (!ok) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`,
      );

    void loadFriends();
    onFriendsChange?.();
  };

  const stageY: Record<string, number> = {
    egg: 0,
    baby: 64,
    child: 128,
    adult: 192,
  };

  return (
    <div className={styles.friendWidget}>
      <section className={styles.friendSearch}>
        <div>
          <span>친구 탭</span>
          <h2>친구 펫 구경하기</h2>
        </div>
        <div className={styles.searchInputWrapper}>
          <label className={styles.searchLabel}>
            <input
              placeholder="유저 닉네임 입력"
              value={searchNickname}
              onChange={(e) => {
                setSearchNickname(e.target.value);
                if (searchError) setSearchError("");
                if (searchSuccess) setSearchSuccess("");
              }}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={(e) => {
                isComposingRef.current = false;
                setSearchNickname(e.currentTarget.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleAddFriend();
              }}
            />
            <button
              type="button"
              disabled={isSearching}
              onClick={() => void handleAddFriend()}
            >
              {isSearching ? "검색 중..." : "친구 추가"}
            </button>
          </label>
          {searchError && (
            <span className={styles.searchError}>{searchError}</span>
          )}
          {searchSuccess && (
            <span className={styles.searchSuccess}>{searchSuccess}</span>
          )}
        </div>
      </section>

      <section className={styles.friendList}>
        {isLoadingFriends && (
          <div className={styles.skeletonList}>
            {[0, 1, 2].map((i) => (
              <div className={styles.skeletonCard} key={i}>
                <div className={styles.skeletonPet} />
                <div className={styles.skeletonInfo}>
                  <div
                    className={styles.skeletonLine}
                    style={{ width: "40%" }}
                  />
                  <div
                    className={styles.skeletonLine}
                    style={{ width: "60%" }}
                  />
                  <div className={styles.skeletonStatRow}>
                    {[0, 1, 2, 3].map((j) => (
                      <div className={styles.skeletonStat} key={j} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoadingFriends && friends.length === 0 && (
          <p className={styles.emptyText}>
            아직 친구가 없어요. 닉네임으로 친구를 추가해 보세요!
          </p>
        )}

        {!isLoadingFriends &&
          friends.map((friend) => {
            const pet = friend.main_pet;
            const petXp = pet ? getPetXp(pet) : 0;
            const petStage = xpLevel(petXp);
            const isOnline = onlineFriendIds.has(friend.id);

            return (
              <article className={styles.friendCard} key={friend.id}>
                <div
                  className={styles.friendPet}
                  style={
                    pet
                      ? {
                          backgroundPositionY: `${16 - stageY[petStage]}px`, // stage offset 반영
                        }
                      : undefined
                  }
                />
                <div className={styles.friendInfo}>
                  <div className={styles.friendName}>
                    <strong>{friend.nickname}</strong>
                    <span
                      className={
                        isOnline ? styles.onlineDot : styles.offlineDot
                      }
                      title={isOnline ? "접속 중" : "오프라인"}
                    />
                    {isOnline && (
                      <span className={styles.onlineLabel}>접속 중</span>
                    )}
                    {isOnline && hiddenOverlayIds.has(friend.id) && (
                      <button
                        className={styles.showOverlayButton}
                        type="button"
                        onClick={() => onShowFriend(friend.id)}
                      >
                        펫 데려오기
                      </button>
                    )}
                  </div>
                  {pet ? (
                    <>
                      <p>
                        {pet.name} · {stageLabel[petStage]}
                      </p>
                      {friend.share_details ? (
                        <dl className={styles.statGrid}>
                          <div>
                            <dt>총 타수</dt>
                            <dd>
                              {(pet.typing_count ?? 0).toLocaleString("ko-KR")}
                            </dd>
                          </div>
                          <div>
                            <dt>총 XP</dt>
                            <dd>{petXp.toLocaleString("ko-KR")}</dd>
                          </div>
                          {Object.entries(xpCategoryLabels).map(
                            ([key, label]) => (
                              <div key={key}>
                                <dt>{label}</dt>
                                <dd>
                                  {getCategoryXp(
                                    pet,
                                    key as XpCategory,
                                  ).toLocaleString("ko-KR")}
                                </dd>
                              </div>
                            ),
                          )}
                        </dl>
                      ) : (
                        <p className={styles.hiddenText}>
                          이 친구는 상세 데이터를 비공개로 설정했어요.
                        </p>
                      )}
                    </>
                  ) : (
                    <p>아직 펫이 없어요.</p>
                  )}
                  <button
                    className={styles.removeFriendButton}
                    type="button"
                    onClick={() => void handleRemoveFriend(friend.id)}
                  >
                    친구 삭제
                  </button>
                </div>
              </article>
            );
          })}
      </section>
    </div>
  );
};
