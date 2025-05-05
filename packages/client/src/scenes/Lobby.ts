import { Scene } from "phaser";
// Import global room instance and username function
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
import { getUserName } from "../utils/discordSDK";
// Import Phase enum for type safety (adjust path if needed)
import { Phase } from "../../../server/src/schemas/GameState"; // Adjust path as necessary
// Import getStateCallbacks for 0.16 listener syntax
import { getStateCallbacks } from "colyseus.js";

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

    // Add listener for the ready button
    this.readyButton.on('pointerdown', () => {
        if (colyseusRoom && this.readyButton.input?.enabled) {
            console.log("Lobby: Sending playerReady message.");
            colyseusRoom.send("playerReady");
            // Disable button immediately and show waiting text
            this.readyButton.disableInteractive().setColor("#888888").setText("Waiting...");
            this.waitingText.setText("Waiting for opponent...").setVisible(true);
        }
    });
    this.readyButton.on('pointerover', () => {
        if (this.readyButton.input?.enabled) this.readyButton.setColor('#55ff55');
    });
    this.readyButton.on('pointerout', () => {
        if (this.readyButton.input?.enabled) this.readyButton.setColor('#00ff00');
        else this.readyButton.setColor('#888888'); // Keep grey if disabled
    });


    // --- Colyseus State Handling ---
    console.log(`Lobby: create() - Checking colyseusRoom status. Is connected: ${!!colyseusRoom}, Room ID: ${colyseusRoom?.roomId}`);

    // Wait for the initial state to be received before setting up player listeners
    colyseusRoom.onStateChange.once((state) => {
      console.log("Lobby: Initial state received inside onStateChange.once. Setting up listeners.");
      if (!this.scene.isActive()) {
          console.log("Lobby: Scene inactive, aborting listener setup.");
          return; // Guard against scene being destroyed before state arrives
      }
      console.log("Lobby: Initial state players count:", state.players?.size ?? 'N/A'); // Log initial count

      // Get the proxy function for attaching listeners
      // Ensure colyseusRoom is valid before getting proxy
      if (!colyseusRoom) {
          console.error("Lobby: colyseusRoom is null inside onStateChange.once. Aborting listener setup.");
          this.statusText.setText("Error: Room connection lost.");
          return;
      }
      const $ = getStateCallbacks(colyseusRoom);

    // --- REMOVED Robustness Check ---
    // The proxy ($) handles the case where state.players might not be ready immediately.
    // if (!state || !state.players || typeof state.players.onAdd !== 'function' || typeof state.players.onRemove !== 'function') { ... } // REMOVED

      console.log("Lobby: Attaching listeners using proxy...");

      // Listen for players joining/leaving using the proxy on colyseusRoom.state.players
      // Store unsubscribe functions
      try {
          console.log("Lobby: Attaching players.onAdd listener via proxy...");
          // Use proxy directly on the room's state reference
          this.playerAddListenerUnsub = $(colyseusRoom.state.players).onAdd((player, sessionId) => {
            if (!this.scene.isActive()) return; // Guard
            console.log(`Lobby: players.onAdd fired for sessionId: ${sessionId}, username: ${player?.username}`);
            // Add listener for changes within this specific player (especially isReady)
            // Use proxy for the player object
            if (player && typeof $(player).listen === 'function') {
                const unsub = $(player).listen("isReady", (currentValue, previousValue) => {
                    console.log(`Lobby: isReady changed for player ${sessionId}: ${previousValue} -> ${currentValue}`);
                    if (this.scene.isActive()) this.updateLobbyUI();
                });
                // Remove previous listener if it exists before adding new one
                this.playerStateListeners.get(sessionId)?.();
                this.playerStateListeners.set(sessionId, unsub);
                console.log(`Lobby: Attached/Replaced isReady listener for new player ${sessionId}`);
            } else {
                console.warn(`Lobby: Player object for ${sessionId} is invalid or missing listen method.`);
            }
            this.updateLobbyUI(); // Update UI when player joins
        });
        console.log("Lobby: players.onAdd listener attached via proxy.");
      } catch (e) {
          console.error("Lobby: Error attaching players.onAdd listener via proxy:", e);
      }

      try {
          console.log("Lobby: Attaching players.onRemove listener via proxy...");
          // Use proxy directly on the room's state reference
          this.playerRemoveListenerUnsub = $(colyseusRoom.state.players).onRemove((player, sessionId) => {
            if (!this.scene.isActive()) return; // Guard
            console.log("Player left lobby:", player?.username || sessionId);
            // Remove listener associated with this player
            const unsub = this.playerStateListeners.get(sessionId);
            if (unsub) {
                unsub(); // Call unsubscribe function
                this.playerStateListeners.delete(sessionId);
                console.log(`Lobby: Removed isReady listener for player ${sessionId}`);
            } else {
                console.warn(`Lobby: Could not find listener to remove for player ${sessionId}`);
            }
            this.removePlayerText(sessionId); // Remove visual text
            this.updateLobbyUI(); // Update UI when player leaves
          });
          console.log("Lobby: players.onRemove listener attached via proxy.");
      } catch (e) {
           console.error("Lobby: Error attaching players.onRemove listener via proxy:", e);
      }

      // Add listeners for existing players (in case state arrives with players already)
      try {
          console.log("Lobby: Attaching listeners to EXISTING players (if any)...");
          // Use colyseusRoom.state here as well for consistency with proxy usage
          colyseusRoom.state.players.forEach((player, sessionId) => {
              console.log(`Lobby: Setting up listener for existing player ${sessionId}`);
              if (player && typeof $(player).listen === 'function') {
                  const unsub = $(player).listen("isReady", (currentValue, previousValue) => {
                      console.log(`Lobby: isReady changed for existing player ${sessionId}: ${previousValue} -> ${currentValue}`);
                      if (this.scene.isActive()) this.updateLobbyUI();
                  });
                  // Remove previous listener if it exists before adding new one
                  this.playerStateListeners.get(sessionId)?.();
                  this.playerStateListeners.set(sessionId, unsub);
                  console.log(`Lobby: Attached/Replaced isReady listener for existing player ${sessionId}`);
              } else {
                  console.warn(`Lobby: Existing player object for ${sessionId} is invalid or missing listen method.`);
              }
          });
          console.log("Lobby: Finished attaching listeners to existing players.");
      } catch (e) {
          console.error("Lobby: Error iterating or attaching listen for existing players:", e);
      }


      // Listen for phase changes from the server using state.listen() via the proxy
      // Use proxy on the room's state reference
      if (colyseusRoom.state && typeof $(colyseusRoom.state).listen === 'function') {
          try {
              console.log("Lobby: Attaching state.listen('currentPhase') listener via proxy...");
              this.phaseListenerUnsub = $(colyseusRoom.state).listen("currentPhase", (currentPhase, previousPhase) => {
                if (!this.scene.isActive()) return; // Guard
                console.log(`Phase changed from ${previousPhase} to: ${currentPhase}`);
                if (currentPhase === Phase.Shop) {
                  this.statusText.setText("Starting Game!");
                  this.time.delayedCall(500, () => {
                    if (this.scene.isActive()) {
                        this.scene.stop();
                        this.scene.start("Shop");
                    }
                  });
                } else if (currentPhase === Phase.Lobby) {
                  this.updateLobbyUI();
                }
              });
              console.log("Lobby: state.listen('currentPhase') listener attached via proxy.");
          } catch (e) {
              console.error("Lobby: Error attaching state.listen('currentPhase') listener via proxy:", e);
          }
      } else {
          console.error("Lobby: colyseusRoom.state is unexpectedly null or invalid when attaching phase listener.");
      }

      // Initial UI setup based on the state received
      console.log("Lobby: Performing initial updateLobbyUI call.");
      this.updateLobbyUI();
    });
  }

  // --- UI Update Logic ---
  updateLobbyUI() {
    if (!colyseusRoom || !colyseusRoom.state || !this.scene.isActive()) {
        console.warn("Lobby: updateLobbyUI called but room/state/scene is invalid or inactive.");
        return;
    }

    const players = colyseusRoom.state.players;
    const mySessionId = colyseusRoom.sessionId;
    const playerCount = players.size;
    const startY = 250; // Starting Y position for player list
    const spacingY = 40; // Vertical spacing between player names

    console.log(`Lobby: updateLobbyUI called. Current player count in state: ${playerCount}`); // Log count

    // Clear existing player text first
    this.playerTextObjects.forEach(textObj => textObj.destroy());
    this.playerTextObjects.clear();

    // Display current players and their ready status
    let playerIndex = 0;
    let allReady = playerCount > 0; // Assume ready if players exist, check below
    let amReady = false;

    players.forEach((player, sessionId) => {
        console.log(`Lobby: updateLobbyUI processing player: ${sessionId}, username: ${player.username}, isReady: ${player.isReady}`); // Log each player
        const isMe = sessionId === mySessionId;
        const readyText = player.isReady ? " [Ready]" : "";
        const displayName = `${player.username || 'Joining...'}${isMe ? ' (You)' : ''}${readyText}`;
        const playerText = this.add.text(
            this.cameras.main.centerX,
            startY + playerIndex * spacingY,
            displayName,
            { fontFamily: "Arial", fontSize: 24, color: player.isReady ? "#00ff00" : "#ffffff", align: "center" }
        ).setOrigin(0.5);
        this.playerTextObjects.set(sessionId, playerText);
        playerIndex++;

        if (!player.isReady) {
            allReady = false;
        }
        if (isMe && player.isReady) {
            amReady = true;
        }
    });
    console.log(`Lobby: updateLobbyUI finished processing ${playerIndex} players.`); // Log end of loop

    // Update Status Text and Ready Button
    if (playerCount < 2) {
        this.statusText.setText("Waiting for opponent...");
        this.readyButton.setVisible(false).disableInteractive();
        this.waitingText.setVisible(false);
    } else {
        // We have 2 players
        this.statusText.setText("Lobby full. Ready up!");
        if (amReady) {
            // I am ready
            this.readyButton.setVisible(true).disableInteractive().setColor("#888888").setText("Waiting...");
            this.waitingText.setText(allReady ? "Starting game..." : "Waiting for opponent...").setVisible(true);
        } else {
            // I am not ready
            this.readyButton.setVisible(true).setInteractive({ useHandCursor: true }).setColor("#00ff00").setText("Ready Up");
            this.waitingText.setVisible(false);
        }
    }

    // If all players are ready (server should handle phase transition)
    if (playerCount === 2 && allReady) {
        this.statusText.setText("Starting game...");
        this.readyButton.setVisible(false); // Hide button as game starts
        this.waitingText.setVisible(false);
        // Phase transition is handled by the 'currentPhase' listener
    }
  }

  removePlayerText(sessionId: string) {
    const textObj = this.playerTextObjects.get(sessionId);
    if (textObj) {
      textObj.destroy();
      this.playerTextObjects.delete(sessionId);
    }
  }

  // --- Cleanup ---
  shutdown() {
    console.log("Lobby scene shutting down.");
    // Remove listeners
    this.phaseListenerUnsub?.();
    this.playerAddListenerUnsub?.();
    this.playerRemoveListenerUnsub?.();
    this.playerStateListeners.forEach(unsub => unsub());
    this.playerStateListeners.clear();

    // Clear references
    this.phaseListenerUnsub = null;
    this.playerAddListenerUnsub = null;
    this.playerRemoveListenerUnsub = null;

    // Destroy UI elements
    this.playerTextObjects.forEach(textObj => textObj.destroy());
    this.playerTextObjects.clear();
    this.statusText?.destroy();
    this.readyButton?.destroy();
    this.waitingText?.destroy();

    // Remove Phaser listeners
    this.readyButton?.off('pointerdown');
    this.readyButton?.off('pointerover');
    this.readyButton?.off('pointerout');
  }
}