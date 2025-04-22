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
      this.playerStateListener = player.onChange(() => {
          if (!this.scene.isActive()) return; // Guard against updates after shutdown
          this.updateNavbar();
          this.updateWaitingStatus();
      });

      // Listen to hand changes (server state dictates the board)
      // Store the listener function if needed for cleanup, though Colyseus might handle it
      player.hand.onAdd((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });
      player.hand.onRemove((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });
      player.hand.onChange((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); }); // If card instance itself changes
      this.handListener = () => { // Placeholder if specific cleanup needed, adjust based on SDK
          player?.hand?.onAdd(null);
          player?.hand?.onRemove(null);
          player?.hand?.onChange(null);
      };


      // Listen to battlefield changes
      player.battlefield.onAdd((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });
      player.battlefield.onRemove((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });
      player.battlefield.onChange((card, key) => { if (this.scene.isActive()) this.updateBoardFromState(); });
      this.battlefieldListener = () => { // Placeholder if specific cleanup needed
          player?.battlefield?.onAdd(null);
          player?.battlefield?.onRemove(null);
          player?.battlefield?.onChange(null);
      };

  } else {
      console.error("Preparation Scene: My player state not found on init.");
  }

  // Listen for phase changes
  this.phaseListener = colyseusRoom.state.listen("currentPhase", (currentPhase) => {
      if (!this.scene.isActive()) return;
      console.log(`Preparation Scene: Phase changed to ${currentPhase}`);
      this.updateDayPhaseText();
      if (currentPhase === Phase.Battle) {
          // Cleanup happens in shutdown
          this.scene.start("Battle");
      } else if (currentPhase !== Phase.Preparation) {
          console.warn(`Preparation Scene: Unexpected phase change to ${currentPhase}. Returning to Lobby.`);
          // Cleanup happens in shutdown
          this.scene.start("Lobby");
      }
      this.updateWaitingStatus();
  });

   // Listen for changes in other players' ready status
   // Use players.onChange which triggers when any player changes at a key
   colyseusRoom.state.players.onChange((changedPlayer, sessionId) => {
       // Check if the scene is still active before processing
       if (!this.scene.isActive()) return;
       if (sessionId !== myPlayerId) {
           // We only care if their 'isReady' changed, but onChange triggers for any change.
           // Re-evaluating waiting status is generally safe.
           this.updateWaitingStatus();
       }
   });
   // Also handle players joining/leaving if necessary
   colyseusRoom.state.players.onAdd((addedPlayer, sessionId) => {
       if (this.scene.isActive()) this.updateWaitingStatus();
   });
   colyseusRoom.state.players.onRemove((removedPlayer, sessionId) => {
       if (this.scene.isActive()) this.updateWaitingStatus();
   });
}

cleanupListeners() {
  console.log("Preparation Scene: Cleaning up listeners.");
   // No need to check room/sessionId here, listeners should handle null checks or be absent

   // Remove specific listeners using stored unsubscribe functions or Colyseus methods
   this.playerStateListener?.(); // Assumes onChange returns unsubscribe function

   // Remove MapSchema listeners (onAdd, onRemove, onChange)
   // Call stored cleanup functions or use Colyseus methods if available
   this.handListener?.();
   this.battlefieldListener?.();

   // Remove phase listener
   // Use stopListening if listen returns void, or remove specific listener if it returns one
   colyseusRoom?.state.stopListening("currentPhase"); // General stopListening might be okay if only one listener

   // Remove general players map listeners - Colyseus 0.15+ uses removeAllListeners() or specific removal
   // For older versions, setting callbacks to null might work, but check SDK docs
   colyseusRoom?.state.players.onAdd(null);
   colyseusRoom?.state.players.onRemove(null);
   colyseusRoom?.state.players.onChange(null);


   // Reset listener references
   this.playerStateListener = null;
   this.handListener = null;
   this.battlefieldListener = null;
   this.phaseListener = null; // This might not be an unsubscribe function

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
  if (!colyseusRoom || !colyseusRoom.sessionId || !this.scene.isActive()) return; // Add scene active check
  const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
  if (!myPlayerState) return;

  // Clear existing draggable objects first
  this.draggableCardObjects.forEach(obj => obj.destroy());
  this.draggableCardObjects = [];
  this.handCardObjects.clear();
  this.battlefieldCardObjects.clear();

  // Populate Hand Visuals
  myPlayerState.hand.forEach((cardInstanceSchema, slotIndex) => {
      const slotNumber = parseInt(slotIndex, 10);
      // Add check for cardInstanceSchema existence
      if (isNaN(slotNumber) || slotNumber < 0 || slotNumber >= this.handSlots.length || !cardInstanceSchema) return;
      const slot = this.handSlots[slotNumber];
      const cardText = this.createCardText(cardInstanceSchema, slot.centerX, slot.centerY, this.handSlotObjects[slotNumber].width, this.handSlotObjects[slotNumber].height, "#444488");
      this.handCardObjects.set(slotIndex, cardText);
      this.setupDraggableCard(cardText, cardInstanceSchema, 'hand', slotIndex);
  });

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
    if (!this.startBattleButton) return; // Guard if called too early

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
        if (!this.waitingText.visible) {
             this.startBattleButton.setColor("#888888");
        }
        this.startBattleButton.disableInteractive();
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

      return this.add.text(
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
  }

  // Helper to setup draggable card visuals
  private setupDraggableCard(
      cardText: Phaser.GameObjects.Text,
      cardInstance: CardInstanceSchema,
      initialLocation: 'hand' | 'battlefield',
      initialIndex: string // Use string index for map keys
  ) {
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