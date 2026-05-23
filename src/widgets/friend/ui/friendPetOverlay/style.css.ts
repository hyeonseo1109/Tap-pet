import { style } from "@vanilla-extract/css";

export const friendOverlayItem = style({
  position: "fixed",
  bottom: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  zIndex: 100,
  pointerEvents: "none",
});

export const friendOverlayPet = style({
  width: 52,
  height: 64,
  backgroundImage: "url('/idle.png')",
  backgroundRepeat: "no-repeat",
  backgroundSize: "auto",
  imageRendering: "pixelated",
  transform: "scale(1.2)",
  transformOrigin: "bottom center",
});

export const friendOverlayNickname = style({
  fontSize: 10,
  fontWeight: 900,
  color: "#fff8df",
  background: "rgba(42, 25, 17, 0.75)",
  padding: "2px 6px",
  whiteSpace: "nowrap",
  maxWidth: 80,
  overflow: "hidden",
  textOverflow: "ellipsis",
});
