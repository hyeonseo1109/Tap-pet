import { style } from "@vanilla-extract/css";

export const button = style({
  userSelect: "none",
  WebkitAppearance: "none",
  backgroundColor: "#f2f2f2",
  border: "none",
  borderRadius: "20px",
  boxSizing: "border-box",
  color: "#1f1f1f",
  cursor: "pointer",
  fontFamily: "Roboto, arial, sans-serif",
  fontSize: "14px",
  height: "40px",
  letterSpacing: "0.25px",
  outline: "none",
  overflow: "hidden",
  padding: "0 12px",
  position: "relative",
  textAlign: "center",
  transition: "background-color .218s, box-shadow .218s",
  whiteSpace: "nowrap",
  width: "auto",
  maxWidth: "400px",
  minWidth: "min-content",

  selectors: {
    "&:disabled": {
      cursor: "default",
      backgroundColor: "#ffffff61",
    },

    "&:disabled::before": {
      opacity: "0.38",
    },

    "&:hover": {
      boxShadow: "0 1px 2px rgba(60,64,67,.30), 0 1px 3px rgba(60,64,67,.15)",
    },
  },
});

export const contentWrapper = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "nowrap",
  height: "100%",
  width: "100%",
  position: "relative",
  justifyContent: "space-between",
});

export const icon = style({
  height: "20px",
  width: "20px",
  minWidth: "20px",
  marginRight: "10px",
  display: "flex",
  alignItems: "center",
});

export const text = style({
  flexGrow: 1,
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const stateOverlay = style({
  position: "absolute",
  inset: 0,
  opacity: 0,
  transition: "opacity .218s",
  selectors: {
    [`${button}:active &`]: {
      backgroundColor: "#001d35",
      opacity: 0.12,
    },
    [`${button}:focus &`]: {
      backgroundColor: "#001d35",
      opacity: 0.12,
    },
  },
});
