import { useEffect, useRef, useState } from "react";
import * as styles from "./style.css";

type OnlineFriend = {
  id: string;
  nickname: string;
  stage: string;
  isTyping: boolean;
};

type FriendPetOverlayProps = {
  onlineFriends: OnlineFriend[];
  onHide: (id: string) => void;
};

const FRAME_WIDTH = 52;
const FRAME_HEIGHT = 64;
const TOTAL_FRAMES = 4;

const STAGE_ROW: Record<string, number> = {
  egg: 0,
  baby: 1,
  child: 2,
  adult: 3,
};

type AnimatedPetProps = {
  stage: string;
  isTyping: boolean;
};

const AnimatedPet = ({ stage, isTyping }: AnimatedPetProps) => {
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const speedRef = useRef(220);

  useEffect(() => {
    speedRef.current = isTyping ? 100 : 220;
  }, [isTyping]);

  useEffect(() => {
    let id: number;
    const animate = (time: number) => {
      if (time - lastFrameTimeRef.current >= speedRef.current) {
        frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES;
        setFrame(frameRef.current);
        lastFrameTimeRef.current = time;
      }
      id = requestAnimationFrame(animate);
    };
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  const x = frame * FRAME_WIDTH;
  const y = STAGE_ROW[stage] * FRAME_HEIGHT;
  const src = isTyping ? "/typing.png" : "/idle.png"; // 추가

  return (
    <div
      className={styles.friendOverlayPet}
      style={{
        backgroundImage: `url('${src}')`, // 수정
        backgroundPositionX: `-${x}px`,
        backgroundPositionY: `-${y}px`,
      }}
    />
  );
};

export const FriendPetOverlay = ({
  onlineFriends,
  onHide,
}: FriendPetOverlayProps) => {
  if (onlineFriends.length === 0) return null;

  return (
    <>
      {onlineFriends.map((friend, idx) => (
        <div
          className={styles.friendOverlayItem}
          key={friend.id}
          style={{ right: 20 + (idx + 1) * 72 }}
        >
          <div className={styles.friendOverlayHoverArea}>
            <button
              className={styles.friendOverlayClose}
              onClick={() => onHide(friend.id)}
              title="숨기기"
            >
              ✕
            </button>
            <span className={styles.friendOverlayNickname}>
              {friend.nickname}
            </span>
          </div>
          <AnimatedPet stage={friend.stage} isTyping={friend.isTyping} />
        </div>
      ))}
    </>
  );
};
