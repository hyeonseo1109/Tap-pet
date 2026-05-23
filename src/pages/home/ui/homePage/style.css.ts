import { globalStyle, style } from "@vanilla-extract/css";

export const homeWidget = style({
  display: "grid",
  gridTemplateColumns: "180px minmax(0, 1fr)",
  height: "min(720px, calc(100vh - 48px))",
  width: "min(1080px, calc(100% - 32px))",
  boxSizing: "border-box",
  border: "4px solid #432719",
  background: "#8a583d",
  boxShadow: "0 0 0 4px #f0d49a, 0 16px 0 rgba(42, 25, 17, 0.42)",
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
  "@media": {
    "(max-width: 760px)": {
      height: "auto",
      borderRight: 0,
      borderBottom: "4px solid #432719",
    },
  },
});

export const logoBox = style({
  display: "grid",
  gap: 2,
  padding: "12px 10px",
  border: "3px solid #3b2418",
  background: "#c88b57",
  color: "#fff5d6",
  textAlign: "center",
  boxShadow: "inset 0 0 0 3px rgba(255, 238, 190, 0.28)",
});

export const nicknameTitle = style({
  fontSize: "22px",
  fontWeight: 900,
  color: "#fff8df",
  textShadow: "0 2px 0 #4b2b1d",
  justifySelf: "start",
  marginLeft: 10,
});

export const miniTitle = style({
  fontSize: "15px",
  fontWeight: 900,
  color: "#fff0bc",
  justifySelf: "end",
  marginRight: 10,
});

globalStyle(`${logoBox} span`, {
  fontSize: 12,
  fontWeight: 900,
  color: "#ffe082",
});

globalStyle(`${logoBox} strong`, {
  fontSize: 22,
  lineHeight: 1.1,
  textShadow: "0 2px 0 #4b2b1d",
});

export const tapWrapper = style({
  display: "grid",
  gap: 10,
  "@media": {
    "(max-width: 760px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    },
  },
});

export const tapButton = style({
  minHeight: 48,
  padding: "0 12px",
  fontSize: 15,
  fontWeight: 900,
  color: "#ffecc2",
  border: "3px solid #3b2418",
  background: "#9b6241",
  width: "100%",
  textAlign: "center",
  cursor: "pointer",
  boxShadow: "0 4px 0 #3b2418",
  selectors: {
    "&:hover": {
      background: "#b57449",
    },
  },
});

export const activeTapButton = style({
  color: "#2d3c21",
  background: "#d8c06f",
  borderColor: "#314725",
  boxShadow: "0 4px 0 #314725",
});

export const contentWrapper = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  height: "100%",
  overflow: "auto",
  background: "rgba(255, 244, 207, 0.92)",
});

export const homePage = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  width: "100%",
  padding: 24,
});
