import { useEffect, useState } from "react";

export const useTyping = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const handler = () => {
      setCount((c) => c + 1);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { count };
};
