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

  // Navbar elements
  private playerHealthText!: Phaser.GameObjects.Text;
  private opponentHealthText!: Phaser.GameObjects.Text; // Renamed from aiHealthText
  private playerBrewsText!: Phaser.GameObjects.Text;
  private dayPhaseText!: Phaser.GameObjects.Text;

  // Colyseus listeners
  private phaseListenerUnsubscribe: (() => void) | null = null; // Store unsubscribe function
  private playerStateListeners: Map<string, () => void> = new Map(); // Track listeners per player
  // Add properties to store onAdd/onRemove unsubscribe functions
  private playerAddListenerUnsubscribe: (() => void) | null = null;
  private playerRemoveListenerUnsubscribe: (() => void) | null = null;

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
    const centerY = this.cameras.main.centerY; // Added for result text positioning
    const gameHeight = this.cameras.main.height;
    const gameWidth = this.cameras.main.width;

    // Get initial state from Colyseus
    const myPlayerId = colyseusRoom.sessionId;
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    let opponentState: PlayerState | undefined;
    colyseusRoom.state.players.forEach((player, sessionId) => {
        if (sessionId !== myPlayerId) {
            opponentState = player;
        }
    });

    const currentDay = colyseusRoom.state.currentDay;
    const playerHealth = myPlayerState?.health ?? 50;
    const opponentHealth = opponentState?.health ?? 50;
    const playerBrews = myPlayerState?.brews ?? 0;

    // --- Navbar ---
    const navbarY = 25;
    const navbarHeight = 50;
    this.add.rectangle(centerX, navbarY, gameWidth, navbarHeight, 0x000000, 0.6);
    // Add styles matching previous implementation
    const navTextStyle = { fontFamily: "Arial", fontSize: 18, color: "#ffffff", align: "left" };
    this.playerHealthText = this.add.text(50, navbarY, `You: ${playerHealth} HP`, { ...navTextStyle, color: "#00ff00" }).setOrigin(0, 0.5);
    this.opponentHealthText = this.add.text(250, navbarY, `Opponent: ${opponentHealth} HP`, { ...navTextStyle, color: "#ff0000" }).setOrigin(0, 0.5);
    this.dayPhaseText = this.add.text(centerX, navbarY, `Day ${currentDay} - Battle Phase`, { ...navTextStyle, fontSize: 24, align: "center" }).setOrigin(0.5);
    this.playerBrewsText = this.add.text(gameWidth - 50, navbarY, `Brews: ${playerBrews}`, { ...navTextStyle, fontSize: 20, color: "#ffff00", align: "right" }).setOrigin(1, 0.5);

    // --- Title ---
    this.add.text(centerX, 80, "Battle Phase!", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ff8c00", // Orange color for battle
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      }).setOrigin(0.5);

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

    // Initial UI update
    this.updateNavbar();
    this.updateDayPhaseText(); // Ensure phase text is correct initially
  }

  // --- Colyseus Listeners ---
  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.state) return;
    // Get the proxy function for attaching listeners
    const $ = getStateCallbacks(colyseusRoom);

    // Listen for phase changes to end the battle or handle errors via the proxy
    this.phaseListenerUnsubscribe = $(colyseusRoom.state).listen("currentPhase", (currentPhase) => {
        if (!this.scene.isActive()) return; // Guard against updates after shutdown
        console.log(`Battle Scene: Phase changed to ${currentPhase}`);
        this.updateDayPhaseText(); // Update navbar

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

    // Listen for health/brew changes to update navbar via the proxy
    colyseusRoom.state.players.forEach((player, sessionId) => {
        // Store the unsubscribe function for each player's specific listeners
        const healthUnsub = $(player).listen("health", () => {
            if (this.scene.isActive()) this.updateNavbar();
        });
        const brewsUnsub = $(player).listen("brews", () => {
            if (this.scene.isActive()) this.updateNavbar();
        });

        const combinedUnsub = () => {
            healthUnsub();
            brewsUnsub();
        };
        this.playerStateListeners.set(sessionId, combinedUnsub);
    });

   if (colyseusRoom.state.players) {
       this.playerAddListenerUnsubscribe = $(colyseusRoom.state.players).onAdd((player, sessionId) => {
           if (!this.scene.isActive()) return;
           console.warn(`Player ${sessionId} joined mid-battle?`);
           this.updateNavbar();
           
           const healthUnsub = $(player).listen("health", () => {
               if (this.scene.isActive()) this.updateNavbar();
           });
           const brewsUnsub = $(player).listen("brews", () => {
               if (this.scene.isActive()) this.updateNavbar();
           });

           const combinedUnsub = () => {
               healthUnsub();
               brewsUnsub();
           };
           this.playerStateListeners.set(sessionId, combinedUnsub);
       });

       this.playerRemoveListenerUnsubscribe = $(colyseusRoom.state.players).onRemove((player, sessionId) => {
           if (!this.scene.isActive()) return;
           console.log(`Player ${sessionId} removed mid-battle`);
           
           const unsubscribe = this.playerStateListeners.get(sessionId);
           if (unsubscribe) {
               unsubscribe();
               this.playerStateListeners.delete(sessionId);
           }
           
           this.updateNavbar();
       });
   } else {
       console.error("Battle Scene: colyseusRoom.state.players is not available when attaching onAdd/onRemove listeners.");
   }
}

cleanupListeners() {
    console.log("Battle Scene: Cleaning up listeners.");
    this.phaseListenerUnsubscribe?.();
    this.phaseListenerUnsubscribe = null;

    this.playerStateListeners.forEach((unsubscribe) => {
        unsubscribe();
    });
    this.playerStateListeners.clear();

    this.playerAddListenerUnsubscribe?.();
    this.playerRemoveListenerUnsubscribe?.();
    this.playerAddListenerUnsubscribe = null;
    this.playerRemoveListenerUnsubscribe = null;
}

  // --- UI Update Functions ---
  updateNavbar() {
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId || !this.playerHealthText?.active || !this.opponentHealthText?.active || !this.playerBrewsText?.active) {
        return;
    }

    const myPlayerId = colyseusRoom.sessionId;
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    let opponentState: PlayerState | undefined;
    colyseusRoom.state.players.forEach((player, sessionId) => {
        if (sessionId !== myPlayerId) opponentState = player;
    });

    this.playerHealthText.setText(`You: ${myPlayerState?.health ?? 'N/A'} HP`);
    this.opponentHealthText.setText(`Opponent: ${opponentState?.health ?? 'N/A'} HP`);
    this.playerBrewsText.setText(`Brews: ${myPlayerState?.brews ?? 'N/A'}`);
  }

   updateDayPhaseText() {
        if (!colyseusRoom || !colyseusRoom.state || !this.dayPhaseText?.active) {
            return;
        }
        const day = colyseusRoom.state.currentDay;
        const phase = colyseusRoom.state.currentPhase;
        const phaseText = phase === Phase.BattleEnd ? "Battle Ended" : phase;
        this.dayPhaseText.setText(`Day ${day} - ${phaseText}`);
   }

  handleBattleEnd() {
    if (this.battleOver || !this.scene.isActive()) return;
    this.battleOver = true;
    console.log("Battle ended (server signal received). Displaying results.");

    this.updateNavbar();
    this.updateDayPhaseText();

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

     this.updateNavbar();
     this.updateDayPhaseText();

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

     this.playerHealthText?.destroy();
     this.opponentHealthText?.destroy();
     this.playerBrewsText?.destroy();
     this.dayPhaseText?.destroy();
     this.resultText?.destroy();
     this.statusText?.destroy();
  }
}