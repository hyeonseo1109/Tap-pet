import { globalStyle, style } from "@vanilla-extract/css";

export const page = style({
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
});

export const panel = style({
  width: "min(560px, 100%)",
  border: "4px solid #432719",
  background: "#8a583d",
  color: "#fff8df",
  padding: 30,
  boxShadow: "0 0 0 4px #f0d49a, 0 16px 0 rgba(42, 25, 17, 0.42)",
});

export const header = style({
  display: "grid",
  gap: 8,
  textAlign: "center",
  marginBottom: 26,
});

globalStyle(`${header} span`, {
  color: "#ffd36d",
  fontSize: 14,
  fontWeight: 900,
});

globalStyle(`${header} h1`, {
  fontSize: "clamp(26px, 5vw, 40px)",
  lineHeight: 1.1,
  textShadow: "0 3px 0 #4b2b1d",
});

globalStyle(`${header} p`, {
  color: "#f7e7bd",
  fontSize: 14,
  fontWeight: 700,
});

export const field = style({
  display: "grid",
  gap: 8,
  color: "#ffe9aa",
  fontWeight: 900,
});

globalStyle(`${field} input`, {
  width: "100%",
  border: "3px solid #4b2b1d",
  background: "#fff8df",
  color: "#3f261a",
  padding: "14px 16px",
  outline: "none",
  boxShadow: "inset 0 3px 0 rgba(75, 43, 29, 0.18)",
});

export const submitButton = style({
  width: "100%",
  marginTop: 18,
  padding: "15px 18px",
  border: "3px solid #2f4f32",
  background: "#79a85d",
  color: "#fff8df",
  textAlign: "center",
  fontWeight: 900,
  boxShadow: "0 5px 0 #2f4f32",
});
