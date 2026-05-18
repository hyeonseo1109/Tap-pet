export const createTypingHandler = (onType: () => void) => {
  return () => {
    onType();
  };
};
