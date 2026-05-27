import { globalStyle, keyframes, style } from "@vanilla-extract/css";

const shimmer = keyframes({
  "0%": { backgroundPosition: "-400px 0" },
  "100%": { backgroundPosition: "400px 0" },
});

const skeletonBase = {
  background: "linear-gradient(90deg, #d9be8a 25%, #e8d4a0 50%, #d9be8a 75%)",
  backgroundSize: "800px 100%",
  animation: `${shimmer} 1.4s ease infinite`,
  borderRadius: 2,
} as const;

export const friendWidget = style({
  width: "100%",
  minHeight: "100%",
  display: "grid",
  alignContent: "start",
  gap: 18,
  padding: 22,
  color: "#3d281f",
  "@media": {
    "(max-width: 520px)": {
      padding: 12,
      gap: 12,
    },
  },
});

export const friendSearch = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 420px)",
  gap: 18,
  alignItems: "start",
  border: "3px solid #5a3525",
  background: "#f6e2b5",
  padding: 18,
  "@media": {
    "(max-width: 760px)": { gridTemplateColumns: "1fr" },
    "(max-width: 520px)": { padding: 12 },
  },
});

globalStyle(`${friendSearch} > div:first-child span`, {
  color: "#7a4e34",
  fontSize: 13,
  fontWeight: 900,
});

globalStyle(`${friendSearch} h2`, {
  margin: "4px 0 0",
  fontSize: 28,
});

export const searchInputWrapper = style({ display: "grid", gap: 6 });

export const searchLabel = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 8,
  "@media": {
    "(max-width: 520px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

globalStyle(`${searchLabel} input`, {
  minWidth: 0,
  border: "3px solid #5a3525",
  background: "#fff8df",
  color: "#3d281f",
  padding: "10px 12px",
  outline: "none",
  boxSizing: "border-box",
});

globalStyle(`${searchLabel} button`, {
  border: "3px solid #45613b",
  background: "#84a965",
  color: "#fff8df",
  padding: "10px 14px",
  fontWeight: 900,
  whiteSpace: "nowrap",
});

globalStyle(`${searchLabel} button:disabled`, { opacity: 0.6, cursor: "wait" });

export const searchError = style({
  color: "#d94f3d",
  fontSize: 13,
  fontWeight: 800,
});
export const searchSuccess = style({
  color: "#4a7c3a",
  fontSize: 13,
  fontWeight: 800,
});

export const friendList = style({ display: "grid", gap: 12 });

/* ── 스켈레톤 ── */
export const skeletonList = style({ display: "grid", gap: 12 });
export const skeletonCard = style({
  display: "grid",
  gridTemplateColumns: "120px minmax(0, 1fr)",
  gap: 16,
  border: "3px solid #c4a86a",
  background: "#e6c98e",
  padding: 16,
  "@media": { "(max-width: 640px)": { gridTemplateColumns: "1fr" } },
});
export const skeletonPet = style({
  minHeight: 120,
  ...skeletonBase,
  border: "3px solid #c4a86a",
});
export const skeletonInfo = style({
  display: "grid",
  gap: 12,
  alignContent: "start",
});
export const skeletonLine = style({ height: 16, ...skeletonBase });
export const skeletonStatRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 8,
  "@media": {
    "(max-width: 520px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  },
});
export const skeletonStat = style({ height: 52, ...skeletonBase });

/* ── 실제 카드 ── */
export const friendCard = style({
  display: "grid",
  gridTemplateColumns: "120px minmax(0, 1fr)",
  gap: 16,
  border: "3px solid #5a3525",
  background: "#e6c98e",
  padding: 16,
  "@media": {
    "(max-width: 640px)": { gridTemplateColumns: "1fr" },
    "(max-width: 520px)": { padding: 12 },
  },
});

/*
  스프라이트: 프레임 1개 = 가로 52px × 세로 64px
  단계별 y 오프셋: egg=0, baby=-64, child=-128, adult=-192
  backgroundSize를 "auto"로 두면 원본 크기 유지
  카드 내에서 중앙 배치를 위해 래퍼에서 overflow:hidden + 중앙 정렬
*/
export const friendPet = style({
  height: "150px",
  border: "3px solid #5a3525",
  backgroundColor: "#7aa16a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
});

export const friendPetSprite = style({
  width: 52,
  height: 64,
  backgroundRepeat: "no-repeat",
  backgroundSize: "auto",
  imageRendering: "pixelated",
  transform: "scale(1.5)",
  flexShrink: 0,
});

export const friendInfo = style({
  display: "grid",
  gap: 10,
  alignContent: "start",
});

globalStyle(`${friendInfo} p`, {
  color: "#6d4a35",
  fontWeight: 800,
  margin: 0,
});

export const friendName = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
});

globalStyle(`${friendName} strong`, { fontSize: 22 });

/* 접속 중 - 초록 */
export const onlineDot = style({
  width: 11,
  height: 11,
  border: "2px solid #2a5c2a",
  borderRadius: "50%",
  background: "#4caf50",
  flexShrink: 0,
  boxShadow: "0 0 4px #4caf5088",
});

/* 오프라인 - 회색 */
export const offlineDot = style({
  width: 11,
  height: 11,
  border: "2px solid #5a3525",
  borderRadius: "50%",
  background: "#9d9d91",
  flexShrink: 0,
});

export const onlineLabel = style({
  fontSize: 12,
  fontWeight: 900,
  color: "#2a6b2a",
  background: "#d4f0c0",
  border: "1px solid #6aad5a",
  padding: "1px 6px",
  borderRadius: 2,
});

export const pokeButton = style({
  fontSize: 12,
  fontWeight: 900,
  color: "#fff8df",
  background: "#c84d43",
  border: "1px solid #8f2e2a",
  padding: "1px 6px",
  borderRadius: 2,
  selectors: {
    "&:disabled": {
      opacity: 0.55,
      cursor: "not-allowed",
    },
  },
});

export const statGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 8,
  margin: 0,
  "@media": {
    "(max-width: 720px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    "(max-width: 420px)": { gridTemplateColumns: "1fr" },
  },
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
globalStyle(`${statGrid} dd`, { margin: 0, fontWeight: 900 });

export const hiddenText = style({
  color: "#9d7558",
  fontSize: 13,
  fontStyle: "italic",
  fontWeight: 700,
});

export const removeFriendButton = style({
  justifySelf: "end",
  border: "2px solid #7a332a",
  background: "transparent",
  color: "#7a332a",
  padding: "6px 12px",
  fontWeight: 900,
  fontSize: 13,
});

export const emptyText = style({
  border: "2px dashed #8f6543",
  background: "rgba(255, 248, 222, 0.72)",
  padding: 16,
  color: "#6a442f",
  fontWeight: 800,
  margin: 0,
});

export const showOverlayButton = style({
  border: "2px solid #45613b",
  background: "#84a965",
  color: "#fff8df",
  padding: "1px 8px",
  fontWeight: 900,
  fontSize: 11,
  borderRadius: 2,
});

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
  width: "min(520px, 100%)",
  border: "4px solid #4b2b1d",
  background: "#8f5b3d",
  color: "#fff8df",
  padding: 24,
  boxShadow: "0 0 0 4px #f2d8a7, 0 14px 0 rgba(52,29,18,0.45)",
});

export const modalHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
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

export const modalMessage = style({
  margin: 0,
  color: "#ffe9aa",
  fontSize: 16,
  fontWeight: 800,
  lineHeight: 1.55,
});

export const modalError = style({
  margin: "10px 0 0",
  border: "2px solid #8f2e2a",
  background: "#fff0df",
  color: "#8f2e2a",
  padding: "8px 10px",
  fontSize: 13,
  fontWeight: 900,
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

export const deleteConfirmButton = style({
  border: "3px solid #6f2d25",
  background: "#b95749",
  color: "#fff8df",
  padding: "13px 18px",
  fontWeight: 900,
  boxShadow: "0 4px 0 #6f2d25",
  textAlign: "center",
  selectors: {
    "&:disabled": {
      opacity: 0.65,
      cursor: "wait",
    },
  },
});

export const friendTitle = style({
  fontSize: "1.5rem",
  fontWeight: 900,
  color: "#7a4e34",
  textShadow: "2px 2px 0 #c4a86a",
  margin: 0,
  "@media": {
    "(max-width: 900px)": {
      fontSize: "20px",
    },
  },
});
