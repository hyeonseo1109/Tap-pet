import { globalStyle, style } from "@vanilla-extract/css";

export const page = style({
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  boxSizing: "border-box",
});

export const panel = style({
  width: "min(760px, 100%)",
  border: "4px solid #4b2b1d",
  boxShadow: "0 0 0 4px #f2d8a7, 0 14px 0 rgba(52, 29, 18, 0.45)",
  background: "#8f5b3d",
  color: "#fff8df",
  padding: 28,
  boxSizing: "border-box",
  overflow: "hidden",
});

export const header = style({
  display: "grid",
  gap: 8,
  textAlign: "center",
});

export const kicker = style({
  color: "#ffd36d",
  fontSize: 14,
  fontWeight: 800,
});

export const title = style({
  fontSize: "clamp(20px, 4vw, 32px)",
  textShadow: "0 3px 0 #4b2b1d",
  lineHeight: 1.2,
});

export const notice = style({
  color: "#f7e7bd",
  fontSize: 14,
});

export const eggGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 14,
  marginTop: 28,
  "@media": {
    "(max-width: 680px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const eggCard = style({
  minHeight: 178,
  display: "grid",
  justifyItems: "center",
  alignContent: "center",
  gap: 10,
  padding: 18,
  border: "3px solid #5a3525",
  background: "#c58a58",
  color: "#fff8df",
  textAlign: "center",
  boxShadow: "inset 0 0 0 3px rgba(255, 238, 187, 0.35)",
  transition: "transform 120ms ease, background 120ms ease",
  selectors: {
    "&:hover": {
      transform: "translateY(-2px)",
      background: "#d79a62",
    },
  },
});

export const selectedEggCard = style({
  background: "#6f8d55",
  borderColor: "#2e4b2b",
  boxShadow: "inset 0 0 0 3px #dff0a5, 0 6px 0 rgba(33, 58, 31, 0.45)",
});

export const eggIcon = style({
  width: 52,
  height: 64,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0 0",
  imageRendering: "pixelated",
  transform: "scale(1.7)",
  marginBottom: 20,
});

export const description = style({
  fontSize: "14.5px",
  wordBreak: "keep-all",
});

export const nameField = style({
  display: "grid",
  gap: 8,
  marginTop: 24,
  color: "#ffe9aa",
  fontWeight: 800,
});

globalStyle(`${nameField} input`, {
  width: "100%",
  boxSizing: "border-box",
  border: "3px solid #4b2b1d",
  background: "#fff8df",
  color: "#3f261a",
  padding: "14px 16px",
  outline: "none",
  boxShadow: "inset 0 3px 0 rgba(75, 43, 29, 0.18)",
});

export const startButton = style({
  width: "100%",
  marginTop: 18,
  padding: "15px 18px",
  border: "3px solid #2f4f32",
  background: "#79a85d",
  color: "#fff8df",
  textAlign: "center",
  fontWeight: 900,
  boxShadow: "0 5px 0 #2f4f32",
  boxSizing: "border-box",
  display: "block",
  selectors: {
    "&:disabled": {
      opacity: 0.65,
      cursor: "wait",
    },
  },
});
