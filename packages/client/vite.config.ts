// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  envDir: "../../",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },

  server: {
    port: 3000,
    proxy: {
      "/.proxy/assets": {
        target: "http://localhost:3000/assets",
        changeOrigin: true,
        ws: true,
        rewrite: (p) => p.replace(/^\/.proxy\/assets/, ""),
      },
      "/.proxy/api": {
        target: "http://localhost:4001",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (p) => p.replace(/^\/.proxy\/api/, ""),
      },
    },
    hmr: {
      clientPort: mode === "development" ? 3000 : 443,
    },
  },
}));
