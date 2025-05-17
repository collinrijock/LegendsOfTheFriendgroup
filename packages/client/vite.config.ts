import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: 'esbuild', // Vite 5 default for JS/TS. Can also be 'terser' or false.
    esbuild: {
      // This option is crucial for preventing class name mangling,
      // which can break Colyseus schema instantiation in production.
      keepNames: true,
    },
    // If you were to use Terser instead of esbuild for minification:
    // minify: 'terser',
    // terserOptions: {
    //   keep_classnames: true, // Equivalent for Terser
    //   keep_fnames: true,     // Also good for Terser
    // },
  },
  // If you have other Vite configurations (e.g., plugins for Phaser, server options),
  // you can add them here. For example:
  // plugins: [
  //   // phaser({ // If using vite-plugin-phaser
  //   //   phaserVersion: '3.80.1', // Specify your Phaser version
  //   // })
  // ],
  // server: {
  //   port: 3000, // Example development server port
  // }
});