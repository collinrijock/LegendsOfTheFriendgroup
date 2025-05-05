import { Scene } from "phaser";
// Import global room instance
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
// Import schemas for type safety (adjust path)
import { Phase, PlayerState, CardInstanceSchema } from "../../../server/src/schemas/GameState"; // Adjust path as needed
// Reuse client interface if compatible or define locally
// Assuming CardInstanceSchema has the necessary fields or we adapt
// import { CardInstance } from "./Battle"; // Reuse client interface if compatible
// Import getStateCallbacks for 0.16 listener syntax
import { getStateCallbacks } from "colyseus.js";

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
  // --- Use Map for other player listeners ---
  private otherPlayerChangeListeners: Map<string, () => void> = new Map(); // Key: sessionId
  // --- End Use Map ---
  // --- Add listener storage for shop offers ---
  private shopOfferListenersUnsub: (() => void)[] = [];

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
    // --- Call createShopCards explicitly after listeners are set up ---
    this.createShopCards(centerX, centerY, gameWidth); // Display initial shop offers
    // --- End Call ---
    this.updateWaitingStatus(); // Update button/waiting text based on initial readiness
  }

  // --- UI Creation Helpers ---
  // Add the missing createHandSlots method
  createHandSlots(centerX: number, gameHeight: number) {
    const handSlotY = gameHeight - 120;
    const handSlotWidth = 100;
    const handSlotHeight = 140;
    const handSlotSpacing = 15;
    const totalHandSlotsWidth = 5 * handSlotWidth + 4 * handSlotSpacing;
    const startHandSlotsX = centerX - totalHandSlotsWidth / 2 + handSlotWidth / 2;

    this.handSlots = [];
    this.handSlotObjects = [];
    this.handCardDisplayObjects.clear(); // Clear any previous display objects

    for (let i = 0; i < 5; i++) {
        const slotX = startHandSlotsX + i * (handSlotWidth + handSlotSpacing);
        const slotRect = new Phaser.Geom.Rectangle(slotX - handSlotWidth / 2, handSlotY - handSlotHeight / 2, handSlotWidth, handSlotHeight);
        this.handSlots.push(slotRect);
        // Create visual representation of the slot
        const slotGraphics = this.add.rectangle(slotX, handSlotY, handSlotWidth, handSlotHeight, 0x222222, 0.4) // Dark grey, semi-transparent
            .setStrokeStyle(1, 0xaaaaaa); // Light grey outline
        this.handSlotObjects.push(slotGraphics);
    }
  }

  createShopCards(centerX: number, centerY: number, gameWidth: number) {
    // Clear existing shop card visuals first
    this.shopCardObjects.forEach(obj => obj.destroy());
    this.shopCardObjects = [];
    // this.cardsInShop = []; // Don't need client-side data array anymore

    // --- Read Shop Offers from Server State ---
    const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId);
    const shopOfferIds = myPlayerState?.shopOfferIds; // This is an ArraySchema<string>

    if (!shopOfferIds || shopOfferIds.length === 0) {
        console.log("No shop offers available from server state yet.");
        // Optionally display a "Loading shop..." message
        return;
    }

    const allCardsData = this.cache.json.get("cardData") as CardData[]; // Get local cache
    if (!allCardsData) {
        console.error("Card data cache not loaded!");
        return;
    }

    // --- Display Shop Cards based on IDs from state ---
    const shopCardWidth = 100;
    const shopCardHeight = 140;
    const shopCardSpacing = 20;
    const totalShopWidth = shopOfferIds.length * shopCardWidth + (shopOfferIds.length - 1) * shopCardSpacing;
    const startShopX = centerX - totalShopWidth / 2 + shopCardWidth / 2;
    const shopY = centerY - 100; // Position shop cards above center

    shopOfferIds.forEach((cardId, index) => {
        const cardData = allCardsData.find(c => c.id === cardId); // Find full data from cache
        if (!cardData) {
            console.warn(`Card data not found in cache for ID: ${cardId}`);
            return; // Skip if data missing
        }

        const cardX = startShopX + index * (shopCardWidth + shopCardSpacing);
        const cardText = this.add.text(
            cardX, shopY,
            `${cardData.name}\nCost: ${cardData.brewCost}\nAtk: ${cardData.attack}\nHP: ${cardData.health}\nSpd: ${cardData.speed}`,
            {
                fontFamily: "Arial",
                fontSize: 14,
                color: "#ffffff",
                backgroundColor: "#333366", // Shop card color
                padding: { x: 5, y: 3 },
                align: "center",
                fixedWidth: shopCardWidth,
                fixedHeight: shopCardHeight,
                wordWrap: { width: shopCardWidth - 10 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        cardText.setData("cardId", cardData.id); // Store the CARD ID for purchase message
        cardText.setData("cardData", cardData); // Store full data for potential display/tooltip use
        this.input.setDraggable(cardText);
        this.shopCardObjects.push(cardText);
    });
    // Re-setup drag/drop listeners for the new shop objects
    this.setupDragAndDrop();
  }

  // --- Drag and Drop ---
   setupDragAndDrop() {
    // --- Clear existing drag listeners first ---
    this.input.off('dragstart');
    this.input.off('drag');
    this.input.off('dragend');
    // --- End Clear ---

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
        let droppedOnValidSlot = false; // Track if dropped on *any* hand slot
        const myPlayerId = colyseusRoom.sessionId;

        for (let i = 0; i < this.handSlots.length; i++) {
            const slotRect = this.handSlots[i];
            if (slotRect && Phaser.Geom.Rectangle.Contains(slotRect, droppedX, droppedY)) {
                droppedOnValidSlot = true; // Dropped on a hand slot zone
                const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
                // Check if server state shows slot as empty
                if (myPlayerState && !myPlayerState.hand.has(String(i))) {
                    const cardData = gameObject.getData("cardData") as CardData;
                    const cardId = gameObject.getData("cardId") as string; // Get the card ID
                    if (cardId) { // Check if cardId exists
                        console.log(`Attempting to buy ${cardData?.name ?? cardId} for slot ${i}`);
                        // Send buy message to server - send CARD ID and slot index
                        colyseusRoom.send("buyCard", { cardId: cardId, handSlotIndex: i });
                        buyAttempted = true;
                        // Visual snaps back, server state handles hand update
                        break; // Exit loop once buy is attempted for a slot
                    } else {
                        console.error("Shop card missing cardId data!");
                    }
                } else {
                     console.log(`Hand slot ${i} is full or player state unavailable.`);
                     // Still counts as a drop attempt on a valid slot, but buy not sent
                     break; // Exit loop
                }
            }
        }

        // If not dropped on any hand slot OR if dropped on a full slot (buy not attempted), snap back.
        // If buy *was* attempted (dropped on empty slot), it will also snap back here.
        // Server state change is the source of truth for the hand.
        if (gameObject.active) { // Check if gameObject still exists
            gameObject.x = gameObject.getData('startX');
            gameObject.y = gameObject.getData('startY');
            if (buyAttempted) {
                 console.log("Buy attempted. Visual snapped back. Waiting for server state update for hand.");
            } else if (droppedOnValidSlot) {
                 console.log("Drop target slot was full or invalid. Snapping back.");
            } else {
                 console.log("Dropped outside hand slots. Snapping back.");
            }
        }
        // --- OLD LOGIC REMOVED ---
        /*
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
        */
        // --- END OLD LOGIC REMOVAL ---
    });
  }

  // --- Colyseus State Synchronization ---

  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.sessionId) return;

    const myPlayerId = colyseusRoom.sessionId;
    // Get the proxy function for attaching listeners
    const $ = getStateCallbacks(colyseusRoom);

    // --- Listen to changes in *my* player state (health, brews, isReady) ---
    const player = colyseusRoom.state.players.get(myPlayerId);
    if (player) {
        // Use listen for specific properties for finer control via the proxy
        // Store the returned unsubscribe function
        this.playerStateListenerUnsub = $(player).onChange(() => { // onChange on the proxied player still works for general changes
            // Add scene active check here for safety, though cleanup should handle it
            if (!this.scene.isActive()) {
                console.warn("Shop: player.onChange called while scene inactive.");
                return;
            }
            console.log("My player state changed (Shop)");
            this.updateNavbar();
            this.updateWaitingStatus(); // Update based on isReady changes
        });

        // --- Listen specifically to hand changes for *my* player ---
        // Use onAdd/onRemove for the map itself via the proxy
        this.handListenersUnsub.push($(player.hand).onAdd((card, key) => {
            if (!this.scene.isActive()) return; // Guard against scene changes
            console.log("Card added to hand (Shop):", key, card.name);
            this.updateHandDisplay();
            // --- Refresh Shop Display ---
            console.log("Refreshing shop display due to hand update.");
            // Re-call createShopCards to redraw shop, excluding newly added hand card
            const centerX = this.cameras.main.centerX;
            const centerY = this.cameras.main.centerY;
            const gameWidth = this.cameras.main.width;
            this.createShopCards(centerX, centerY, gameWidth);
            // Re-setup drag/drop for the potentially new shop cards
            this.setupDragAndDrop();
            // --- End Refresh ---
        }));
        this.handListenersUnsub.push($(player.hand).onRemove((card, key) => {
            if (!this.scene.isActive()) return; // Guard against scene changes
            console.log("Card removed from hand (Shop):", key);
            this.updateHandDisplay();
        }));
        // Add listeners for existing cards in hand (if needed, currently relying on onAdd/Remove)
        // player.hand.forEach((card, key) => { ... });

        // --- Listen to shop offer changes for *my* player ---
        // Use proxy for shopOfferIds collection
        this.shopOfferListenersUnsub.push($(player.shopOfferIds).onAdd((cardId, index) => {
            if (!this.scene.isActive()) return;
            console.log(`Shop offer added (ID: ${cardId}) at index ${index}`);
            const centerX = this.cameras.main.centerX;
            const centerY = this.cameras.main.centerY;
            const gameWidth = this.cameras.main.width;
            this.createShopCards(centerX, centerY, gameWidth);
        }));
        this.shopOfferListenersUnsub.push($(player.shopOfferIds).onRemove((cardId, index) => {
             if (!this.scene.isActive()) return;
             console.log(`Shop offer removed (ID: ${cardId}) at index ${index}`);
             const centerX = this.cameras.main.centerX;
             const centerY = this.cameras.main.centerY;
             const gameWidth = this.cameras.main.width;
             this.createShopCards(centerX, centerY, gameWidth);
        }));

    } else {
        console.error("Shop Scene: My player state not found on init.");
    }


    // --- Listen for phase changes ---
    // Ensure the unsubscribe function returned by state.listen is stored
    // Use proxy for the state object
    this.phaseListenerUnsub = $(colyseusRoom.state).listen("currentPhase", (currentPhase, previousPhase) => {
        // Add scene active check here for safety
        if (!this.scene.isActive()) {
            console.warn(`Shop: Phase listener triggered (${previousPhase} -> ${currentPhase}) while scene inactive.`);
            return;
        }
        console.log(`Shop Scene: Phase changed from ${previousPhase} to ${currentPhase}`);
        this.updateDayPhaseText(); // Update navbar text
        if (currentPhase === Phase.Preparation) {
            // Stop the current scene before starting the next
            if (this.scene.isActive()) {
                this.scene.stop(); // Stop Shop scene
                this.scene.start("Preparation");
            }
        } else if (currentPhase !== Phase.Shop) {
            // If phase changes to something unexpected, handle it
            console.warn(`Shop Scene: Unexpected phase change to ${currentPhase}. Returning to Lobby.`);
            // Stop the current scene before starting the next
            if (this.scene.isActive()) {
                this.scene.stop(); // Stop Shop scene
                this.scene.start("Lobby"); // Or MainMenu
            }
        }
        // Update button/waiting status based on new phase
        this.updateWaitingStatus();
    });

     // --- Listen for changes in other players' ready status ---
     // Use proxy for players collection
     $(colyseusRoom.state.players).onAdd((otherPlayer, sessionId) => {
        if (sessionId !== myPlayerId) {
            console.log("Other player added (Shop):", sessionId);
            // Listen to the isReady property of the other player via the proxy
            const unsub = $(otherPlayer).listen("isReady", () => {
                if (!this.scene.isActive()) return; // Add guard
                console.log(`Other player ${sessionId} readiness changed (Shop)`);
                this.updateWaitingStatus();
            });
            // --- Store unsubscribe for new player in Map ---
            this.otherPlayerChangeListeners.set(sessionId, unsub);
            // --- End Store ---
            this.updateWaitingStatus(); // Update immediately on add
        }
     });
     // Use proxy for players collection
     $(colyseusRoom.state.players).onRemove((otherPlayer, sessionId) => {
        if (sessionId !== myPlayerId) {
            console.log("Other player removed (Shop):", sessionId);
            // --- Remove the specific listener for the removed player ---
            const unsub = this.otherPlayerChangeListeners.get(sessionId);
            if (unsub) {
                unsub(); // Call the unsubscribe function
                this.otherPlayerChangeListeners.delete(sessionId); // Remove from map
                console.log(`Removed listener for player ${sessionId}`);
            } else {
                console.warn(`Could not find listener to remove for player ${sessionId}`);
            }
            // --- End Remove ---
            this.updateWaitingStatus();
        }
     });
     // Initial setup for existing other players
     colyseusRoom.state.players.forEach((otherPlayer, sessionId) => {
        if (sessionId !== myPlayerId) {
             // Use proxy for the other player object
             const unsub = $(otherPlayer).listen("isReady", () => {
                if (!this.scene.isActive()) return; // Add guard
                console.log(`Other player ${sessionId} readiness changed (Shop) - initial setup`);
                this.updateWaitingStatus();
            });
            // --- Store unsubscribe for existing players in Map ---
            this.otherPlayerChangeListeners.set(sessionId, unsub);
            // --- End Store ---
        }
     });
  }

  cleanupListeners() {
    console.log("Shop Scene: Cleaning up listeners.");

    // --- Add Specific Logging ---
    if (this.playerStateListenerUnsub) {
        console.log("Shop Scene: Attempting to call playerStateListenerUnsub().");
        this.playerStateListenerUnsub();
        console.log("Shop Scene: playerStateListenerUnsub() called.");
    } else {
        console.log("Shop Scene: playerStateListenerUnsub was null or undefined.");
    }

    if (this.phaseListenerUnsub) {
        console.log("Shop Scene: Attempting to call phaseListenerUnsub().");
        this.phaseListenerUnsub();
        console.log("Shop Scene: phaseListenerUnsub() called.");
    } else {
        console.log("Shop Scene: phaseListenerUnsub was null or undefined.");
    }
    // --- End Specific Logging ---


    // Call unsubscribe functions obtained from listen/onChange/onAdd etc.
    // this.playerStateListenerUnsub?.(); // Covered by logging above
    // this.phaseListenerUnsub?.(); // Covered by logging above

    this.handListenersUnsub.forEach((unsub, index) => {
        console.log(`Shop Scene: Cleaning up hand listener index ${index}`);
        unsub();
    });
    this.otherPlayerChangeListeners.forEach((unsub, sessionId) => {
        console.log(`Shop Scene: Cleaning up listener for other player ${sessionId}`);
        unsub();
    });
    this.otherPlayerChangeListeners.clear();
    this.shopOfferListenersUnsub.forEach((unsub, index) => {
        console.log(`Shop Scene: Cleaning up shop offer listener index ${index}`);
        unsub();
    });

    // Clear arrays
    this.handListenersUnsub = [];
    this.shopOfferListenersUnsub = [];

    // Reset listener references
    this.playerStateListenerUnsub = null;
    this.phaseListenerUnsub = null;


     // Remove Phaser input listeners
     this.input.off('dragstart');
     this.input.off('drag');
     this.input.off('dragend');
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