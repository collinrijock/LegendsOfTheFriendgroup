import { ScaleFlow } from "./utils/ScaleFlow";
import { initiateDiscordSDK } from "./utils/discordSDK";
// Import Colyseus connection function and room variable from the new file
import { connectColyseus, colyseusRoom, colyseusClient } from "./utils/colyseusClient"; // Updated import

// Import GameState schema if needed for type hints, though scenes will handle specifics
// import { GameState } from "../../server/src/schemas/GameState"; // Adjust path

import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game"; // Keep for now, but likely unused in main flow
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { Background } from "./scenes/Background";
import { Lobby } from "./scenes/Lobby";
import { Shop } from "./scenes/Shop";
import { Preparation } from "./scenes/Preparation";
import { Battle } from "./scenes/Battle";
import { BoardView } from "./scenes/BoardView"; // Import BoardView

// --- Global Colyseus Room Variable (Now imported from colyseusClient.ts) ---
// export let colyseusRoom: Room | null = null; // Moved
// export let colyseusClient: Client | null = null; // Moved

// Function to connect to Colyseus (Moved to colyseusClient.ts)
// export async function connectColyseus(accessToken: string, username: string) { ... } // Moved


(async () => {
  // Initiate Discord SDK first
  // This now handles Colyseus connection internally via the imported connectColyseus
  await initiateDiscordSDK();

  // Phaser game setup remains largely the same
  new ScaleFlow({
    type: Phaser.AUTO,
    parent: "gameParent",
    width: 1280,
    height: 720,
    backgroundColor: "#000000",
    roundPixels: false,
    pixelArt: false,
    scene: [Boot, Preloader, MainMenu, Lobby, Shop, Preparation, Battle, BoardView, Game, Background], // Added BoardView
  });
})();