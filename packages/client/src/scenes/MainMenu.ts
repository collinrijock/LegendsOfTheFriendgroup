import { Scene } from "phaser";
import { authorizeDiscordUser } from "../utils/discordSDK";
// Import the global room variable and card loading function
import { colyseusRoom, loadAllCardData } from "../utils/colyseusClient";

export class MainMenu extends Scene {
  private statusText!: Phaser.GameObjects.Text;
  
  constructor() {
    super("MainMenu");
  }


  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");
    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    this.add.text(Number(this.game.config.width) * 0.5, 300, "Legends of the Friendgroup", {
      fontFamily: "Arial Black",
      fontSize: 58,
      // yellow
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 8,
      align: "center",
    }).setOrigin(0.5);

    this.add
      .text(Number(this.game.config.width) * 0.5, 460, "Click to Start", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    // Add status text for feedback
    this.statusText = this.add.text(this.cameras.main.centerX, 520, "", {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffff00",
        align: "center",
    }).setOrigin(0.5);


    this.input.once("pointerdown", async () => {
        this.statusText.setText("Authorizing with Discord...");
        const authSuccess = await authorizeDiscordUser();

        if (authSuccess) {
            this.statusText.setText("Connecting to server...");
            // Connection attempt happens within authorizeDiscordUser now
            // Wait a short moment to allow connection attempt
            await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust delay if needed

            if (colyseusRoom) {
                this.statusText.setText("Loading game data...");
                // Load all card data before entering the lobby
                const cardDataLoaded = await loadAllCardData();
            
                if (cardDataLoaded) {
                    this.statusText.setText("Connected! Entering Lobby...");
                    // Successfully authorized, connected, and loaded card data
                    this.scene.start("Lobby");
                } else {
                    this.statusText.setText("Failed to load game data. Please try again.");
                }
            } else {
                 this.statusText.setText("Failed to connect to server. Please try again.");
                 // Re-enable click listener? Or show a retry button.
                 // For now, just display error.
            }
        } else {
            this.statusText.setText("Discord authorization failed. Please try again.");
            // Re-enable click listener?
        }
    });
  }
}