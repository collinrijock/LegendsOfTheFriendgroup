import { Scene } from "phaser";

// --- Interfaces --- (Ensure consistency)
interface CardData {
  id: string;
  name: string;
  attack: number;
  speed: number; // Lower is faster (represents attack cooldown in seconds)
  health: number; // Max health
  brewCost: number;
  description: string;
  isLegend: boolean;
}

interface CardInstance extends CardData {
    instanceId: string; // Unique identifier for this specific instance of the card
    currentHp: number; // Current health, can be less than max health
}

// Helper class to manage individual card state during battle
class BattleCard {
  gameObject: Phaser.GameObjects.Text;
  // data: CardData; // Use cardInstance instead
  cardInstance: CardInstance; // Store the full instance data
  // currentHp: number; // Now part of cardInstance
  attackTimer: number; // Counts down to next attack
  isAlive: boolean = true;
  isPlayerCard: boolean;
  hpText: Phaser.GameObjects.Text; // Reference to the HP display text
  attackBarBg: Phaser.GameObjects.Graphics | null = null; // Background for attack timer bar
  attackBarFill: Phaser.GameObjects.Graphics | null = null; // Fill for attack timer bar
  attackCooldown: number; // Store the full cooldown time in ms

  // constructor(scene: Scene, x: number, y: number, cardData: CardData, isPlayer: boolean) { // OLD
  constructor(scene: Scene, x: number, y: number, instanceData: CardInstance, isPlayer: boolean) {
    // this.data = cardData; // OLD
    this.cardInstance = instanceData; // Store the instance data
    // this.currentHp = cardData.health; // OLD - Use instanceData.currentHp
    // Speed is now seconds until attack. Convert to milliseconds.
    this.attackCooldown = (instanceData.speed || 5) * 1000; // Default to 5 seconds if speed is 0 or undefined
    this.attackTimer = this.attackCooldown; // Start ready to attack
    // this.attackTimer = Phaser.Math.Between(500, this.attackCooldown); // Optional: Random initial delay

    this.isPlayerCard = isPlayer;

    const cardWidth = 100;
    const cardHeight = 140;
    const barHeight = 10; // Height of the attack timer bar
    // const totalHeight = cardHeight + barHeight + 5 + 20; // Card + HP Text + Bar + Spacing
    const baseY = y; // Keep original y as the bottom reference

    const bgColor = isPlayer ? "#444488" : "#884444"; // Blue for player, Red for AI

    // Main card text (position adjusted for HP and bar)
    this.gameObject = scene.add.text(
      x,
      baseY - barHeight - 5 - 20, // Position above HP text and bar
      `${instanceData.name}\nAtk: ${instanceData.attack}\nSpd: ${instanceData.speed}s`, // Use instance data
      {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#ffffff",
        backgroundColor: bgColor,
        padding: { x: 5, y: 3 },
        align: "center",
        fixedWidth: cardWidth,
        fixedHeight: cardHeight - 20, // Leave space for HP
        wordWrap: { width: cardWidth - 10 }
      }
    ).setOrigin(0.5, 1); // Origin at bottom center

    // HP text - Use currentHp from instance (position adjusted for bar)
    this.hpText = scene.add.text(
        x,
        baseY - barHeight - 5, // Position slightly below the main text, above bar
        `HP: ${instanceData.currentHp}/${instanceData.health}`, // Use currentHp and max health
        {
            fontFamily: "Arial",
            fontSize: 14,
            color: "#00ff00", // Green for health (will be updated)
            backgroundColor: "#000000",
            padding: { x: 3, y: 1 },
            align: "center",
            fixedWidth: cardWidth,
        }
    ).setOrigin(0.5, 1); // Origin at bottom center
    // Set initial HP text color
    this.updateHpDisplay();


    // Attack Timer Bar Background
    this.attackBarBg = scene.add.graphics();
    this.attackBarBg.fillStyle(0x000000, 0.5); // Dark background
    this.attackBarBg.fillRect(x - cardWidth / 2, baseY - barHeight, cardWidth, barHeight);

    // Attack Timer Bar Fill
    this.attackBarFill = scene.add.graphics();
    this.attackBarFill.fillStyle(0xffff00, 1); // Yellow fill
    // Initial fill state will be set in update
    this.attackBarFill.fillRect(x - cardWidth / 2, baseY - barHeight, cardWidth, barHeight); // Start full

    this.gameObject.setData("battleCard", this); // Link the GameObject back to the BattleCard instance
  }

  takeDamage(damage: number, scene: Scene) {
    if (!this.isAlive) return;

    // Modify currentHp within the cardInstance
    this.cardInstance.currentHp -= damage;
    this.showDamageNumber(damage, scene);
    this.updateHpDisplay(); // Update text and color

    if (this.cardInstance.currentHp <= 0) {
        this.die(scene);
    }
  }

  // NEW: Separate method to update HP text and color
  updateHpDisplay() {
      if (!this.hpText) return; // Guard against potential race conditions during destroy

      const hp = this.cardInstance.currentHp;
      const maxHp = this.cardInstance.health;

      if (!this.isAlive || hp <= 0) {
          this.hpText.setText("HP: 0");
          this.hpText.setColor("#ff0000"); // Red when dead
          return;
      }

      const hpPercent = hp / maxHp;
      this.hpText.setText(`HP: ${hp}/${maxHp}`);

      if (hpPercent < 0.3) {
          this.hpText.setColor("#ff0000"); // Red when low health
      } else if (hpPercent < 0.6) {
          this.hpText.setColor("#ffff00"); // Yellow when medium health
      } else {
          this.hpText.setColor("#00ff00"); // Green when high health
      }
  }


  showDamageNumber(damage: number, scene: Scene) {
    const damageText = scene.add.text(
        this.gameObject.x + Phaser.Math.Between(-10, 10), // Random horizontal offset
        this.gameObject.y - this.gameObject.displayHeight - 10, // Above the card
        `-${damage}`,
        {
            fontFamily: "Arial Black",
            fontSize: 24,
            color: "#ff0000", // Red for damage
            stroke: "#000000",
            strokeThickness: 4,
        }
    ).setOrigin(0.5);

    // Animate the damage text: float up and fade out
    scene.tweens.add({
        targets: damageText,
        y: damageText.y - 50, // Float up
        alpha: 0, // Fade out
        duration: 1000, // 1 second
        ease: 'Power1',
        onComplete: () => {
            damageText.destroy(); // Remove text after animation
        }
    });
  }


  die(scene: Scene) {
    if (!this.isAlive) return; // Prevent dying multiple times

    console.log(`${this.cardInstance.name} (ID: ${this.cardInstance.instanceId}) died!`); // Log instance ID
    this.isAlive = false;
    this.cardInstance.currentHp = 0; // Ensure HP is 0
    this.updateHpDisplay(); // Update HP text to 0 and red
    this.gameObject.setTint(0x888888);
    // this.hpText.setTint(0x888888); // Color change handles this
    if (this.attackBarBg) {
        this.attackBarBg.destroy();
        this.attackBarBg = null;
    }
    if (this.attackBarFill) {
        this.attackBarFill.destroy();
        this.attackBarFill = null;
    }
    // Optional: Add a small delay before making it completely inactive or removing
  }

  update(delta: number, targetCards: BattleCard[], scene: Scene) {
    if (!this.isAlive || !this.attackBarFill) return; // Stop if dead or bars destroyed

    this.attackTimer -= delta;

    // Update attack bar fill
    const progress = Math.max(0, this.attackTimer) / this.attackCooldown; // Ensure progress doesn't go negative visually
    this.attackBarFill.clear();
    this.attackBarFill.fillStyle(0xffff00, 1);
    // Draw from right to left as timer decreases
    const fillWidth = this.gameObject.width * (1 - progress);
    this.attackBarFill.fillRect(
        this.gameObject.x + this.gameObject.width / 2 - fillWidth, // Start drawing from the right edge
        this.hpText.y + 5, // Position below HP text
        fillWidth,
        10 // barHeight
    );


    if (this.attackTimer <= 0) {
      // Find a living target
      const livingTargets = targetCards.filter(card => card.isAlive);
      if (livingTargets.length > 0) {
        const target = Phaser.Utils.Array.GetRandom(livingTargets);
        console.log(`${this.cardInstance.name} attacks ${target.cardInstance.name} for ${this.cardInstance.attack} damage`);
        target.takeDamage(this.cardInstance.attack, scene);

         // Add a simple attack visual (e.g., quick scale tween)
         scene.tweens.add({
            targets: this.gameObject,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true, // Scale back down
            ease: 'Sine.easeInOut'
        });

        // --- START: Add Attack Line Visual ---
        const attackerPos = this.gameObject.getCenter();
        const targetPos = target.gameObject.getCenter();

        if (attackerPos && targetPos) {
            const attackLine = scene.add.line(
                0, 0, // Position doesn't matter as we use setTo
                attackerPos.x, attackerPos.y,
                targetPos.x, targetPos.y,
                0xffffff, // White color for the line
                0.8 // Alpha transparency
            ).setOrigin(0, 0).setLineWidth(2); // Set line width

            // Destroy the line after a short delay
            scene.time.delayedCall(250, () => {
                attackLine.destroy();
            });
        }
        // --- END: Add Attack Line Visual ---


      } else {
        // No living targets left
        // console.log(`${this.cardInstance.name} has no targets left.`); // Less console spam
      }

      // Reset timer based on speed (now directly seconds * 1000)
      this.attackTimer = this.attackCooldown;
    }
  }
}


export class Battle extends Scene {
  private playerBoardCards: (BattleCard | null)[] = []; // Renamed for clarity
  private aiBoardCards: (BattleCard | null)[] = []; // Renamed for clarity
  private handCardDisplayObjects: (Phaser.GameObjects.Text | null)[] = []; // Visuals for hand cards

  private playerBrewsEarned: number = 0;
  private battleOver: boolean = false;
  private resultText!: Phaser.GameObjects.Text;
  private continueButton!: Phaser.GameObjects.Text;
  private currentDay: number = 1;
  private playerBrewsAtStart: number = 0; // Track brews at start for calculation
  private playerHealthText!: Phaser.GameObjects.Text; // For updating health display
  private playerBrewsText!: Phaser.GameObjects.Text; // For updating brew display
  private aiHealthText!: Phaser.GameObjects.Text; // For updating AI health display

  constructor() {
    super("Battle");
  }

  // init(data: { battlefieldState: (CardData | null)[], currentDay?: number, playerBrews?: number }) { // OLD
  init(data: { currentDay?: number, playerBrews?: number }) { // Reads state from registry now
    this.playerBoardCards = []; // Reset boards
    this.aiBoardCards = [];
    this.handCardDisplayObjects = [null, null, null, null, null]; // Reset hand visuals
    this.playerBrewsEarned = 0;
    this.battleOver = false;
    this.currentDay = data.currentDay || this.registry.get('currentDay') || 1;
    // Use registry brews as the primary source if not passed explicitly
    this.playerBrewsAtStart = data.playerBrews ?? this.registry.get('playerBrews') ?? 0;
    this.registry.set('currentDay', this.currentDay);

    // --- Load State from Registry ---
    const playerHandState: (CardInstance | null)[] = this.registry.get('playerHandState') || [null, null, null, null, null];
    const playerBattlefieldState: (CardInstance | null)[] = this.registry.get('playerBattlefieldState') || [null, null, null, null, null];

    // --- Setup Player Board ---
    const playerSlotWidth = 120;
    const playerSlotSpacing = 20;
    const totalPlayerSlotsWidth = 5 * playerSlotWidth + 4 * playerSlotSpacing;
    const startPlayerSlotsX = this.cameras.main.centerX - totalPlayerSlotsWidth / 2 + playerSlotWidth / 2;
    const playerSlotsY = this.cameras.main.height - 250; // Move player board slightly up

    playerBattlefieldState.forEach((cardInstance, index) => {
      if (cardInstance) {
        const slotX = startPlayerSlotsX + index * (playerSlotWidth + playerSlotSpacing);
        // Create BattleCard using CardInstance
        this.playerBoardCards[index] = new BattleCard(this, slotX, playerSlotsY, cardInstance, true);
      } else {
        this.playerBoardCards[index] = null;
      }
    });

    // --- Setup AI Board (Test Mode) ---
    const aiSlotWidth = 120;
    const aiSlotSpacing = 20;
    const totalAiSlotsWidth = 5 * aiSlotWidth + 4 * aiSlotSpacing; // Use 5 slots for positioning
    const startAiSlotsX = this.cameras.main.centerX - totalAiSlotsWidth / 2 + aiSlotWidth / 2;
    const aiSlotsY = 200; // AI slots upper half

    const allCards: CardData[] = this.cache.json.get("cardData");
    if (!allCards || allCards.length === 0) {
        console.error("Card data not loaded or empty! Cannot setup AI.");
        return; // Exit if no cards are available
    }

    // Determine number of AI cards (1 to 4) - CHANGED FROM 1-5
    const numAiCards = Phaser.Math.Between(1, 4);
    const availableSlots = [0, 1, 2, 3, 4]; // Indices of AI slots
    Phaser.Utils.Array.Shuffle(availableSlots); // Randomize slot order

    this.aiBoardCards = [null, null, null, null, null]; // Initialize AI board with nulls

    console.log(`Setting up AI with ${numAiCards} cards.`); // Log updated range implicitly

    for (let i = 0; i < numAiCards; i++) {
        const slotIndex = availableSlots[i]; // Get a random, unique slot index
        const aiCardData = Phaser.Utils.Array.GetRandom(allCards); // Select a random card definition

        if (aiCardData && slotIndex !== undefined) {
            const slotX = startAiSlotsX + slotIndex * (aiSlotWidth + aiSlotSpacing);
            // Create a CardInstance for the AI card
            const aiCardInstance: CardInstance = {
                ...aiCardData, // Copy base data
                instanceId: `ai_${aiCardData.id}_${Date.now()}_${slotIndex}`, // Simple unique ID for AI instance
                currentHp: aiCardData.health // Start at full health
            };
            this.aiBoardCards[slotIndex] = new BattleCard(this, slotX, aiSlotsY, aiCardInstance, false);
            console.log(`AI placed ${aiCardData.name} in slot ${slotIndex}`);
        } else {
            console.error("Failed to get random card data or slot index for AI setup.");
        }
    }

     // --- Display Player Hand (Read-Only) ---
     const handSlotY = this.cameras.main.height - 80; // Position hand display lower in battle
     const handSlotWidth = 80; // Smaller display for hand in battle
     const handSlotHeight = 100; // Adjusted height
     const handSlotSpacing = 10;
     const totalHandSlotsWidth = 5 * handSlotWidth + 4 * handSlotSpacing;
     const startHandSlotsX = this.cameras.main.centerX - totalHandSlotsWidth / 2 + handSlotWidth / 2;

     for (let i = 0; i < 5; i++) {
         const cardInstance = playerHandState[i];
         const slotX = startHandSlotsX + i * (handSlotWidth + handSlotSpacing);

         // Add a background/placeholder for the slot
         this.add.rectangle(slotX, handSlotY, handSlotWidth, handSlotHeight, 0x000000, 0.3).setOrigin(0.5);

         if (cardInstance) {
             const cardText = this.createHandCardText( // Use helper for hand display
                 cardInstance,
                 slotX,
                 handSlotY,
                 handSlotWidth,
                 handSlotHeight
             );
             this.handCardDisplayObjects[i] = cardText;
             // Make non-interactive during battle
         } else {
             this.handCardDisplayObjects[i] = null; // Ensure slot is marked as empty
         }
     }
  }

  create() {
    this.scene.launch("background");

    const centerX = this.cameras.main.centerX;
    const gameHeight = this.cameras.main.height;

    // Get current day, health, and starting brews from registry/init
    const currentDay = this.currentDay;
    const playerHealth = this.registry.get('playerHealth') || 50;
    const aiHealth = this.registry.get('aiHealth') || 50; // Get AI health
    const playerBrews = this.playerBrewsAtStart; // Show brews at start of battle

    // --- Navbar ---
    const navbarY = 25;
    const navbarHeight = 50;
    this.add.rectangle(centerX, navbarY, this.cameras.main.width, navbarHeight, 0x000000, 0.6); // Semi-transparent background

    // Player Health Display (Left) - Store reference to update later
    this.playerHealthText = this.add.text(50, navbarY, `Player HP: ${playerHealth}`, {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#00ff00",
        align: "left"
    }).setOrigin(0, 0.5);

    // AI Health Display (Left-Center) - Store reference
    this.aiHealthText = this.add.text(250, navbarY, `Enemy HP: ${aiHealth}`, {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#ff0000", // Red for enemy health
        align: "left"
    }).setOrigin(0, 0.5);


    // Day/Phase Display (Center)


    // Brews Display (Right) - Store reference to update later
    this.playerBrewsText = this.add.text(this.cameras.main.width - 50, navbarY, `Brews: ${playerBrews}`, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#ffff00",
        align: "right"
    }).setOrigin(1, 0.5);
    // --- End Navbar ---

    // Title (Adjust Y position below navbar)
  

    // Result Text (initially hidden)
    this.resultText = this.add.text(centerX, this.cameras.main.centerY, "", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
    }).setOrigin(0.5).setAlpha(0); // Start hidden

    // Continue Button (initially hidden)
    this.continueButton = this.add.text(centerX, gameHeight - 150, "Continue to Shop", { // Adjusted Y slightly
        fontFamily: "Arial Black",
        fontSize: 40,
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
    }).setOrigin(0.5).setAlpha(0); // Start hidden and non-interactive

    // Button interaction logic is now fully handled in endBattle
  }

  // Helper to create read-only hand card visuals in Battle
  private createHandCardText(
      cardInstance: CardInstance,
      x: number, y: number,
      width: number, height: number
  ): Phaser.GameObjects.Text {
      // Show current/max HP only if damaged, otherwise just max HP
      const hpDisplay = cardInstance.currentHp < cardInstance.health
          ? `${cardInstance.currentHp}/${cardInstance.health}`
          : `${cardInstance.health}`;

      return this.add.text(
          x, y,
          `${cardInstance.name}\nHP: ${hpDisplay}`, // Simplified display for hand
          {
              fontFamily: "Arial",
              fontSize: 11, // Smaller font for hand display
              color: "#cccccc", // Dimmed color
              backgroundColor: "#222244", // Darker background for hand cards
              padding: { x: 3, y: 2 },
              align: "center",
              fixedWidth: width,
              fixedHeight: height,
              wordWrap: { width: width - 6 }
          }
      ).setOrigin(0.5);
  }


  update(time: number, delta: number) {
    if (this.battleOver) return; // Stop updates if battle is finished

    // Use renamed arrays and filter out nulls/dead cards
    const activePlayerCards = this.playerBoardCards.filter(card => card && card.isAlive) as BattleCard[];
    const activeAiCards = this.aiBoardCards.filter(card => card && card.isAlive) as BattleCard[];

    // Update Player Cards
    activePlayerCards.forEach(card => {
      card.update(delta, activeAiCards, this);
    });

    // Update AI Cards
    activeAiCards.forEach(card => {
      card.update(delta, activePlayerCards, this);
    });

    // Check for end conditions using renamed arrays
    // Player lost if they started with cards but have no active cards left
    const playerHadCards = this.playerBoardCards.some(c => c !== null);
    const playerLost = playerHadCards && activePlayerCards.length === 0;
    // AI lost if they started with cards but have no active cards left
    const aiHadCards = this.aiBoardCards.some(c => c !== null);
    const aiLost = aiHadCards && activeAiCards.length === 0;

    if (playerLost || aiLost) {
      this.endBattle(playerLost);
    }
  }

  endBattle(playerLost: boolean) {
    if (this.battleOver) return; // Ensure endBattle only runs once
    this.battleOver = true;
    console.log("Battle Over!");

    // --- Calculate Brews Earned ---
    const initialAiCount = this.aiBoardCards.filter(c => c !== null).length;
    const survivingAiBoardCards = this.aiBoardCards.filter(card => card && card.isAlive) as BattleCard[];
    const remainingAiCount = survivingAiBoardCards.length;
    this.playerBrewsEarned = initialAiCount - remainingAiCount;

    // --- Face Damage Calculation ---
    let playerHealth = this.registry.get('playerHealth') || 0;
    let aiHealth = this.registry.get('aiHealth') || 0;
    let faceDamageDealt = 0;
    let faceDamageTaken = 0;
    let gameOver = false;
    let finalResultMessage = ""; // For game over messages

    const survivingPlayerBoardCards = this.playerBoardCards.filter(card => card && card.isAlive) as BattleCard[];

    if (playerLost) {
      // AI wins battle phase, surviving AI cards deal face damage
      faceDamageTaken = survivingAiBoardCards.reduce((sum, card) => sum + card.cardInstance.attack, 0);
      playerHealth -= faceDamageTaken;
      console.log(`Player takes ${faceDamageTaken} face damage. Remaining HP: ${playerHealth}`);
      finalResultMessage = "Defeat!"; // Base result if not game over
    } else {
      // Player wins battle phase, surviving player cards deal face damage
      faceDamageDealt = survivingPlayerBoardCards.reduce((sum, card) => sum + card.cardInstance.attack, 0);
      aiHealth -= faceDamageDealt;
      console.log(`AI takes ${faceDamageDealt} face damage. Remaining HP: ${aiHealth}`);
      finalResultMessage = "Victory!"; // Base result if not game over
    }

    // Clamp health to 0 minimum
    playerHealth = Math.max(0, playerHealth);
    aiHealth = Math.max(0, aiHealth);

    // --- Update Persistent State in Registry ---
    // Hand state persists as is unless modified by future mechanics
    const finalPlayerHandState: (CardInstance | null)[] = this.registry.get('playerHandState') || [null, null, null, null, null];
    const finalPlayerBattlefieldState: (CardInstance | null)[] = [null, null, null, null, null];

    this.playerBoardCards.forEach((battleCard, index) => {
        if (battleCard && battleCard.isAlive) {
            // The cardInstance within battleCard already has updated currentHp
            finalPlayerBattlefieldState[index] = battleCard.cardInstance;
        } else {
            finalPlayerBattlefieldState[index] = null; // Card died or slot was empty
        }
    });
    
    // Add flat brew reward scaling with day
    const flatBrewReward = this.currentDay * 3; // CHANGED FROM 4
    const finalBrews = this.playerBrewsAtStart + this.playerBrewsEarned + flatBrewReward;
    
    this.registry.set('playerHealth', playerHealth);
    this.registry.set('aiHealth', aiHealth);
    this.registry.set('playerHandState', finalPlayerHandState); // Save potentially unchanged hand state
    this.registry.set('playerBattlefieldState', finalPlayerBattlefieldState); // Save surviving battlefield state
    this.registry.set('playerBrews', finalBrews); // Save updated brew count

    // --- Update UI and Check Game Over ---
    this.playerHealthText.setText(`Player HP: ${playerHealth}`);
    this.aiHealthText.setText(`Enemy HP: ${aiHealth}`);
    this.playerBrewsText.setText(`Brews: ${finalBrews}`); // Show final brew count

    // Check for Game Over
    if (playerHealth <= 0) {
        finalResultMessage = "GAME OVER - You Lost!";
        gameOver = true;
        console.log("Player has lost the game.");
    } else if (aiHealth <= 0) {
        finalResultMessage = "GAME OVER - You Win!";
        gameOver = true;
        console.log("Player has won the game!");
    }
    // TODO: Add Day 10 win condition check

    // --- Display Results ---
    let resultMessage: string;
    let resultColor: string;
    const totalBrewsEarnedThisRound = this.playerBrewsEarned + flatBrewReward; // Calculate total for display

    if (gameOver) {
        resultMessage = finalResultMessage; // Use the game over message
        resultColor = (playerHealth <= 0) ? "#ff0000" : "#00ff00"; // Bright red/green for game over
    } else if (playerLost) {
        // Update message to show total brews earned
        resultMessage = `Defeat!\nTook ${faceDamageTaken} face damage.\nBrews Earned: ${totalBrewsEarnedThisRound}`;
        resultColor = "#ff8888"; // Lighter red for phase loss
    } else { // Player won the phase
        // Update message to show total brews earned
        resultMessage = `Victory!\nDealt ${faceDamageDealt} face damage.\nBrews Earned: ${totalBrewsEarnedThisRound}`;
        resultColor = "#88ff88"; // Lighter green for phase win
    }


    // Display results text
    this.resultText.setText(resultMessage);
    this.resultText.setColor(resultColor);
    this.resultText.setAlpha(1);

    // Configure Continue Button based on game state
    this.continueButton.setAlpha(1); // Make button visible
    this.continueButton.off('pointerdown'); // Remove previous listeners
    this.continueButton.off('pointerover');
    this.continueButton.off('pointerout');

    if (gameOver) {
        this.continueButton.setText("Back to Main Menu");
        this.continueButton.setColor('#ffffff'); // White text for game over button
        this.continueButton.once('pointerdown', () => {
            // Optional: Clear registry state before going back?
            // this.registry.reset(); // Or clear specific keys
            this.scene.stop("Background");
            this.scene.start("MainMenu");
        });
        this.continueButton.on('pointerover', () => this.continueButton.setColor('#ffff55')); // Yellow highlight
        this.continueButton.on('pointerout', () => this.continueButton.setColor('#ffffff'));
    } else {
        // Continue to next day's shop
        this.continueButton.setText("Continue to Shop");
        this.continueButton.setColor('#00ff00'); // Green text
        this.continueButton.once('pointerdown', () => {
            const nextDay = this.currentDay + 1;
            this.registry.set('currentDay', nextDay);
            // State (health, brews, hand, battlefield) is already saved in registry
            // Update log message to reflect total brews earned and the formula
            const totalBrewsEarnedThisRound = this.playerBrewsEarned + flatBrewReward;
            console.log(`Battle ended. Earned ${totalBrewsEarnedThisRound} brews (Kills: ${this.playerBrewsEarned}, Day Bonus: ${flatBrewReward}). Total: ${finalBrews}. Starting Day ${nextDay}`);
            // Shop scene will read the updated state from the registry
            this.scene.start("Shop", { /* Pass minimal data if needed, like day */ currentDay: nextDay });
        });
        this.continueButton.on('pointerover', () => this.continueButton.setColor('#55ff55')); // Lighter green highlight
        this.continueButton.on('pointerout', () => this.continueButton.setColor('#00ff00'));
    }

    // Make the button interactive after a short delay
    this.time.delayedCall(500, () => {
         this.continueButton.setInteractive({ useHandCursor: true });
    });
  }
}