import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    // Set the base path for assets loaded in this scene.
    // This path should correctly resolve to 'public/assets/' in development (via Vite)
    // and 'dist/assets/' in production (served by Express).
    this.load.setPath("assets/");

    // Load the background image needed for the Preloader scene.
    this.load.image("background", "bg.png");
  }

  create() {
    this.scene.start("Preloader");
  }
}