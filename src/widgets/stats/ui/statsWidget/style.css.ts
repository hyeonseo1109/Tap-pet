import { globalStyle, style } from "@vanilla-extract/css";

export const statsWidget = style({
  width: "100%",
  minHeight: "100%",
  display: "grid",
  alignContent: "start",
  gap: 18,
  padding: 22,
  color: "#3d281f",
  "@media": {
    "(max-width: 520px)": {
      padding: 12,
      gap: 12,
    },
  },
});

export const summaryPanel = style({
  border: "3px solid #5a3525",
  background: "#f6e2b5",
  padding: 18,
  "@media": {
    "(max-width: 520px)": {
      padding: 12,
    },
  },
});

globalStyle(`${summaryPanel} > span`, {
  color: "#7a4e34",
  fontSize: 13,
  fontWeight: 900,
});

globalStyle(`${summaryPanel} h2`, {
  margin: "4px 0 16px",
  fontSize: 28,
});

export const summaryGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  "@media": {
    "(max-width: 720px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

globalStyle(`${summaryGrid} div`, {
  border: "3px solid #7a4e34",
  background: "#fff5cf",
  padding: 16,
});

globalStyle(`${summaryGrid} span`, {
  display: "block",
  color: "#90603f",
  fontSize: 13,
  fontWeight: 900,
});

globalStyle(`${summaryGrid} strong`, {
  display: "block",
  marginTop: 8,
  fontSize: 28,
});

export const xpPanel = style({
  border: "3px solid #5a3525",
  background: "#e6c98e",
  padding: 18,
  "@media": {
    "(max-width: 520px)": {
      padding: 12,
    },
  },
});

globalStyle(`${xpPanel} h3`, {
  margin: "0 0 14px",
  fontSize: 22,
});

export const xpGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
  "@media": {
    "(max-width: 720px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    "(max-width: 420px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

globalStyle(`${xpGrid} div`, {
  display: "flex",
  justifyContent: "space-between",
  border: "2px solid #5f6f3d",
  background: "#dce7a3",
  padding: "11px 12px",
  fontWeight: 900,
});
