import { useEffect, useRef, useState } from "react";
import * as styles from "./style.css";

interface Props {
  stage: string;
  state: string;
  animationSpeedRef: React.RefObject<number>;
}

const FRAME_WIDTH = 52;
const FRAME_HEIGHT = 64;
const TOTAL_FRAMES = 4;
const STAGE_Y = {
  egg: 0,
  baby: 1,
  child: 2,
  adult: 3,
};

export const CharacterImage = ({ stage, state, animationSpeedRef }: Props) => {
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    let animationId: number;

    const animate = (time: number) => {
      if (time - lastFrameTimeRef.current >= animationSpeedRef.current) {
        frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES;
        setFrame(frameRef.current);
        lastFrameTimeRef.current = time;
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [animationSpeedRef]);

  const x = frame * FRAME_WIDTH;

  const y = STAGE_Y[stage as keyof typeof STAGE_Y] * FRAME_HEIGHT;

  return (
    <div
      className={styles.characterWidget}
      style={{
        backgroundImage: `url(/${state}.png)`,
        backgroundPosition: `-${x}px -${y}px`,
      }}
    />
  );
};
