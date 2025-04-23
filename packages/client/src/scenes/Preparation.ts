import { Scene } from "phaser";
// Import global room instance
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
// Import schemas for type safety (adjust path)
import { Phase, PlayerState, CardInstanceSchema } from "../../../server/src/schemas/GameState"; // Adjust path
// Reuse client interface if compatible
import { CardInstance } from "./Battle";

// --- Utility Function --- (Keep or import)
// function generateUniqueId(): string { ... }

export class Preparation extends Scene {
  // Visual representations
  private handSlotObjects: Phaser.GameObjects.Rectangle[] = [];
  private battlefieldSlotObjects: Phaser.GameObjects.Rectangle[] = [];

  // Geometry for drop zones
  private handSlots: Phaser.Geom.Rectangle[] = [];
  private battlefieldSlots: Phaser.Geom.Rectangle[] = [];

  // Track the VISUAL card objects currently in each slot (using Map for consistency)
  private handCardObjects: Map<string, Phaser.GameObjects.Text> = new Map(); // Key: slotIndex "0"-"4"
  private battlefieldCardObjects: Map<string, Phaser.GameObjects.Text> = new Map(); // Key: slotIndex "0"-"4"

  // All draggable card visuals currently in the scene
  private draggableCardObjects: Phaser.GameObjects.Text[] = [];

  private startBattleButton!: Phaser.GameObjects.Text;
  private waitingText!: Phaser.GameObjects.Text; // "Waiting for other player..."

  // Navbar elements
  private healthText!: Phaser.GameObjects.Text;
  private brewText!: Phaser.GameObjects.Text;
  private dayPhaseText!: Phaser.GameObjects.Text;

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


  constructor() {
    super("Preparation");
  }

  // Remove init - state comes from Colyseus
  // init(data: { playerBrews?: number, currentDay?: number }) { ... }

  create() {
    this.scene.launch("background");

    // --- Safety Check ---
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) {
        console.error("Preparation Scene: Colyseus room not available!");
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Error: Connection lost.\nPlease return to Main Menu.", { color: '#ff0000', fontSize: '24px', align: 'center' }).setOrigin(0.5);
        this.input.once('pointerdown', () => this.scene.start('MainMenu'));
        return;
    }

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameHeight = this.cameras.main.height;
    const gameWidth = this.cameras.main.width;

    // Get initial state from Colyseus
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    const currentDay = colyseusRoom.state.currentDay;
    const playerHealth = myPlayerState?.health ?? 50;
    const playerBrews = myPlayerState?.brews ?? 0;

    // --- Log Hand State ---
    if (myPlayerState) {
        console.log("Preparation Create: Initial myPlayerState.hand contents:", JSON.stringify(Object.fromEntries(myPlayerState.hand.entries())));
    } else {
        console.log("Preparation Create: myPlayerState not found initially.");
    }
    // --- End Log ---

    // --- Navbar ---
    const navbarY = 25;
    const navbarHeight = 50;
    this.add.rectangle(centerX, navbarY, gameWidth, navbarHeight, 0x000000, 0.6);
    this.healthText = this.add.text(50, navbarY, `Health: ${playerHealth}`, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#00ff00",
        align: "left"
    }).setOrigin(0, 0.5);
    this.dayPhaseText = this.add.text(centerX, navbarY, `Day ${currentDay} - Preparation Phase`, {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffffff",
        align: "center"
    }).setOrigin(0.5);
    this.brewText = this.add.text(gameWidth - 50, navbarY, `Brews: ${playerBrews}`, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#ffff00",
        align: "right"
    }).setOrigin(1, 0.5);
    // Add styles matching previous implementation

    // --- Title ---
    this.add.text(centerX, 80, "Preparation Phase", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
    }).setOrigin(0.5);
    // Add styles matching previous implementation

    // --- Battlefield Slots ---
    this.createBattlefieldSlots(centerX, centerY);

    // --- Hand Slots ---
    this.createHandSlots(centerX, gameHeight);

    // --- Populate Slots from Server State ---
    this.updateBoardFromState(); // Initial population

    // --- Drag and Drop Logic ---
    this.setupDragAndDrop();

    // --- Start Battle Button ---
    this.startBattleButton = this.add.text(centerX, gameHeight - 50, "Start Battle", {
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
    this.waitingText = this.add.text(centerX, gameHeight - 20, "", {
        fontFamily: "Arial", fontSize: 18, color: "#ffff00", align: "center"
    }).setOrigin(0.5).setVisible(false); // Initially hidden

    // --- Colyseus Listeners ---
    this.setupColyseusListeners();

    // Initial UI update based on readiness
    this.updateWaitingStatus(); // Includes button state update
  }

  // --- UI Creation Helpers ---

  createBattlefieldSlots(centerX: number, centerY: number) {
    const slotWidth = 120;
    const slotHeight = 160;
    const slotSpacing = 20;
    const totalSlotsWidth = 5 * slotWidth + 4 * slotSpacing;
    const startSlotsX = centerX - totalSlotsWidth / 2 + slotWidth / 2;
    const slotsY = centerY - 80;

    this.battlefieldSlots = [];
    this.battlefieldSlotObjects = [];
    this.battlefieldCardObjects.clear();

    for (let i = 0; i < 5; i++) {
      const slotX = startSlotsX + i * (slotWidth + slotSpacing);
      const slotRect = new Phaser.Geom.Rectangle(slotX - slotWidth / 2, slotsY - slotHeight / 2, slotWidth, slotHeight);
      this.battlefieldSlots.push(slotRect);
      const slotGraphics = this.add.rectangle(slotX, slotsY, slotWidth, slotHeight, 0x000000, 0.3)
          .setStrokeStyle(2, 0xffffff);
      this.battlefieldSlotObjects.push(slotGraphics);
    }
  }

  createHandSlots(centerX: number, gameHeight: number) {
    const handSlotY = gameHeight - 120;
    const handSlotWidth = 100;
    const handSlotHeight = 140;
    const handSlotSpacing = 15;
    const totalHandSlotsWidth = 5 * handSlotWidth + 4 * handSlotSpacing;
    const startHandSlotsX = centerX - totalHandSlotsWidth / 2 + handSlotWidth / 2;

    this.handSlots = [];
    this.handSlotObjects = [];
    this.handCardObjects.clear();

    for (let i = 0; i < 5; i++) {
        const slotX = startHandSlotsX + i * (handSlotWidth + handSlotSpacing);
        const slotRect = new Phaser.Geom.Rectangle(slotX - handSlotWidth / 2, handSlotY - handSlotHeight / 2, handSlotWidth, handSlotHeight);
        this.handSlots.push(slotRect);
        const slotGraphics = this.add.rectangle(slotX, handSlotY, handSlotWidth, handSlotHeight, 0x222222, 0.4)
            .setStrokeStyle(1, 0xaaaaaa);
        this.handSlotObjects.push(slotGraphics);
    }
  }

  // --- Drag and Drop ---

  setupDragAndDrop() {
    this.input.on('dragstart', (pointer, gameObject: Phaser.GameObjects.Text) => {
        if (!gameObject.getData('cardInstance')) return;
        // Only allow dragging if not already waiting
        const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId);
        if (!myPlayerState || myPlayerState.isReady) return;


        this.children.bringToTop(gameObject);
        gameObject.setAlpha(0.7);
        gameObject.setData('isDragging', true); // Mark as being dragged

        // Store original position/slot for potential snap back
        gameObject.setData('originalX', gameObject.x);
        gameObject.setData('originalY', gameObject.y);
        gameObject.setData('originalLocation', gameObject.getData('location'));
        gameObject.setData('originalSlotIndex', gameObject.getData('currentSlotIndex'));


        // Visually remove from current slot map immediately
        const currentLocation = gameObject.getData('location');
        const currentSlotIndex = gameObject.getData('currentSlotIndex');
        if (currentLocation === 'battlefield') {
            this.battlefieldCardObjects.delete(currentSlotIndex);
        } else if (currentLocation === 'hand') {
            this.handCardObjects.delete(currentSlotIndex);
        }
        // Don't modify server state here
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (gameObject.getData('isDragging')) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        }
    });

    this.input.on('dragend', (pointer, gameObject: Phaser.GameObjects.Text) => {
        if (!gameObject.getData('isDragging')) return;

        gameObject.setAlpha(1.0);
        gameObject.setData('isDragging', false);
        const droppedX = gameObject.x;
        const droppedY = gameObject.y;
        let placed = false;

        // Check drop on Battlefield Slots
        for (let i = 0; i < this.battlefieldSlots.length; i++) {
            const slotKey = String(i);
            if (Phaser.Geom.Rectangle.Contains(this.battlefieldSlots[i], droppedX, droppedY)) {
                if (!this.battlefieldCardObjects.has(slotKey)) { // Check if visual slot is empty
                    gameObject.x = this.battlefieldSlots[i].centerX;
                    gameObject.y = this.battlefieldSlots[i].centerY;
                    this.battlefieldCardObjects.set(slotKey, gameObject); // Place visual object
                    gameObject.setData('location', 'battlefield');
                    gameObject.setData('currentSlotIndex', slotKey);
                    placed = true;
                    break;
                }
            }
        }

        // Check drop on Hand Slots
        if (!placed) {
            for (let i = 0; i < this.handSlots.length; i++) {
                 const slotKey = String(i);
                if (Phaser.Geom.Rectangle.Contains(this.handSlots[i], droppedX, droppedY)) {
                    if (!this.handCardObjects.has(slotKey)) { // Check if visual slot is empty
                        gameObject.x = this.handSlots[i].centerX;
                        gameObject.y = this.handSlots[i].centerY;
                        this.handCardObjects.set(slotKey, gameObject); // Place visual object
                        gameObject.setData('location', 'hand');
                        gameObject.setData('currentSlotIndex', slotKey);
                        placed = true;
                        break;
                    }
                }
            }
        }

        // If not placed on any valid empty slot, return to original position
        if (!placed) {
             console.log("No valid empty slot found, returning card.");
             gameObject.x = gameObject.getData('originalX');
             gameObject.y = gameObject.getData('originalY');
             const originalLocation = gameObject.getData('originalLocation');
             const originalSlotIndex = gameObject.getData('originalSlotIndex');
             gameObject.setData('location', originalLocation);
             gameObject.setData('currentSlotIndex', originalSlotIndex);
             // Put back into the correct visual map
             if (originalLocation === 'battlefield') {
                 this.battlefieldCardObjects.set(originalSlotIndex, gameObject);
             } else if (originalLocation === 'hand') {
                 this.handCardObjects.set(originalSlotIndex, gameObject);
             }
        }
         this.updateStartButtonState(); // Check if ready state needs update
    });
  }

  // --- Colyseus State Synchronization ---

setupColyseusListeners() {
  if (!colyseusRoom || !colyseusRoom.sessionId) return;
  const myPlayerId = colyseusRoom.sessionId;

  // Listen to general player state changes (health, brews, isReady)
  const player = colyseusRoom.state.players.get(myPlayerId);
  if (player) {
      // Use onChange for the whole player object or listen for specific props
      // Store the returned unsubscribe function
      this.playerStateListenerUnsub = player.onChange(() => {
          if (!this.scene.isActive()) return; // Guard against updates after shutdown
          this.updateNavbar();
          this.updateWaitingStatus();
      });

      // Listen to hand changes
      this.handAddUnsub = player.hand.onAdd((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });
      this.handRemoveUnsub = player.hand.onRemove((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });
      // Assuming onChange on MapSchema items also returns an unsubscribe function
      // Note: Colyseus 0.15 might require iterating and adding onChange to each item.
      // If direct onChange on the map doesn't work as expected, this needs adjustment.
      // For now, assume it works like this or is handled by onAdd/onRemove triggering updateBoardFromState.
      // this.handChangeUnsub = player.hand.onChange((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });


      // Listen to battlefield changes
      this.battlefieldAddUnsub = player.battlefield.onAdd((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });
      this.battlefieldRemoveUnsub = player.battlefield.onRemove((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });
      // this.battlefieldChangeUnsub = player.battlefield.onChange((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });

  } else {
      console.error("Preparation Scene: My player state not found on init.");
  }

  // Listen for phase changes
  // Store the returned unsubscribe function
  this.phaseListenerUnsub = colyseusRoom.state.listen("currentPhase", (currentPhase) => {
      if (!this.scene.isActive()) return;
      console.log(`Preparation Scene: Phase changed to ${currentPhase}`);
      this.updateDayPhaseText();
      if (currentPhase === Phase.Battle) {
          // Stop the current scene before starting the next
          if (this.scene.isActive()) {
              this.scene.stop(); // Stop Preparation scene
              this.scene.start("Battle");
          }
      } else if (currentPhase !== Phase.Preparation) {
          console.warn(`Preparation Scene: Unexpected phase change to ${currentPhase}. Returning to Lobby.`);
          // Stop the current scene before starting the next
          if (this.scene.isActive()) {
              this.scene.stop(); // Stop Preparation scene
              this.scene.start("Lobby");
          }
      }
      this.updateWaitingStatus();
  });

   // Listen for changes in other players' ready status & join/leave
   // Store the returned unsubscribe functions
   this.otherPlayerAddUnsub = colyseusRoom.state.players.onAdd((addedPlayer, sessionId) => {
       if (this.scene.isActive()) {
           if (sessionId !== myPlayerId) {
               // Listen for changes on the added player
               const unsub = addedPlayer.onChange(() => {
                   if (this.scene.isActive()) this.updateWaitingStatus();
               });
               this.otherPlayerChangeListeners.set(sessionId, unsub);
           }
           this.updateWaitingStatus();
       }
   });
   this.otherPlayerRemoveUnsub = colyseusRoom.state.players.onRemove((removedPlayer, sessionId) => {
       if (this.scene.isActive()) {
           // Remove the specific listener for the removed player
           const unsub = this.otherPlayerChangeListeners.get(sessionId);
           unsub?.();
           this.otherPlayerChangeListeners.delete(sessionId);
           this.updateWaitingStatus();
       }
   });
   // Add listeners for existing other players
   colyseusRoom.state.players.forEach((existingPlayer, sessionId) => {
        if (sessionId !== myPlayerId) {
            const unsub = existingPlayer.onChange(() => {
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
  this.otherPlayerChangeListeners.forEach(unsub => unsub()); // Unsubscribe from each other player

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
  this.input.off('dragstart');
  this.input.off('drag');
  this.input.off('dragend');
  this.startBattleButton?.off('pointerdown');
  this.startBattleButton?.off('pointerover');
  this.startBattleButton?.off('pointerout');
}

  // --- UI Update Functions ---

  updateNavbar() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.healthText || !this.brewText) return;
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    if (myPlayerState) {
        this.healthText.setText(`Health: ${myPlayerState.health}`);
        this.brewText.setText(`Brews: ${myPlayerState.brews}`);
    }
    this.updateDayPhaseText();
  }

  updateDayPhaseText() {
        if (!colyseusRoom || !this.dayPhaseText) return;
        const day = colyseusRoom.state.currentDay;
        const phase = colyseusRoom.state.currentPhase;
        this.dayPhaseText.setText(`Day ${day} - ${phase}`);
  }

  // Reads the server state and updates the entire visual board
updateBoardFromState() {
  // --- Add Log ---
  console.log("Preparation updateBoardFromState: Function called.");
  // --- End Log ---
  if (!colyseusRoom || !colyseusRoom.sessionId ) {
      console.log("Preparation updateBoardFromState: Exiting early - Room/Session/Scene inactive."); // Log exit reason
      console.log("Colyseus Room:", colyseusRoom);
      console.log("Session ID:", colyseusRoom?.sessionId);
      console.log("Scene active:", this.scene.isActive());
      return; // Add scene active check
  }
  // --- Add Log After First Guard ---
  console.log("Preparation updateBoardFromState: Passed first guard (Room/Session/Scene active).");
  // --- End Log ---

  const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
  if (!myPlayerState) {
      console.log("Preparation updateBoardFromState: Exiting early - myPlayerState not found."); // Log exit reason
      return;
  }
  // --- Add Log After Second Guard ---
  console.log("Preparation updateBoardFromState: Passed second guard (myPlayerState found).");
  // --- End Log ---
  // --- End Log ---
  // Clear existing draggable objects first
  this.draggableCardObjects.forEach(obj => obj.destroy());
  this.draggableCardObjects = [];
  this.handCardObjects.clear();
  this.battlefieldCardObjects.clear();

  // --- Log Hand Size Before Loop ---
  console.log(`Preparation updateBoardFromState: Hand size before loop: ${myPlayerState.hand.size}`);
  // --- End Log ---

  // --- Add Detailed Logging Before Loop ---
  console.log("Preparation updateBoardFromState: Logging hand state right before loop:");
  console.log("  myPlayerState.hand object:", myPlayerState.hand);
  console.log("  myPlayerState.hand.size:", myPlayerState.hand.size);
  console.log("  typeof myPlayerState.hand.forEach:", typeof myPlayerState.hand.forEach);
  try {
      console.log("  myPlayerState.hand keys:", Array.from(myPlayerState.hand.keys()));
  } catch (e) {
      console.error("  Error getting hand keys:", e);
  }
  // --- End Detailed Logging ---

  // Populate Hand Visuals
  myPlayerState.hand.forEach((cardInstanceSchema, slotIndex) => {
      // --- Log Inside Loop Start ---
      console.log(`Preparation updateBoardFromState: Entering hand.forEach for slotIndex: ${slotIndex}`);
      // --- End Log ---
      const slotNumber = parseInt(slotIndex, 10);
      // Add check for cardInstanceSchema existence
      if (isNaN(slotNumber) || slotNumber < 0 || slotNumber >= this.handSlots.length || !cardInstanceSchema) {
          console.warn(`Preparation updateBoardFromState: Skipping invalid hand slot data for index ${slotIndex}`);
          return; // Use return instead of continue for forEach
      }
      // --- Log Card ---
      console.log(`Preparation updateBoardFromState: Processing hand card in slot ${slotIndex}: ID=${cardInstanceSchema.cardId}, InstanceID=${cardInstanceSchema.instanceId}`);
      // --- End Log ---
      const slot = this.handSlots[slotNumber];
      // --- Add Log Before createCardText ---
      console.log(`Preparation updateBoardFromState: About to call createCardText for slot ${slotIndex}`);
      // --- End Log ---
      const cardText = this.createCardText(cardInstanceSchema, slot.centerX, slot.centerY, this.handSlotObjects[slotNumber].width, this.handSlotObjects[slotNumber].height, "#444488");
      // --- Log Card Text Creation ---
      if (cardText) {
          console.log(`Preparation updateBoardFromState: Created cardText for hand slot ${slotIndex}`);
      } else {
          console.error(`Preparation updateBoardFromState: Failed to create cardText for hand slot ${slotIndex}`);
          return; // Skip setup if text creation failed
      }
      // --- End Log ---
      this.handCardObjects.set(slotIndex, cardText);
      // --- Add Log Before setupDraggableCard ---
      console.log(`Preparation updateBoardFromState: About to call setupDraggableCard for slot ${slotIndex}`);
      // --- End Log ---
      this.setupDraggableCard(cardText, cardInstanceSchema, 'hand', slotIndex);
  });

  // --- Log Hand Size After Loop ---
  console.log(`Preparation updateBoardFromState: Hand size after loop: ${myPlayerState.hand.size}`);
  console.log(`Preparation updateBoardFromState: handCardObjects map size: ${this.handCardObjects.size}`);
  // --- Log Draggable Objects After Hand Loop ---
  console.log(`Preparation updateBoardFromState: Draggable objects after hand loop: ${this.draggableCardObjects.length}`);
  // --- End Log ---

  // Populate Battlefield Visuals
  myPlayerState.battlefield.forEach((cardInstanceSchema, slotIndex) => {
      const slotNumber = parseInt(slotIndex, 10);
      // Add check for cardInstanceSchema existence
      if (isNaN(slotNumber) || slotNumber < 0 || slotNumber >= this.battlefieldSlots.length || !cardInstanceSchema) return;
      const slot = this.battlefieldSlots[slotNumber];
      const cardText = this.createCardText(cardInstanceSchema, slot.centerX, slot.centerY, this.battlefieldSlotObjects[slotNumber].width, this.battlefieldSlotObjects[slotNumber].height, "#663333");
      this.battlefieldCardObjects.set(slotIndex, cardText);
      this.setupDraggableCard(cardText, cardInstanceSchema, 'battlefield', slotIndex);
  });

   this.updateStartButtonState(); // Update button based on new state
}


  updateWaitingStatus() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.startBattleButton || !this.waitingText) return;

    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    if (!myPlayerState) return;

    let allPlayersReady = true;
    colyseusRoom.state.players.forEach(player => {
        if (!player.isReady) allPlayersReady = false;
    });

    const amReady = myPlayerState.isReady;
    const canInteract = !amReady && colyseusRoom.state.currentPhase === Phase.Preparation;

    // Enable/disable button based on interaction state AND board state
    this.updateStartButtonState(); // This handles the button color/interactivity based on board content

    // Show/hide waiting text
    if (amReady && !allPlayersReady) {
        this.waitingText.setText("Waiting for other player(s)...").setVisible(true);
        this.startBattleButton.setText("Waiting..."); // Change button text
        this.startBattleButton.disableInteractive().setColor("#888888"); // Ensure disabled while waiting
    } else {
        this.waitingText.setVisible(false);
        this.startBattleButton.setText("Start Battle"); // Reset button text
        // Re-enable button *if* conditions are met (handled by updateStartButtonState)
        this.updateStartButtonState();
    }

    // Disable dragging if waiting
    this.draggableCardObjects.forEach(cardObj => {
         if (cardObj.input) cardObj.input.enabled = canInteract;
    });
  }

  updateStartButtonState() {
    // --- Add Null Check ---
    if (!this.startBattleButton || !this.startBattleButton.active) {
        console.warn("updateStartButtonState called but button is null or inactive.");
        return; // Guard if called too early or after shutdown
    }
    // --- End Null Check ---

    // Enable button only if at least one card is placed on the BATTLEFIELD visually
    const canStart = this.battlefieldCardObjects.size > 0;
    const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom?.sessionId);
    const amReady = myPlayerState?.isReady ?? false;
    const isPrepPhase = colyseusRoom?.state.currentPhase === Phase.Preparation;

    const shouldBeEnabled = canStart && !amReady && isPrepPhase;

    if (shouldBeEnabled) {
        this.startBattleButton.setColor("#00ff00");
        this.startBattleButton.setInteractive({ useHandCursor: true });
        this.startBattleButton.off('pointerdown'); // Remove previous listener
        this.startBattleButton.once('pointerdown', this.confirmPreparation, this); // Call confirmPreparation
        this.startBattleButton.on('pointerover', () => this.startBattleButton.setColor('#55ff55'));
        this.startBattleButton.on('pointerout', () => this.startBattleButton.setColor('#00ff00'));
    } else {
        // Keep disabled color unless actively waiting (handled by updateWaitingStatus)
        // Check waitingText visibility *before* potentially accessing it
        if (this.waitingText && !this.waitingText.visible) {
             this.startBattleButton.setColor("#888888");
        }
        // This is the line causing the error if this.startBattleButton is null
        this.startBattleButton.disableInteractive(); // Error occurs here if button is null
        this.startBattleButton.off('pointerdown');
        this.startBattleButton.off('pointerover');
        this.startBattleButton.off('pointerout');
    }
  }

  // Called when the "Start Battle" button is clicked
confirmPreparation() {
  if (!colyseusRoom) return;
  console.log("Confirming preparation layout...");

  // Construct layout data from current VISUAL state
  // Server needs CardInstanceSchema-like data or just instanceIds if it can look them up
  const handLayout: { [key: string]: CardInstanceSchema | null } = {};
  for (let i = 0; i < 5; i++) {
      const key = String(i);
      const cardObject = this.handCardObjects.get(key);
      // Ensure we get the actual CardInstanceSchema stored in data
      handLayout[key] = cardObject ? (cardObject.getData('cardInstance') as CardInstanceSchema) : null;
  }

  const battlefieldLayout: { [key: string]: CardInstanceSchema | null } = {};
  for (let i = 0; i < 5; i++) {
      const key = String(i);
      const cardObject = this.battlefieldCardObjects.get(key);
      // Ensure we get the actual CardInstanceSchema stored in data
      battlefieldLayout[key] = cardObject ? (cardObject.getData('cardInstance') as CardInstanceSchema) : null;
  }

  // Send layout to server and mark as ready
  colyseusRoom.send("setPreparation", { handLayout: handLayout, battlefieldLayout: battlefieldLayout });
  // Note: Server sets isReady=true upon receiving this message.
  // Client UI update (waiting text, disabled button) will happen via playerStateListener.
  this.updateWaitingStatus(); // Immediately show waiting state
}


  // Helper to create card text objects (accepts CardInstanceSchema)
  private createCardText(
      cardInstance: CardInstanceSchema,
      x: number, y: number,
      width: number, height: number,
      bgColor: string
  ): Phaser.GameObjects.Text {
      const hpDisplay = cardInstance.currentHp < cardInstance.health
          ? `${cardInstance.currentHp}/${cardInstance.health}`
          : `${cardInstance.health}`;

      const cardText = this.add.text(
          x, y,
          `${cardInstance.name}\nAtk: ${cardInstance.attack}\nHP: ${hpDisplay}\nSpd: ${cardInstance.speed}`,
          {
            fontFamily: "Arial",
            fontSize: 14,
            color: "#ffffff",
            backgroundColor: bgColor,
            padding: { x: 5, y: 3 },
            align: "center",
            fixedWidth: width,
            fixedHeight: height,
            wordWrap: { width: width - 10 }
          } // Add styles matching previous implementation
      ).setOrigin(0.5);

      // --- Set Depth and Log ---
      cardText.setDepth(10); // Ensure it's above slots/background
      console.log(`createCardText: Created text for ${cardInstance.name}. Properties: x=${cardText.x}, y=${cardText.y}, visible=${cardText.visible}, alpha=${cardText.alpha}, depth=${cardText.depth}`);
      // --- End Set Depth and Log ---

      return cardText;
  }

  // Helper to setup draggable card visuals
  private setupDraggableCard(
      cardText: Phaser.GameObjects.Text,
      cardInstance: CardInstanceSchema,
      initialLocation: 'hand' | 'battlefield',
      initialIndex: string // Use string index for map keys
  ) {
      // --- Add Logging ---
      console.log(`setupDraggableCard: Setting up card '${cardInstance.name}' (Instance: ${cardInstance.instanceId}) for location '${initialLocation}', index '${initialIndex}'. Valid text object: ${!!cardText}`);
      // --- End Logging ---
      cardText.setData("cardInstance", cardInstance);
      cardText.setData("location", initialLocation);
      cardText.setData("currentSlotIndex", initialIndex);
      cardText.setInteractive({ useHandCursor: true });
      this.input.setDraggable(cardText);
      this.draggableCardObjects.push(cardText);
  }

   // Override shutdown
   shutdown() {
        console.log("Preparation scene shutting down explicitly.");
        this.cleanupListeners();
        // Destroy UI elements to prevent leaks if scene restarts
        this.draggableCardObjects.forEach(obj => obj.destroy());
        this.handSlotObjects.forEach(obj => obj.destroy());
        this.battlefieldSlotObjects.forEach(obj => obj.destroy());
        this.healthText?.destroy();
        this.brewText?.destroy();
        this.dayPhaseText?.destroy();
        this.startBattleButton?.destroy();
        this.waitingText?.destroy();

        // Clear arrays and maps
        this.draggableCardObjects = [];
        this.handSlotObjects = [];
        this.battlefieldSlotObjects = [];
        this.handSlots = [];
        this.battlefieldSlots = [];
        this.handCardObjects.clear();
        this.battlefieldCardObjects.clear();
   }
}