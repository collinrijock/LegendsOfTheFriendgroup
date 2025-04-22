import { Scene } from "phaser";
// Import global room instance
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
// Import schemas for type safety (adjust path)
import { Phase, PlayerState, CardInstanceSchema } from "../../../server/src/schemas/GameState"; // Adjust path as needed
// Reuse client interface if compatible or define locally
// Assuming CardInstanceSchema has the necessary fields or we adapt
// import { CardInstance } from "./Battle"; // Reuse client interface if compatible

// --- Utility Function --- (Keep or import)
function generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// --- Interfaces --- (Keep CardData if needed for shop display before buying)
interface CardData {
  id: string; // Base card type ID from JSON
  name: string;
  attack: number;
  speed: number;
  health: number; // Max health
  brewCost: number;
  description: string;
  isLegend: boolean;
}

// Represents a specific instance of a card owned by the player (Client-side representation if needed)
// interface CardInstance extends CardData {
//     instanceId: string; // Unique ID for this specific card instance
//     currentHp: number; // Current health of this instance
// }


export class Shop extends Scene {
  private cardsInShop: CardData[] = []; // Cards currently offered (client-side generation for now)
  private playerBrews: number = 0; // Local cache, updated from server state
  private brewText!: Phaser.GameObjects.Text; // Navbar text
  private healthText!: Phaser.GameObjects.Text; // Navbar text
  private dayPhaseText!: Phaser.GameObjects.Text; // Navbar text
  private continueButton!: Phaser.GameObjects.Text;
  private shopCardObjects: Phaser.GameObjects.Text[] = []; // Draggable shop card visuals
  private waitingText!: Phaser.GameObjects.Text; // "Waiting for other player..."

  // Hand display elements
  private handSlotObjects: Phaser.GameObjects.Rectangle[] = [];
  private handSlots: Phaser.Geom.Rectangle[] = [];
  private handCardDisplayObjects: Map<string, Phaser.GameObjects.Text> = new Map(); // Map slotIndex ("0"-"4") to Text object

  // Colyseus listeners
  private playerStateListenerUnsub: (() => void) | null = null; // Store unsubscribe function
  private handListenersUnsub: (() => void)[] = []; // Store multiple unsubscribe functions for hand
  private phaseListenerUnsub: (() => void) | null = null; // Store unsubscribe function
  private otherPlayerListenersUnsub: (() => void)[] = []; // Store unsubscribe functions for other players

  constructor() {
    super("Shop");
  }

  // Remove init method - state comes from Colyseus room
  // init(data: { playerBrews?: number, currentDay?: number }) { ... }

  preload() {
    // Assets loaded in Preloader
  }

  create() {
    this.scene.launch("background");

    // --- Safety Check ---
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) {
        console.error("Shop Scene: Colyseus room not available!");
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Error: Connection lost.\nPlease return to Main Menu.", {
            fontFamily: "Arial",
            fontSize: '24px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);
        this.input.once('pointerdown', () => this.scene.start('MainMenu'));
        return;
    }

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Get initial state from Colyseus
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    const currentDay = colyseusRoom.state.currentDay;
    const playerHealth = myPlayerState?.health ?? 50; // Use default if state not ready yet
    this.playerBrews = myPlayerState?.brews ?? 0; // Initialize local cache

    // --- Navbar ---
    const navbarY = 25;
    const navbarHeight = 50;
    this.add.rectangle(centerX, navbarY, gameWidth, navbarHeight, 0x000000, 0.6); // Semi-transparent background

    // Health Display (Left)
    this.healthText = this.add.text(50, navbarY, `Health: ${playerHealth}`, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#00ff00", // Green for health
        align: "left"
    }).setOrigin(0, 0.5); // Align left vertically centered

    // Day/Phase Display (Center)
    this.dayPhaseText = this.add.text(centerX, navbarY, `Day ${currentDay} - Shop Phase`, {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffffff",
        align: "center"
    }).setOrigin(0.5);

    // Brews Display (Right)
    this.brewText = this.add.text(gameWidth - 50, navbarY, `Brews: ${this.playerBrews}`, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#ffff00", // Yellow for brews
        align: "right"
    }).setOrigin(1, 0.5); // Align right vertically centered
    // --- End Navbar ---


    // --- Title & Instructions ---
    this.add.text(centerX, 80, `Shop`, { // Adjusted Y
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    this.add.text(centerX, 120, `Drag cards to your hand below to buy`, { // New instructions
        fontFamily: "Arial",
        fontSize: 20,
        color: "#dddddd",
        align: "center",
      })
      .setOrigin(0.5);
    // --- End Title & Instructions ---


    // --- Hand Slots Display ---
    this.createHandSlots(centerX, gameHeight);
    // Initial display will be triggered by listener setup if state is ready

    // --- Shop Cards Display ---
    this.createShopCards(centerX, centerY, gameWidth);

    // --- Drag and Drop Logic ---
    this.setupDragAndDrop();

    // --- Continue Button ---
    this.continueButton = this.add.text(
        centerX,
        gameHeight - 50, // Adjusted position slightly
        "Continue", // Changed text
        {
          fontFamily: "Arial Black",
          fontSize: 40,
          color: "#00ff00", // Start enabled, will be updated by status check
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true }); // Interactivity managed by updateWaitingStatus

    this.continueButton.on('pointerdown', () => {
        if (colyseusRoom && myPlayerState && !myPlayerState.isReady && colyseusRoom.state.currentPhase === Phase.Shop) {
            console.log("Sending playerReady message for Shop phase...");
            colyseusRoom.send("playerReady");
            this.updateWaitingStatus(); // Show waiting text immediately
        }
    });
    this.continueButton.on('pointerover', () => {
        if (this.continueButton.input?.enabled) this.continueButton.setColor('#55ff55');
    });
    this.continueButton.on('pointerout', () => {
         if (this.continueButton.input?.enabled) this.continueButton.setColor('#00ff00');
         else this.continueButton.setColor('#888888'); // Keep grey if disabled
    });
    // --- End Continue Button ---

    // --- Waiting Text ---
    this.waitingText = this.add.text(centerX, gameHeight - 20, "", {
        fontFamily: "Arial", fontSize: 18, color: "#ffff00", align: "center"
    }).setOrigin(0.5).setVisible(false); // Initially hidden
    // --- End Waiting Text ---

    // --- Colyseus Listeners ---
    this.setupColyseusListeners();
  
    // Initial UI update based on current state
    this.updateNavbar(); // Update health/brews based on initial fetch
    this.updateHandDisplay(); // Update hand based on initial state
    this.updateWaitingStatus(); // Update button/waiting text based on initial readiness
  }
  
  // --- UI Creation Helpers ---
  // ... (createHandSlots, createShopCards remain the same) ...
  
  // --- Drag and Drop ---
  // ... (setupDragAndDrop remains the same, but relies on server state for validation) ...
   setupDragAndDrop() {
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        // Ensure it's a Text object and one of our shop cards
        if (!(gameObject instanceof Phaser.GameObjects.Text) || !this.shopCardObjects.includes(gameObject)) return;
        // Check if dragging is enabled (based on waiting status)
        if (!gameObject.input?.enabled) return;
  
        this.children.bringToTop(gameObject);
        gameObject.setAlpha(0.7);
        gameObject.setData('startX', gameObject.x);
        gameObject.setData('startY', gameObject.y);
    });
  
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
        if (!(gameObject instanceof Phaser.GameObjects.Text) || !this.shopCardObjects.includes(gameObject)) return;
        if (!gameObject.input?.enabled) return;
  
        gameObject.x = dragX;
        gameObject.y = dragY;
    });
  
    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        if (!colyseusRoom || !(gameObject instanceof Phaser.GameObjects.Text) || !this.shopCardObjects.includes(gameObject)) return;
        // No need to check input.enabled here, drag wouldn't have started if disabled
  
        gameObject.setAlpha(1.0);
        const droppedX = gameObject.x;
        const droppedY = gameObject.y;
        let buyAttempted = false;
        const myPlayerId = colyseusRoom.sessionId;
  
        for (let i = 0; i < this.handSlots.length; i++) {
            const slotRect = this.handSlots[i];
            if (slotRect && Phaser.Geom.Rectangle.Contains(slotRect, droppedX, droppedY)) {
                const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
                // Check if server state shows slot as empty
                if (myPlayerState && !myPlayerState.hand.has(String(i))) {
                    const cardData = gameObject.getData("cardData") as CardData;
                    if (cardData) {
                        console.log(`Attempting to buy ${cardData.name} for slot ${i}`);
                        // Send buy message to server - send full card data for server to create instance
                        colyseusRoom.send("buyCard", { cardData: cardData, handSlotIndex: i });
                        buyAttempted = true;
                        // Destroy the shop card visual immediately for responsiveness.
                        // Server state update will handle adding it to the hand visually if successful.
                        gameObject.destroy();
                        this.shopCardObjects = this.shopCardObjects.filter(obj => obj !== gameObject);
                        break;
                    }
                } else {
                     console.log(`Hand slot ${i} is full or player state unavailable.`);
                     buyAttempted = true; // Attempted, but failed due to full slot or state issue
                     break;
                }
            }
        }
  
        // If not dropped on a valid empty slot, or buy failed server-side (e.g. brews), snap back.
        // Since we destroy optimistically, we only snap back if no buy was attempted.
        if (!buyAttempted && gameObject.active) { // Check if gameObject still exists and wasn't destroyed
            gameObject.x = gameObject.getData('startX');
            gameObject.y = gameObject.getData('startY');
        } else if (buyAttempted && !gameObject.active) {
             // If buy was attempted and visual was destroyed.
             // We rely on server state updates. If the buy fails server-side (e.g., not enough brews),
             // the card won't appear in the hand. The shop card remains gone.
             // A shop refresh mechanic or explicit "buy failed" message could improve this.
             console.log("Buy attempted. Visual removed. Waiting for server state update for hand.");
        } else if (buyAttempted && gameObject.active) {
            // This case happens if the drop was on a full slot - snap back
             gameObject.x = gameObject.getData('startX');
             gameObject.y = gameObject.getData('startY');
             console.log("Drop target slot was full. Snapping back.");
        }
    });
  }
  
  // --- Colyseus State Synchronization ---
  
  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.sessionId) return;
  
    const myPlayerId = colyseusRoom.sessionId;
  
    // --- Listen to changes in *my* player state (health, brews, isReady) ---
    const player = colyseusRoom.state.players.get(myPlayerId);
    if (player) {
        // Use listen for specific properties for finer control
        this.playerStateListenerUnsub = player.onChange(() => {
            console.log("My player state changed (Shop)");
            this.updateNavbar();
            this.updateWaitingStatus(); // Update based on isReady changes
        });
  
        // --- Listen specifically to hand changes for *my* player ---
        // Use onAdd/onRemove for the map itself
        this.handListenersUnsub.push(player.hand.onAdd((card, key) => {
            console.log("Card added to hand (Shop):", key);
            this.updateHandDisplay();
            // If needed, attach listener to the new card instance
            // this.handListenersUnsub.push(card.onChange(() => this.updateHandDisplay()));
        }));
        this.handListenersUnsub.push(player.hand.onRemove((card, key) => {
            console.log("Card removed from hand (Shop):", key);
            this.updateHandDisplay();
            // Remove listeners associated with the removed card if necessary
        }));
        // Add listeners for existing cards in hand
        player.hand.forEach((card, key) => {
             // this.handListenersUnsub.push(card.onChange(() => this.updateHandDisplay()));
        });
  
    } else {
        console.error("Shop Scene: My player state not found on init.");
    }
  
  
    // --- Listen for phase changes ---
    this.phaseListenerUnsub = colyseusRoom.state.listen("currentPhase", (currentPhase, previousPhase) => {
        console.log(`Shop Scene: Phase changed from ${previousPhase} to ${currentPhase}`);
        this.updateDayPhaseText(); // Update navbar text
        if (currentPhase === Phase.Preparation) {
            // Cleanup happens in shutdown
            this.scene.start("Preparation");
        } else if (currentPhase !== Phase.Shop) {
            // If phase changes to something unexpected, handle it
            console.warn(`Shop Scene: Unexpected phase change to ${currentPhase}. Returning to Lobby.`);
            // Cleanup happens in shutdown
            this.scene.start("Lobby"); // Or MainMenu
        }
        // Update button/waiting status based on new phase
        this.updateWaitingStatus();
    });
  
     // --- Listen for changes in other players' ready status ---
     colyseusRoom.state.players.onAdd((otherPlayer, sessionId) => {
        if (sessionId !== myPlayerId) {
            console.log("Other player added (Shop):", sessionId);
            // Listen to the isReady property of the other player
            const unsub = otherPlayer.listen("isReady", () => {
                console.log(`Other player ${sessionId} readiness changed (Shop)`);
                this.updateWaitingStatus();
            });
            this.otherPlayerListenersUnsub.push(unsub); // Store the unsubscribe function
            this.updateWaitingStatus(); // Update immediately on add
        }
     });
     colyseusRoom.state.players.onRemove((otherPlayer, sessionId) => {
        if (sessionId !== myPlayerId) {
            console.log("Other player removed (Shop):", sessionId);
            // Find and remove the listener? Colyseus might handle this, but explicit removal is safer if tracked.
            // For now, just update status. Listeners might become stale if not removed.
            this.updateWaitingStatus();
        }
     });
     // Initial setup for existing other players
     colyseusRoom.state.players.forEach((otherPlayer, sessionId) => {
        if (sessionId !== myPlayerId) {
             const unsub = otherPlayer.listen("isReady", () => {
                console.log(`Other player ${sessionId} readiness changed (Shop) - initial setup`);
                this.updateWaitingStatus();
            });
            this.otherPlayerListenersUnsub.push(unsub);
        }
     });
  }
  
  cleanupListeners() {
    console.log("Shop Scene: Cleaning up listeners.");
  
    // Call unsubscribe functions obtained from listen/onChange/onAdd etc.
    this.playerStateListenerUnsub?.();
    this.phaseListenerUnsub?.(); // This should be the function returned by listen()
    this.handListenersUnsub.forEach(unsub => unsub());
    this.otherPlayerListenersUnsub.forEach(unsub => unsub());
  
    // Clear arrays
    this.handListenersUnsub = [];
    this.otherPlayerListenersUnsub = [];
  
    // Reset listener references
    this.playerStateListenerUnsub = null;
    this.phaseListenerUnsub = null;
  
    // Remove listeners attached directly to room.state or MapSchemas if needed
    // Colyseus client SDK generally handles listener cleanup when unsub functions are called
    // or when the room connection is closed. Explicitly removing listeners like below
    // might be redundant or interfere with the SDK's internal management.
    // Relying on calling the stored unsubscribe functions is the standard practice.
    // colyseusRoom?.state?.stopListening("currentPhase"); // Example if listen returns void - Not standard API
    // colyseusRoom?.state?.players?.onAdd(null); // Remove all onAdd - Not standard API
    // colyseusRoom?.state?.players?.onRemove(null); // Remove all onRemove - Not standard API
    // Need to iterate players and remove onChange/listen listeners if they weren't tracked individually - Handled by unsub array
  
     // Remove Phaser input listeners
     this.input.off('dragstart');
     this.input.off('drag');
     this.input.off('dragend');
     // Remove button listeners if added directly
     this.continueButton?.off('pointerdown');
     this.continueButton?.off('pointerover');
     this.continueButton?.off('pointerout');
  }

  // --- UI Update Functions ---

  updateNavbar() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.healthText || !this.brewText || !this.scene.isActive("Shop")) return; // Check if scene is active
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    if (myPlayerState) {
        this.healthText.setText(`Health: ${myPlayerState.health}`);
        this.brewText.setText(`Brews: ${myPlayerState.brews}`);
        this.playerBrews = myPlayerState.brews; // Update local cache if needed for checks
    }
     this.updateDayPhaseText();
  }

   updateDayPhaseText() {
        if (!colyseusRoom || !this.dayPhaseText || !this.scene.isActive("Shop")) return;
        const day = colyseusRoom.state.currentDay;
        const phase = colyseusRoom.state.currentPhase;
        // Convert phase enum/string to user-friendly text if needed
        const phaseText = phase.charAt(0).toUpperCase() + phase.slice(1) + " Phase";
        this.dayPhaseText.setText(`Day ${day} - ${phaseText}`);
    }

  updateHandDisplay() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.scene.isActive("Shop")) return;
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    if (!myPlayerState) return;

    // Set of slot indices currently occupied according to server state
    const occupiedSlots = new Set(myPlayerState.hand.keys()); // Keys are strings "0", "1", etc.

    // Remove visuals for slots that are no longer in the server state hand
    this.handCardDisplayObjects.forEach((textObject, slotIndexString) => {
        if (!occupiedSlots.has(slotIndexString)) {
            console.log(`Removing card visual from hand slot ${slotIndexString}`);
            textObject.destroy();
            this.handCardDisplayObjects.delete(slotIndexString);
        }
    });

    // Add or update visuals for cards in the server state hand
    myPlayerState.hand.forEach((cardInstanceSchema, slotIndexString) => {
        const slotNumber = parseInt(slotIndexString, 10);
        if (isNaN(slotNumber) || slotNumber < 0 || slotNumber >= this.handSlots.length) {
             console.warn(`Invalid slot index ${slotIndexString} received from server.`);
             return;
        }

        const existingVisual = this.handCardDisplayObjects.get(slotIndexString);
        const slot = this.handSlots[slotNumber];
        const slotObject = this.handSlotObjects[slotNumber]; // Get the rectangle for dimensions

        if (existingVisual) {
            // Update existing visual if necessary (e.g., HP changes - unlikely in shop)
            // For now, just ensure it exists. We could update text content if needed.
            // console.log(`Card visual already exists for slot ${slotIndexString}`);
        } else {
            // Create new visual
            console.log(`Creating card visual for hand slot ${slotIndexString}`);
            const cardText = this.createCardText(
                cardInstanceSchema, // Pass the schema instance
                slot.centerX, slot.centerY,
                slotObject.width, slotObject.height, // Use actual slot dimensions
                "#444488" // Hand card color
            );
            this.handCardDisplayObjects.set(slotIndexString, cardText);
        }
    });
  }

  updateWaitingStatus() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.continueButton || !this.waitingText || !this.scene.isActive("Shop")) return;

    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    if (!myPlayerState) return; // Should not happen if listeners are working

    let allPlayersReady = true;
    colyseusRoom.state.players.forEach((player) => {
        if (!player.isReady) {
            allPlayersReady = false;
        }
    });

    const amReady = myPlayerState.isReady;
    const isShopPhase = colyseusRoom.state.currentPhase === Phase.Shop;
    const canInteract = !amReady && isShopPhase; // Can interact if not ready AND it's the shop phase

    // Enable/disable button interaction
    this.continueButton.setInteractive(canInteract);
    this.continueButton.input.useHandCursor = canInteract; // Toggle hand cursor
    this.continueButton.setColor(canInteract ? "#00ff00" : "#888888"); // Green if active, grey if not

    // Show/hide waiting text and update button text
    if (amReady && !allPlayersReady && isShopPhase) {
        this.waitingText.setText("Waiting for other player(s)...").setVisible(true);
        this.continueButton.setText("Waiting..."); // Change button text when waiting
    } else if (!isShopPhase) {
         this.waitingText.setText(`Waiting for ${colyseusRoom.state.currentPhase} phase...`).setVisible(true);
         this.continueButton.setText("Continue"); // Reset button text but keep disabled
    }
    else {
        this.waitingText.setVisible(false);
        this.continueButton.setText("Continue"); // Reset button text
    }

    // Enable/disable dragging shop cards
    this.shopCardObjects.forEach(cardObj => {
        if (cardObj.input) { // Check if input is defined
             cardObj.input.enabled = canInteract; // Only allow dragging if player can interact
        }
    });
  }

  // Helper to create card text objects (accepts CardInstanceSchema)
  private createCardText(
      cardInstance: CardInstanceSchema, // Use Schema type
      x: number, y: number,
      width: number, height: number,
      bgColor: string
  ): Phaser.GameObjects.Text {
      // Show current/max HP only if damaged, otherwise just max HP
      const hpDisplay = cardInstance.currentHp < cardInstance.health
          ? `${cardInstance.currentHp}/${cardInstance.health}`
          : `${cardInstance.health}`;

      return this.add.text(
          x, y,
          `${cardInstance.name}\nAtk: ${cardInstance.attack}\nHP: ${hpDisplay}\nSpd: ${cardInstance.speed}`,
          {
              fontFamily: "Arial",
              fontSize: 14, // Adjust as needed
              color: "#ffffff",
              backgroundColor: bgColor,
              padding: { x: 5, y: 3 },
              align: "center",
              fixedWidth: width,
              fixedHeight: height,
              wordWrap: { width: width - 10 }
          }
      ).setOrigin(0.5);
  }

   // Override shutdown method to ensure listeners are cleaned up
   shutdown(data?: object | undefined) {
        console.log("Shop scene shutting down.");
        this.cleanupListeners();

        // Destroy UI elements created in this scene to prevent duplicates if scene restarts
        this.shopCardObjects.forEach(obj => obj.destroy());
        this.handCardDisplayObjects.forEach(obj => obj.destroy());
        this.handSlotObjects.forEach(obj => obj.destroy());
        // Destroy navbar elements, buttons, text etc.
        this.healthText?.destroy();
        this.brewText?.destroy();
        this.dayPhaseText?.destroy();
        this.continueButton?.destroy();
        this.waitingText?.destroy();

        // Clear local arrays/maps
        this.shopCardObjects = [];
        this.handCardDisplayObjects.clear();
        this.handSlotObjects = [];
        this.handSlots = [];
        this.cardsInShop = [];

        // Call super.shutdown() if extending a class that requires it
        // super.shutdown(data);
   }
}