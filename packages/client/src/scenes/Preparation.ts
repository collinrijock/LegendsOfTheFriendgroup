import { Scene } from "phaser";
// Import global room instance
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
// Import schemas for type safety (adjust path)
import {
  Phase,
  PlayerState,
  CardInstanceSchema,
} from "../schemas/GameState"; // Adjust path
// Reuse client interface if compatible
// import { CardInstance } from "./Battle"; // Not strictly needed if using CardInstanceSchema
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
    colyseusRoom.state.players.forEach((existingPlayer, sessionId) => {
      if (sessionId !== myPlayerId) {
        // Use proxy for existing player
        const unsub = $(existingPlayer).listen("isReady", () => {
          // Listen specifically to isReady
          if (this.scene.isActive()) this.updateWaitingStatus();
        });
        this.otherPlayerChangeListeners.set(sessionId, unsub);
      }
    });
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
      collection: Map<string, CardInstanceSchema>,
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
    colyseusRoom.state.players.forEach((player) => {
      if (!player.isReady) allPlayersReady = false;
    });

    const amReady = myPlayerState.isReady;
    const canInteract =
      !amReady && colyseusRoom.state.currentPhase === Phase.Preparation;

    // Enable/disable button based on interaction state AND board state
    this.updateStartButtonState(); // This handles the button color/interactivity based on board content

    // Show/hide waiting text
    if (amReady && !allPlayersReady) {
      this.waitingText
        .setText("Waiting for other player(s)...")
        .setVisible(true);
      this.startBattleButton.setText("Waiting..."); // Change button text
      this.startBattleButton.disableInteractive().setColor("#888888"); // Ensure disabled while waiting
    } else {
      this.waitingText.setVisible(false);
      this.startBattleButton.setText("Start Battle"); // Reset button text
      // Re-enable button *if* conditions are met (handled by updateStartButtonState)
      this.updateStartButtonState();
    }

    // BoardView handles drag interaction state
  }

  updateStartButtonState() {
    // --- Add Null Check ---
    if (!this.startBattleButton || !this.startBattleButton.active) {
      console.warn(
        "updateStartButtonState called but button is null or inactive."
      );
      return; // Guard if called too early or after shutdown
    }
    let battlefieldCardsCount = 0; // Initialize count here
    const boardView = this.scene.get("BoardView") as BoardView;
    if (boardView && boardView.scene.isActive()) {
      const layoutData = boardView.getLocalPlayerLayoutData();
      layoutData.forEach((entry) => {
        if (entry.area === "battlefield") {
          battlefieldCardsCount++;
        }
      });
    }
    const canStart = battlefieldCardsCount > 0;

    const myPlayerState = colyseusRoom?.state.players.get(
      colyseusRoom?.sessionId
    );
    const amReady = myPlayerState?.isReady ?? false;
    const isPrepPhase = colyseusRoom?.state.currentPhase === Phase.Preparation;

    const shouldBeEnabled = canStart && !amReady && isPrepPhase;

    if (shouldBeEnabled) {
      this.startBattleButton.setColor("#00ff00");
      this.startBattleButton.setInteractive({ useHandCursor: true });
      this.startBattleButton.off("pointerdown"); // Remove previous listener
      this.startBattleButton.once("pointerdown", this.confirmPreparation, this); // Call confirmPreparation
      this.startBattleButton.on("pointerover", () =>
        this.startBattleButton.setColor("#55ff55")
      );
      this.startBattleButton.on("pointerout", () =>
        this.startBattleButton.setColor("#00ff00")
      );
    } else {
      // Keep disabled color unless actively waiting (handled by updateWaitingStatus)
      // Check waitingText visibility *before* potentially accessing it
      if (this.waitingText && !this.waitingText.visible) {
        this.startBattleButton.setColor("#888888");
      }
      // This is the line causing the error if this.startBattleButton is null
      this.startBattleButton.disableInteractive(); // Error occurs here if button is null
      this.startBattleButton.off("pointerdown");
      this.startBattleButton.off("pointerover");
      this.startBattleButton.off("pointerout");
    }
  }

  // Called when the "Start Battle" button is clicked
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