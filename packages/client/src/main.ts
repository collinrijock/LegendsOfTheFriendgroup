import { ScaleFlow } from "./utils/ScaleFlow";
import { initiateDiscordSDK } from "./utils/discordSDK";

import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { Background } from "./scenes/Background";
// Import the new Lobby scene
import { Lobby } from "./scenes/Lobby";
// Import the new Shop scene
import { Shop } from "./scenes/Shop";
// Import the new Preparation scene
import { Preparation } from "./scenes/Preparation";
// Import the new Battle scene
import { Battle } from "./scenes/Battle";


(async () => {
  initiateDiscordSDK();

  new ScaleFlow({
    type: Phaser.AUTO,
    parent: "gameParent",
    width: 1280, // this must be a pixel value
    height: 720, // this must be a pixel value
    backgroundColor: "#000000",
    roundPixels: false,
    pixelArt: false,
    // Add Lobby and Shop to the scene list
    // Game scene is still here but not directly accessed from Lobby anymore
    // Add Preparation scene to the list
    // Add Battle scene to the list
    scene: [Boot, Preloader, MainMenu, Lobby, Shop, Preparation, Battle, Game, Background],
  });
})();