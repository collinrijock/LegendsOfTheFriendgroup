import { Scene } from "phaser";

// @ts-ignore
const isProd = import.meta.env.PROD;

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

    const assetPath = "/assets"; // Standardized path
    this.load.setPath(assetPath);
    this.load.image("background", "bg.png");
    this.load.image("fridge_bg", "fridge_bg.png");
  }

  create() {
    this.scene.start("Preloader");
  }
}