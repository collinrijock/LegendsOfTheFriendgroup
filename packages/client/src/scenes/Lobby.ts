import { Scene } from "phaser";
// Import global room instance and username function
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
import { getUserName } from "../utils/discordSDK";
// Import Phase enum for type safety (adjust path if needed)
import { Phase } from "../../../server/src/schemas/GameState"; // Adjust path as necessary

export class Lobby extends Scene {
  private playerTextObjects: Map<string, Phaser.GameObjects.Text> = new Map(); // Map sessionId to Text object
  private statusText!: Phaser.GameObjects.Text;
  private readyButton!: Phaser.GameObjects.Text; // Added
  private waitingText!: Phaser.GameObjects.Text; // Added

  // Listener tracking
  private phaseListenerUnsub: (() => void) | null = null;
  private playerAddListenerUnsub: (() => void) | null = null;
  private playerRemoveListenerUnsub: (() => void) | null = null;
  private playerStateListeners: Map<string, () => void> = new Map(); // Track individual player listeners

  constructor() {
    super("Lobby");
  }

  create() {
    this.scene.launch("background");

    // Check if connected
    if (!colyseusRoom) {
      console.error("Not connected to Colyseus room!");
      // Handle error - maybe return to MainMenu
      this.add
        .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY,
          "Error: Not connected to server.\nPlease return to Main Menu.",
          { color: "#ff0000", fontSize: "24px", align: "center" }
        )
        .setOrigin(0.5);
      this.input.once("pointerdown", () => this.scene.start("MainMenu"));
      return;
    }

    // Lobby Title
    this.add
      .text(this.cameras.main.centerX, 100, "Lobby", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    // Players List Title
    this.add
      .text(this.cameras.main.centerX, 200, "Players in Lobby:", {
        fontFamily: "Arial",
        fontSize: 32,
        color: "#dddddd",
        align: "center",
      })
      .setOrigin(0.5);

    // Status Text (Waiting for players/game start)
    this.statusText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.height - 100,
        "Waiting for players...",
        {
          fontFamily: "Arial",
          fontSize: 24,
          color: "#ffff00",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Ready Button (Initially hidden/disabled)
    this.readyButton = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.height - 150, // Position above status text
        "Ready Up",
        {
            fontFamily: "Arial Black",
            fontSize: 40,
            color: "#888888", // Start disabled
            stroke: "#000000",
            strokeThickness: 6,
            align: "center",
        }
    )
    .setOrigin(0.5)
    .setVisible(false) // Start hidden
    .disableInteractive(); // Start disabled

    // Waiting Text (Initially hidden)
    this.waitingText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.height - 110, // Below ready button
        "",
        { fontFamily: "Arial", fontSize: 18, color: "#ffff00", align: "center" }
    )
    .setOrigin(0.5)
    .setVisible(false);


    // --- Colyseus State Handling ---

    // Wait for the initial state to be received before setting up player listeners
    colyseusRoom.onStateChange.once((state) => {
      console.log("Lobby: Initial state received, setting up listeners.");
      if (!this.scene.isActive()) return; // Guard against scene being destroyed before state arrives

      // REMOVED: Initial player list display - rely on onAdd/onRemove
      // this.updatePlayerList();

      // Listen for players joining/leaving using standard MapSchema methods
      // Store unsubscribe functions
      this.playerAddListenerUnsub = state.players.onAdd((player, sessionId) => {
        if (!this.scene.isActive()) return; // Guard
        console.log("Player joined lobby:", player.username, sessionId);
        // Add listener for changes within this specific player (especially isReady)
        const unsub = player.onChange(() => {
            if (this.scene.isActive()) this.updateLobbyUI();
        });
        this.playerStateListeners.set(sessionId, unsub);
        this.updateLobbyUI(); // Update UI when player joins
      });
      this.playerRemoveListenerUnsub = state.players.onRemove((player, sessionId) => {
        if (!this.scene.isActive()) return; // Guard
        console.log("Player left lobby:", player?.username || sessionId);
        // Remove listener associated with this player
        const unsub = this.playerStateListeners.get(sessionId);
        unsub?.(); // Call unsubscribe function
        this.playerStateListeners.delete(sessionId);
        this.removePlayerText(sessionId); // Remove visual text
        this.updateLobbyUI(); // Update UI when player leaves
      });

      // Add listeners for existing players (in case state arrives with players already)
      state.players.forEach((player, sessionId) => {
          const unsub = player.onChange(() => {
              if (this.scene.isActive()) this.updateLobbyUI();
          });
          this.playerStateListeners.set(sessionId, unsub);
      });


      // Update status text based on initial player count - Handled by updateLobbyUI now
      // this.updateStatusText(); // REMOVED

      // Listen for phase changes from the server using state.listen()
      if (state) {
          // Store unsubscribe function
          this.phaseListenerUnsub = state.listen("currentPhase", (currentPhase, previousPhase) => {
            if (!this.scene.isActive()) return; // Guard
            console.log(`Phase changed from ${previousPhase} to: ${currentPhase}`);
            if (currentPhase === Phase.Shop) {
              this.statusText.setText("Starting Game!");
              this.time.delayedCall(500, () => {
                if (this.scene.isActive()) this.scene.start("Shop"); // Check active before starting
              });
            } else if (currentPhase === Phase.Lobby) {
              // If phase reverts to Lobby (e.g., game ended, error)
              this.updateLobbyUI(); // Update UI based on Lobby state
            }
          });
      } else {
          console.error("Lobby: State is unexpectedly null after onStateChange.once");
      }

      // Initial UI update after listeners are set up
      this.updateLobbyUI();

    });

    // Listeners attached directly to the room (like onLeave, onError) can be outside onStateChange.once
    // colyseusRoom.onLeave.addOnce(...) etc.

    // Clean up listeners when scene shuts down
    this.events.on('shutdown', () => {
      console.log("Lobby scene shutting down, cleaning up listeners.");
      // Call cleanup function
      this.cleanupListeners();
      // Destroy UI elements
      this.playerTextObjects.forEach(text => text.destroy()); // Destroy player texts
      this.playerTextObjects.clear();
      this.statusText?.destroy();
      this.readyButton?.destroy(); // Destroy ready button
      this.waitingText?.destroy(); // Destroy waiting text
    });

    // Remove old Start Game button logic
    /*
    const startGameButton = this.add.text(...)
    startGameButton.on("pointerdown", () => { ... });
    */
    // Remove registry initialization - server handles initial state
    /*
    this.registry.set('currentDay', 1);
    this.registry.set('playerHealth', 50);
    ...
    */
  }

  // New combined UI update function
  updateLobbyUI() {
    if (!colyseusRoom || !colyseusRoom.state || !this.scene.isActive()) return;

    this.updatePlayerList(); // Update the visual list of players first

    const myPlayerId = colyseusRoom.sessionId;
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    const playerCount = colyseusRoom.state.players.size;
    const maxPlayers = colyseusRoom.maxClients || 2; // Use room's maxClients

    // Default states
    this.statusText.setText("Waiting for players...");
    this.readyButton.setVisible(false).disableInteractive();
    this.waitingText.setVisible(false);

    if (playerCount < maxPlayers) {
        // Not enough players yet
        this.statusText.setText(`Waiting for ${maxPlayers - playerCount} more player(s)...`);
    } else {
        // Enough players, show ready button logic
        this.statusText.setText("Ready up to start!"); // Change status text
        this.readyButton.setVisible(true);

        let allPlayersReady = true;
        colyseusRoom.state.players.forEach(p => { if (!p.isReady) allPlayersReady = false; });

        if (myPlayerState) {
            if (myPlayerState.isReady) {
                // Local player is ready
                this.readyButton.setText("Ready!").setColor("#55ff55").disableInteractive();
                if (!allPlayersReady) {
                    this.waitingText.setText("Waiting for other player(s)...").setVisible(true);
                    this.statusText.setText(""); // Hide "Ready up" text when waiting
                } else {
                     this.statusText.setText("Starting game..."); // All ready
                     this.waitingText.setVisible(false);
                }
            } else {
                // Local player is not ready
                this.readyButton.setText("Ready Up").setColor("#00ff00").setInteractive({ useHandCursor: true });
                this.readyButton.off('pointerdown'); // Remove previous listener
                this.readyButton.once('pointerdown', () => {
                    if (colyseusRoom && !myPlayerState.isReady) { // Double check state
                        console.log("Sending playerReady message (Lobby)");
                        colyseusRoom.send("playerReady");
                        // UI will update via listener when state changes
                    }
                });
                this.readyButton.on('pointerover', () => this.readyButton.setColor('#55ff55'));
                this.readyButton.on('pointerout', () => this.readyButton.setColor('#00ff00'));
                this.waitingText.setVisible(false);
            }
        } else {
            // Should not happen if player is in the room
            this.readyButton.setText("Error").setColor("#ff0000").disableInteractive();
        }
    }
  }


  updatePlayerList() {
    if (!colyseusRoom || !colyseusRoom.state || !this.scene.isActive()) return; // Add active check

    // Clear existing text objects that are no longer in the room state
    const currentSessionIds = new Set(colyseusRoom.state.players.keys());
    this.playerTextObjects.forEach((textObject, sessionId) => {
      if (!currentSessionIds.has(sessionId)) {
        this.removePlayerText(sessionId); // Use helper to destroy and remove from map
      }
    });

    // Update or create text objects for current players
    let yPos = 250;
    colyseusRoom.state.players.forEach((player, sessionId) => {
      // Access the username from the player state
      const playerName = player.username || `Player ${sessionId.substring(0, 4)}`;
      const isReady = player.isReady; // Get ready status
      const isSelf = sessionId === colyseusRoom.sessionId;

      let playerText = this.playerTextObjects.get(sessionId);
      const displayText = `${playerName}${isSelf ? " (You)" : ""} ${isReady ? "✅" : "⏳"}`; // Add ready indicator

      if (playerText) {
        // Update existing text object position and text (including username and ready status)
        playerText.setY(yPos);
        playerText.setText(displayText);
      } else {
        // Create new text object displaying the username and ready status
        playerText = this.add
          .text(
            this.cameras.main.centerX,
            yPos,
            displayText,
            {
              fontFamily: "Arial",
              fontSize: 24,
              color: "#ffffff",
              align: "center",
            }
          )
          .setOrigin(0.5);
        this.playerTextObjects.set(sessionId, playerText);
      }
      yPos += 40; // Increment Y position for the next player
    });

    // Status text update is handled by updateLobbyUI now
    // this.updateStatusText(); // REMOVED
  }

  // REMOVED updateStatusText function - logic moved to updateLobbyUI

  removePlayerText(sessionId: string) {
    const textObject = this.playerTextObjects.get(sessionId);
    if (textObject) {
      textObject.destroy();
      this.playerTextObjects.delete(sessionId);
    }
  }

  // Add cleanup function
  cleanupListeners() {
      console.log("Lobby: Cleaning up listeners");
      this.phaseListenerUnsub?.();
      this.playerAddListenerUnsub?.();
      this.playerRemoveListenerUnsub?.();
      this.playerStateListeners.forEach(unsub => unsub()); // Unsubscribe from each player's changes

      this.phaseListenerUnsub = null;
      this.playerAddListenerUnsub = null;
      this.playerRemoveListenerUnsub = null;
      this.playerStateListeners.clear();

      // Remove button listeners if added directly
      this.readyButton?.off('pointerdown');
      this.readyButton?.off('pointerover');
      this.readyButton?.off('pointerout');
  }
}