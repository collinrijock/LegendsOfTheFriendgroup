import { Scene } from "phaser";
// Import global room instance
import { colyseusRoom } from "../utils/colyseusClient"; // Updated import
// Import schemas for type safety (adjust path)
import { Phase, PlayerState, CardInstanceSchema } from "../../../server/src/schemas/GameState"; // Adjust path

// --- Interfaces --- (Keep CardData if needed locally)
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

// Keep CardInstance interface for local use (compatible with CardInstanceSchema)
export interface CardInstance extends CardData {
    instanceId: string;
    currentHp: number;
}

// --- BattleCard Class --- (Modify constructor and updates)
class BattleCard {
  gameObject: Phaser.GameObjects.Text;
  cardInstance: CardInstance; // Use client interface type
  attackTimer: number;
  isAlive: boolean = true;
  isPlayerCard: boolean; // Is this card owned by the *local* client?
  ownerSessionId: string; // Whose card is this?
  hpText: Phaser.GameObjects.Text;
  attackBarBg: Phaser.GameObjects.Graphics | null = null;
  attackBarFill: Phaser.GameObjects.Graphics | null = null;
  attackCooldown: number;

  // Constructor now takes CardInstanceSchema from server state
  constructor(scene: Scene, x: number, y: number, instanceSchema: CardInstanceSchema, ownerId: string, isLocalPlayer: boolean) {
    // Convert schema to local interface type if necessary, or use schema directly if compatible
    // For simplicity, assume direct compatibility or simple mapping here
    this.cardInstance = instanceSchema as any as CardInstance; // Cast or map properties
    this.ownerSessionId = ownerId;
    this.isPlayerCard = isLocalPlayer;

    this.attackCooldown = (this.cardInstance.speed || 5) * 1000;
    this.attackTimer = this.attackCooldown; // Start ready

    const cardWidth = 100;
    const cardHeight = 140;
    const barHeight = 10;
    const baseY = y;

    // Use different colors based on whether it's the local player's card or opponent's
    const bgColor = isLocalPlayer ? "#444488" : "#884444"; // Blue for local player, Red for opponent

    // Create visuals (GameObject, HP Text, Attack Bar) as before...
    // Ensure HP text uses cardInstance.currentHp and cardInstance.health
    // --- Visual Creation Code (similar to previous version) ---
     const totalHeight = cardHeight + barHeight + 5 + 20; // Card + HP Text + Bar + Spacing

     // Main card text (position adjusted for HP and bar)
     this.gameObject = scene.add.text(
       x,
       baseY - barHeight - 5 - 20, // Position above HP text and bar
       ``, // Set text below
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
         ``, // Set text below
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

     // Attack Timer Bar Background
     this.attackBarBg = scene.add.graphics();
     this.attackBarBg.fillStyle(0x000000, 0.5); // Dark background
     this.attackBarBg.fillRect(x - cardWidth / 2, baseY - barHeight, cardWidth, barHeight);

     // Attack Timer Bar Fill
     this.attackBarFill = scene.add.graphics();
     this.attackBarFill.fillStyle(0xffff00, 1); // Yellow fill
     // Initial fill state will be set in updateAttackBar

     // Set text content using this.cardInstance data
     this.gameObject.setText(`${this.cardInstance.name}\nAtk: ${this.cardInstance.attack}\nSpd: ${this.cardInstance.speed}s`);
     this.updateHpDisplay(); // Initial HP text
     this.updateAttackBar(); // Initial bar state

    this.gameObject.setData("battleCard", this);
  }

  // takeDamage: Updates local cardInstance.currentHp, shows damage number, updates HP display.
  // Does NOT send updates to server - battle is client-simulated for now.
  takeDamage(damage: number, scene: Scene) {
    if (!this.isAlive) return;
    this.cardInstance.currentHp -= damage;
    this.showDamageNumber(damage, scene);
    this.updateHpDisplay();
    if (this.cardInstance.currentHp <= 0) {
        this.die(scene);
    }
  }

  // updateHpDisplay: Updates HP text and color based on currentHp/health.
  updateHpDisplay() {
      if (!this.hpText || !this.hpText.active) return; // Check if text object is still valid
      const hp = Math.max(0, this.cardInstance.currentHp); // Ensure HP doesn't go below 0 visually
      const maxHp = this.cardInstance.health;
      this.hpText.setText(`HP: ${hp}/${maxHp}`);
      // Set color based on HP percentage (red/yellow/green)
      const hpPercent = maxHp > 0 ? hp / maxHp : 0;
       if (!this.isAlive || hp <= 0) { this.hpText.setColor("#ff0000"); } // Red when dead or 0 HP
       else if (hpPercent < 0.3) { this.hpText.setColor("#ff0000"); } // Red when low
       else if (hpPercent < 0.6) { this.hpText.setColor("#ffff00"); } // Yellow when medium
       else { this.hpText.setColor("#00ff00"); } // Green when high
  }

  // showDamageNumber: Creates floating damage text animation. (No changes needed)
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

  // die: Marks card as dead, updates visuals, destroys bars. (No changes needed)
  die(scene: Scene) {
    if (!this.isAlive) return;
    console.log(`${this.cardInstance.name} (Owner: ${this.ownerSessionId}) died!`);
    this.isAlive = false;
    this.cardInstance.currentHp = 0;
    this.updateHpDisplay();
    this.gameObject.setTint(0x888888);
    this.attackBarBg?.destroy(); this.attackBarBg = null;
    this.attackBarFill?.destroy(); this.attackBarFill = null;
  }

  // updateAttackBar: Updates the visual fill of the attack timer bar.
  updateAttackBar() {
      if (!this.isAlive || !this.attackBarFill || !this.attackBarFill.active) return; // Check if bar is valid
      const progress = Math.max(0, this.attackTimer) / this.attackCooldown;
      const cardWidth = this.gameObject.width; // Use actual width
      const barHeight = 10;
      // Ensure hpText exists and is active before accessing its properties
      const barY = this.hpText && this.hpText.active ? this.hpText.y + 5 : this.gameObject.y + 5; // Position below HP text or fallback

      this.attackBarFill.clear();
      this.attackBarFill.fillStyle(0xffff00, 1);
      const fillWidth = cardWidth * (1 - progress);
      this.attackBarFill.fillRect(
          this.gameObject.x + cardWidth / 2 - fillWidth, // Start drawing from right edge
          barY,
          fillWidth,
          barHeight
      );
  }


  // update: Main simulation logic for the card.
  update(delta: number, targetCards: BattleCard[], scene: Scene) {
    if (!this.isAlive) return;

    this.attackTimer -= delta;
    this.updateAttackBar(); // Update bar visual

    if (this.attackTimer <= 0) {
      const livingTargets = targetCards.filter(card => card && card.isAlive); // Add null check for safety
      if (livingTargets.length > 0) {
        const target = Phaser.Utils.Array.GetRandom(livingTargets);
        // console.log(`${this.cardInstance.name} attacks ${target.cardInstance.name}`); // Less verbose log
        target.takeDamage(this.cardInstance.attack, scene);
        // Add attack visual tween as before...
         scene.tweens.add({ targets: this.gameObject, scaleX: 1.1, scaleY: 1.1, duration: 100, yoyo: true, ease: 'Sine.easeInOut' });
      }
      this.attackTimer = this.attackCooldown; // Reset timer
    }
  }
}


export class Battle extends Scene {
  // Store BattleCard instances keyed by owner session ID, then slot index
  private playerBoardCards: Map<string, (BattleCard | null)[]> = new Map();
  private handCardDisplayObjects: Map<string, (Phaser.GameObjects.Text | null)[]> = new Map(); // Display opponent hand? Maybe just placeholders.

  private battleOver: boolean = false;
  private resultText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text; // For "Battle Ended", "Waiting for results..."

  // Navbar elements
  private playerHealthText!: Phaser.GameObjects.Text;
  private opponentHealthText!: Phaser.GameObjects.Text; // Renamed from aiHealthText
  private playerBrewsText!: Phaser.GameObjects.Text;
  private dayPhaseText!: Phaser.GameObjects.Text;

  // Colyseus listeners
  private phaseListenerUnsubscribe: (() => void) | null = null; // Store unsubscribe function
  private playerStateListeners: Map<string, () => void> = new Map(); // Track listeners per player

  constructor() {
    super("Battle");
  }

  // Remove init - state comes from Colyseus
  // init(data: { currentDay?: number, playerBrews?: number }) { ... }

  create() {
    this.scene.launch("background");
    this.battleOver = false; // Reset battle state

    // --- Safety Check ---
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) {
        console.error("Battle Scene: Colyseus room not available!");
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Error: Connection lost.\nPlease return to Main Menu.", { color: '#ff0000', fontSize: '24px', align: 'center', backgroundColor: '#000000' }).setOrigin(0.5);
        this.input.once('pointerdown', () => {
            // Attempt to leave if possible, ignore errors
            try { colyseusRoom?.leave(); } catch (e) {}
            this.scene.start('MainMenu');
        });
        return;
    }

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY; // Added for result text positioning
    const gameHeight = this.cameras.main.height;
    const gameWidth = this.cameras.main.width;

    // Get initial state from Colyseus
    const myPlayerId = colyseusRoom.sessionId;
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    let opponentState: PlayerState | undefined;
    colyseusRoom.state.players.forEach((player, sessionId) => {
        if (sessionId !== myPlayerId) {
            opponentState = player;
        }
    });

    const currentDay = colyseusRoom.state.currentDay;
    const playerHealth = myPlayerState?.health ?? 50;
    const opponentHealth = opponentState?.health ?? 50;
    const playerBrews = myPlayerState?.brews ?? 0;

    // --- Navbar ---
    const navbarY = 25;
    const navbarHeight = 50;
    this.add.rectangle(centerX, navbarY, gameWidth, navbarHeight, 0x000000, 0.6);
    // Add styles matching previous implementation
    const navTextStyle = { fontFamily: "Arial", fontSize: 18, color: "#ffffff", align: "left" };
    this.playerHealthText = this.add.text(50, navbarY, `You: ${playerHealth} HP`, { ...navTextStyle, color: "#00ff00" }).setOrigin(0, 0.5);
    this.opponentHealthText = this.add.text(250, navbarY, `Opponent: ${opponentHealth} HP`, { ...navTextStyle, color: "#ff0000" }).setOrigin(0, 0.5);
    this.dayPhaseText = this.add.text(centerX, navbarY, `Day ${currentDay} - Battle Phase`, { ...navTextStyle, fontSize: 24, align: "center" }).setOrigin(0.5);
    this.playerBrewsText = this.add.text(gameWidth - 50, navbarY, `Brews: ${playerBrews}`, { ...navTextStyle, fontSize: 20, color: "#ffff00", align: "right" }).setOrigin(1, 0.5);


    // --- Title ---
    // Add styles matching previous implementation
    this.add.text(centerX, 80, "Battle Phase!", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ff8c00", // Orange color for battle
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      }).setOrigin(0.5);

    // --- Board Setup ---
    this.playerBoardCards.clear(); // Clear previous battle data
    this.createBoardVisuals(myPlayerId, opponentState?.sessionId);

    // --- Result Text & Status Text (initially hidden) ---
    // Add styles matching previous implementation for resultText
    this.resultText = this.add.text(centerX, centerY, "", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
    }).setOrigin(0.5).setAlpha(0);

    this.statusText = this.add.text(centerX, gameHeight - 50, "", {
         fontFamily: "Arial", fontSize: 24, color: "#ffff00", align: "center"
    }).setOrigin(0.5).setAlpha(0);


    // --- Colyseus Listeners ---
    this.setupColyseusListeners();

    // Initial UI update
    this.updateNavbar();
    this.updateDayPhaseText(); // Ensure phase text is correct initially
  }

  // --- Board Creation ---
  createBoardVisuals(myPlayerId: string, opponentId?: string) {
    if (!colyseusRoom || !colyseusRoom.state) return;

    const centerX = this.cameras.main.centerX;
    const gameHeight = this.cameras.main.height;

    // Player Board (Bottom)
    const playerSlotWidth = 120;
    const playerSlotSpacing = 20;
    const totalPlayerSlotsWidth = 5 * playerSlotWidth + 4 * playerSlotSpacing;
    const startPlayerSlotsX = centerX - totalPlayerSlotsWidth / 2 + playerSlotWidth / 2;
    const playerSlotsY = gameHeight - 250; // Position player board slightly up

    const myState = colyseusRoom.state.players.get(myPlayerId);
    const myBoardArray: (BattleCard | null)[] = Array(5).fill(null);
    myState?.battlefield.forEach((cardSchema, slotIndex) => {
        const index = parseInt(slotIndex, 10);
        if (cardSchema && !isNaN(index) && index >= 0 && index < 5) {
            const slotX = startPlayerSlotsX + index * (playerSlotWidth + playerSlotSpacing);
            myBoardArray[index] = new BattleCard(this, slotX, playerSlotsY, cardSchema, myPlayerId, true);
        }
    });
    this.playerBoardCards.set(myPlayerId, myBoardArray);

    // Opponent Board (Top)
    if (opponentId) {
        const opponentState = colyseusRoom.state.players.get(opponentId);
        const opponentBoardArray: (BattleCard | null)[] = Array(5).fill(null);
        const aiSlotWidth = 120; // Use consistent naming if possible
        const aiSlotSpacing = 20;
        const totalAiSlotsWidth = 5 * aiSlotWidth + 4 * aiSlotSpacing;
        const startAiSlotsX = centerX - totalAiSlotsWidth / 2 + aiSlotWidth / 2;
        const aiSlotsY = 200; // AI/Opponent slots upper half

        opponentState?.battlefield.forEach((cardSchema, slotIndex) => {
            const index = parseInt(slotIndex, 10);
            if (cardSchema && !isNaN(index) && index >= 0 && index < 5) {
                const slotX = startAiSlotsX + index * (aiSlotWidth + aiSlotSpacing);
                opponentBoardArray[index] = new BattleCard(this, slotX, aiSlotsY, cardSchema, opponentId, false);
            }
        });
        this.playerBoardCards.set(opponentId, opponentBoardArray);
    } else {
        // Ensure opponent board is empty if no opponent ID
        this.playerBoardCards.set("opponent", Array(5).fill(null)); // Use a placeholder key
    }

    // Optional: Display Hand Placeholders (read-only)
    // ... create visual placeholders for local player's hand ...
  }

  // --- Colyseus Listeners ---
  setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.state) return;

    // Listen for phase changes to end the battle or handle errors
    this.phaseListenerUnsubscribe = colyseusRoom.state.listen("currentPhase", (currentPhase) => {
        if (!this.scene.isActive()) return; // Guard against updates after shutdown
        console.log(`Battle Scene: Phase changed to ${currentPhase}`);
        this.updateDayPhaseText(); // Update navbar

        if (currentPhase === Phase.BattleEnd) {
            this.handleBattleEnd(); // Trigger results display
        } else if (currentPhase === Phase.Shop) {
            // Transition directly to shop after BattleEnd is processed by server
            // Cleanup happens in shutdown() which is called by scene.start()
            this.scene.start("Shop");
        } else if (currentPhase === Phase.GameOver) {
            this.handleGameOver(); // Show final game over message
        } else if (currentPhase !== Phase.Battle) {
            // Unexpected phase, return to Lobby
            console.warn(`Battle Scene: Unexpected phase change to ${currentPhase}. Returning to Lobby.`);
            // Cleanup happens in shutdown()
            try { colyseusRoom?.leave(); } catch(e) {} // Attempt to leave
            this.scene.start("Lobby");
        }
    });

    // Listen for health/brew changes to update navbar
    colyseusRoom.state.players.forEach((player, sessionId) => {
        // Store the unsubscribe function for each player's onChange
        const unsubscribe = player.onChange(() => {
            // Check if scene is still active before updating UI
            if (this.scene.isActive()) {
                this.updateNavbar();
            }
        });
        this.playerStateListeners.set(sessionId, unsubscribe);
    });

     // Also handle players joining/leaving during battle? Unlikely but possible.
     colyseusRoom.state.players.onAdd((player, sessionId) => {
         if (!this.scene.isActive()) return;
         // If a player joins mid-battle? Error state? Or maybe spectator?
         console.warn(`Player ${sessionId} joined mid-battle?`);
         this.updateNavbar(); // Update just in case
         // Add listener for the new player
         const unsubscribe = player.onChange(() => {
             if (this.scene.isActive()) this.updateNavbar();
         });
         this.playerStateListeners.set(sessionId, unsubscribe);
         // Recreate board visuals if opponent was missing?
         const myId = colyseusRoom?.sessionId;
         if (myId && sessionId !== myId) {
             this.createBoardVisuals(myId, sessionId);
         }
     });

     colyseusRoom.state.players.onRemove((player, sessionId) => {
         if (!this.scene.isActive()) return;
         console.log(`Player ${sessionId} removed mid-battle`);
         // Remove listener
         const unsubscribe = this.playerStateListeners.get(sessionId);
         if (unsubscribe) {
             unsubscribe(); // Call the stored unsubscribe function
             this.playerStateListeners.delete(sessionId);
         }
         this.updateNavbar(); // Update display
         // Clear the removed player's board visuals
         const board = this.playerBoardCards.get(sessionId);
         board?.forEach(card => {
             card?.gameObject?.destroy(); // Add null checks
             card?.hpText?.destroy();
             card?.attackBarBg?.destroy();
             card?.attackBarFill?.destroy();
         });
         this.playerBoardCards.delete(sessionId);
         // Server should handle game over logic if needed
     });
  }

  cleanupListeners() {
    console.log("Battle Scene: Cleaning up listeners.");
    // Remove phase listener
    this.phaseListenerUnsubscribe?.(); // Call the stored unsubscribe function
    this.phaseListenerUnsubscribe = null;

    // Clear player state listeners
    this.playerStateListeners.forEach((unsubscribe) => {
        unsubscribe(); // Call each player's unsubscribe function
    });
    this.playerStateListeners.clear(); // Clear the map

    // Remove Colyseus general player add/remove listeners
    // Note: Using null as the callback effectively removes the listener
    // Ensure this is the correct way for your Colyseus version or use specific unsubscribe methods if available
    try {
        colyseusRoom?.state?.players?.onAdd(null as any); // Cast to any if TS complains
        colyseusRoom?.state?.players?.onRemove(null as any);
    } catch (e) {
        console.warn("Error removing onAdd/onRemove listeners:", e);
        // Fallback or alternative cleanup if needed
    }
  }

  // --- UI Update Functions ---
  updateNavbar() {
    // Added checks for text elements existence
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId || !this.playerHealthText?.active || !this.opponentHealthText?.active || !this.playerBrewsText?.active) {
        // console.warn("Cannot update navbar, elements or room state missing/inactive.");
        return;
    }

    const myPlayerId = colyseusRoom.sessionId;
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    let opponentState: PlayerState | undefined;
    colyseusRoom.state.players.forEach((player, sessionId) => {
        if (sessionId !== myPlayerId) opponentState = player;
    });

    this.playerHealthText.setText(`You: ${myPlayerState?.health ?? 'N/A'} HP`);
    this.opponentHealthText.setText(`Opponent: ${opponentState?.health ?? 'N/A'} HP`);
    this.playerBrewsText.setText(`Brews: ${myPlayerState?.brews ?? 'N/A'}`);
    // Day/Phase text updated separately by updateDayPhaseText
  }

   updateDayPhaseText() {
        if (!colyseusRoom || !colyseusRoom.state || !this.dayPhaseText?.active) {
            // console.warn("Cannot update day/phase text, element or room state missing/inactive.");
            return;
        }
        const day = colyseusRoom.state.currentDay;
        const phase = colyseusRoom.state.currentPhase;
        // Show "Battle Ended" if in BattleEnd phase
        const phaseText = phase === Phase.BattleEnd ? "Battle Ended" : phase;
        this.dayPhaseText.setText(`Day ${day} - ${phaseText}`);
   }


  // --- Battle Simulation ---
  update(time: number, delta: number) {
    // Only run simulation if in Battle phase and not yet over locally
    if (this.battleOver || !colyseusRoom || !colyseusRoom.state || colyseusRoom.state.currentPhase !== Phase.Battle) {
        return;
    }

    const myPlayerId = colyseusRoom.sessionId;
    let opponentId: string | undefined;
    colyseusRoom.state.players.forEach((player, sessionId) => {
        if (sessionId !== myPlayerId) opponentId = sessionId;
    });

    // Use placeholder key if opponentId is missing initially
    const opponentKey = opponentId ?? "opponent";

    const myBoard = this.playerBoardCards.get(myPlayerId) || [];
    const opponentBoard = this.playerBoardCards.get(opponentKey) || [];

    const activePlayerCards = myBoard.filter(card => card && card.isAlive) as BattleCard[];
    const activeOpponentCards = opponentBoard.filter(card => card && card.isAlive) as BattleCard[];

    // Update Player Cards (Target Opponent Cards)
    activePlayerCards.forEach(card => {
      card.update(delta, activeOpponentCards, this);
    });

    // Update Opponent Cards (Target Player Cards)
    activeOpponentCards.forEach(card => {
      card.update(delta, activePlayerCards, this);
    });

    // Client-side check for end conditions (optional, server is authoritative)
    // const playerLost = activePlayerCards.length === 0 && myBoard.some(c => c !== null);
    // const opponentLost = activeOpponentCards.length === 0 && opponentBoard.some(c => c !== null);
    // if (playerLost || opponentLost) {
    //    console.log("Client detected potential battle end.");
    //    // Don't end locally, wait for server phase change
    // }
  }

  // --- End Battle Handling ---

  handleBattleEnd() {
    if (this.battleOver || !this.scene.isActive()) return; // Prevent multiple calls or calls after shutdown
    this.battleOver = true;
    console.log("Battle ended (server signal received). Displaying results.");

    // Stop local simulation updates (handled by battleOver flag in update)

    // Update UI based on final server state
    this.updateNavbar(); // Ensure final health/brews are shown
    this.updateDayPhaseText(); // Show "Battle Ended"

    // Determine result message based on final health from server state
    const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId);
    let opponentState: PlayerState | undefined;
    colyseusRoom?.state.players.forEach((p, sid) => { if (sid !== colyseusRoom?.sessionId) opponentState = p; });

    let resultMessage = "Battle Ended"; // Default
    let resultColor = "#ffffff";
    if (myPlayerState && opponentState) {
        // Note: Server already calculated face damage and updated health before changing phase
        if (myPlayerState.health > opponentState.health) {
             resultMessage = "Victory!";
             resultColor = "#88ff88";
        } else if (opponentState.health > myPlayerState.health) {
             resultMessage = "Defeat!";
             resultColor = "#ff8888";
        } else {
             resultMessage = "Draw!"; // Should be rare if face damage occurs
             resultColor = "#ffff88";
        }
        // We don't need to show damage/brews earned here, as the navbar reflects the final state.
        // Could add a summary if desired.
    } else {
        // Handle case where one player might be missing (e.g., left)
        resultMessage = "Battle Ended (Opponent Left?)";
        resultColor = "#ffffff";
    }

    if (this.resultText?.active) {
        this.resultText.setText(resultMessage).setColor(resultColor).setAlpha(1);
    }
    if (this.statusText?.active) {
        this.statusText.setText("Waiting for next round...").setAlpha(1);
    }

    // No continue button here, server automatically transitions to Shop after a delay
  }

  handleGameOver() {
     if (this.battleOver || !this.scene.isActive()) return; // Prevent multiple calls or calls after shutdown
     this.battleOver = true; // Stop simulation
     console.log("Game Over signal received.");

     this.updateNavbar(); // Show final scores
     this.updateDayPhaseText(); // Show "Game Over" or similar

     // Determine final winner/loser/draw based on server state
     const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId);
     let opponentState: PlayerState | undefined;
     colyseusRoom?.state.players.forEach((p, sid) => { if (sid !== colyseusRoom?.sessionId) opponentState = p; });

     let finalMessage = "Game Over!";
     let finalColor = "#ffffff";

     if (myPlayerState && opponentState) {
         if (myPlayerState.health > opponentState.health) { finalMessage = "You Win!"; finalColor = "#00ff00"; }
         else if (opponentState.health > myPlayerState.health) { finalMessage = "You Lose!"; finalColor = "#ff0000"; }
         else { finalMessage = "Draw!"; finalColor = "#ffff00"; }
     } else if (myPlayerState) {
         // Opponent likely left or disconnected
         finalMessage = "You Win! (Opponent Left)"; finalColor = "#00ff00";
     } else {
         // This client's state is missing? Should not happen if client is still here
         finalMessage = "Game Over (Error?)"; finalColor = "#ff0000";
     }


     if (this.resultText?.active) {
        this.resultText.setText(finalMessage).setColor(finalColor).setAlpha(1);
     }
     if (this.statusText?.active) {
        this.statusText.setText("Click to return to Main Menu").setAlpha(1);
     }

     // Make clickable to return to menu
     this.input.once('pointerdown', () => {
         // Cleanup happens in shutdown
         try { colyseusRoom?.leave(); } catch(e) {} // Leave the room
         this.scene.stop("Background");
         this.scene.start("MainMenu");
     });
  }


   // Override shutdown
   shutdown() {
        console.log("Battle scene shutting down explicitly.");
        this.cleanupListeners(); // Remove Colyseus listeners

        // Destroy card game objects
        this.playerBoardCards.forEach(board => {
            board?.forEach(card => {
                if (card) {
                    card.gameObject?.destroy();
                    card.hpText?.destroy();
                    card.attackBarBg?.destroy();
                    card.attackBarFill?.destroy();
                }
            });
        });
        this.playerBoardCards.clear();

        // Destroy hand display objects (if any were created)
        this.handCardDisplayObjects.forEach(hand => {
            hand?.forEach(displayObj => displayObj?.destroy());
        });
        this.handCardDisplayObjects.clear();

        // Destroy navbar elements, text etc. safely
        this.playerHealthText?.destroy();
        this.opponentHealthText?.destroy();
        this.playerBrewsText?.destroy();
        this.dayPhaseText?.destroy();
        this.resultText?.destroy();
        this.statusText?.destroy();

        // Call super.shutdown() if necessary for Phaser's internal cleanup
        // super.shutdown(); // Check Phaser docs if this is needed/recommended
   }
}

// Helper function (if needed, or import)
// function generateUniqueId(): string { ... }