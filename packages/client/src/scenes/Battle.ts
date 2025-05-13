import { Scene } from "phaser";
// Import global room instance
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
// Import schemas for type safety (adjust path)
import { Phase, PlayerState, CardInstanceSchema } from "../../../server/src/schemas/GameState"; // Adjust path
// Import getStateCallbacks for 0.16 listener syntax
import { getStateCallbacks } from "colyseus.js";

export class Battle extends Scene {
  private handCardDisplayObjects: Map<string, (Phaser.GameObjects.Text | null)[]> = new Map(); // Display opponent hand? Maybe just placeholders.

  private battleOver: boolean = false;
  private resultText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text; // For "Battle Ended", "Waiting for results..."

  // Colyseus listeners
  private phaseListenerUnsubscribe: (() => void) | null = null; // Store unsubscribe function

  constructor() {
    super("Battle");
  }

  create() {
    this.scene.launch("background");
    this.battleOver = false; // Reset battle state

    // --- Safety Check ---
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) {
        console.error("Battle Scene: Colyseus room not available!");
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Error: Connection lost.\nPlease return to Main Menu.", { color: '#ff0000', fontSize: '24px', align: 'center', backgroundColor: '#000000' }).setOrigin(0.5);
        this.input.once('pointerdown', () => {
            // Attempt to leave if possible, ignore errors
            try { colyseusRoom?.leave(); } catch (e) {}
            this.scene.start('MainMenu');
        });
        return;
    }

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameHeight = this.cameras.main.height;
    const gameWidth = this.cameras.main.width;

    // --- Result Text & Status Text (initially hidden) ---
    this.resultText = this.add.text(centerX, centerY, "", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
    }).setOrigin(0.5).setAlpha(0);

    this.statusText = this.add.text(centerX, gameHeight - 50, "", {
         fontFamily: "Arial", fontSize: 24, color: "#ffff00", align: "center"
    }).setOrigin(0.5).setAlpha(0);

    // --- Colyseus Listeners ---
    this.setupColyseusListeners();

    // Register shutdown event listener
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.state) return;
    // Get the proxy function for attaching listeners
    const $ = getStateCallbacks(colyseusRoom);

    // Listen for phase changes to end the battle or handle errors via the proxy
    this.phaseListenerUnsubscribe = $(colyseusRoom.state).listen("currentPhase", (currentPhase) => {
        if (!this.scene.isActive()) return; // Guard against updates after shutdown
        console.log(`Battle Scene: Phase changed to ${currentPhase}`);

        if (currentPhase === Phase.BattleEnd) {
            this.handleBattleEnd(); // Trigger results display
        } else if (currentPhase === Phase.Shop) {
            // Stop the current scene before starting the next
            if (this.scene.isActive()) {
                this.scene.stop(); // Stop Battle scene
                this.scene.start("Shop");
            }
        } else if (currentPhase === Phase.GameOver) {
            this.handleGameOver(); // Show final game over message
        } else if (currentPhase !== Phase.Battle) {
            // Unexpected phase, return to Lobby
            console.warn(`Battle Scene: Unexpected phase change to ${currentPhase}. Returning to Lobby.`);
            // Stop the current scene before starting the next
            if (this.scene.isActive()) {
                try { colyseusRoom?.leave(); } catch(e) {} // Attempt to leave
                this.scene.stop(); // Stop Battle scene
                this.scene.start("Lobby");
            }
        }
    });
  }

  cleanupListeners() {
    console.log("Battle Scene: Cleaning up listeners.");
    this.phaseListenerUnsubscribe?.();
    this.phaseListenerUnsubscribe = null;
  }

  handleBattleEnd() {
    if (this.battleOver || !this.scene.isActive()) return;
    this.battleOver = true;
    console.log("Battle ended (server signal received). Displaying results.");

    const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId);
    let opponentState: PlayerState | undefined;
    colyseusRoom?.state.players.forEach((p, sid) => { if (sid !== colyseusRoom?.sessionId) opponentState = p; });

    let resultMessage = "Battle Ended";
    let resultColor = "#ffffff";
    if (myPlayerState && opponentState) {
        if (myPlayerState.health > opponentState.health) {
             resultMessage = "Victory!";
             resultColor = "#88ff88";
        } else if (opponentState.health > myPlayerState.health) {
             resultMessage = "Defeat!";
             resultColor = "#ff8888";
        } else {
             resultMessage = "Draw!";
             resultColor = "#ffff88";
        }
    } else {
        resultMessage = "Battle Ended (Opponent Left?)";
        resultColor = "#ffffff";
    }

    if (this.resultText?.active) {
        this.resultText.setText(resultMessage).setColor(resultColor).setAlpha(1);
    }
    if (this.statusText?.active) {
        this.statusText.setText("Waiting for next round...").setAlpha(1);
    }
  }

  handleGameOver() {
     if (this.battleOver || !this.scene.isActive()) return;
     this.battleOver = true;
     console.log("Game Over signal received.");

     const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId);
     let opponentState: PlayerState | undefined;
     colyseusRoom?.state.players.forEach((p, sid) => { if (sid !== colyseusRoom?.sessionId) opponentState = p; });

     let finalMessage = "Game Over!";
     let finalColor = "#ffffff";

     if (myPlayerState && opponentState) {
         if (myPlayerState.health > opponentState.health) { finalMessage = "You Win!"; finalColor = "#00ff00"; }
         else if (opponentState.health > myPlayerState.health) { finalMessage = "You Lose!"; finalColor = "#ff0000"; }
         else { finalMessage = "Draw!"; finalColor = "#ffff00"; }
     } else if (myPlayerState) {
         finalMessage = "You Win! (Opponent Left)"; finalColor = "#00ff00";
     } else {
         finalMessage = "Game Over (Error?)"; finalColor = "#ff0000";
     }

     if (this.resultText?.active) {
        this.resultText.setText(finalMessage).setColor(finalColor).setAlpha(1);
     }
     if (this.statusText?.active) {
        this.statusText.setText("Click to return to Main Menu").setAlpha(1);
     }

     this.input.once('pointerdown', () => {
         try { colyseusRoom?.leave(); } catch(e) {}
         this.scene.stop("Background");
         this.scene.start("MainMenu");
     });
  }

  shutdown() {
     console.log("Battle scene shutting down explicitly.");
     this.cleanupListeners();

     this.handCardDisplayObjects.forEach(hand => {
         hand?.forEach(displayObj => displayObj?.destroy());
     });
     this.handCardDisplayObjects.clear();

     this.resultText?.destroy();
     this.statusText?.destroy();

     // Unregister the shutdown event listener for this scene
     this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
}