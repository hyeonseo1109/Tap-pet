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
  gap: 12,
  marginBottom: 14,
  flexWrap: "wrap",
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
  flex: 1,
});

export const addPetButton = style({
  marginLeft: "auto",
  border: "2px solid #45613b",
  background: "#84a965",
  color: "#fff8df",
  padding: "6px 12px",
  fontWeight: 900,
  fontSize: 13,
  whiteSpace: "nowrap",
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

/* 대표펫 - 크게 */
export const petPortrait = style({
  width: 52,
  height: 64,
  backgroundRepeat: "no-repeat",
  imageRendering: "pixelated",
  transform: "scale(2.5)",
});

/* 침실 펫 - 작게 */
export const restPetPortrait = style({
  width: 52,
  height: 64,
  backgroundRepeat: "no-repeat",
  imageRendering: "pixelated",
  transform: "scale(1)",
  flexShrink: 0,
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

/* ── 새 펫 데려오기 모달 ── */

export const modalOverlay = style({
  position: "fixed",
  inset: 0,
  background: "rgba(42, 25, 17, 0.72)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 200,
  padding: 24,
});

export const modalPanel = style({
  width: "min(680px, 100%)",
  border: "4px solid #4b2b1d",
  background: "#8f5b3d",
  color: "#fff8df",
  padding: 26,
  boxShadow: "0 0 0 4px #f2d8a7, 0 14px 0 rgba(52,29,18,0.45)",
  boxSizing: "border-box",
  maxHeight: "90vh",
  overflowY: "auto",
});

export const modalHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
});

globalStyle(`${modalHeader} span`, {
  fontSize: 22,
  fontWeight: 900,
  textShadow: "0 2px 0 #4b2b1d",
});

export const modalCloseButton = style({
  border: "2px solid #4b2b1d",
  background: "#6d422f",
  color: "#ffecc2",
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
});

export const eggGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const eggCard = style({
  minHeight: 150,
  display: "grid",
  justifyItems: "center",
  alignContent: "center",
  gap: 8,
  padding: 16,
  border: "3px solid #5a3525",
  background: "#c58a58",
  color: "#fff8df",
  textAlign: "center",
  boxShadow: "inset 0 0 0 3px rgba(255,238,187,0.35)",
  transition: "background 120ms ease",
  selectors: {
    "&:hover": {
      background: "#d79a62",
    },
  },
});

export const selectedEggCard = style({
  background: "#6f8d55",
  borderColor: "#2e4b2b",
  boxShadow: "inset 0 0 0 3px #dff0a5, 0 6px 0 rgba(33,58,31,0.45)",
});

export const eggIcon = style({
  width: 52,
  height: 64,
  backgroundImage: "url('/idle.png')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0 0",
  imageRendering: "pixelated",
  transform: "scale(1.5)",
  marginBottom: 14,
});

export const nameField = style({
  display: "grid",
  gap: 8,
  marginTop: 20,
  color: "#ffe9aa",
  fontWeight: 800,
});

globalStyle(`${nameField} input`, {
  width: "100%",
  boxSizing: "border-box",
  border: "3px solid #4b2b1d",
  background: "#fff8df",
  color: "#3f261a",
  padding: "13px 16px",
  outline: "none",
  boxShadow: "inset 0 3px 0 rgba(75,43,29,0.18)",
});

export const fieldError = style({
  color: "#ff6b6b",
  fontSize: 13,
  fontWeight: 800,
});

export const modalActions = style({
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  gap: 10,
  marginTop: 18,
});

export const cancelButton = style({
  border: "3px solid #4b2b1d",
  background: "#6d422f",
  color: "#ffecc2",
  padding: "13px 18px",
  fontWeight: 900,
  boxShadow: "0 4px 0 #3b2010",
  textAlign: "center",
});

export const confirmButton = style({
  border: "3px solid #2f4f32",
  background: "#79a85d",
  color: "#fff8df",
  padding: "13px 18px",
  fontWeight: 900,
  boxShadow: "0 4px 0 #2f4f32",
  textAlign: "center",
  selectors: {
    "&:disabled": {
      opacity: 0.65,
      cursor: "wait",
    },
  },
});
