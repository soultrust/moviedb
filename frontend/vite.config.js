import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: "spa", // Ensures all routes fall back to index.html on reload (fixes "Not Found" on nested routes)
});
