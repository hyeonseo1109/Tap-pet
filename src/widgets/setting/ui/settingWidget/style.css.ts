import { globalStyle, style } from "@vanilla-extract/css";

export const settingWidget = style({
  width: "100%",
  minHeight: "100%",
  padding: 22,
  color: "#3d281f",
  display: "grid",
  alignContent: "start",
  gap: 18,
});

export const settingPanel = style({
  border: "3px solid #5a3525",
  background: "#f6e2b5",
  padding: 18,
});

globalStyle(`${settingPanel} > span`, {
  color: "#7a4e34",
  fontSize: 13,
  fontWeight: 900,
});

globalStyle(`${settingPanel} h2`, {
  margin: "4px 0 16px",
  fontSize: 28,
});

export const settingList = style({
  display: "grid",
  gap: 12,
});

export const settingRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 14,
  alignItems: "center",
  border: "3px solid #7a4e34",
  background: "#fff5cf",
  padding: 14,
});

globalStyle(`${settingRow} div`, {
  display: "grid",
  gap: 4,
});

globalStyle(`${settingRow} strong`, {
  fontSize: 18,
});

globalStyle(`${settingRow} span`, {
  color: "#7a4e34",
  fontSize: 13,
  fontWeight: 800,
});

globalStyle(`${settingRow} input`, {
  width: 46,
  height: 26,
  accentColor: "#6f9d55",
});

export const volumeRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 14,
  alignItems: "center",
  border: "3px solid #7a4e34",
  background: "#fff5cf",
  padding: 14,
});

globalStyle(`${volumeRow} > div:first-child`, {
  display: "grid",
  gap: 4,
});

globalStyle(`${volumeRow} strong`, {
  fontSize: 18,
});

globalStyle(`${volumeRow} > div:first-child span`, {
  color: "#7a4e34",
  fontSize: 13,
  fontWeight: 800,
});

export const volumeControl = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

export const volumeSlider = style({
  width: 120,
  accentColor: "#6f9d55",
  cursor: "pointer",
  selectors: {
    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed",
    },
  },
});

export const volumeValue = style({
  fontSize: 13,
  fontWeight: 900,
  color: "#7a4e34",
  minWidth: 36,
  textAlign: "right",
});
