import { style } from "@vanilla-extract/css";

export const allWrapperStyle = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  // minHeight: "100vh",
  height: "50%",
  width: "60%",
  padding: "20px",
  boxSizing: "border-box",
  backgroundColor: "#b07e5d",
});

export const titleStyle = style({
  fontSize: "2rem",
  fontWeight: "bold",
  marginBottom: "20px",
});

export const contentStyle = style({
  fontSize: "1.2rem",
  color: "#333",
  textAlign: "center",
  maxWidth: "600px",
});

export const buttonStyle = style({
  marginTop: "30px",
  padding: "10px 20px",
  fontSize: "1rem",
  color: "#fff",
  backgroundColor: "#007bff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
});
