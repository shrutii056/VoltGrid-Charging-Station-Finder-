import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://voltgrid-charging-station-finder-kkx7.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
