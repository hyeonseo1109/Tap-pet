import * as styles from "./style.css";

type OnlineFriend = {
  nickname: string;
  stage: string;
};

type FriendPetOverlayProps = {
  onlineFriends: OnlineFriend[];
};

const FRAME_HEIGHT = 64;

const STAGE_ROW: Record<string, number> = {
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
          style={{ right: 20 + (idx + 1) * 72 }}
          title={friend.nickname}
        >
          <div
            className={styles.friendOverlayPet}
            style={{
              backgroundPositionX: "0px",
              backgroundPositionY: `-${STAGE_ROW[friend.stage] * FRAME_HEIGHT}px`,
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
