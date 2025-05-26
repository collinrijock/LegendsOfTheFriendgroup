import { Scene } from "phaser";

export class Background extends Scene {
  constructor() {
    super("background");
  }

  create() {
    this.cameras.main.setBackgroundColor(0xadd8e6);
    this.scene.sendToBack();
  }
}
