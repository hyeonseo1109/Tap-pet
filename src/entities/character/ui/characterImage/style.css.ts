import { style } from "@vanilla-extract/css";

export const characterWidget = style({
  position: "fixed",
  right: 10,
  bottom: 15,
  width: 52,
  height: 64,
  backgroundRepeat: "no-repeat",
  imageRendering: "pixelated",
  transform: "scale(1.5)",
  transformOrigin: "bottom right",
});
