// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  envDir: "../../",
  esbuild: {
    keepNames: true,
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
  },
  build: {
    minify: 'esbuild', // Use esbuild for minification
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
      // Proxy for all backend calls, REST and WS, via /.proxy/
      // This makes the client code consistent for dev and prod regarding /.proxy/ prefix.
      "/.proxy": {
        target: "http://localhost:4001", // Your backend server
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/\.proxy/, ''), // Strips /.proxy prefix
                                                          // e.g., /.proxy/api/token -> /api/token
                                                          // e.g., /.proxy/api/game (WS) -> /api/game (WS)
      }
      // Note: For production, Nginx needs a similar rule:
      // location /.proxy/ {
      //     rewrite ^/\.proxy/(.*)$ /$1 break;
      //     proxy_pass http://localhost:4001; # (or your backend's actual address)
      //     # ... other necessary proxy headers for HTTP & WS ...
      // }
    },
    hmr: {
      clientPort: mode === "development" ? 3000 : 443,
    },
  },
}));