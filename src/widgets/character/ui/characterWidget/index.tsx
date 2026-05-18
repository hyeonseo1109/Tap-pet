type Props = {
  stage: string;
};

export const CharacterWidget = ({ stage }: Props) => {
  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        width: 120,
        height: 120,
        border: "2px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {stage === "egg" && "🥚"}
      {stage === "baby" && "🐣"}
      {stage === "child" && "🐥"}
      {stage === "adult" && "🐤"}
    </div>
  );
};
