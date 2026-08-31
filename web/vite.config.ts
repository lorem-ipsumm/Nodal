import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  plugins: [tailwindcss(), react()],
  build: {
    outDir: path.resolve(__dirname, "../dist-web"),
    emptyOutDir: true,
  },
});
