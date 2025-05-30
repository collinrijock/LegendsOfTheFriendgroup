import { Scene } from "phaser";

// @ts-ignore
const isProd = import.meta.env.PROD;

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    const bg = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "background"
    );
    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    //  A simple progress bar. This is the outline of the bar.
    this.add
      .rectangle(
        Number(this.game.config.width) * 0.5,
        Number(this.game.config.height) * 0.5,
        468,
        32
      )
      .setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(
      Number(this.game.config.width) * 0.5 - 230,
      Number(this.game.config.height) * 0.5,
      4,
      28,
      0xffffff
    );

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    const assetPath = "/assets"; // Standardized path
    this.load.setPath(assetPath);
    this.load.image("logo", "logo.png");

    // Remove loading of card data as it's now on the server
    // this.load.json("cardData", "data/cards.json");

    // Load card sprites
    this.load.image("cardFullTier1", "CardFullTier1.png");
    this.load.image("cardMinionTier1", "CardMinionTier1.png");
    this.load.image("lola_art", "lola.png"); // Load card art
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}