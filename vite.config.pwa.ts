import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist-pwa",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.pwa.html"),
      },
    },
  },
  server: {
    port: 5174,
    host: true,
    open: "/index.pwa.html",
  },
});
