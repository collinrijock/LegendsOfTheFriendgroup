// vite.config.js
import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

export default defineConfig({
  define: {
    // allow `process.env.NODE_ENV` and friends
    "process.env": {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: "globalThis" },
      plugins: [
        NodeGlobalsPolyfillPlugin({ process: true, buffer: true }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({ process: true, buffer: true }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
});
