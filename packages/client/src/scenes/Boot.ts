import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.setPath("assets/");
  }

  create() {
    this.scene.start("Preloader");
  }
}
