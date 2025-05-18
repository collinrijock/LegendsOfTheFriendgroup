// vite.config.js
import { defineConfig } from "vite";
import { terser } from "rollup-plugin-terser";

export default ({ mode }) => {
  const isLocalhost = process.env.NODE_ENV === "development";

  return defineConfig({
    envDir: "../../",
    build: {
      minify: "terser",
      terserOptions: {
        mangle: false,
        keep_classnames: true,
        keep_fnames: true,
      },
    },

    server: {
      port: 3000,
      proxy: {
        "/.proxy/assets": {
          target: "http://localhost:3000/assets",
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/.proxy\/assets/, ""),
        },
        "/.proxy/api": {
          target: "http://localhost:4001",
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/.proxy\/api/, ""),
        },
      },
      hmr: {
        clientPort: isLocalhost ? 3000 : 443,
      },
    },
  });
};
