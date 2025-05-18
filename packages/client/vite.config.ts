// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  envDir: "../../",
  resolve: {
    dedupe: ["@colyseus/schema"],
  },
  build: {
    minify: false, // Changed from 'terser' to false for diagnostics
    sourcemap: true,
    terserOptions: {
      mangle: false ,
      // Keep compression disabled as per the existing configuration
      compress: false,
      keep_classnames: true, // Preserve class names
      keep_fnames: true,     // Preserve function names
    },
    commonjsOptions: {
      include: [/node_modules/], // Or more specific paths
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
      strictRequires: true,
      transformMixedEsModules: true,
    }
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