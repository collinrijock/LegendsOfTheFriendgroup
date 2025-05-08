import { Scene } from "phaser";
import { colyseusRoom } from "../utils/colyseusClient";
import {
  GameState,
  PlayerState,
  CardInstanceSchema,
  Phase,
} from "../../../server/src/schemas/GameState"; // Adjust path
import { getStateCallbacks } from "colyseus.js";

interface CardUIData {
  id: string;
  name: string;
  attack: number;
  speed: number;
  health: number;
  brewCost: number;
  description: string;
  isLegend: boolean;
  currentHp?: number;
  instanceId?: string;
}

const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;
const SLOT_SPACING = 15;
const HAND_Y_PLAYER = 580; // Bottom of screen
const BATTLEFIELD_Y_PLAYER = 420;
const HAND_Y_OPPONENT = 100; // Top of screen (for their hand cards, obscured)
const BATTLEFIELD_Y_OPPONENT = 260;

export class BoardView extends Scene {
  private playerVisuals: Map<
    string,
    {
      // Keyed by sessionId
      hand: Map<string, Phaser.GameObjects.Container>; // Keyed by slotIndex "0"-"4"
      battlefield: Map<string, Phaser.GameObjects.Container>; // Keyed by slotIndex "0"-"4"
      handSlotOutlines: Phaser.GameObjects.Rectangle[];
      battlefieldSlotOutlines: Phaser.GameObjects.Rectangle[];
    }
  > = new Map();

  private currentPhase: Phase = Phase.Lobby; // Add currentPhase property

  // Navbar elements
  private playerHealthText!: Phaser.GameObjects.Text;
  private opponentHealthText!: Phaser.GameObjects.Text;
  private playerBrewsText!: Phaser.GameObjects.Text;
  private dayPhaseText!: Phaser.GameObjects.Text;
  private opponentUsernameText!: Phaser.GameObjects.Text; // For opponent's name

  // Listeners
  private listeners: Array<() => void> = [];
  private cardDataCache: CardUIData[] | null = null;

  constructor() {
    super("BoardView");
  }

  private updateCardHpVisuals(cardContainer: Phaser.GameObjects.Container, currentHp: number, maxHealth: number) {
    if (!cardContainer || !cardContainer.active) return;

    const hpText = cardContainer.getData("hpTextObject") as Phaser.GameObjects.Text;
    const backgroundRect = cardContainer.getData('backgroundRectangle') as Phaser.GameObjects.Rectangle;

    if (hpText && hpText.active) {
        hpText.setText(`HP: ${currentHp}/${maxHealth}`);
        const hpPercent = maxHealth > 0 ? currentHp / maxHealth : 0;
        if (currentHp <= 0) {
            hpText.setColor("#ff0000"); // Red for dead
        } else if (hpPercent < 0.3) {
            hpText.setColor("#ff8888"); // Lighter Red for low
        } else if (hpPercent < 0.6) {
            hpText.setColor("#ffff88"); // Yellow for medium
        } else {
            hpText.setColor("#88ff88"); // Green for high
        }
    }

    // Handle dimming/tinting for death or revival
    const isVisuallyDead = cardContainer.alpha < 1.0; // A simple check

    if (currentHp <= 0) {
        if (!isVisuallyDead) { // Apply death visuals if not already applied
            cardContainer.setAlpha(0.6);
            if (backgroundRect && backgroundRect.active && typeof backgroundRect.setTint === 'function') {
                backgroundRect.setTint(0x777777);
            }
        }
    } else { // currentHp > 0
        if (isVisuallyDead) { // Apply alive visuals if it was visually dead
            cardContainer.setAlpha(1.0);
            if (backgroundRect && backgroundRect.active && typeof backgroundRect.clearTint === 'function') {
                backgroundRect.clearTint();
            } else if (backgroundRect && backgroundRect.active) {
                console.warn("BoardView: updateCardHpVisuals - clearTint method not found on backgroundRect for card.", cardContainer.getData('instanceId'), backgroundRect);
            }
        }
    }
  }

  preload() {
    if (!this.textures.exists("cardBack")) {
      // Create a simple texture for card back if it doesn't exist
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x502a7e); // Dark purple
      graphics.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      graphics.lineStyle(2, 0xbda4d5); // Light purple border
      graphics.strokeRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      graphics.generateTexture("cardBack", CARD_WIDTH, CARD_HEIGHT);
      graphics.destroy();
    }
  }

  create() {
    console.log("BoardView creating...");
    this.cardDataCache = this.cache.json.get("cardData");

    this.createNavbar();
    this.setupColyseusListeners();
    // Ensure this scene is rendered below other UI scenes like Shop, Prep, Battle
    // this.scene.sendToBack(); // REMOVE THIS LINE
    // The Background scene will send itself to back.
    // Active phase scenes (Shop, Prep, Battle) will bring themselves to the top.
    // BoardView should sit between them.
  }

  private createNavbar() {
    const centerX = this.cameras.main.centerX;
    const gameWidth = this.cameras.main.width;
    const navbarY = 30; // Slightly lower to not overlap very top
    const navbarHeight = 50;

    this.add
      .rectangle(centerX, navbarY, gameWidth, navbarHeight, 0x000000, 0.7)
      .setDepth(1000); // Ensure navbar is on top

    const navTextStyle = {
      fontFamily: "Arial",
      fontSize: 16,
      color: "#ffffff",
      align: "left",
    };
    this.playerHealthText = this.add
      .text(20, navbarY, `You: -- HP`, { ...navTextStyle, color: "#00ff00" })
      .setOrigin(0, 0.5)
      .setDepth(1001);
    this.playerBrewsText = this.add
      .text(gameWidth - 20, navbarY, `Brews: --`, {
        ...navTextStyle,
        color: "#ffff00",
        align: "right",
      })
      .setOrigin(1, 0.5)
      .setDepth(1001);

    this.opponentUsernameText = this.add
      .text(200, navbarY - 10, `Opponent: --`, {
        ...navTextStyle,
        fontSize: 14,
      })
      .setOrigin(0, 0.5)
      .setDepth(1001);
    this.opponentHealthText = this.add
      .text(200, navbarY + 10, `-- HP`, { ...navTextStyle, color: "#ff0000" })
      .setOrigin(0, 0.5)
      .setDepth(1001);

    this.dayPhaseText = this.add
      .text(centerX, navbarY, `Day -- - Phase --`, {
        ...navTextStyle,
        fontSize: 20,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(1001);
  }

  private showAttackAnimation(cardInstanceId: string) {
    const cardContainer = this.getCardGameObjectByInstanceId(cardInstanceId);
    if (cardContainer && cardContainer.active) {
        // Example: A quick "punch" tween
        const originalScaleX = cardContainer.scaleX;
        const originalScaleY = cardContainer.scaleY;
        this.tweens.add({
            targets: cardContainer,
            scaleX: originalScaleX * 1.15,
            scaleY: originalScaleY * 1.15,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }
  }

  private showDamageNumber(targetInstanceId: string, damage: number) {
    const targetContainer = this.getCardGameObjectByInstanceId(targetInstanceId);
    if (targetContainer && targetContainer.active && damage > 0) {
        const damageText = this.add.text(
            targetContainer.x + Phaser.Math.Between(-10, 10),
            targetContainer.y - CARD_HEIGHT / 2 - 10, // Above the card
            `-${damage}`,
            {
                fontFamily: "Arial Black",
                fontSize: 24,
                color: "#ff0000", // Red for damage
                stroke: "#000000",
                strokeThickness: 4,
            }
        ).setOrigin(0.5).setDepth(targetContainer.depth + 1); // Ensure damage text is above card

        this.tweens.add({
            targets: damageText,
            y: damageText.y - 50, // Float up
            alpha: 0, // Fade out
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                damageText.destroy();
            }
        });
    }
  }

  private drawAttackLine(attackerInstanceId: string, targetInstanceId: string) {
    const attackerContainer = this.getCardGameObjectByInstanceId(attackerInstanceId);
    const targetContainer = this.getCardGameObjectByInstanceId(targetInstanceId);

    if (attackerContainer && attackerContainer.active && targetContainer && targetContainer.active) {
        const line = this.add.line(
            0, 0,
            attackerContainer.x, attackerContainer.y,
            targetContainer.x, targetContainer.y,
            0xff3333, // Bright red
            0.7
        ).setOrigin(0, 0).setLineWidth(2).setDepth(attackerContainer.depth); // Same depth or slightly above slots

        this.time.delayedCall(250, () => {
            line.destroy();
        });
    }
  }

  private setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.state) {
      console.error("BoardView: Colyseus room or state not available!");
      this.time.delayedCall(100, this.setupColyseusListeners, [], this); // Retry
      return;
    }
    const $ = getStateCallbacks(colyseusRoom);

    this.listeners.push(
      $(colyseusRoom.state).listen("currentDay", () => this.updateNavbarText())
    );
    this.listeners.push(
      $(colyseusRoom.state).listen("currentPhase", (newPhase, oldPhase) => { // Added oldPhase
        this.currentPhase = newPhase as Phase; // Update currentPhase
        this.updateNavbarText();

    const processCardVisualsPostBattle = (cardContainer: Phaser.GameObjects.Container, cardSchema: CardInstanceSchema | undefined, ownerSessionId: string, slotKey: string) => {
        if (!cardContainer.active) return;

        const cooldownBarBg = cardContainer.getData('cooldownBarBg') as Phaser.GameObjects.Rectangle;
        const cooldownBarFill = cardContainer.getData('cooldownBarFill') as Phaser.GameObjects.Rectangle;

        if (newPhase === Phase.Battle) {
            const cardArea = cardContainer.getData('area');
            if (cardArea === 'battlefield') {
                if (cardSchema) {
                    if (cooldownBarBg && cooldownBarFill) {
                        cooldownBarBg.setVisible(true);
                        cooldownBarFill.setVisible(true);
                        cooldownBarFill.setSize(CARD_WIDTH - 10, 6); // Reset width
        
                        const maxCooldown = (cardSchema.speed > 0 ? cardSchema.speed : 1.5) * 1000;
                        cardContainer.setData('maxAttackCooldown', maxCooldown);
                        cardContainer.setData('attackCooldownTimer', maxCooldown);
                    } else {
                        console.warn(`BoardView: Battle Phase - Card ${cardSchema.instanceId} (Owner: ${ownerSessionId}, Slot: ${slotKey}) missing cooldown bar elements in data. Bg: ${!!cooldownBarBg}, Fill: ${!!cooldownBarFill}`);
                    }
                } else {
                    console.warn(`BoardView: Battle Phase - Battlefield card container (Owner: ${ownerSessionId}, Slot: ${slotKey}) has no cardSchema. No cooldown bar shown.`);
                }
            } else {
                // This case should ideally not happen if we are iterating only battlefield cards, but good for diagnostics
                // console.warn(`BoardView: Battle Phase - Card container (Owner: ${ownerSessionId}, Slot: ${slotKey}) has area '${cardArea}' instead of 'battlefield'. No cooldown bar shown.`);
            }
        } else { // Not in Battle phase
            if (cooldownBarBg) cooldownBarBg.setVisible(false);
            if (cooldownBarFill) cooldownBarFill.setVisible(false);
        }

        // Reset visuals if transitioning out of battle phases
        if (oldPhase === Phase.Battle || oldPhase === Phase.BattleEnd) {
                if (newPhase !== Phase.Battle && newPhase !== Phase.BattleEnd) {
                    if (cardSchema && cardSchema.currentHp > 0) { // Only reset if alive
                        cardContainer.setAlpha(1.0);
                        const bgRect = cardContainer.getData('backgroundRectangle') as Phaser.GameObjects.Rectangle;
                        if (bgRect && bgRect.active && typeof bgRect.clearTint === 'function') {
                            bgRect.clearTint();
                        }
                    }
                    // If cardSchema.currentHp <= 0, it should already be tinted/dimmed by HP listener
                }
            }
        };

        this.playerVisuals.forEach((playerData, playerId) => {
            playerData.battlefield.forEach((cardContainer, slotKey) => {
                const cardSchema = colyseusRoom?.state.players.get(playerId)?.battlefield.get(slotKey);
                processCardVisualsPostBattle(cardContainer, cardSchema, playerId, slotKey);
            });
            // Hand cards generally don't have cooldown bars or battle-specific states other than HP
             playerData.hand.forEach((cardContainer, slotKey) => {
                const cardSchema = colyseusRoom?.state.players.get(playerId)?.hand.get(slotKey);
                 // Process hand cards if they need any visual reset (e.g. if they could be 'dead' visually)
                 if (oldPhase === Phase.Battle || oldPhase === Phase.BattleEnd) {
                    if (newPhase !== Phase.Battle && newPhase !== Phase.BattleEnd) {
                        if (cardSchema && cardSchema.currentHp > 0) {
                            cardContainer.setAlpha(1.0);
                            const bgRect = cardContainer.getData('backgroundRectangle') as Phaser.GameObjects.Rectangle;
                            if (bgRect && bgRect.active && typeof bgRect.clearTint === 'function') {
                                bgRect.clearTint();
                            }
                        }
                    }
                }
            });
        });
      })
    );

    this.listeners.push(
      $(colyseusRoom.state.players).onAdd((player, sessionId) => {
        console.log(`BoardView: Player added ${sessionId}`);
        this.addPlayerVisuals(sessionId);
        this.addPlayerListeners(player, sessionId);
        this.updatePlayerSlots(player, sessionId); // Initial population
        this.updateNavbarText(); // Update opponent name if they joined
      })
    );

    this.listeners.push(
      $(colyseusRoom.state.players).onRemove((player, sessionId) => {
        console.log(`BoardView: Player removed ${sessionId}`);
        this.removePlayerVisuals(sessionId);
        this.updateNavbarText(); // Update opponent name if they left
      })
    );

    // Listener for battle attack events
    this.listeners.push(colyseusRoom.onMessage("battleAttackEvent", (message: {
        attackerInstanceId: string,
        targetInstanceId: string,
        damageDealt: number,
        attackerPlayerId: string,
        targetPlayerId: string
    }) => {
        if (this.currentPhase !== Phase.Battle || !this.scene.isActive()) return;
        console.log("BoardView: Received battleAttackEvent", message);

        // Check if the attacker and target are still visually present
        const attackerCard = this.getCardGameObjectByInstanceId(message.attackerInstanceId);
        const targetCard = this.getCardGameObjectByInstanceId(message.targetInstanceId);

        if (attackerCard && attackerCard.active && targetCard && targetCard.active) {
            this.drawAttackLine(message.attackerInstanceId, message.targetInstanceId);
            this.showAttackAnimation(message.attackerInstanceId);
            // Server will send HP update, which will trigger its own visual update for HP text and death.
            // We can show damage number here for immediate feedback.
            this.showDamageNumber(message.targetInstanceId, message.damageDealt);
    
            // Reset attacker's visual cooldown timer
            const attackerMaxCooldown = attackerCard.getData('maxAttackCooldown') as number;
            if (attackerMaxCooldown > 0) {
                attackerCard.setData('attackCooldownTimer', attackerMaxCooldown);
                const fillBar = attackerCard.getData('cooldownBarFill') as Phaser.GameObjects.Rectangle;
                if (fillBar) fillBar.setSize(CARD_WIDTH - 10, 6); // Reset fill bar to full using setSize
            }
        
            // Client-side visual update for target card's HP
            const targetCardOwnerId = targetCard.getData('ownerSessionId') as string;
            const targetCardSlotKey = targetCard.getData('slotKey') as string;
            const targetCardArea = targetCard.getData('area') as 'hand' | 'battlefield';
        
            if (targetCardOwnerId === message.targetPlayerId && targetCardArea === 'battlefield' && targetCardSlotKey) {
                const targetPlayer = colyseusRoom.state.players.get(message.targetPlayerId);
                const cardSchema = targetPlayer?.battlefield.get(targetCardSlotKey);
        
                // Verify instanceId matches, as schema in map might have changed if card moved (unlikely during attack)
                if (cardSchema && cardSchema.instanceId === message.targetInstanceId) {
                    const newVisualHp = Math.max(0, cardSchema.currentHp - message.damageDealt);
                    this.updateCardHpVisuals(targetCard, newVisualHp, cardSchema.health);
                } else {
                    console.warn(`BoardView: battleAttackEvent - Target card schema not found or instanceId mismatch for player ${message.targetPlayerId}, slot ${targetCardSlotKey}, instance ${message.targetInstanceId}.`);
                }
            } else {
                 console.warn(`BoardView: battleAttackEvent - Target card container data inconsistent or not on battlefield. Owner: ${targetCardOwnerId}, Area: ${targetCardArea}, Slot: ${targetCardSlotKey}`);
            }
        
        } else {
            console.warn("BoardView: Attacker or target not found/active for battleAttackEvent", message);
        }
    }));

    colyseusRoom.state.players.forEach((player, sessionId) => {
      this.addPlayerVisuals(sessionId);
      this.addPlayerListeners(player, sessionId);
      this.updatePlayerSlots(player, sessionId); // Initial population
    });
    this.updateNavbarText(); // Initial navbar text
  }
  
  update(time: number, delta: number) {
    if (!this.scene.isActive() || this.currentPhase !== Phase.Battle || !colyseusRoom || !colyseusRoom.state) {
        return;
    }
  
    this.playerVisuals.forEach((playerData) => {
        playerData.battlefield.forEach((cardContainer) => {
            if (!cardContainer.active) return;
  
            const maxCooldown = cardContainer.getData('maxAttackCooldown') as number;
            let currentTimer = cardContainer.getData('attackCooldownTimer') as number;
  
            if (maxCooldown > 0) { // Only process if it has a valid cooldown
                currentTimer -= delta;
                if (currentTimer < 0) currentTimer = 0;
                cardContainer.setData('attackCooldownTimer', currentTimer);
  
                const cooldownBarFill = cardContainer.getData('cooldownBarFill') as Phaser.GameObjects.Rectangle;
                if (cooldownBarFill && cooldownBarFill.visible) {
                    const progress = currentTimer / maxCooldown;
                    cooldownBarFill.setSize((CARD_WIDTH - 10) * Math.max(0, progress), 6); // Use setSize
                }
            }
        });
    });
  }
  
  private addPlayerListeners(player: PlayerState, sessionId: string) {
    const $ = getStateCallbacks(colyseusRoom!);
    const playerListeners: Array<() => void> = [];

    playerListeners.push(
      $(player).listen("health", () => this.updateNavbarText())
    );
    playerListeners.push(
      $(player).listen("brews", () => this.updateNavbarText())
    );
    playerListeners.push(
      $(player).listen("username", () => this.updateNavbarText())
    );

    playerListeners.push(
      $(player.hand).onAdd((cardSchema, slotKey) =>
        this.updateCardVisual(sessionId, "hand", slotKey, cardSchema)
      )
    );
    playerListeners.push(
      $(player.hand).onRemove((cardSchema, slotKey) =>
        this.removeCardVisual(sessionId, "hand", slotKey)
      )
    );
    player.hand.forEach((cardSchema, slotKey) => {
      // For existing cards
      this.updateCardVisual(sessionId, "hand", slotKey, cardSchema);
      const handCardHpUnsub = $(cardSchema).listen("currentHp", (newHp, oldHp) => {
          const cardContainer = this.getCardGameObjectByInstanceId(cardSchema.instanceId);
          if (cardContainer) {
              this.updateCardHpVisuals(cardContainer, newHp, cardSchema.health);
          }
      });
      playerListeners.push(handCardHpUnsub);
    });

    playerListeners.push(
      $(player.battlefield).onAdd((cardSchema, slotKey) =>
        this.updateCardVisual(sessionId, "battlefield", slotKey, cardSchema)
      )
    );
    playerListeners.push(
      $(player.battlefield).onRemove((cardSchema, slotKey) =>
        this.removeCardVisual(sessionId, "battlefield", slotKey)
      )
    );
    player.battlefield.forEach((cardSchema, slotKey) => {
        // For existing cards
        this.updateCardVisual(sessionId, "battlefield", slotKey, cardSchema);
        const battlefieldCardHpUnsub = $(cardSchema).listen("currentHp", (newHp, oldHp) => {
            const cardContainer = this.getCardGameObjectByInstanceId(cardSchema.instanceId);
            if (cardContainer) {
                this.updateCardHpVisuals(cardContainer, newHp, cardSchema.health);
            }
        });
        playerListeners.push(battlefieldCardHpUnsub);
      });

    // Store these listeners to be cleaned up if the player leaves
    // This part is tricky with current structure, onLeave should handle cleanup of player-specific visuals and associated listeners.
    // For now, the main listeners array will handle general cleanup.
    this.listeners.push(...playerListeners);
  }

  private updatePlayerSlots(player: PlayerState, sessionId: string) {
    player.hand.forEach((card, slotKey) =>
      this.updateCardVisual(sessionId, "hand", slotKey, card)
    );
    player.battlefield.forEach((card, slotKey) =>
      this.updateCardVisual(sessionId, "battlefield", slotKey, card)
    );
  }

  private addPlayerVisuals(sessionId: string) {
    if (!this.playerVisuals.has(sessionId)) {
      const handSlotOutlines: Phaser.GameObjects.Rectangle[] = [];
      const battlefieldSlotOutlines: Phaser.GameObjects.Rectangle[] = [];
      const isLocalPlayer = sessionId === colyseusRoom?.sessionId;

      for (let i = 0; i < 5; i++) {
        const handX = this.calculateSlotX(i);
        const handY = isLocalPlayer ? HAND_Y_PLAYER : HAND_Y_OPPONENT;
        const handOutline = this.add
          .rectangle(handX, handY, CARD_WIDTH, CARD_HEIGHT)
          .setStrokeStyle(2, isLocalPlayer ? 0xaaaaaa : 0x777777, 0.8)
          .setDepth(0); // Behind cards
        handSlotOutlines.push(handOutline);

        const bfX = this.calculateSlotX(i);
        const bfY = isLocalPlayer
          ? BATTLEFIELD_Y_PLAYER
          : BATTLEFIELD_Y_OPPONENT;
        const bfOutline = this.add
          .rectangle(bfX, bfY, CARD_WIDTH, CARD_HEIGHT)
          .setStrokeStyle(2, isLocalPlayer ? 0xffffff : 0xaaaaaa, 1)
          .setDepth(0); // Behind cards
        battlefieldSlotOutlines.push(bfOutline);
      }

      this.playerVisuals.set(sessionId, {
        hand: new Map(),
        battlefield: new Map(),
        handSlotOutlines,
        battlefieldSlotOutlines,
      });
    }
  }

  private removePlayerVisuals(sessionId: string) {
    const visuals = this.playerVisuals.get(sessionId);
    if (visuals) {
      visuals.hand.forEach((container) => container.destroy());
      visuals.battlefield.forEach((container) => container.destroy());
      visuals.handSlotOutlines.forEach((outline) => outline.destroy());
      visuals.battlefieldSlotOutlines.forEach((outline) => outline.destroy());
    }
    this.playerVisuals.delete(sessionId);
  }

  private updateCardVisual(
    sessionId: string,
    area: "hand" | "battlefield",
    slotKey: string,
    cardSchema: CardInstanceSchema
  ) {
    if (!this.scene.isActive()) return;
    this.removeCardVisual(sessionId, area, slotKey); // Remove old one if exists

    const playerVisuals = this.playerVisuals.get(sessionId);
    if (!playerVisuals) return;

    const isLocalPlayer = sessionId === colyseusRoom?.sessionId;
    const x = this.calculateSlotX(parseInt(slotKey, 10));
    let y: number;
    let isObscured = false;

    if (area === "hand") {
      y = isLocalPlayer ? HAND_Y_PLAYER : HAND_Y_OPPONENT;
      if (!isLocalPlayer) isObscured = true;
    } else {
      // battlefield
      y = isLocalPlayer ? BATTLEFIELD_Y_PLAYER : BATTLEFIELD_Y_OPPONENT;
    }

    const cardContainer = this.createCardGameObject(
      cardSchema,
      x,
      y,
      isObscured,
      isLocalPlayer
    );
    cardContainer.setData("instanceId", cardSchema.instanceId);
    cardContainer.setData("slotKey", slotKey); // Store original slotKey
    cardContainer.setData("area", area); // Store original area
    cardContainer.setData("ownerSessionId", sessionId); // Store owner
    cardContainer.setDepth(1); // Ensure cards are rendered above default depth 0 elements

    // Apply dead style if HP is 0 or less initially
    if (cardSchema.currentHp <= 0) {
        cardContainer.setAlpha(0.6);
        const bg = cardContainer.getData('backgroundRectangle') as Phaser.GameObjects.Rectangle;
        if (bg && bg.active && typeof bg.setTint === 'function') {
            bg.setTint(0x777777);
        }
        const hpText = cardContainer.getData("hpTextObject") as Phaser.GameObjects.Text;
        if (hpText && hpText.active) hpText.setColor("#ff0000");
    }

    if (area === "hand") {
      playerVisuals.hand.set(slotKey, cardContainer);
    } else {
      playerVisuals.battlefield.set(slotKey, cardContainer);
    }
  
    // Make card interactive if it belongs to the local player
    if (isLocalPlayer) {
      this.makeCardInteractive(cardContainer);
    }
  }

  private removeCardVisual(
    sessionId: string,
    area: "hand" | "battlefield",
    slotKey: string
  ) {
    const playerVisuals = this.playerVisuals.get(sessionId);
    if (playerVisuals) {
      const mapArea =
        area === "hand" ? playerVisuals.hand : playerVisuals.battlefield;
      const existingVisual = mapArea.get(slotKey);
      if (existingVisual) {
        if (existingVisual.input && existingVisual.input.enabled) {
            this.input.disable(existingVisual); // Disable input before destroying
        }
        // Defer destruction to prevent errors if the object is still in an input queue
        this.time.delayedCall(1, () => {
            if (existingVisual.active) { // Check if still active before destroying
                existingVisual.destroy();
            }
        });
        mapArea.delete(slotKey);
      }
    }
  }

  private calculateSlotX(slotIndex: number): number {
    const totalWidthAllSlots = 5 * CARD_WIDTH + 4 * SLOT_SPACING;
    const startX =
      (this.cameras.main.width - totalWidthAllSlots) / 2 + CARD_WIDTH / 2;
    return startX + slotIndex * (CARD_WIDTH + SLOT_SPACING);
  }

  private createCardGameObject(
    cardSchema: CardInstanceSchema,
    x: number,
    y: number,
    isObscured: boolean,
    isLocalPlayer: boolean
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    if (isObscured) {
      const cardBack = this.add.image(0, 0, "cardBack").setOrigin(0.5);
      container.add(cardBack);
      return container;
    }

    const cardBaseData = this.cardDataCache?.find(
      (c) => c.id === cardSchema.cardId
    );

    const bgColor = isLocalPlayer ? 0x444488 : 0x884444; // Blue for player, Red for opponent
    const cardBackground = this.add
      .rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, bgColor)
      .setOrigin(0.5);
    cardBackground.setStrokeStyle(2, 0xffffff);
    container.add(cardBackground);
    container.setData('backgroundRectangle', cardBackground); // Store for tinting

    const nameText = this.add
      .text(0, -CARD_HEIGHT / 2 + 10, cardSchema.name, {
        fontFamily: "Arial",
        fontSize: 12,
        color: "#ffffff",
        align: "center",
        wordWrap: { width: CARD_WIDTH - 10 },
      })
      .setOrigin(0.5, 0);
    container.add(nameText);

    const statsText = this.add
      .text(0, 0, `A: ${cardSchema.attack} S: ${cardSchema.speed}`, {
        fontFamily: "Arial",
        fontSize: 11,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);
    container.add(statsText);

    const hpText = this.add
      .text(
        0,
        CARD_HEIGHT / 2 - 15,
        `HP: ${cardSchema.currentHp}/${cardSchema.health}`,
        {
          fontFamily: "Arial",
          fontSize: 12,
          color: "#00ff00",
          align: "center",
        }
      )
      .setOrigin(0.5, 1);
    container.add(hpText);
    // Store hpText on container for Battle scene to update easily
    container.setData("hpTextObject", hpText);

    // Add Cooldown Bar elements (initially invisible)
    const cooldownBarBg = this.add.rectangle(0, CARD_HEIGHT / 2 - 5, CARD_WIDTH - 10, 6, 0x000000, 0.5).setVisible(false); // Background for cooldown
    const cooldownBarFill = this.add.rectangle(-(CARD_WIDTH - 10)/2, CARD_HEIGHT / 2 - 5, CARD_WIDTH - 10, 6, 0x44ff44).setOrigin(0, 0.5).setVisible(false); // Fill for cooldown
    container.add(cooldownBarBg);
    container.add(cooldownBarFill);
    container.setData('cooldownBarBg', cooldownBarBg);
    container.setData('cooldownBarFill', cooldownBarFill);
    container.setData('attackCooldownTimer', 0);
    container.setData('maxAttackCooldown', 0);

    // Add cost if it's a player's hand card and not in Battle phase
    if (cardBaseData && isLocalPlayer && this.currentPhase !== Phase.Battle && this.currentPhase !== Phase.BattleEnd) {
      // Only show cost for local player's cards for now, and not during battle phases
      const costText = this.add
        .text(
          CARD_WIDTH / 2 - 10,
          -CARD_HEIGHT / 2 + 10,
          `${cardBaseData.brewCost}B`,
          {
            fontFamily: "Arial",
            fontSize: 12,
            color: "#ffff00",
            align: "right",
          }
        )
        .setOrigin(1, 0);
      container.add(costText);
    }

    return container;
  }

  public getCardGameObjectByInstanceId(
    instanceId: string
  ): Phaser.GameObjects.Container | undefined {
    for (const [_sessionId, playerData] of this.playerVisuals) {
      for (const [_slotKey, cardObject] of playerData.hand) {
        if (cardObject.getData("instanceId") === instanceId) return cardObject;
      }
      for (const [_slotKey, cardObject] of playerData.battlefield) {
        if (cardObject.getData("instanceId") === instanceId) return cardObject;
      }
    }
    return undefined;
  }

  public getSlotPixelPosition(
    isLocalPlayer: boolean,
    area: "hand" | "battlefield",
    slotIndex: number
  ): { x: number; y: number } | undefined {
    if (slotIndex < 0 || slotIndex > 4) return undefined;

    const x = this.calculateSlotX(slotIndex);
    let y: number;

    if (area === "hand") {
      y = isLocalPlayer ? HAND_Y_PLAYER : HAND_Y_OPPONENT;
    } else {
      // battlefield
      y = isLocalPlayer ? BATTLEFIELD_Y_PLAYER : BATTLEFIELD_Y_OPPONENT;
    }
    return { x, y };
  }
  
  private makeCardInteractive(cardContainer: Phaser.GameObjects.Container) {
    const hitAreaRectangle = new Phaser.Geom.Rectangle(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT
    );
    cardContainer.setInteractive({
      hitArea: hitAreaRectangle,
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    this.input.setDraggable(cardContainer);
    // Explicitly ensure input is enabled for the draggable card container
    if (cardContainer.input) {
        cardContainer.input.enabled = true;
    }

    cardContainer.on('dragstart', (pointer: Phaser.Input.Pointer) => {
    // Guard: Only allow drag actions if in Shop or Preparation phase
    if (this.currentPhase !== Phase.Shop && this.currentPhase !== Phase.Preparation) {
      // If drag is not allowed for the current phase, simply return.
      // Do not modify cardContainer.input.draggable here.
      // The card remains draggable by Phaser's definition, but our custom dragstart logic won't run.
      return;
    }
    
    // If drag is allowed (Shop or Preparation phase):
    // Ensure the object still has an active input handler before proceeding
    if (!cardContainer.input || !cardContainer.input.enabled) {
        return;
    }

    this.children.bringToTop(cardContainer);
    cardContainer.setAlpha(0.7);
    cardContainer.setData('isDragging', true);
    cardContainer.setData('originalX', cardContainer.x);
    cardContainer.setData('originalY', cardContainer.y);
    // Store original area and slot key at the start of the drag
    cardContainer.setData('originalAreaOnDragStart', cardContainer.getData('area'));
    cardContainer.setData('originalSlotKeyOnDragStart', cardContainer.getData('slotKey'));
    // Original area and slotKey are already set in cardContainer.data when it's created/updated
  });

    cardContainer.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (cardContainer.getData('isDragging')) {
        cardContainer.x = dragX;
        cardContainer.y = dragY;
      }
    });

    cardContainer.on('dragend', (pointer: Phaser.Input.Pointer) => {
      if (!cardContainer.getData('isDragging')) return;
  
      cardContainer.setAlpha(1.0);
      cardContainer.setData('isDragging', false);
  
      const instanceId = cardContainer.getData('instanceId') as string;
      // Use the area and slotKey stored at the beginning of the drag for updating visual maps
      const originalArea = cardContainer.getData('originalAreaOnDragStart') as 'hand' | 'battlefield';
      const originalSlotKey = cardContainer.getData('originalSlotKeyOnDragStart') as string;
      const ownerSessionId = cardContainer.getData('ownerSessionId') as string;
  
      let dropped = false;
      let newAreaForServer: 'hand' | 'battlefield' | undefined;
      let newSlotKeyForServer: string | undefined;
  
      // Check drop on local player's hand slots
      for (let i = 0; i < 5; i++) {
        const targetSlotKey = String(i);
        const slotPos = this.getSlotPixelPosition(true, 'hand', i); // true for local player
        if (slotPos) {
          const dropZone = new Phaser.Geom.Rectangle(slotPos.x - CARD_WIDTH / 2, slotPos.y - CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
          if (Phaser.Geom.Rectangle.Contains(dropZone, cardContainer.x, cardContainer.y)) {
            if (this.isSlotEmpty(ownerSessionId, 'hand', targetSlotKey, instanceId)) {
              if (this.currentPhase === Phase.Shop || this.currentPhase === Phase.Preparation) {
                // Valid drop in hand
                cardContainer.x = slotPos.x;
                cardContainer.y = slotPos.y;
                cardContainer.setData('area', 'hand');
                cardContainer.setData('slotKey', targetSlotKey);
                this.updateVisualMaps(ownerSessionId, originalArea, originalSlotKey, 'hand', targetSlotKey, cardContainer);
                dropped = true;
                newAreaForServer = 'hand';
                newSlotKeyForServer = targetSlotKey;
  
                if (this.currentPhase === Phase.Shop && (originalArea !== 'hand' || originalSlotKey !== targetSlotKey)) {
                   colyseusRoom?.send("moveCardInHand", { instanceId, fromSlotKey: originalSlotKey, toSlotKey: targetSlotKey });
                }
                // For Prep phase, real-time update will be sent below
              }
            }
            break;
          }
        }
      }
  
      // Check drop on local player's battlefield slots (only if in Preparation phase)
      if (!dropped && this.currentPhase === Phase.Preparation) {
        for (let i = 0; i < 5; i++) {
          const targetSlotKey = String(i);
          const slotPos = this.getSlotPixelPosition(true, 'battlefield', i); // true for local player
          if (slotPos) {
            const dropZone = new Phaser.Geom.Rectangle(slotPos.x - CARD_WIDTH / 2, slotPos.y - CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
            if (Phaser.Geom.Rectangle.Contains(dropZone, cardContainer.x, cardContainer.y)) {
              if (this.isSlotEmpty(ownerSessionId, 'battlefield', targetSlotKey, instanceId)) {
                // Valid drop on battlefield
                cardContainer.x = slotPos.x;
                cardContainer.y = slotPos.y;
                cardContainer.setData('area', 'battlefield');
                cardContainer.setData('slotKey', targetSlotKey);
                this.updateVisualMaps(ownerSessionId, originalArea, originalSlotKey, 'battlefield', targetSlotKey, cardContainer);
                dropped = true;
                newAreaForServer = 'battlefield';
                newSlotKeyForServer = targetSlotKey;
                // Preparation.ts will read the final layout for its own send, this is for real-time sync
              }
              break;
            }
          }
        }
      }
  
      if (!dropped) {
        cardContainer.x = cardContainer.getData('originalX');
        cardContainer.y = cardContainer.getData('originalY');
        // Reset area and slotKey to original if not dropped successfully
        cardContainer.setData('area', originalArea);
        cardContainer.setData('slotKey', originalSlotKey);
      } else {
        // If dropped successfully and in Preparation phase, send update to server
        if (this.currentPhase === Phase.Preparation && newAreaForServer && newSlotKeyForServer) {
          // Only send if it actually moved to a new logical slot
          if (originalArea !== newAreaForServer || originalSlotKey !== newSlotKeyForServer) {
              colyseusRoom?.send("updatePrepLayout", {
                  instanceId,
                  newArea: newAreaForServer,
                  newSlotKey: newSlotKeyForServer
              });
          }
        }
      }
  
      // Notify Preparation scene if it's active and phase is Prep, so it can update button state
      if (this.currentPhase === Phase.Preparation) {
        const prepScene = this.scene.get('Preparation');
        if (prepScene && prepScene.scene.isActive() && (prepScene as any).updateStartButtonState) {
            (prepScene as any).updateStartButtonState();
        }
      }
    });
  }
    
  // Add the new getCardLayouts method
  public getCardLayouts(): { handLayout: { [key: string]: string | null }, battlefieldLayout: { [key: string]: string | null } } {
    const handLayout: { [key: string]: string | null } = {};
    const battlefieldLayout: { [key: string]: string | null } = {};
  
    if (!colyseusRoom || !colyseusRoom.sessionId) {
      // Initialize with nulls if room is not available
      for (let i = 0; i < 5; i++) {
        handLayout[String(i)] = null;
        battlefieldLayout[String(i)] = null;
      }
      return { handLayout, battlefieldLayout };
    }
  
    const localPlayerId = colyseusRoom.sessionId;
    const playerVisuals = this.playerVisuals.get(localPlayerId);
  
    for (let i = 0; i < 5; i++) {
      const slotKey = String(i);
      // Hand layout
      if (playerVisuals && playerVisuals.hand.has(slotKey)) {
        const cardContainer = playerVisuals.hand.get(slotKey);
        handLayout[slotKey] = cardContainer?.getData('instanceId') as string || null;
      } else {
        handLayout[slotKey] = null;
      }
  
      // Battlefield layout
      if (playerVisuals && playerVisuals.battlefield.has(slotKey)) {
        const cardContainer = playerVisuals.battlefield.get(slotKey);
        battlefieldLayout[slotKey] = cardContainer?.getData('instanceId') as string || null;
      } else {
        battlefieldLayout[slotKey] = null;
      }
    }
    return { handLayout, battlefieldLayout };
  }
  
  private isSlotEmpty(sessionId: string, area: 'hand' | 'battlefield', slotKey: string, draggedInstanceId: string): boolean {
    const playerVisuals = this.playerVisuals.get(sessionId);
    if (!playerVisuals) return false; // Should not happen for local player
  
    const targetMap = area === 'hand' ? playerVisuals.hand : playerVisuals.battlefield;
    const occupantCard = targetMap.get(slotKey);
  
    if (!occupantCard) return true; // Slot is visually empty
    // Slot is occupied, check if it's the card being dragged (e.g., dragged slightly but still over its original slot)
    return occupantCard.getData('instanceId') === draggedInstanceId;
  }
  
  private updateVisualMaps(
    sessionId: string,
    originalArea: 'hand' | 'battlefield',
    originalSlotKey: string,
    newArea: 'hand' | 'battlefield',
    newSlotKey: string,
    cardContainer: Phaser.GameObjects.Container // This is the card being moved
  ) {
    const playerVisuals = this.playerVisuals.get(sessionId);
    if (!playerVisuals) return;

    // Remove from original map entry if it's indeed this cardContainer
    const originalMap = originalArea === 'hand' ? playerVisuals.hand : playerVisuals.battlefield;
    if (originalMap.get(originalSlotKey) === cardContainer) {
        originalMap.delete(originalSlotKey);
    }
    
    // Add to new map entry.
    // The isSlotEmpty method should have ensured that if newMap.get(newSlotKey) exists,
    // it's either cardContainer itself (dropped back to original slot) or the slot was empty.
    // Thus, we don't need to handle destroying a *different* card here.
    const newMap = newArea === 'hand' ? playerVisuals.hand : playerVisuals.battlefield;
    newMap.set(newSlotKey, cardContainer);
  }
  
  public getPlayerCardGameObjects(
    sessionId: string
  ): Phaser.GameObjects.Container[] {
    const cardObjects: Phaser.GameObjects.Container[] = [];
    const visuals = this.playerVisuals.get(sessionId);
    if (visuals) {
      visuals.hand.forEach((cardContainer) => cardObjects.push(cardContainer));
      visuals.battlefield.forEach((cardContainer) =>
        cardObjects.push(cardContainer)
      );
    }
    return cardObjects;
  }
  
  public getLocalPlayerLayoutData(): Array<{ instanceId: string, area: 'hand' | 'battlefield', slotKey: string }> {
    const layoutData: Array<{ instanceId: string, area: 'hand' | 'battlefield', slotKey: string }> = [];
    if (!colyseusRoom || !colyseusRoom.sessionId) return layoutData;
  
    const localPlayerId = colyseusRoom.sessionId;
    const playerVisuals = this.playerVisuals.get(localPlayerId);
  
    if (playerVisuals) {
      playerVisuals.hand.forEach((cardContainer, slotKey) => {
        layoutData.push({
          instanceId: cardContainer.getData('instanceId') as string,
          area: 'hand',
          slotKey: cardContainer.getData('slotKey') as string, // Use the current data slotKey
        });
      });
      playerVisuals.battlefield.forEach((cardContainer, slotKey) => {
        layoutData.push({
          instanceId: cardContainer.getData('instanceId') as string,
          area: 'battlefield',
          slotKey: cardContainer.getData('slotKey') as string, // Use the current data slotKey
        });
      });
    }
    return layoutData;
  }
  
  private updateNavbarText() {
    if (
      !colyseusRoom ||
      !colyseusRoom.state ||
      !this.playerHealthText ||
      !this.playerHealthText.active
    )
      return; // Ensure elements are valid

    const myPlayerId = colyseusRoom.sessionId;
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    let opponentState: PlayerState | undefined;
    let opponentName = "Opponent: --";

    colyseusRoom.state.players.forEach((player, sessionId) => {
      if (sessionId !== myPlayerId) {
        opponentState = player;
        opponentName = `Opponent: ${player.username || "Connecting..."}`;
      }
    });

    this.playerHealthText.setText(`You: ${myPlayerState?.health ?? "--"} HP`);
    this.playerBrewsText.setText(`Brews: ${myPlayerState?.brews ?? "--"}`);

    this.opponentUsernameText.setText(opponentName);
    this.opponentHealthText.setText(`${opponentState?.health ?? "--"} HP`);

    const day = colyseusRoom.state.currentDay;
    const phase = colyseusRoom.state.currentPhase;
    this.dayPhaseText.setText(`Day ${day} - ${phase}`);
  }

  shutdown() {
    console.log("BoardView shutting down...");
    this.listeners.forEach((unsub) => unsub());
    this.listeners = [];
    this.playerVisuals.forEach((areas) => {
      areas.hand.forEach((container) => container.destroy());
      areas.battlefield.forEach((container) => container.destroy());
    });
    this.playerVisuals.clear();

    this.playerHealthText?.destroy();
    this.opponentHealthText?.destroy();
    this.playerBrewsText?.destroy();
    this.dayPhaseText?.destroy();
    this.opponentUsernameText?.destroy();
  }
}