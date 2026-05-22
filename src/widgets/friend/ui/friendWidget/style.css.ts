import { globalStyle, style } from "@vanilla-extract/css";

export const friendWidget = style({
  width: "100%",
  minHeight: "100%",
  display: "grid",
  alignContent: "start",
  gap: 18,
  padding: 22,
  color: "#3d281f",
});

export const friendSearch = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 420px)",
  gap: 18,
  alignItems: "end",
  border: "3px solid #5a3525",
  background: "#f6e2b5",
  padding: 18,
  "@media": {
    "(max-width: 760px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

globalStyle(`${friendSearch} span`, {
  color: "#7a4e34",
  fontSize: 13,
  fontWeight: 900,
});

globalStyle(`${friendSearch} h2`, {
  margin: "4px 0 0",
  fontSize: 28,
});

globalStyle(`${friendSearch} label`, {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 8,
});

globalStyle(`${friendSearch} input`, {
  minWidth: 0,
  border: "3px solid #5a3525",
  background: "#fff8df",
  color: "#3d281f",
  padding: "10px 12px",
  outline: "none",
});

globalStyle(`${friendSearch} button`, {
  border: "3px solid #45613b",
  background: "#84a965",
  color: "#fff8df",
  padding: "10px 14px",
  fontWeight: 900,
});

export const friendList = style({
  display: "grid",
  gap: 12,
});

export const friendCard = style({
  display: "grid",
  gridTemplateColumns: "120px minmax(0, 1fr)",
  gap: 16,
  border: "3px solid #5a3525",
  background: "#e6c98e",
  padding: 16,
  "@media": {
    "(max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const friendPet = style({
  minHeight: 120,
  border: "3px solid #5a3525",
  backgroundColor: "#7aa16a",
  backgroundImage: "url('/idle.png')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center 28px",
  imageRendering: "pixelated",
});

export const friendInfo = style({
  display: "grid",
  gap: 12,
});

globalStyle(`${friendInfo} p`, {
  color: "#6d4a35",
  fontWeight: 800,
});

export const friendName = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

globalStyle(`${friendName} strong`, {
  fontSize: 22,
});

export const offlineDot = style({
  width: 11,
  height: 11,
  border: "2px solid #5a3525",
  borderRadius: "50%",
  background: "#9d9d91",
});

export const statGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 8,
  margin: 0,
});

globalStyle(`${statGrid} div`, {
  border: "2px solid #7a4e34",
  background: "#fff5cf",
  padding: 10,
});

globalStyle(`${statGrid} dt`, {
  color: "#90603f",
  fontSize: 12,
  fontWeight: 900,
});

globalStyle(`${statGrid} dd`, {
  margin: 0,
  fontWeight: 900,
});
