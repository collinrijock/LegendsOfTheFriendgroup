import { Scene } from "phaser";

// --- Utility Function ---
function generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// --- Interfaces ---
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

// Represents a specific instance of a card owned by the player
interface CardInstance extends CardData {
    instanceId: string; // Unique ID for this specific card instance
    currentHp: number; // Current health of this instance
}

export class Shop extends Scene {
  private cardsInShop: CardData[] = []; // Cards currently offered in the shop
  // private selectedCards: CardData[] = []; // REMOVED - Replaced by drag-to-buy
  private playerBrews: number = 10; // Starting brews for Day 1
  private brewText!: Phaser.GameObjects.Text; // Navbar text
  private confirmButton!: Phaser.GameObjects.Text; // Now just "Continue"
  private shopCardObjects: Phaser.GameObjects.Text[] = []; // Draggable shop card visuals
  // private maxSelection: number = 2; // REMOVED
  private currentDay: number = 1;

  // Hand display elements
  private handSlotObjects: Phaser.GameObjects.Rectangle[] = [];
  private handSlots: Phaser.Geom.Rectangle[] = [];
  private handCardDisplayObjects: (Phaser.GameObjects.Text | null)[] = [null, null, null, null, null]; // Visuals for cards in hand

  constructor() {
    super("Shop");
  }

  // Add init method to receive data from Battle scene (or load from registry)
  init(data: { playerBrews?: number, currentDay?: number }) {
      // Load state from registry or use defaults/passed data
      this.playerBrews = data.playerBrews === undefined ? (this.registry.get('playerBrews') || 10) : data.playerBrews;
      this.currentDay = data.currentDay || this.registry.get('currentDay') || 1;
      this.registry.set('currentDay', this.currentDay); // Ensure registry is up-to-date

      // Hand/Battlefield state is read directly from registry in create
      // Reset shop-specific arrays
      this.cardsInShop = [];
      this.shopCardObjects = [];
      this.handCardDisplayObjects = [null, null, null, null, null]; // Reset visual array
      this.handSlotObjects = [];
      this.handSlots = [];
  }

  preload() {
    // Assets for cards would be loaded in Preloader, ensure cardData is loaded
  }

  create() {
    this.scene.launch("background"); // Keep background consistent

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Get current day and health from registry
    const currentDay = this.registry.get('currentDay') || 1;
    const playerHealth = this.registry.get('playerHealth') || 50;

    // --- Navbar ---
    const navbarY = 25;
    const navbarHeight = 50;
    this.add.rectangle(centerX, navbarY, gameWidth, navbarHeight, 0x000000, 0.6); // Semi-transparent background

    // Health Display (Left)
    this.add.text(50, navbarY, `Health: ${playerHealth}`, {
        fontFamily: "Arial",
        fontSize: 20, // Slightly smaller for more info
        color: "#00ff00", // Green for health
        align: "left"
    }).setOrigin(0, 0.5); // Align left vertically centered

    // Day/Phase Display (Center)
    this.add.text(centerX, navbarY, `Day ${currentDay} - Shop Phase`, {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffffff",
        align: "center"
    }).setOrigin(0.5);

    // Brews Display (Right) - Moved to Navbar
    this.brewText = this.add.text(gameWidth - 50, navbarY, `Brews: ${this.playerBrews}`, {
        fontFamily: "Arial",
        fontSize: 20, // Slightly smaller
        color: "#ffff00", // Yellow for brews
        align: "right"
    }).setOrigin(1, 0.5); // Align right vertically centered
    // --- End Navbar ---


    // Title - Center Top (Adjust Y position below navbar)
    this.add
      .text(centerX, 80, `Shop`, { // Adjusted Y
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    // Instructions - Removed old "Select X cards" text
    /* this.add
      .text(centerX, 120, `Select ${this.maxSelection} cards`, { ... })
      .setOrigin(0.5);
    */
    this.add
      .text(centerX, 120, `Drag cards to your hand below to buy`, { // New instructions
        fontFamily: "Arial",
        fontSize: 20,
        color: "#dddddd",
        align: "center",
      })
      .setOrigin(0.5);


    // --- Hand Slots Display (Similar to Preparation scene) ---
    const handSlotY = gameHeight - 120;
    const handSlotWidth = 100;
    const handSlotHeight = 140;
    const handSlotSpacing = 15;
    const totalHandSlotsWidth = 5 * handSlotWidth + 4 * handSlotSpacing;
    const startHandSlotsX = centerX - totalHandSlotsWidth / 2 + handSlotWidth / 2;

    this.handSlots = [];
    this.handSlotObjects = [];
    const playerHandState: (CardInstance | null)[] = this.registry.get('playerHandState') || [null, null, null, null, null];

    for (let i = 0; i < 5; i++) {
        const slotX = startHandSlotsX + i * (handSlotWidth + handSlotSpacing);
        const slotRect = new Phaser.Geom.Rectangle(
            slotX - handSlotWidth / 2,
            handSlotY - handSlotHeight / 2,
            handSlotWidth,
            handSlotHeight
        );
        this.handSlots.push(slotRect);

        // Visual representation for hand slots
        const slotGraphics = this.add.rectangle(
            slotX,
            handSlotY,
            handSlotWidth,
            handSlotHeight,
            0x222222, 0.4
        ).setStrokeStyle(1, 0xaaaaaa);
        this.handSlotObjects.push(slotGraphics);

        // Display card if it exists in the persistent state
        const cardInstance = playerHandState[i];
        if (cardInstance) {
            const cardText = this.createCardText(
                cardInstance,
                slotX,
                handSlotY,
                handSlotWidth,
                handSlotHeight,
                "#444488" // Hand card color
            );
            this.handCardDisplayObjects[i] = cardText;
            // Make hand cards non-interactive in shop? Or allow selling later? For now, non-interactive.
            // cardText.setInteractive();
        }
    }
    // --- End Hand Slots Display ---


    // Load card data from cache
    const allCards: CardData[] = this.cache.json.get("cardData");

    // --- Display 4 Shop Cards (Center the card area) ---
    const totalCardAreaWidth = gameWidth * 0.8; // Use 80% of width for cards
    const cardDisplayWidth = 150; // Fixed width for card representation
    const cardSpacing = (totalCardAreaWidth - (4 * cardDisplayWidth)) / 3; // Space between 4 cards
    const startX = centerX - totalCardAreaWidth / 2 + cardDisplayWidth / 2; // Calculate starting X to center the group
    const cardY = centerY - 50; // Position cards vertically centered slightly above middle

    this.shopCardObjects = []; // Clear previous objects if scene restarts
    this.cardsInShop = []; // Clear previous shop cards

    if (!allCards || allCards.length === 0) {
        console.error("Card data not loaded or empty!");
        // Handle error, maybe display a message
        return;
    }

    for (let i = 0; i < 4; i++) {
      // Select a random card from the available pool
      const randomCard = Phaser.Utils.Array.GetRandom(allCards);
      // In a real scenario, you might want to prevent duplicates or weight rarities
      this.cardsInShop.push(randomCard);

      const cardRepresentation = this.add.text(
        startX + i * (cardDisplayWidth + cardSpacing), // Position cards with spacing
        cardY,
        `${randomCard.name}\nCost: ${randomCard.brewCost}\nAtk: ${randomCard.attack} / HP: ${randomCard.health}\nSpd: ${randomCard.speed}`, // Use random card data
        {
          fontFamily: "Arial",
          fontSize: 16, // Slightly smaller font
          color: "#ffffff",
          backgroundColor: "#333333",
          padding: { x: 10, y: 5 },
          align: "center",
          fixedWidth: cardDisplayWidth, // Use fixed width
          wordWrap: { width: cardDisplayWidth - 20 } // Adjust word wrap
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true, draggable: true }); // Make draggable

      // Store the card data with the game object for easy access in the handler
      cardRepresentation.setData("cardData", randomCard); // Use the randomly selected card
      // cardRepresentation.setData("isSelected", false); // REMOVED
      this.shopCardObjects.push(cardRepresentation);

      // REMOVE OLD CLICK HANDLER
      // cardRepresentation.on("pointerdown", () => {
      //   this.toggleCardSelection(cardRepresentation);
      // });
    }

    // --- Drag and Drop Logic for Buying ---
    this.input.on('dragstart', (pointer, gameObject: Phaser.GameObjects.Text) => {
        // Check if it's a shop card being dragged
        if (this.shopCardObjects.includes(gameObject)) {
            this.children.bringToTop(gameObject);
            gameObject.setAlpha(0.7);
            // Store original position for snap back
            gameObject.setData('startX', gameObject.x);
            gameObject.setData('startY', gameObject.y);
        }
        // Add logic here if hand cards become draggable later (e.g., for selling)
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (this.shopCardObjects.includes(gameObject)) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        }
    });

    this.input.on('dragend', (pointer, gameObject: Phaser.GameObjects.Text) => {
        if (this.shopCardObjects.includes(gameObject)) {
            gameObject.setAlpha(1.0);
            const droppedX = gameObject.x;
            const droppedY = gameObject.y;
            let bought = false;

            // Check drop on Hand Slots
            for (let i = 0; i < this.handSlots.length; i++) {
                const playerHandState: (CardInstance | null)[] = this.registry.get('playerHandState');
                // Check if slot exists and is empty, and if dropped within its bounds
                if (this.handSlots[i] && playerHandState[i] === null && Phaser.Geom.Rectangle.Contains(this.handSlots[i], droppedX, droppedY)) {
                    const cardData = gameObject.getData("cardData") as CardData;
                    if (this.playerBrews >= cardData.brewCost) {
                        // Buy the card
                        this.playerBrews -= cardData.brewCost;
                        const newCardInstance: CardInstance = {
                            ...cardData, // Copy base data
                            instanceId: generateUniqueId(),
                            currentHp: cardData.health // Start with full HP
                        };

                        // Update registry state
                        playerHandState[i] = newCardInstance;
                        this.registry.set('playerHandState', playerHandState);

                        // Update visuals
                        const slot = this.handSlots[i];
                        const newCardText = this.createCardText(
                            newCardInstance,
                            slot.centerX,
                            slot.centerY,
                            this.handSlotObjects[i].width, // Use actual slot dimensions
                            this.handSlotObjects[i].height,
                            "#444488" // Hand card color
                        );
                        this.handCardDisplayObjects[i] = newCardText; // Store visual reference

                        // Remove the shop card visual and data
                        gameObject.destroy();
                        this.shopCardObjects = this.shopCardObjects.filter(obj => obj !== gameObject);
                        // Optional: Refresh shop or replace bought card? For now, just remove.

                        bought = true;
                        this.updateUI(); // Update brew count display
                        console.log(`Bought ${cardData.name} for ${cardData.brewCost} brews. Placed in hand slot ${i}.`);
                        break; // Exit loop once placed
                    } else {
                        console.log("Not enough brews!");
                        // Snap back to original position
                        gameObject.x = gameObject.getData('startX');
                        gameObject.y = gameObject.getData('startY');
                        break; // Exit loop
                    }
                }
            }

            // If not bought (dropped outside or on full slot), snap back
            if (!bought) {
                gameObject.x = gameObject.getData('startX');
                gameObject.y = gameObject.getData('startY');
            }
        }
         // Add logic here if hand cards become draggable later
    });


    // --- Continue Button (No longer Confirm Selection) ---
    this.confirmButton = this.add.text(
        centerX,
        gameHeight - 50, // Adjusted position slightly
        "Continue", // Changed text
        {
          fontFamily: "Arial Black",
          fontSize: 40,
          color: "#00ff00", // Always enabled color
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true }); // Always interactive

    this.confirmButton.on('pointerdown', () => {
        this.confirmSelection(); // Renamed function, but logic is simpler now
    });
    this.confirmButton.on('pointerover', () => this.confirmButton.setColor('#55ff55'));
    this.confirmButton.on('pointerout', () => this.confirmButton.setColor('#00ff00'));

    // Remove initial updateUI call for button state, as it's always active now
    // this.updateUI();
    this.updateUI(); // Still needed to set initial brew text
  }

  // REMOVE toggleCardSelection method entirely
  // private toggleCardSelection(cardObject: Phaser.GameObjects.Text) { ... }

  private updateUI() {
    // Update Brews Text in Navbar
    this.brewText.setText(`Brews: ${this.playerBrews}`);

    // Confirm/Continue button state is now always active, no update needed here
  }

  // Renamed and simplified confirmSelection
  private confirmSelection() {
    console.log("Continuing to Preparation Phase...");
    // State (hand/battlefield) is already updated in the registry via drag-and-drop buys.
    // We just need to save the current brew count.
    this.registry.set('playerBrews', this.playerBrews); // Save potentially updated brew count

    this.scene.start("Preparation", {
        // No need to pass hand/battlefield, Prep will read from registry
        // Pass brews/day in case Prep needs it immediately, though registry is preferred
        playerBrews: this.playerBrews,
        currentDay: this.currentDay
    });
  }

  // Helper to create card text objects (can be reused)
  private createCardText(
      cardInstance: CardInstance,
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
}