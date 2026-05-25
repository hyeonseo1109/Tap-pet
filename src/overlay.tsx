import ReactDOM from "react-dom/client";
import { OverlayApp } from "./overlay/OverlayApp";
import "./app/global.css";

document.documentElement.style.background = "transparent";
document.body.style.background = "transparent";
document.body.style.backgroundImage = "none";
document.body.style.backgroundColor = "transparent";

ReactDOM.createRoot(document.getElementById("overlay-root")!).render(
  <OverlayApp />,
);
