import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/chatwoot_tools/",
  server: {
    proxy: {
      "/chatwoot-api": {
        target: "https://app.chatwoot.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatwoot-api/, ""),
      },
    },
  },
});
