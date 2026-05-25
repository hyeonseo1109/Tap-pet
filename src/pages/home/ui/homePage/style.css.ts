import { globalStyle, style } from "@vanilla-extract/css";

export const homeWidget = style({
  display: "grid",
  gridTemplateColumns: "180px minmax(0, 1fr)",
  height: "min(720px, calc(100dvh - 48px))",
  width: "min(1080px, calc(100% - 32px))",
  minWidth: 0,
  boxSizing: "border-box",
  border: "4px solid #432719",
  background: "#8a583d",
  boxShadow: "0 0 0 4px #f0d49a, 0 16px 0 rgba(42, 25, 17, 0.42)",
  "@media": {
    "(max-width: 980px)": {
      gridTemplateColumns: "132px minmax(0, 1fr)",
    },
    "(max-width: 760px)": {
      gridTemplateColumns: "1fr",
      gridTemplateRows: "auto minmax(0, 1fr)",
      height: "calc(100dvh - 24px)",
      width: "calc(100% - 24px)",
    },
    "(max-width: 420px)": {
      width: "100%",
      height: "100dvh",
      borderLeft: 0,
      borderRight: 0,
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
    "(max-width: 980px)": {
      gap: 10,
      padding: 10,
    },
    "(max-width: 760px)": {
      height: "auto",
      gap: 10,
      padding: 12,
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
  "@media": {
    "(max-width: 980px)": {
      padding: "8px 6px",
    },
    "(max-width: 760px)": {
      gridTemplateColumns: "minmax(0, 1fr) auto",
      alignItems: "end",
      textAlign: "left",
    },
  },
});

export const nicknameTitle = style({
  fontSize: "22px",
  fontWeight: 900,
  color: "#fff8df",
  textShadow: "0 2px 0 #4b2b1d",
  justifySelf: "start",
  marginLeft: 10,
  lineHeight: 1.05,
  overflowWrap: "anywhere",
  "@media": {
    "(max-width: 980px)": {
      fontSize: 16,
      marginLeft: 4,
    },
  },
});

export const miniTitle = style({
  fontSize: "15px",
  fontWeight: 900,
  color: "#fff0bc",
  justifySelf: "end",
  marginRight: 10,
  lineHeight: 1.05,
  "@media": {
    "(max-width: 980px)": {
      fontSize: 12,
      marginRight: 4,
    },
  },
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
    "(max-width: 980px)": {
      gap: 8,
    },
    "(max-width: 760px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: 8,
    },
    "(max-width: 420px)": {
      gap: 6,
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
  lineHeight: 1.1,
  selectors: {
    "&:hover": {
      background: "#b57449",
    },
  },
  "@media": {
    "(max-width: 980px)": {
      minHeight: 40,
      padding: "0 8px",
      fontSize: 13,
      borderWidth: 2,
      boxShadow: "0 3px 0 #3b2418",
    },
    "(max-width: 420px)": {
      minHeight: 42,
      padding: "0 6px",
      fontSize: 13,
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
  minHeight: "100dvh",
  width: "100%",
  padding: 24,
  "@media": {
    "(max-width: 760px)": {
      padding: 12,
    },
    "(max-width: 420px)": {
      padding: 0,
    },
  },
});

export const pokeToastStack = style({
  position: "fixed",
  top: 18,
  right: 18,
  zIndex: 500,
  display: "grid",
  gap: 10,
  width: "min(320px, calc(100vw - 24px))",
  pointerEvents: "none",
  "@media": {
    "(max-width: 520px)": {
      top: 10,
      right: 10,
    },
  },
});

export const pokeToast = style({
  position: "relative",
  display: "grid",
  gap: 4,
  border: "3px solid #5a3525",
  background: "#fff5cf",
  color: "#3d281f",
  padding: "12px 36px 12px 14px",
  boxShadow: "0 5px 0 rgba(67, 39, 25, 0.35)",
  pointerEvents: "auto",
});

export const pokeToastClose = style({
  position: "absolute",
  top: 7,
  right: 7,
  width: 22,
  height: 22,
  display: "grid",
  placeItems: "center",
  border: "2px solid #7a332a",
  background: "#c84d43",
  color: "#fff8df",
  fontSize: 12,
  fontWeight: 900,
  lineHeight: 1,
});
