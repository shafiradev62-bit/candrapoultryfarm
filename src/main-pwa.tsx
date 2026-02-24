import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppPWA from "./AppPWA";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppPWA />
  </StrictMode>
);
