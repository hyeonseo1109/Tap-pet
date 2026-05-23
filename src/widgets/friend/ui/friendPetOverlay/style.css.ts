import { style } from "@vanilla-extract/css";

export const friendOverlayItem = style({
  position: "fixed",
  bottom: 15,
  display: "flex",
  zIndex: 100,
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
});

export const friendOverlayHoverArea = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  opacity: 0,
  transition: "opacity 150ms ease",
  pointerEvents: "none",
  selectors: {
    [`${friendOverlayItem}:hover &`]: {
      opacity: 1,
      pointerEvents: "auto",
    },
  },
});

export const friendOverlayClose = style({
  width: 18,
  height: 18,
  border: "1.5px solid #4b2b1d",
  background: "#b95749",
  color: "#fff",
  fontSize: 9,
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRadius: 2,
  lineHeight: 1,
});

export const friendOverlayPet = style({
  width: 52,
  height: 64,
  bottom: 30,
  backgroundRepeat: "no-repeat",
  backgroundSize: "auto",
  imageRendering: "pixelated",
  transform: "scale(1.5)",
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
