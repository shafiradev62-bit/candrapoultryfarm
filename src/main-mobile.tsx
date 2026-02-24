import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppMobile from "./AppMobile";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppMobile />
  </StrictMode>
);
