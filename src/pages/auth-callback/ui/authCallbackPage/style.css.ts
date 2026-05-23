import { keyframes, style } from "@vanilla-extract/css";

const shimmer = keyframes({
  "0%": { backgroundPosition: "-600px 0" },
  "100%": { backgroundPosition: "600px 0" },
});

const skeletonBase = {
  background: "linear-gradient(90deg, #c8a870 25%, #dfc090 50%, #c8a870 75%)",
  backgroundSize: "1200px 100%",
  animation: `${shimmer} 1.4s ease infinite`,
} as const;

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
  display: "grid",
  gridTemplateColumns: "180px minmax(0, 1fr)",
  height: "min(720px, calc(100vh - 48px))",
  width: "min(1080px, calc(100% - 32px))",
  border: "4px solid #432719",
  background: "#8a583d",
  boxShadow: "0 0 0 4px #f0d49a, 0 16px 0 rgba(42, 25, 17, 0.42)",
  overflow: "hidden",
  "@media": {
    "(max-width: 760px)": {
      gridTemplateColumns: "1fr",
      gridTemplateRows: "auto minmax(0, 1fr)",
      height: "calc(100vh - 24px)",
      width: "calc(100% - 24px)",
    },
  },
});

export const sidePanel = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 16,
  borderRight: "4px solid #432719",
  background: "#6d422f",
  height: "100%",
});

export const skeletonLogo = style({
  height: 72,
  ...skeletonBase,
  borderRadius: 2,
});

export const skeletonNavList = style({
  display: "grid",
  gap: 10,
});

export const skeletonNavItem = style({
  height: 48,
  ...skeletonBase,
  borderRadius: 2,
});

export const skeletonLogout = style({
  marginTop: "auto",
  height: 42,
  ...skeletonBase,
  borderRadius: 2,
});

export const contentPanel = style({
  display: "flex",
  flexDirection: "column",
  gap: 18,
  padding: 22,
  background: "rgba(255, 244, 207, 0.92)",
  overflow: "hidden",
});

export const skeletonHeroCard = style({
  display: "grid",
  gridTemplateColumns: "180px minmax(0, 1fr)",
  gap: 22,
  border: "3px solid #c4a86a",
  background: "#f0d9a0",
  padding: 18,
  "@media": {
    "(max-width: 700px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const skeletonPortrait = style({
  height: 190,
  ...skeletonBase,
  borderRadius: 2,
});

export const skeletonInfoBlock = style({
  display: "grid",
  gap: 14,
  alignContent: "start",
});

export const skeletonLine = style({
  height: 18,
  ...skeletonBase,
  borderRadius: 2,
});

export const skeletonStatRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
});

export const skeletonStat = style({
  height: 60,
  ...skeletonBase,
  borderRadius: 2,
});

export const skeletonXpRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
});

export const skeletonXp = style({
  height: 36,
  ...skeletonBase,
  borderRadius: 2,
});

export const skeletonRestPanel = style({
  display: "grid",
  gap: 10,
  border: "3px solid #c4a86a",
  background: "#e0c080",
  padding: 18,
});

export const skeletonRestCard = style({
  height: 60,
  ...skeletonBase,
  borderRadius: 2,
});
