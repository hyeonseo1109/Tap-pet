import { style } from "@vanilla-extract/css";

export const logoutButton = style({
  marginTop: "auto",
  minHeight: 42,
  border: "3px solid #3b2418",
  background: "#4d3326",
  color: "#ffecc2",
  textAlign: "center",
  fontWeight: 900,
  boxShadow: "0 4px 0 #2b1a12",
  "@media": {
    "(max-width: 980px)": {
      minHeight: 36,
      borderWidth: 2,
      fontSize: 13,
      boxShadow: "0 3px 0 #2b1a12",
    },
    "(max-width: 760px)": {
      marginTop: 0,
    },
  },
});
