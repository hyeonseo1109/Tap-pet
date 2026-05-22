import { globalStyle, style } from "@vanilla-extract/css";

export const LoginWidget = style({
  width: "min(560px, calc(100% - 32px))",
  display: "grid",
  gap: 22,
  alignItems: "center",
  justifyContent: "center",
  padding: 30,
  boxSizing: "border-box",
  border: "4px solid #432719",
  background: "#8a583d",
  color: "#fff8df",
  boxShadow: "0 0 0 4px #f0d49a, 0 16px 0 rgba(42, 25, 17, 0.42)",
});

export const titleBlock = style({
  display: "grid",
  gap: 8,
  textAlign: "center",
});

globalStyle(`${titleBlock} span`, {
  color: "#ffd36d",
  fontSize: 14,
  fontWeight: 900,
});

globalStyle(`${titleBlock} h1`, {
  margin: 0,
  fontSize: "clamp(40px, 8vw, 68px)",
  lineHeight: 0.95,
  textShadow: "0 4px 0 #4b2b1d",
});

globalStyle(`${titleBlock} p`, {
  color: "#f7e7bd",
  fontSize: 14,
  fontWeight: 700,
});

export const petPreview = style({
  width: 52,
  height: 64,
  margin: "10px 0 4px",
  backgroundImage: "url('/idle.png')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0 0",
  imageRendering: "pixelated",
  transform: "scale(2.4)",
});
