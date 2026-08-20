import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Some older libraries (react-grid-layout is one of them) contain
  // debug-logging code that checks `process.env.NODE_ENV`, assuming
  // a Node/Webpack-style environment where `process` always exists.
  // Vite doesn't provide that in the browser by default, which was
  // causing "process is not defined" the moment a drag started. This
  // tells Vite to swap every `process.env.NODE_ENV` for a real string
  // at build time, so the browser never needs an actual `process`.
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
});
