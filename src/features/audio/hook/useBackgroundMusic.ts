import { useEffect, useRef } from "react";

type UseBackgroundMusicParams = {
  play: boolean;
  volume: number; // 0~100
  src?: string;
};

export const useBackgroundMusic = ({
  play,
  volume,
  src = "/TapPet.mp3",
}: UseBackgroundMusicParams) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = true;
      audioRef.current = audio;
    }

    audioRef.current.volume = volume / 100;

    if (play) {
      audioRef.current.play().catch(() => {
        const resume = () => {
          audioRef.current?.play().catch(() => {});
          window.removeEventListener("click", resume);
          window.removeEventListener("keydown", resume);
        };
        window.addEventListener("click", resume);
        window.addEventListener("keydown", resume);
      });
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [play, volume, src]);
};
