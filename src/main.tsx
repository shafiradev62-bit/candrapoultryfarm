import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./landscape-mobile.css";

console.log("=== MAIN.TSX LOADED ===");

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (!rootElement) {
  console.error("Root element not found!");
} else {
  try {
    console.log("Creating React root...");
    createRoot(rootElement).render(<App />);
    console.log("React app rendered successfully!");
  } catch (error) {
    console.error("Error rendering app:", error);
  }
}
