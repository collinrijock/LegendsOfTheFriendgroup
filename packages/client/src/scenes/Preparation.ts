import { Scene } from "phaser";
// Import global room instance
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
// Import client-side schemas for type safety
import {
  Phase,
  ClientPlayerState,
  ClientCardInstance,
} from "../schemas/ClientSchemas";
// Reuse client interface if compatible
// import { CardInstance } from "./Battle"; // Not strictly needed if using ClientCardInstance
// Import getStateCallbacks for 0.16 listener syntax
import { getStateCallbacks } from "colyseus.js";
import { BoardView } from "./BoardView"; // Import BoardView

const CARD_HEIGHT = 140;
const CARD_WIDTH = 100;

export class Preparation extends Scene {
  private startBattleButton!: Phaser.GameObjects.Text;
  private waitingText!: Phaser.GameObjects.Text; // "Waiting for other player..."

  // Colyseus listeners
  private playerStateListener: (() => void) | null = null;
  private handListener: (() => void) | null = null;
  private battlefieldListener: (() => void) | null = null;
  private phaseListener: (() => void) | null = null;

  // Colyseus listeners - Store unsubscribe functions
  private playerStateListenerUnsub: (() => void) | null = null;
  private handAddUnsub: (() => void) | null = null;
  private handRemoveUnsub: (() => void) | null = null;
  private handChangeUnsub: (() => void) | null = null; // Assuming onChange returns unsub
  private battlefieldAddUnsub: (() => void) | null = null;
  private battlefieldRemoveUnsub: (() => void) | null = null;
  private battlefieldChangeUnsub: (() => void) | null = null; // Assuming onChange returns unsub
  private phaseListenerUnsub: (() => void) | null = null;
  private otherPlayerChangeListeners: Map<string, () => void> = new Map(); // For other players' onChange
  private otherPlayerAddUnsub: (() => void) | null = null;
  private otherPlayerRemoveUnsub: (() => void) | null = null;

  // Declare clientSideCardLayout
  private clientSideCardLayout: Map<
    string,
    {
      area: "hand" | "battlefield";
      slotKey: string;
      gameObject: Phaser.GameObjects.Container;
    }
  > = new Map();

  constructor() {
    super("Preparation");
  }

  // Remove init - state comes from Colyseus
  // init(data: { playerBrews?: number, currentDay?: number }) { ... }

  create() {
    this.scene.launch("background"); // Keep background launch

    // --- Launch BoardView if not already active ---
    if (!this.scene.get("BoardView")?.scene.isActive()) {
      this.scene.launch("BoardView");
    }
    this.scene.bringToTop(); // Ensure Preparation UI is on top of BoardView
    // --- End BoardView Launch ---

    // --- Safety Check ---
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) {
      console.error("Preparation Scene: Colyseus room not available!");
      this.add
        .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY,
          "Error: Connection lost.\nPlease return to Main Menu.",
          { color: "#ff0000", fontSize: "24px", align: "center" }
        )
        .setOrigin(0.5);
      this.input.once("pointerdown", () => this.scene.start("MainMenu"));
      return;
    }

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameHeight = this.cameras.main.height;
    const gameWidth = this.cameras.main.width;

    // --- Log Hand State ---
    const myPlayerStateForLog = colyseusRoom.state.players.get(
      colyseusRoom.sessionId
    );
    if (myPlayerStateForLog) {
      console.log(
        "Preparation Create: Initial myPlayerState.hand contents:",
        JSON.stringify(Object.fromEntries(myPlayerStateForLog.hand.entries()))
      );
    } else {
      console.log("Preparation Create: myPlayerState not found initially.");
    }
    // --- End Log ---

    // --- Title ---
    this.add
      .text(centerX, 80, "Preparation Phase", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);
    // Add styles matching previous implementation

    // --- Start Battle Button ---
    this.startBattleButton = this.add
      .text(centerX, gameHeight - 50, "Start Battle", {
        fontFamily: "Arial Black",
        fontSize: 40,
        color: "#888888", // Start disabled
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5);
    // Add styles matching previous implementation (start disabled color: #888888)
    this.startBattleButton.setColor("#888888").disableInteractive(); // Start disabled

    // --- Waiting Text ---
    this.waitingText = this.add
      .text(centerX, gameHeight - 20, "", {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#ffff00",
        align: "center",
      })
      .setOrigin(0.5)
      .setVisible(false); // Initially hidden

    // --- Colyseus Listeners ---
    this.setupColyseusListeners();

    // Initial UI update based on readiness
    this.updateWaitingStatus();

    // --- Schedule button state update ---
    this.time.delayedCall(100, this.updateStartButtonState, [], this); // Ensure button state is correct after BoardView init

    // Register shutdown event listener
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  // --- Drag and Drop ---

  // --- Colyseus State Synchronization ---

  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.sessionId) return;
    const myPlayerId = colyseusRoom.sessionId;
    // Get the proxy function for attaching listeners
    const $ = getStateCallbacks(colyseusRoom);

    // Listen to general player state changes (health, brews, isReady)
    const player = colyseusRoom.state.players.get(myPlayerId);
    if (player) {
      // Use onChange for the whole player object or listen for specific props
      // Store the returned unsubscribe function
      // Use proxy for the player object
      this.playerStateListenerUnsub = $(player).onChange(() => {
        if (!this.scene.isActive()) return; // Guard against updates after shutdown
        this.updateWaitingStatus();
      });

      // Listen to hand changes via the proxy
      this.handAddUnsub = $(player.hand).onAdd((card, key) => {
        // --- Add Log ---
        console.log(
          `Preparation Scene: player.hand.onAdd triggered for key: ${key}, card: ${
            card?.name
          }. Scene active: ${this.scene.isActive()}`
        );
        if (this.scene.isActive()) {
          this.updateStartButtonState(); // Update button based on new hand state
        }
      });
      this.handRemoveUnsub = $(player.hand).onRemove((card, key) => {
        if (this.scene.isActive()) this.updateStartButtonState();
      });
      // Note: onChange on individual items within the map might require attaching listeners inside onAdd
      // For now, updateBoardFromState on Add/Remove covers visual updates.

      // Listen to battlefield changes via the proxy
      this.battlefieldAddUnsub = $(player.battlefield).onAdd((card, key) => {
        if (this.scene.isActive()) this.updateStartButtonState();
      });
      this.battlefieldRemoveUnsub = $(player.battlefield).onRemove(
        (card, key) => {
          if (this.scene.isActive()) this.updateStartButtonState();
        }
      );
      // Note: onChange on individual items within the map might require attaching listeners inside onAdd
    } else {
      console.error("Preparation Scene: My player state not found on init.");
    }

    // Listen for phase changes via the proxy
    // Store the returned unsubscribe function
    this.phaseListenerUnsub = $(colyseusRoom.state).listen(
      "currentPhase",
      (currentPhase) => {
        if (!this.scene.isActive()) return;
        console.log(`Preparation Scene: Phase changed to ${currentPhase}`);
        if (currentPhase === Phase.Battle) {
          // Stop the current scene before starting the next
          if (this.scene.isActive()) {
            this.scene.stop(); // Stop Preparation scene
            this.scene.start("Battle");
          }
        } else if (currentPhase !== Phase.Preparation) {
          console.warn(
            `Preparation Scene: Unexpected phase change to ${currentPhase}. Returning to Lobby.`
          );
          // Stop the current scene before starting the next
          if (this.scene.isActive()) {
            this.scene.stop(); // Stop Preparation scene
            this.scene.start("Lobby");
          }
        }
        this.updateWaitingStatus();
      }
    );

    // Listen for changes in other players' ready status & join/leave via the proxy
    // Store the returned unsubscribe functions
    this.otherPlayerAddUnsub = $(colyseusRoom.state.players).onAdd(
      (addedPlayer, sessionId) => {
        if (this.scene.isActive()) {
          if (sessionId !== myPlayerId) {
            // Listen for changes on the added player via the proxy
            const unsub = $(addedPlayer).listen("isReady", () => {
              // Listen specifically to isReady
              if (this.scene.isActive()) this.updateWaitingStatus();
            });
            this.otherPlayerChangeListeners.set(sessionId, unsub);
          }
          this.updateWaitingStatus();
        }
      }
    );
    this.otherPlayerRemoveUnsub = $(colyseusRoom.state.players).onRemove(
      (removedPlayer, sessionId) => {
        if (this.scene.isActive()) {
          // Remove the specific listener for the removed player
          const unsub = this.otherPlayerChangeListeners.get(sessionId);
          unsub?.();
          this.otherPlayerChangeListeners.delete(sessionId);
          this.updateWaitingStatus();
        }
      }
    );
    // Add listeners for existing other players
    colyseusRoom.state.players.forEach(
      (existingPlayer: any, sessionId: string) => {
        // Cast to any or use ClientPlayerState
        if (sessionId !== myPlayerId) {
          // Use proxy for existing player
          const unsub = $(existingPlayer as ClientPlayerState).listen(
            "isReady",
            () => {
              // Listen specifically to isReady
              if (this.scene.isActive()) this.updateWaitingStatus();
            }
          );
          this.otherPlayerChangeListeners.set(sessionId, unsub);
        }
      }
    );
  }

  cleanupListeners() {
    console.log("Preparation Scene: Cleaning up listeners.");

    // Call stored unsubscribe functions
    this.playerStateListenerUnsub?.();
    this.handAddUnsub?.();
    this.handRemoveUnsub?.();
    this.handChangeUnsub?.(); // Call if stored
    this.battlefieldAddUnsub?.();
    this.battlefieldRemoveUnsub?.();
    this.battlefieldChangeUnsub?.(); // Call if stored
    this.phaseListenerUnsub?.();
    this.otherPlayerAddUnsub?.();
    this.otherPlayerRemoveUnsub?.();
    this.otherPlayerChangeListeners.forEach((unsub) => unsub()); // Unsubscribe from each other player

    // Clear stored functions/maps
    this.playerStateListenerUnsub = null;
    this.handAddUnsub = null;
    this.handRemoveUnsub = null;
    this.handChangeUnsub = null;
    this.battlefieldAddUnsub = null;
    this.battlefieldRemoveUnsub = null;
    this.battlefieldChangeUnsub = null;
    this.phaseListenerUnsub = null;
    this.otherPlayerAddUnsub = null;
    this.otherPlayerRemoveUnsub = null;
    this.otherPlayerChangeListeners.clear();

    // Remove input listeners
    this.input.off("dragstart");
    this.input.off("drag");
    this.input.off("dragend");
    this.startBattleButton?.off("pointerdown");
    this.startBattleButton?.off("pointerover");
    this.startBattleButton?.off("pointerout");
  }

  // --- UI Update Functions ---

  // Initializes clientSideCardLayout based on server state and makes cards draggable
  private makeLocalPlayerCardsDraggable() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.scene.isActive()) {
      console.warn(
        "Preparation: Cannot make cards draggable, room/session/scene inactive."
      );
      return;
    }
    const myPlayerId = colyseusRoom.sessionId;
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    const boardView = this.scene.get("BoardView") as BoardView;

    if (!myPlayerState || !boardView) {
      console.warn(
        "Preparation: Player state or BoardView not found for making cards draggable."
      );
      return;
    }

    // Clear existing layout and draggability from old objects if any
    this.clientSideCardLayout.forEach((entry) => {
      if (entry.gameObject && entry.gameObject.input) {
        this.input.disable(entry.gameObject); // Make previously draggable items non-draggable
      }
    });
    this.clientSideCardLayout.clear();

    const processCards = (
      collection: Map<string, ClientCardInstance>, // Updated type
      area: "hand" | "battlefield"
    ) => {
      collection.forEach((cardSchema, slotKey) => {
        const cardGO = boardView.getCardGameObjectByInstanceId(
          cardSchema.instanceId
        );
        if (cardGO) {
          cardGO.setInteractive({ useHandCursor: true }); // Ensure interactive for draggability
          this.input.setDraggable(cardGO);
          this.clientSideCardLayout.set(cardSchema.instanceId, {
            area,
            slotKey,
            gameObject: cardGO,
          });
          // Ensure cardGO is on top of BoardView's slot outlines if z-ordering is an issue
          // boardView.children.bringToTop(cardGO); // BoardView manages its own card depths
        } else {
          console.warn(
            `Preparation: Could not find GameObject in BoardView for card instance ${cardSchema.instanceId}`
          );
        }
      });
    };

    processCards(myPlayerState.hand, "hand");
    processCards(myPlayerState.battlefield, "battlefield");

    console.log(
      "Preparation: Made local player cards draggable and initialized clientSideCardLayout.",
      this.clientSideCardLayout
    );
    this.updateStartButtonState();
  }

  updateWaitingStatus() {
    if (
      !colyseusRoom ||
      !colyseusRoom.sessionId ||
      !this.startBattleButton ||
      !this.waitingText
    )
      return;

    const myPlayerState = colyseusRoom.state.players.get(
      colyseusRoom.sessionId
    );
    if (!myPlayerState) return;

    let allPlayersReady = true;
    colyseusRoom.state.players.forEach((player: any) => {
      // Cast to any or use ClientPlayerState
      if (!(player as ClientPlayerState).isReady) allPlayersReady = false;
    });

    const amReady = myPlayerState.isReady;
    const canInteract =
      !amReady && colyseusRoom.state.currentPhase === Phase.Preparation;

    // Enable/disable button based on interaction state AND board state
    // updateStartButtonState handles the button color/interactivity based on board content and ready state
    this.updateStartButtonState();

    // Show/hide waiting text and adjust button text if ready
    if (amReady && !allPlayersReady) {
      this.waitingText
        .setText("Waiting for other player(s)...")
        .setVisible(true);
      this.startBattleButton.setText("Cancel Ready"); // Change button text
      // updateStartButtonState will set color and interactivity based on amReady
    } else {
      this.waitingText.setVisible(false);
      this.startBattleButton.setText("Start Battle"); // Reset button text
      // updateStartButtonState will set color and interactivity
    }

    // BoardView handles drag interaction state
  }

  updateStartButtonState() {
    if (!this.startBattleButton || !this.startBattleButton.active) {
      return;
    }
    let battlefieldCardsCount = 0;
    const boardView = this.scene.get("BoardView") as BoardView;
    if (boardView && boardView.scene.isActive()) {
      const layoutData = boardView.getLocalPlayerLayoutData();
      layoutData.forEach((entry) => {
        if (entry.area === "battlefield") {
          battlefieldCardsCount++;
        }
      });
    }
    const canStartBattle = battlefieldCardsCount > 0;

    const myPlayerState = colyseusRoom?.state.players.get(
      colyseusRoom?.sessionId
    ) as ClientPlayerState | undefined;
    const amReady = myPlayerState?.isReady ?? false;
    const isPrepPhase = colyseusRoom?.state.currentPhase === Phase.Preparation;

    // Remove existing listeners to prevent stacking
    this.startBattleButton.off("pointerdown").off("pointerover").off("pointerout");

    // Define pointerdown behavior
    this.startBattleButton.on("pointerdown", () => {
      if (!colyseusRoom || !colyseusRoom.sessionId) return;
      const currentMyPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId) as ClientPlayerState | undefined;

      if (currentMyPlayerState && colyseusRoom.state.currentPhase === Phase.Preparation) {
        if (currentMyPlayerState.isReady) {
          colyseusRoom.send("playerUnready");
        } else {
          // Only confirm if canStartBattle is true (player has cards on board)
          // This check is implicitly handled by the button being disabled if !canStartBattle
          // but good to be explicit if confirmPreparation had other ways to be called.
          if (canStartBattle) {
              this.confirmPreparation();
          } else {
              console.log("Preparation: Cannot start battle, no cards on battlefield.");
          }
        }
      }
    });

    // Define pointerover behavior
    this.startBattleButton.on("pointerover", () => {
      if (this.startBattleButton.input?.enabled) {
        const currentMyPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId) as ClientPlayerState | undefined;
        const currentAmReady = currentMyPlayerState?.isReady ?? false;
        if (currentAmReady) { // "Cancel Ready" state
          this.startBattleButton.setColor("#ffaa55"); // Hover for "Cancel Ready"
        } else { // "Start Battle" state (and enabled)
          this.startBattleButton.setColor("#55ff55"); // Hover for "Start Battle"
        }
      }
    });

    // Define pointerout behavior
    this.startBattleButton.on("pointerout", () => {
      // Color will be reset by the main logic below based on current state
      // This handler primarily ensures that if it was hovered, it reverts.
      // The main logic will then set the correct non-hover color.
      // Re-evaluate current state to set correct base color on pointerout
      const currentMyPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId) as ClientPlayerState | undefined;
      const currentAmReady = currentMyPlayerState?.isReady ?? false;
      const currentIsPrepPhase = colyseusRoom?.state.currentPhase === Phase.Preparation;

      if (!currentIsPrepPhase) {
          this.startBattleButton.setColor("#888888"); // Disabled color
      } else {
          if (currentAmReady) {
              this.startBattleButton.setColor("#ff8800"); // Normal for "Cancel Ready"
          } else {
              // To determine color for "Start Battle", we need canStartBattle again
              let currentBattlefieldCardsCount = 0;
              const currentBoardView = this.scene.get("BoardView") as BoardView;
              if (currentBoardView && currentBoardView.scene.isActive()) {
                  const layoutData = currentBoardView.getLocalPlayerLayoutData();
                  layoutData.forEach((entry) => {
                      if (entry.area === "battlefield") currentBattlefieldCardsCount++;
                  });
              }
              const currentCanStartBattle = currentBattlefieldCardsCount > 0;

              if (currentCanStartBattle) {
                  this.startBattleButton.setColor("#00ff00"); // Normal for "Start Battle"
              } else {
                  this.startBattleButton.setColor("#888888"); // Disabled color
              }
          }
      }
      // If button is disabled, it should be grey anyway.
      if (!this.startBattleButton.input?.enabled && this.startBattleButton.active) {
          this.startBattleButton.setColor("#888888");
      }
    });

    // Set text, color, and interactivity based on current state
    if (!isPrepPhase) {
      this.startBattleButton.setText("Start Battle").setColor("#888888").disableInteractive();
    } else {
      // It IS the Preparation phase
      if (amReady) {
        // Player is ready: "Cancel Ready", orange, interactive.
        this.startBattleButton.setText("Cancel Ready").setColor("#ff8800").setInteractive({ useHandCursor: true });
      } else {
        // Player is NOT ready.
        this.startBattleButton.setText("Start Battle");
        if (canStartBattle) {
          // Not ready, but CAN start: Green, interactive.
          this.startBattleButton.setColor("#00ff00").setInteractive({ useHandCursor: true });
        } else {
          // Not ready, CANNOT start: Grey, disabled.
          this.startBattleButton.setColor("#888888").disableInteractive();
        }
      }
    }
  }

  // Called when the "Start Battle" button is clicked AND player is NOT ready
  confirmPreparation() {
    if (!colyseusRoom) return;
    console.log("Confirming preparation layout...");

    const boardView = this.scene.get("BoardView") as BoardView;
    if (!boardView || !boardView.scene.isActive()) {
      console.error("Preparation: BoardView not available to get layout data.");
      return;
    }
    const { handLayout, battlefieldLayout } = boardView.getCardLayouts();

    console.log("Sending preparation layout to server:", {
      handLayout,
      battlefieldLayout,
    });

    // Send layout (with instance IDs) to server and mark as ready
    colyseusRoom.send("setPreparation", {
      handLayout: handLayout,
      battlefieldLayout: battlefieldLayout,
    });
    // Note: Server sets isReady=true upon receiving this message.
    // Client UI update (waiting text, disabled button) will happen via playerStateListener.
    this.updateWaitingStatus(); // Immediately show waiting state visually
  }

  // Override shutdown
  shutdown() {
    console.log("Preparation scene shutting down explicitly.");
    this.cleanupListeners();
    // Destroy UI elements to prevent leaks if scene restarts
    this.startBattleButton?.destroy();
    this.waitingText?.destroy();

    // Clear arrays and maps
    this.clientSideCardLayout.clear(); // Clear the map

    // Unregister the shutdown event listener for this scene
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
}