import * as styles from "./style.css";

type FriendPetOverlayProps = {
  /** 접속 중인 친구들의 { nickname, petStage } 배열 */
  onlineFriends: Array<{
    nickname: string;
    stage: string;
  }>;
};

// const FRAME_WIDTH = 52;
const FRAME_HEIGHT = 64;

const STAGE_Y: Record<string, number> = {
  egg: 0,
  baby: 1,
  child: 2,
  adult: 3,
};

export const FriendPetOverlay = ({ onlineFriends }: FriendPetOverlayProps) => {
  if (onlineFriends.length === 0) return null;

  return (
    <>
      {onlineFriends.map((friend, idx) => (
        <div
          className={styles.friendOverlayItem}
          key={friend.nickname}
          style={{
            /* 내 펫(right:20) 기준으로 왼쪽으로 순서대로 배치 */
            right: 20 + (idx + 1) * 72,
          }}
          title={friend.nickname}
        >
          <div
            className={styles.friendOverlayPet}
            style={{
              backgroundPosition: `0px -${STAGE_Y[friend.stage] * FRAME_HEIGHT}px`,
            }}
          />
          <span className={styles.friendOverlayNickname}>
            {friend.nickname}
          </span>
        </div>
      ))}
    </>
  );
};
