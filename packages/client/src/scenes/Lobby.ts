import { Scene } from "phaser";
import { getUserName } from "../utils/discordSDK";

export class Lobby extends Scene {
  constructor() {
    super("Lobby");
  }

  create() {
    // Add background
    this.scene.launch("background");

    // Lobby Title
    this.add
      .text(this.cameras.main.centerX, 100, "Lobby", { // Use cameras.main.centerX
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    // Players List Title - Center
    this.add
      .text(this.cameras.main.centerX, 200, "Players in Lobby:", { // Use cameras.main.centerX
        fontFamily: "Arial",
        fontSize: 32,
        color: "#000000", // Consider changing color for visibility on background
        align: "center",
      })
      .setOrigin(0.5);

    // Display current player's name - Center
    // TODO: Fetch and display all players from the server room state
    const playerName = getUserName();
    this.add
      .text(this.cameras.main.centerX, 250, playerName, { // Use cameras.main.centerX
        fontFamily: "Arial",
        fontSize: 24,
        color: "#333333", // Consider changing color
        align: "center",
      })
      .setOrigin(0.5);

    // Start Game Button - Center at bottom
    const startGameButton = this.add
      .text(this.cameras.main.centerX, this.cameras.main.height - 100, "Start Game", { // Use cameras.main.centerX and height
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startGameButton.on("pointerdown", () => {
      // Transition to the Shop scene for Day 1
      console.log("Starting game, entering Shop...");
      // Initialize game day, health, and starting brews
      this.registry.set('currentDay', 1);
      this.registry.set('playerHealth', 50); // Starting health
      this.registry.set('aiHealth', 50); // Starting AI health (for test mode)
      // Initialize persistent card states as empty arrays/nulls
      this.registry.set('playerHandState', [null, null, null, null, null]);
      this.registry.set('playerBattlefieldState', [null, null, null, null, null]);
      // Initial brews are handled in Shop init, but could be set here too if needed globally earlier
      // this.registry.set('playerBrews', 10);
      this.scene.start("Shop");
    });

    startGameButton.on("pointerover", () => {
      startGameButton.setColor("#55ff55"); // Highlight effect
    });

    startGameButton.on("pointerout", () => {
      startGameButton.setColor("#00ff00"); // Reset color
    });
  }
}