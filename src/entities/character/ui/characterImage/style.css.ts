import { style } from "@vanilla-extract/css";

export const characterWidget = style({
  position: "fixed",
  right: 20,
  bottom: 30,
  width: 52,
  height: 64,
  backgroundRepeat: "no-repeat",
  imageRendering: "pixelated",
  transform: "scale(1.5)",
});
