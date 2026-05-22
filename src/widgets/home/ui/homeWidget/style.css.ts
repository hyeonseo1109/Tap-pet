import { globalStyle, style } from "@vanilla-extract/css";

export const homeWidget = style({
  width: "100%",
  minHeight: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 18,
  padding: 22,
  color: "#3d281f",
});

export const heroPanel = style({
  border: "3px solid #5a3525",
  background: "#f6e2b5",
  padding: 18,
  boxShadow: "inset 0 0 0 3px rgba(255, 252, 226, 0.65)",
});

export const restPanel = style({
  border: "3px solid #5a3525",
  background: "#e6c98e",
  padding: 18,
});

export const sectionTitle = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
});

globalStyle(`${sectionTitle} span`, {
  color: "#7a4e34",
  fontSize: 13,
  fontWeight: 900,
});

globalStyle(`${sectionTitle} strong`, {
  color: "#3d281f",
  fontSize: 24,
  lineHeight: 1.1,
});

export const mainPetCard = style({
  display: "grid",
  gridTemplateColumns: "180px minmax(0, 1fr)",
  gap: 22,
  alignItems: "center",
  "@media": {
    "(max-width: 700px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const portraitFrame = style({
  minHeight: 190,
  display: "grid",
  placeItems: "center",
  border: "3px solid #5a3525",
  background: "#7aa16a",
  boxShadow: "inset 0 0 0 4px #b7d17c",
});

export const petPortrait = style({
  width: 52,
  height: 64,
  backgroundRepeat: "no-repeat",
  imageRendering: "pixelated",
  transform: "scale(2.25)",
});

export const petInfo = style({
  display: "grid",
  gap: 14,
  minWidth: 0,
});

globalStyle(`${petInfo} h2`, {
  margin: "4px 0 0",
  fontSize: 32,
  lineHeight: 1.05,
  color: "#2e2018",
});

export const metaLabel = style({
  fontSize: 13,
  fontWeight: 900,
  color: "#8b5d3b",
});

export const infoGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
  margin: 0,
  "@media": {
    "(max-width: 820px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
});

globalStyle(`${infoGrid} div`, {
  border: "2px solid #7a4e34",
  background: "#fff5cf",
  padding: 10,
});

globalStyle(`${infoGrid} dt`, {
  color: "#90603f",
  fontSize: 12,
  fontWeight: 900,
});

globalStyle(`${infoGrid} dd`, {
  margin: 0,
  fontWeight: 900,
  color: "#2e2018",
});

export const xpList = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
  "@media": {
    "(max-width: 640px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
});

globalStyle(`${xpList} div`, {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  border: "2px solid #5f6f3d",
  background: "#dce7a3",
  padding: "8px 10px",
  fontSize: 13,
  fontWeight: 900,
});

export const dangerButton = style({
  justifySelf: "start",
  border: "3px solid #6f2d25",
  background: "#b95749",
  color: "#fff7df",
  padding: "9px 16px",
  fontWeight: 900,
  boxShadow: "0 4px 0 #6f2d25",
});

export const restList = style({
  display: "grid",
  gap: 10,
});

export const restCard = style({
  display: "grid",
  gridTemplateColumns: "52px minmax(0, 1fr) auto auto",
  gap: 12,
  alignItems: "center",
  border: "2px solid #6a442f",
  background: "#fff1c8",
  padding: "10px 12px",
});

globalStyle(`${restCard} div`, {
  display: "grid",
  gap: 2,
});

globalStyle(`${restCard} strong`, {
  color: "#2e2018",
});

globalStyle(`${restCard} span`, {
  color: "#7a4e34",
  fontSize: 13,
  fontWeight: 800,
});

globalStyle(`${restCard} button`, {
  border: "2px solid #45613b",
  background: "#84a965",
  color: "#fff8df",
  padding: "7px 10px",
  fontWeight: 900,
});

export const textDangerButton = style({
  borderColor: "#7a332a !important",
  background: "#be6154 !important",
});

export const emptyText = style({
  border: "2px dashed #8f6543",
  background: "rgba(255, 248, 222, 0.72)",
  padding: 16,
  color: "#6a442f",
  fontWeight: 800,
});
