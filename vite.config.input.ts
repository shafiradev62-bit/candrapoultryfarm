import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  build: {
    outDir: 'dist-input',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.input.html'),
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_APP_MODE': JSON.stringify('input'),
  },
});
