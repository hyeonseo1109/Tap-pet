import { globalStyle, style } from "@vanilla-extract/css";

export const dangerPanel = style({
  border: "3px solid #7a332a",
  background: "#faeaea",
  padding: 18,
});

globalStyle(`${dangerPanel} h3`, {
  margin: "0 0 14px",
  fontSize: 20,
  color: "#6f2d25",
});

export const dangerRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 16,
  alignItems: "center",
  "@media": {
    "(max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

globalStyle(`${dangerRow} div`, {
  display: "grid",
  gap: 4,
});

globalStyle(`${dangerRow} strong`, {
  fontSize: 17,
  color: "#3d281f",
});

globalStyle(`${dangerRow} span`, {
  color: "#8a4a42",
  fontSize: 13,
  fontWeight: 700,
});

export const dangerButton = style({
  border: "3px solid #6f2d25",
  background: "#b95749",
  color: "#fff7df",
  padding: "10px 18px",
  fontWeight: 900,
  boxShadow: "0 4px 0 #6f2d25",
  whiteSpace: "nowrap",
});

export const confirmBox = style({
  display: "grid",
  gap: 14,
  border: "2px solid #b95749",
  background: "#fff0ee",
  padding: 16,
});

export const warning = style({
  color: "#7a1f18",
  fontWeight: 800,
  fontSize: 14,
  margin: 0,
});

export const field = style({
  display: "grid",
  gap: 8,
  color: "#5a3025",
  fontWeight: 800,
  fontSize: 14,
});

globalStyle(`${field} input`, {
  border: "3px solid #b95749",
  background: "#fff8df",
  color: "#3f261a",
  padding: "12px 14px",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
});

export const fieldError = style({
  color: "#c0392b",
  fontSize: 13,
  fontWeight: 800,
});

export const actions = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
});

export const cancelButton = style({
  border: "3px solid #5a3525",
  background: "#c8a06a",
  color: "#fff8df",
  padding: "11px 18px",
  fontWeight: 900,
  textAlign: "center",
  boxShadow: "0 3px 0 #5a3525",
});

export const confirmButton = style({
  border: "3px solid #6f2d25",
  background: "#b95749",
  color: "#fff7df",
  padding: "11px 18px",
  fontWeight: 900,
  textAlign: "center",
  boxShadow: "0 3px 0 #6f2d25",
  selectors: {
    "&:disabled": {
      opacity: 0.6,
      cursor: "wait",
    },
  },
});
