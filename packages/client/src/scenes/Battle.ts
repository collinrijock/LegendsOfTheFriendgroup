import { Scene } from "phaser";
// Import global room instance
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
// Import client-side schemas for type safety
import { Phase, ClientPlayerState, ClientCardInstance } from "../schemas/ClientSchemas";
// Import getStateCallbacks for 0.16 listener syntax
import { getStateCallbacks } from "colyseus.js";

// Helper function to format seconds into MM:SS
function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

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
    }).setOrigin(0.5).setAlpha(0)?.setDepth(1500);

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

    const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId) as ClientPlayerState | undefined;
    let opponentState: ClientPlayerState | undefined;
    colyseusRoom?.state.players.forEach((p: any, sid: string) => { if (sid !== colyseusRoom?.sessionId) opponentState = p as ClientPlayerState; });

    let mainMessage = "Battle Complete!";
    let winnerInfoMessage = "";
    let resultColor = "#ffffff"; // Default color

    if (myPlayerState && opponentState) {
        if (myPlayerState.health > opponentState.health) {
             winnerInfoMessage = `${myPlayerState.username} Wins!`;
             resultColor = "#88ff88"; // Green for local player win
        } else if (opponentState.health > myPlayerState.health) {
             winnerInfoMessage = `${opponentState.username} Wins!`;
             resultColor = "#ff8888"; // Red for local player loss
        } else {
             winnerInfoMessage = "Draw!";
             resultColor = "#ffff88"; // Yellow for draw
        }
    } else if (myPlayerState) { // Opponent likely left
        winnerInfoMessage = `${myPlayerState.username} Wins! (Opponent Left)`;
        resultColor = "#88ff88";
    } else { // Should not happen if myPlayerState is the local player
        winnerInfoMessage = "(Error determining outcome)";
        resultColor = "#ffffff";
    }

    const finalResultMessage = `${mainMessage}\n${winnerInfoMessage}`;

    if (this.resultText?.active) {
        this.resultText.setText(finalResultMessage).setColor(resultColor).setAlpha(1).setDepth(1500);
    }
    if (this.statusText?.active) {
        this.statusText.setText("Waiting for next round...").setAlpha(1);
    }
  }

  handleGameOver() {
     if (this.battleOver || !this.scene.isActive()) return;
     this.battleOver = true;
     console.log("Game Over signal received.");

     // Hide or destroy any existing battle result text
     this.resultText?.destroy();
     this.statusText?.destroy();

     const centerX = this.cameras.main.centerX;
     const centerY = this.cameras.main.centerY;
     const gameWidth = this.cameras.main.width;
     const gameHeight = this.cameras.main.height;

     // Add a dark overlay
     const overlay = this.add.rectangle(centerX, centerY, gameWidth, gameHeight, 0x000000, 0.75)
         .setDepth(1999); // Ensure it's on top of board but below game over text

     // "GAME OVER" Title
     const gameOverTitle = this.add.text(centerX, centerY - 150, "GAME OVER", {
         fontFamily: "Arial Black",
         fontSize: "96px",
         color: "#ff3333",
         stroke: "#000000",
         strokeThickness: 10,
         align: "center"
     }).setOrigin(0.5).setDepth(2000);

     const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId) as ClientPlayerState | undefined;
     let opponentState: ClientPlayerState | undefined;
     colyseusRoom?.state.players.forEach((p: any, sid: string) => { if (sid !== colyseusRoom?.sessionId) opponentState = p as ClientPlayerState; });

     let outcomeMessage = "";
     if (myPlayerState && opponentState) {
         if (myPlayerState.health > opponentState.health) { outcomeMessage = "You Win!"; }
         else if (opponentState.health > myPlayerState.health) { outcomeMessage = "You Lose!"; }
         else { outcomeMessage = "It's a Draw!"; }
     } else if (myPlayerState) {
         outcomeMessage = "You Win! (Opponent Left)";
     } else {
         outcomeMessage = "Match Concluded";
     }

     const outcomeText = this.add.text(centerX, centerY - 30, outcomeMessage, {
         fontFamily: "Arial",
         fontSize: "48px",
         color: "#ffffff",
         stroke: "#333333",
         strokeThickness: 6,
         align: "center"
     }).setOrigin(0.5).setDepth(2000);

     // Display Total Match Time
     const totalMatchTime = colyseusRoom?.state.matchTimer ?? 0;
     const matchTimeText = this.add.text(centerX, centerY + 40, `Total Match Time: ${formatTime(totalMatchTime)}`, {
         fontFamily: "Arial",
         fontSize: "28px",
         color: "#cccccc",
         align: "center"
     }).setOrigin(0.5).setDepth(2000);


     const returnPrompt = this.add.text(centerX, centerY + 120, "Click to return to Main Menu", {
         fontFamily: "Arial",
         fontSize: "24px",
         color: "#ffff00",
         align: "center"
     }).setOrigin(0.5).setDepth(2000);

     this.input.once('pointerdown', () => {
         if (!this.scene.isActive()) return;
         try { colyseusRoom?.leave(); } catch(e) {}
         this.scene.stop("Background"); // Stop background if it's running
         this.scene.stop("BoardView"); // Stop BoardView if it's running
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