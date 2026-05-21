import { style } from "@vanilla-extract/css";

export const homeContainer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  color: "white",
});

export const homeWidget = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "50%",
  width: "60%",
  boxSizing: "border-box",
  backgroundColor: "#b07e5d",
});

export const tapWrapper = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  border: "2px solid white",
  height: "100%",
});

export const tapButton = style({
  // padding: "10px 20px",
  fontSize: "1rem",
  color: "#fff",
  flex: 1,
  border: "1px solid white",
  width: "100%",
  cursor: "pointer",
});

export const contentWrapper = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 3,
  border: "2px solid white",
  height: "100%",
});
