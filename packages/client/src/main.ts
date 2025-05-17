// Import schema classes for priming
import { GameState, PlayerState, CardInstanceSchema } from "../../server/src/schemas/GameState";

// --- Enhanced Schema Priming ---
// This is to help bundlers like Vite/Rollup recognize these classes,
// preventing issues with minification/tree-shaking where
// class constructors might not be correctly identified by Colyseus client.
// We instantiate them once to give a stronger hint to the bundler.
function primeSchemasForBundler() {
  try {
    // @ts-ignore Unused instances are intentional for priming
    const _gs = new GameState();
    // @ts-ignore
    const _ps = new PlayerState();
    // @ts-ignore
    const _cis = new CardInstanceSchema();

    if (typeof window !== 'undefined' && (window as any).__SCHEMA_INSTANCES_PRIMED === undefined) {
      (window as any).__SCHEMA_INSTANCES_PRIMED = true; // Mark as primed
      console.log(
        "Schema instances primed in main.ts for bundler awareness:",
        _gs?.constructor?.name,
        _ps?.constructor?.name,
        _cis?.constructor?.name
      );
    }
  } catch (e) {
    console.warn("Error during schema priming (instantiation in main.ts):", e);
  }
}
primeSchemasForBundler();
// --- End Enhanced Schema Priming ---

import { ScaleFlow } from "./utils/ScaleFlow";
import { initiateDiscordSDK } from "./utils/discordSDK";
// Import Colyseus connection function and room variable from the new file
import { connectColyseus, colyseusRoom, colyseusClient } from "./utils/colyseusClient"; // Updated import

// Import GameState schema if needed for type hints, though scenes will handle specifics
// import { GameState } from "../../server/src/schemas/GameState"; // Adjust path - already imported above for priming

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