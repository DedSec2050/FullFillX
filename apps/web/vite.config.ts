import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET ?? "http://fulfillx-api:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.VITE_PORT ?? 5173),
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      "/health": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.VITE_PORT ?? 4173),
  },
});
