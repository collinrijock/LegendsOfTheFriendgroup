import { Scene } from "phaser";

// --- Interfaces --- (Ensure consistency)
interface CardData {
  id: string;
  name: string;
  attack: number;
  speed: number;
  health: number;
  brewCost: number;
  description: string;
  isLegend: boolean;
}

interface CardInstance extends CardData {
    instanceId: string;
    currentHp: number;
}

// --- Utility Function --- (If not globally available)
function generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}


export class Preparation extends Scene {
  // Remove handCardsData - will load directly from registry
  // private handCardsData: CardData[] = [];

  // Visual representations
  private handSlotObjects: Phaser.GameObjects.Rectangle[] = [];
  private battlefieldSlotObjects: Phaser.GameObjects.Rectangle[] = [];

  // Geometry for drop zones
  private handSlots: Phaser.Geom.Rectangle[] = [];
  private battlefieldSlots: Phaser.Geom.Rectangle[] = [];

  // Track the VISUAL card objects currently in each slot
  private handCardObjects: (Phaser.GameObjects.Text | null)[] = [];
  private battlefieldCardObjects: (Phaser.GameObjects.Text | null)[] = [];

  // All draggable card visuals currently in the scene
  private draggableCardObjects: Phaser.GameObjects.Text[] = [];

  private startBattleButton!: Phaser.GameObjects.Text;
  private currentDay: number = 1;
  private playerBrews: number = 0;

  constructor() {
    super("Preparation");
  }

  // Init loads brews and day, state is loaded from registry in create
  init(data: { playerBrews?: number, currentDay?: number }) {
    // this.handCardsData = data.hand || []; // REMOVED
    this.currentDay = data.currentDay || this.registry.get('currentDay') || 1;
    this.playerBrews = data.playerBrews || this.registry.get('playerBrews') || 0; // Load brews
    this.registry.set('currentDay', this.currentDay); // Ensure registry is up-to-date

    // Reset visual arrays
    this.battlefieldCardObjects = [null, null, null, null, null];
    this.handCardObjects = [null, null, null, null, null];
    this.draggableCardObjects = [];
    this.battlefieldSlotObjects = [];
    this.handSlotObjects = [];
  }

  create() {
    this.scene.launch("background"); // Keep background consistent

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameHeight = this.cameras.main.height;
    const gameWidth = this.cameras.main.width;

    // Get current day and health from registry (or passed data)
    const currentDay = this.registry.get('currentDay') || 1;
    const playerHealth = this.registry.get('playerHealth') || 50;
    // Brews are passed via init data
    const playerBrews = this.playerBrews;

    // --- Navbar ---
    const navbarY = 25;
    const navbarHeight = 50;
    
    this.add.rectangle(centerX, navbarY, gameWidth, navbarHeight, 0x000000, 0.6); // Semi-transparent background

     // Health Display (Left)
     this.add.text(50, navbarY, `Health: ${playerHealth}`, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#00ff00",
        align: "left"
    }).setOrigin(0, 0.5);

    // Day/Phase Display (Center)
    this.add.text(centerX, navbarY, `Day ${currentDay} - Preparation Phase`, {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffffff",
        align: "center"
    }).setOrigin(0.5);

    // Brews Display (Right)
    this.add.text(gameWidth - 50, navbarY, `Brews: ${playerBrews}`, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#ffff00",
        align: "right"
    }).setOrigin(1, 0.5);
    // --- End Navbar ---

    // Title (Adjust Y position below navbar)
    this.add
      .text(centerX, 80, "Preparation Phase", { // Adjusted Y
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    // --- Load Persistent State ---
    const playerHandState: (CardInstance | null)[] = this.registry.get('playerHandState') || [null, null, null, null, null];
    const playerBattlefieldState: (CardInstance | null)[] = this.registry.get('playerBattlefieldState') || [null, null, null, null, null];

    // --- Battlefield Slots ---
    // (Keep existing code for creating battlefield slot visuals and geometry)
    const slotWidth = 120;
    const slotHeight = 160;
    const slotSpacing = 20;
    const totalSlotsWidth = 5 * slotWidth + 4 * slotSpacing;
    const startSlotsX = centerX - totalSlotsWidth / 2 + slotWidth / 2;
    const slotsY = centerY - 80;

    this.battlefieldSlots = [];
    this.battlefieldSlotObjects = [];
    for (let i = 0; i < 5; i++) {
      const slotX = startSlotsX + i * (slotWidth + slotSpacing);
      const slotRect = new Phaser.Geom.Rectangle(
        slotX - slotWidth / 2,
        slotsY - slotHeight / 2,
        slotWidth,
        slotHeight
      );
      this.battlefieldSlots.push(slotRect);
      const slotGraphics = this.add.rectangle(
        slotX,
        slotsY,
        slotWidth,
        slotHeight,
        0x000000, // Black background
        0.3 // Semi-transparent
      ).setStrokeStyle(2, 0xffffff); // White border
      this.battlefieldSlotObjects.push(slotGraphics);

      // Create card visuals from persistent state
      const cardInstance = playerBattlefieldState[i];
      if (cardInstance) {
          const cardText = this.createCardText(cardInstance, slotX, slotsY, slotWidth, slotHeight, "#663333"); // Battlefield color
          this.battlefieldCardObjects[i] = cardText;
          this.setupDraggableCard(cardText, cardInstance, 'battlefield', i);
      }
    }


    // --- Hand Slots ---
    // (Keep existing code for creating hand slot visuals and geometry)
    const handSlotY = gameHeight - 120;
    const handSlotWidth = 100;
    const handSlotHeight = 140;
    const handSlotSpacing = 15;
    const totalHandSlotsWidth = 5 * handSlotWidth + 4 * handSlotSpacing;
    const startHandSlotsX = centerX - totalHandSlotsWidth / 2 + handSlotWidth / 2;

    this.handSlots = [];
    this.handSlotObjects = [];
    for (let i = 0; i < 5; i++) {
        const slotX = startHandSlotsX + i * (handSlotWidth + handSlotSpacing);
        const slotRect = new Phaser.Geom.Rectangle(
            slotX - handSlotWidth / 2,
            handSlotY - handSlotHeight / 2,
            handSlotWidth,
            handSlotHeight
        );
        this.handSlots.push(slotRect);
        const slotGraphics = this.add.rectangle(
            slotX,
            handSlotY,
            handSlotWidth,
            handSlotHeight,
            0x222222, // Darker grey background for hand slots
            0.4
        ).setStrokeStyle(1, 0xaaaaaa); // Lighter grey border
        this.handSlotObjects.push(slotGraphics);

        // Create card visuals from persistent state
        const cardInstance = playerHandState[i];
        if (cardInstance) {
            const cardText = this.createCardText(cardInstance, slotX, handSlotY, handSlotWidth, handSlotHeight, "#444488"); // Hand color
            this.handCardObjects[i] = cardText;
            this.setupDraggableCard(cardText, cardInstance, 'hand', i);
        }
    }


    // --- Create Draggable Card Objects from Hand Data --- // REMOVED THIS SECTION


    // --- Drag and Drop Logic --- (Needs slight adjustment for CardInstance)
    this.input.on('dragstart', (pointer, gameObject: Phaser.GameObjects.Text) => {
        if (!gameObject.getData('cardInstance')) return; // Ignore non-card drags

        this.children.bringToTop(gameObject);
        gameObject.setAlpha(0.7);

        // Clear the card's current visual slot array
        const currentLocation = gameObject.getData('location');
        const currentSlotIndex = gameObject.getData('currentSlotIndex');
        if (currentLocation === 'battlefield' && currentSlotIndex !== -1) {
            this.battlefieldCardObjects[currentSlotIndex] = null;
        } else if (currentLocation === 'hand' && currentSlotIndex !== -1) {
            this.handCardObjects[currentSlotIndex] = null;
        }
        // Don't modify registry state here, only visual representation
        gameObject.setData('location', null);
        gameObject.setData('currentSlotIndex', -1);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (!gameObject.getData('cardInstance')) return;
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject: Phaser.GameObjects.Text) => {
        if (!gameObject.getData('cardInstance')) return; // Ignore non-card drags

        gameObject.setAlpha(1.0);
        const droppedX = gameObject.x;
        const droppedY = gameObject.y;
        let placed = false;

        // Check drop on Battlefield Slots
        for (let i = 0; i < this.battlefieldSlots.length; i++) {
            if (Phaser.Geom.Rectangle.Contains(this.battlefieldSlots[i], droppedX, droppedY)) {
                if (this.battlefieldCardObjects[i] === null) { // Check if visual slot is empty
                    gameObject.x = this.battlefieldSlots[i].centerX;
                    gameObject.y = this.battlefieldSlots[i].centerY;
                    this.battlefieldCardObjects[i] = gameObject; // Place visual object
                    gameObject.setData('location', 'battlefield');
                    gameObject.setData('currentSlotIndex', i);
                    placed = true;
                    break;
                }
            }
        }

        // Check drop on Hand Slots
        if (!placed) {
            for (let i = 0; i < this.handSlots.length; i++) {
                if (Phaser.Geom.Rectangle.Contains(this.handSlots[i], droppedX, droppedY)) {
                    if (this.handCardObjects[i] === null) { // Check if visual slot is empty
                        gameObject.x = this.handSlots[i].centerX;
                        gameObject.y = this.handSlots[i].centerY;
                        this.handCardObjects[i] = gameObject; // Place visual object
                        gameObject.setData('location', 'hand');
                        gameObject.setData('currentSlotIndex', i);
                        placed = true;
                        break;
                    }
                }
            }
        }

        // If not placed on any valid empty slot, return to the *first available hand slot* visually
        if (!placed) {
             const targetHandSlotIndex = this.handCardObjects.findIndex(slot => slot === null);
             if(targetHandSlotIndex !== -1) {
                 const slot = this.handSlots[targetHandSlotIndex];
                 gameObject.x = slot.centerX;
                 gameObject.y = slot.centerY;
                 this.handCardObjects[targetHandSlotIndex] = gameObject; // Place visual object
                 gameObject.setData('location', 'hand');
                 gameObject.setData('currentSlotIndex', targetHandSlotIndex);
             } else {
                 // If hand is full and drop fails, destroy? Return to original spot?
                 // For now, let's try returning to original spot if possible
                 // This requires storing original slot/location on dragstart
                 console.error("No available hand slot to return card to!");
                 // Fallback: destroy or place off-screen
                 gameObject.destroy();
                 this.draggableCardObjects = this.draggableCardObjects.filter(obj => obj !== gameObject);
             }
        }
         this.updateStartButtonState(); // Check if ready to start
    });

    // --- Start Battle Button ---
    // (Keep existing button creation code)
    this.startBattleButton = this.add.text(
        centerX,
        gameHeight - 50, // Position near bottom, below hand
        "Start Battle",
        {
          fontFamily: "Arial Black",
          fontSize: 40,
          color: "#888888", // Start disabled
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
        }
      )
      .setOrigin(0.5);
      // Initially not interactive, updateStartButtonState handles this

    this.updateStartButtonState(); // Set initial state
  }

  // Helper to create card text objects
  private createCardText(
      cardInstance: CardInstance,
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
          }
      ).setOrigin(0.5);
  }

  // Helper to setup draggable card visuals
  private setupDraggableCard(
      cardText: Phaser.GameObjects.Text,
      cardInstance: CardInstance,
      initialLocation: 'hand' | 'battlefield',
      initialIndex: number
  ) {
      cardText.setData("cardInstance", cardInstance); // Store the full instance data
      cardText.setData("location", initialLocation);
      cardText.setData("currentSlotIndex", initialIndex);
      cardText.setInteractive({ useHandCursor: true });
      this.input.setDraggable(cardText);
      this.draggableCardObjects.push(cardText);
  }


  updateStartButtonState() {
    // Enable button only if at least one card is placed on the BATTLEFIELD visually
    const canStart = this.battlefieldCardObjects.some(card => card !== null);

    if (canStart) {
        this.startBattleButton.setColor("#00ff00");
        this.startBattleButton.setInteractive({ useHandCursor: true });
        this.startBattleButton.off('pointerdown'); // Remove previous listener
        this.startBattleButton.once('pointerdown', this.startBattle, this);
        this.startBattleButton.on('pointerover', () => this.startBattleButton.setColor('#55ff55'));
        this.startBattleButton.on('pointerout', () => this.startBattleButton.setColor('#00ff00'));
    } else {
        this.startBattleButton.setColor("#888888");
        this.startBattleButton.disableInteractive();
        this.startBattleButton.off('pointerover');
        this.startBattleButton.off('pointerout');
    }
  }

  startBattle() {
    console.log("Starting Battle!");

    // --- Update Registry State based on final visual placement ---
    const finalHandState: (CardInstance | null)[] = [null, null, null, null, null];
    const finalBattlefieldState: (CardInstance | null)[] = [null, null, null, null, null];

    this.handCardObjects.forEach((cardObject, index) => {
        if (cardObject) {
            finalHandState[index] = cardObject.getData('cardInstance') as CardInstance;
        }
    });

    this.battlefieldCardObjects.forEach((cardObject, index) => {
        if (cardObject) {
            finalBattlefieldState[index] = cardObject.getData('cardInstance') as CardInstance;
        }
    });

    this.registry.set('playerHandState', finalHandState);
    this.registry.set('playerBattlefieldState', finalBattlefieldState);
    this.registry.set('playerBrews', this.playerBrews); // Save brews just in case

    console.log("Final Hand State:", finalHandState.map(c => c?.name));
    console.log("Final Battlefield State:", finalBattlefieldState.map(c => c?.name));

    // Transition to the Battle Scene
    console.log("Transitioning to Battle Scene...");
    this.scene.start("Battle", {
        // Battle scene will read state from registry
        // Pass brews/day if needed immediately by Battle init, though registry is preferred
        currentDay: this.currentDay,
        playerBrews: this.playerBrews
    });
  }
}