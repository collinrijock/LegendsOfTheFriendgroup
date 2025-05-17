import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: 'esbuild', // Use esbuild for minification (Vite 5 default)
    esbuild: {
      keepNames: true, // CRITICAL for Colyseus schema class names
      // You might want to uncomment the line below to remove console logs from production builds
      // drop: ['console', 'debugger'],
    },
    sourcemap: false, // Disable sourcemaps for production for smaller bundles
    commonjsOptions: {
      // Vite's default CommonJS handling is usually good.
      // If you encounter issues with CJS dependencies of colyseus.js, you might need:
      // transformMixedEsModules: true,
      // include: [/node_modules/], // Or more specific paths
    },
    // rollupOptions: { // Advanced customization if needed
    //   output: {
    //     manualChunks: {
    //       phaser: ['phaser'],
    //       colyseus: ['colyseus.js'],
    //     },
    //   },
    // },
  },
  optimizeDeps: {
    include: [
      'colyseus.js', // Ensures colyseus.js is correctly processed and pre-bundled by Vite
      // '@colyseus/schema', // Usually a sub-dependency of colyseus.js, but can be added if specific issues arise
    ],
    // disabled: false, // Default is false (enabled), which is generally what you want for optimizeDeps.
  },
  // server: { // Development server specific options
  //   port: 3000, // Example: Set a custom dev server port
  // }
});