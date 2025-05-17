import { Scene } from "phaser";
// Import global room instance and username function
import { colyseusRoom, globalCardDataCache, loadAllCardData } from "../utils/colyseusClient"; // Updated import
import { getUserName } from "../utils/discordSDK";
// Import Phase enum for type safety (adjust path if needed)
import { Phase, PlayerState } from "../../../server/src/schemas/GameState"; // Adjust path as necessary
// Import getStateCallbacks for 0.16 listener syntax
import { getStateCallbacks } from "colyseus.js";

export class Lobby extends Scene {
  private playerTextObjects: Map<string, Phaser.GameObjects.Text> = new Map(); // Map sessionId to Text object
  private statusText!: Phaser.GameObjects.Text;
  private readyButton!: Phaser.GameObjects.Text;
  private waitingText!: Phaser.GameObjects.Text;

  // Listener tracking
  private phaseListenerUnsub: (() => void) | null = null;
  private playerAddListenerUnsub: (() => void) | null = null;
  private playerRemoveListenerUnsub: (() => void) | null = null;
  private playerStateListeners: Map<string, () => void> = new Map(); // Track individual player 'isReady' listeners
  private listenersAttached: boolean = false; // Flag to ensure main listeners are attached once

  constructor() {
    super("Lobby");
  }

  create() {
    this.scene.launch("background");
    this.listenersAttached = false; // Reset flag on scene creation

    // Check if connected
    if (!colyseusRoom || !colyseusRoom.sessionId) { // Added sessionId check
      console.error("Lobby Scene: Not connected to Colyseus room or no session ID!");
      this.add
        .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY,
          "Error: Not connected to server.\nPlease return to Main Menu.",
          { color: "#ff0000", fontSize: "24px", align: "center", backgroundColor: '#000000' }
        )
        .setOrigin(0.5);
      this.input.once("pointerdown", () => {
          try { colyseusRoom?.leave(); } catch(e) {}
          this.scene.start("MainMenu");
      });
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
        this.cameras.main.height - 100, // Adjusted Y
        "Connecting to lobby...", // Initial text
        {
          fontFamily: "Arial",
          fontSize: 24,
          color: "#ffff00",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Ready Button
    this.readyButton = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.height - 150,
        "Ready Up",
        {
            fontFamily: "Arial Black",
            fontSize: 40,
            color: "#888888", // Start disabled
            backgroundColor: "#333333",
            padding: { x: 20, y: 10 },
            stroke: "#000000",
            strokeThickness: 6,
            align: "center",
        }
    )
    .setOrigin(0.5)
    .setVisible(false) // Start hidden, shown by updateLobbyUI
    .disableInteractive(); // Start disabled, managed by updateLobbyUI

    // Waiting Text (Initially hidden)
    this.waitingText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.height - 110, // Below ready button
        "",
        { fontFamily: "Arial", fontSize: 18, color: "#ffff00", align: "center" }
    )
    .setOrigin(0.5)
    .setVisible(false);

    this.readyButton.on('pointerdown', () => {
        if (colyseusRoom && this.readyButton.input?.enabled) {
            console.log("Lobby: Sending playerReady message.");
            colyseusRoom.send("playerReady");
            // UI update (button text/state) will be handled by the server state change listener
        }
    });
    this.readyButton.on('pointerover', () => {
        if (this.readyButton.input?.enabled) this.readyButton.setColor('#55ff55');
    });
    this.readyButton.on('pointerout', () => {
        if (this.readyButton.input?.enabled) this.readyButton.setColor('#00ff00');
        else this.readyButton.setColor('#888888');
    });

    this.setupColyseusListeners();
    // Initial UI update is now handled by attachMainListenersAndUI via setupColyseusListeners

    // Register shutdown event listener
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  private attachMainListenersAndUI() {
    if (this.listenersAttached) {
        console.log("Lobby: Main listeners and UI setup already performed, skipping.");
        return;
    }
    if (!this.scene.isActive()) {
        console.warn("Lobby: attachMainListenersAndUI called but scene is not active. Aborting.");
        return;
    }
    if (!colyseusRoom || !colyseusRoom.state) {
        console.warn("Lobby: attachMainListenersAndUI called but Colyseus room or state is not ready. Aborting.");
        return;
    }

    console.log("Lobby: Attaching main Colyseus listeners and performing initial UI update.");
    this.attachMainListeners(); // This method sets up specific listeners like phase, player add/remove
    this.updateLobbyUI();     // Perform the initial UI render based on current state
    this.listenersAttached = true;
  }

  setupColyseusListeners() {
    if (!colyseusRoom) {
        console.error("Lobby: setupColyseusListeners called but colyseusRoom is null.");
        return;
    }
    console.log("Lobby: Setting up Colyseus general listeners.");

    // If state is already available, schedule the main listener attachment and UI update.
    // Using a small delay ensures Phaser's scene context is fully ready.
    if (colyseusRoom.state && !this.listenersAttached) {
        console.log("Lobby: State already available on setup. Scheduling attachMainListenersAndUI.");
        this.time.delayedCall(1, this.attachMainListenersAndUI, [], this);
    }

    // Always set up onStateChange.once for the definitive first state synchronization.
    // This handles cases where state might not be immediately available or if a full state sync occurs.
    colyseusRoom.onStateChange.once((state) => {
        console.log("Lobby: Initial state received via onStateChange.once.");
        if (!this.scene.isActive()) {
            console.log("Lobby: Scene became inactive before onStateChange.once processing could complete.");
            return;
        }
        // Call the consolidated method to attach listeners and update UI
        this.attachMainListenersAndUI();
    });

    // Note: If state was already processed by the direct check + delayedCall,
    // attachMainListenersAndUI will bail out due to `this.listenersAttached` being true,
    // preventing duplicate setup from the onStateChange.once callback.
  }

  attachMainListeners() {
    if (!colyseusRoom || !colyseusRoom.state) {
        console.error("Lobby: attachMainListeners - colyseusRoom or state is null.");
        return;
    }
    const $ = getStateCallbacks(colyseusRoom);

    // Listen for phase changes
    if (this.phaseListenerUnsub) this.phaseListenerUnsub(); // Clean up previous if any
    this.phaseListenerUnsub = $(colyseusRoom.state).listen("currentPhase", (currentPhase, previousPhase) => {
      if (!this.scene.isActive()) return;
      console.log(`Lobby: Phase changed from ${previousPhase} to: ${currentPhase}`);
      if (currentPhase === Phase.Shop) {
        this.statusText.setText("Starting Game!");
        this.time.delayedCall(500, () => {
          if (this.scene.isActive()) {
              this.scene.stop(); // Stop Lobby scene
              this.scene.start("Shop");
          }
        });
      } else if (currentPhase === Phase.Lobby) {
        this.updateLobbyUI(); // Refresh UI if somehow back to Lobby
      } else if (currentPhase === Phase.GameOver) {
        // Handle game over if it occurs while in lobby (e.g. other player leaves from another phase)
        this.statusText.setText("Game Over. Returning to Main Menu.");
        this.time.delayedCall(1500, () => {
            if (this.scene.isActive()) {
                try { colyseusRoom?.leave(); } catch(e) {}
                this.scene.stop();
                this.scene.start("MainMenu");
            }
        });
      }
    });

    // Listen for players joining/leaving
    if (this.playerAddListenerUnsub) this.playerAddListenerUnsub();
    this.playerAddListenerUnsub = $(colyseusRoom.state.players).onAdd((player, sessionId) => {
      if (!this.scene.isActive()) return;
      console.log(`Lobby: Player joined: ${player.username} (${sessionId})`);
      this.addPlayerStateListener(player, sessionId);
      this.updateLobbyUI();
    });

    if (this.playerRemoveListenerUnsub) this.playerRemoveListenerUnsub();
    this.playerRemoveListenerUnsub = $(colyseusRoom.state.players).onRemove((player, sessionId) => {
      if (!this.scene.isActive()) return;
      console.log(`Lobby: Player left: ${player.username} (${sessionId})`);
      this.removePlayerStateListener(sessionId);
      this.updateLobbyUI();
    });

    // Add listeners for existing players
    colyseusRoom.state.players.forEach((player, sessionId) => {
        this.addPlayerStateListener(player, sessionId);
    });
  }

  addPlayerStateListener(player: PlayerState, sessionId: string) {
    if (!colyseusRoom) return;
    const $ = getStateCallbacks(colyseusRoom);

    // Remove existing listener for this player before adding a new one
    this.playerStateListeners.get(sessionId)?.();

    console.log(`Lobby: Adding 'isReady' listener for player ${sessionId}`);
    const unsub = $(player).listen("isReady", (currentValue, previousValue) => {
        console.log(`Lobby: isReady changed for player ${sessionId}: ${previousValue} -> ${currentValue}`);
        if (this.scene.isActive()) this.updateLobbyUI();
    });
    this.playerStateListeners.set(sessionId, unsub);
  }

  removePlayerStateListener(sessionId: string) {
    const unsub = this.playerStateListeners.get(sessionId);
    if (unsub) {
        console.log(`Lobby: Removing 'isReady' listener for player ${sessionId}`);
        unsub();
        this.playerStateListeners.delete(sessionId);
    }
  }

  updateLobbyUI() {
    if (!this.scene.isActive()) {
        console.warn("Lobby: updateLobbyUI called but scene is NOT ACTIVE. Aborting UI update.");
        return;
    }
    if (!colyseusRoom) {
        console.warn("Lobby: updateLobbyUI called but colyseusRoom is NULL. Aborting UI update.");
        if (this.statusText && this.statusText.active) { // Check if statusText is valid
            this.statusText.setText("Error: Connection lost.");
        }
        return;
    }
    if (!colyseusRoom.state) {
        console.warn("Lobby: updateLobbyUI called but colyseusRoom.state is NULL. Aborting UI update.");
        if (this.statusText && this.statusText.active) { // Check if statusText is valid
            this.statusText.setText("Error: Game state unavailable.");
        }
        return;
    }

    // Check if we have card data loaded
    if (globalCardDataCache.size === 0) {
        console.log("Lobby: Card data not loaded yet. Loading...");
        // Replace dynamic import with direct call
        loadAllCardData().then(success => {
            if (success) {
                console.log("Lobby: Card data loaded successfully");
            } else {
                console.warn("Lobby: Failed to load card data");
            }
        });
    }

    // console.log("Lobby: updateLobbyUI proceeding with updates."); // Optional: for debugging successful entry

    const players = colyseusRoom.state.players;
    const mySessionId = colyseusRoom.sessionId;
    const playerCount = players.size;
    const startY = 250;
    const spacingY = 40;

    // Clear existing player text objects
    this.playerTextObjects.forEach(textObj => textObj.destroy());
    this.playerTextObjects.clear();

    let playerIndex = 0;
    let allPlayersReady = playerCount > 0; // Assume ready if players exist, check below
    let localPlayerIsReady = false;
    const localPlayer = players.get(mySessionId);
    if (localPlayer) {
        localPlayerIsReady = localPlayer.isReady;
    }

    players.forEach((player, sessionId) => {
        const isMe = sessionId === mySessionId;
        const readyMarker = player.isReady ? " [Ready]" : " [Not Ready]";
        const displayName = `${player.username || 'Joining...'}${isMe ? ' (You)' : ''}${readyMarker}`;
        const playerText = this.add.text(
            this.cameras.main.centerX,
            startY + playerIndex * spacingY,
            displayName,
            { fontFamily: "Arial", fontSize: 24, color: player.isReady ? "#00ff00" : "#ffffff", align: "center" }
        ).setOrigin(0.5);
        this.playerTextObjects.set(sessionId, playerText);
        playerIndex++;

        if (!player.isReady) {
            allPlayersReady = false;
        }
    });

    // Update Status Text, Ready Button, and Waiting Text
    if (playerCount < 2) {
        this.statusText.setText("Waiting for opponent...");
        this.readyButton.setVisible(false).disableInteractive();
        this.waitingText.setVisible(false);
    } else { // playerCount is 2 (maxClients)
        this.readyButton.setVisible(true); // Always show button if 2 players
        if (localPlayerIsReady) {
            this.statusText.setText("Waiting for opponent to ready up...");
            this.readyButton.setText("Waiting...").setColor("#888888").disableInteractive();
            this.waitingText.setText(allPlayersReady ? "Starting game..." : "Waiting for opponent...").setVisible(true);
        } else { // Local player is not ready
            this.statusText.setText("Lobby full. Ready up!");
            this.readyButton.setText("Ready Up").setColor("#00ff00").setInteractive({ useHandCursor: true });
            this.waitingText.setVisible(false);
        }

        if (allPlayersReady) { // This implies playerCount is 2 and both are ready
            this.statusText.setText("Starting game...");
            this.readyButton.setVisible(false); // Hide button as game starts (server handles phase transition)
            this.waitingText.setVisible(false);
        }
    }
  }

  shutdown() {
    console.log("Lobby scene shutting down.");
    this.listenersAttached = false; // Reset flag for potential scene restart
    // Remove Colyseus listeners
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

    // Remove Phaser listeners from button
    this.readyButton?.off('pointerdown');
    this.readyButton?.off('pointerover');
    this.readyButton?.off('pointerout');

    // Unregister the shutdown event listener for this scene
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    // super.shutdown(); // If extending a base class with shutdown logic
  }
}