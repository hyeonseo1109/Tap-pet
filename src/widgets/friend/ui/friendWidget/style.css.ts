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
  "@media": { "(max-width: 640px)": { gridTemplateColumns: "1fr" } },
});

/*
  스프라이트: 프레임 1개 = 가로 52px × 세로 64px
  단계별 y 오프셋: egg=0, baby=-64, child=-128, adult=-192
  backgroundSize를 "auto"로 두면 원본 크기 유지
  카드 내에서 중앙 배치를 위해 래퍼에서 overflow:hidden + 중앙 정렬
*/
export const friendPet = style({
  height: 120,
  border: "3px solid #5a3525",
  backgroundColor: "#7aa16a",
  backgroundImage: "url('/idle.png')",
  backgroundRepeat: "no-repeat",
  backgroundSize: "208px auto",
  backgroundPositionX: "center",
  backgroundPositionY: "16px",
  imageRendering: "pixelated",
  transform: "scale(1)", // 50% 확대
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

export const statGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 8,
  margin: 0,
  "@media": {
    "(max-width: 720px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
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
  justifySelf: "start",
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
