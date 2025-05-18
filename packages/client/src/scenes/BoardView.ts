import { Scene } from "phaser";
import {
  colyseusRoom,
  globalCardDataCache,
  CardData,
} from "../utils/colyseusClient";
import {
  ClientGameState, // Use ClientGameState if needed for full state typing
  ClientPlayerState,
  ClientCardInstance,
  Phase,
} from "../schemas/ClientSchemas"; // Adjust path
import { getStateCallbacks } from "colyseus.js";

// Remove CardUIData as ClientCardInstance can be used
// interface CardUIData {
//   id: string;
//   name: string;
//   attack: number;
//   speed: number;
//   health: number;
//   brewCost: number;
//   description: string;
//   isLegend: boolean;
//   currentHp?: number;
//   instanceId?: string;
// }

const MINION_CARD_WIDTH = 100;
const MINION_CARD_HEIGHT = 140;
const FULL_CARD_WIDTH = 120;
const FULL_CARD_HEIGHT = 168;
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

  // Add sell zone properties
  private sellZone!: Phaser.GameObjects.Container;
  private sellZoneRect!: Phaser.GameObjects.Rectangle;
  private sellZoneText!: Phaser.GameObjects.Text;
  private brewGainText!: Phaser.GameObjects.Text;

  // Navbar elements
  private playerHealthText!: Phaser.GameObjects.Text;
  private opponentHealthText!: Phaser.GameObjects.Text;
  private playerBrewsText!: Phaser.GameObjects.Text;
  private dayPhaseText!: Phaser.GameObjects.Text;
  private opponentUsernameText!: Phaser.GameObjects.Text; // For opponent's name

  // Listeners
  private listeners: Array<() => void> = [];
  private cardSchemaListeners: Map<string, Array<() => void>> = new Map(); // Added: For card-specific schema listeners

  constructor() {
    super("BoardView");
  }

  private updateCardHpVisuals(
    cardContainer: Phaser.GameObjects.Container,
    currentHp: number,
    maxHealth: number
  ) {
    if (!cardContainer || !cardContainer.active) return;

    const hpText = cardContainer.getData(
      "hpTextObject"
    ) as Phaser.GameObjects.Text;
    const mainCardImage = cardContainer.getData(
      "mainCardImage"
    ) as Phaser.GameObjects.Image; // Changed from backgroundRectangle

    if (hpText && hpText.active) {
      hpText.setText(`${currentHp}/${maxHealth}`);
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
      if (!isVisuallyDead) {
        // Apply death visuals if not already applied
        cardContainer.setAlpha(0.6);
        if (
          mainCardImage &&
          mainCardImage.active &&
          typeof mainCardImage.setTint === "function"
        ) {
          // Check mainCardImage
          mainCardImage.setTint(0x777777);
        }
      }
    } else {
      // currentHp > 0
      if (isVisuallyDead) {
        // Apply alive visuals if it was visually dead
        cardContainer.setAlpha(1.0);
        if (
          mainCardImage &&
          mainCardImage.active &&
          typeof mainCardImage.clearTint === "function"
        ) {
          // Check mainCardImage
          mainCardImage.clearTint();
        } else if (mainCardImage && mainCardImage.active) {
          console.warn(
            "BoardView: updateCardHpVisuals - clearTint method not found on mainCardImage for card.",
            cardContainer.getData("instanceId"),
            mainCardImage
          );
        }
      }
    }
  }

  preload() {
    if (!this.textures.exists("cardBack")) {
      // Create a simple texture for card back if it doesn't exist
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x502a7e); // Dark purple
      graphics.fillRect(0, 0, FULL_CARD_WIDTH, FULL_CARD_HEIGHT);
      graphics.lineStyle(2, 0xbda4d5); // Light purple border
      graphics.strokeRect(0, 0, FULL_CARD_WIDTH, FULL_CARD_HEIGHT);
      graphics.generateTexture("cardBack", FULL_CARD_WIDTH, FULL_CARD_HEIGHT);
      graphics.destroy();
    }
  }

  create() {
    console.log("BoardView creating...");
    this.createNavbar();
    this.createSellZone(); // Add this line to create the sell zone
    this.setupColyseusListeners();
    // Ensure this scene is rendered below other UI scenes like Shop, Prep, Battle
    // this.scene.sendToBack(); // REMOVE THIS LINE
    // The Background scene will send itself to back.
    // Active phase scenes (Shop, Prep, Battle) will bring themselves to the top.
    // BoardView should sit between them.

    // Register shutdown event listener
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
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
      .text(gameWidth * 0.05, navbarY, `You: -- HP`, {
        ...navTextStyle,
        color: "#00ff00",
      }) // Dynamic X
      .setOrigin(0, 0.5) // Adjusted origin for left alignment
      .setDepth(1001);
    this.playerBrewsText = this.add
      .text(gameWidth * 0.95, navbarY, `Brews: --`, {
        // Dynamic X
        ...navTextStyle,
        color: "#ffff00",
        align: "right",
      })
      .setOrigin(1, 0.5) // Adjusted origin for right alignment
      .setDepth(1001);

    this.opponentUsernameText = this.add
      .text(gameWidth * 0.25, navbarY - 10, `Opponent: --`, {
        // Dynamic X
        ...navTextStyle,
        fontSize: 14,
      })
      .setOrigin(0, 0.5) // Adjusted origin for left alignment
      .setDepth(1001);
    this.opponentHealthText = this.add
      .text(gameWidth * 0.25, navbarY + 10, `-- HP`, {
        ...navTextStyle,
        color: "#ff0000",
      }) // Dynamic X
      .setOrigin(0, 0.5) // Adjusted origin for left alignment
      .setDepth(1001);

    this.dayPhaseText = this.add
      .text(centerX, navbarY, `Day -- - Phase --`, {
        // Remains centered
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
        ease: "Sine.easeInOut",
      });
    }
  }

  private showDamageNumber(targetInstanceId: string, damage: number) {
    const targetContainer =
      this.getCardGameObjectByInstanceId(targetInstanceId);
    if (targetContainer && targetContainer.active && damage > 0) {
      const damageText = this.add
        .text(
          targetContainer.x + Phaser.Math.Between(-10, 10),
          targetContainer.y - FULL_CARD_HEIGHT / 2 - 10, // Above the card
          `-${damage}`,
          {
            fontFamily: "Arial Black",
            fontSize: 24,
            color: "#ff0000", // Red for damage
            stroke: "#000000",
            strokeThickness: 4,
          }
        )
        .setOrigin(0.5)
        .setDepth(targetContainer.depth + 1); // Ensure damage text is above card

      this.tweens.add({
        targets: damageText,
        y: damageText.y - 50, // Float up
        alpha: 0, // Fade out
        duration: 1000,
        ease: "Power1",
        onComplete: () => {
          damageText.destroy();
        },
      });
    }
  }

  private drawAttackLine(attackerInstanceId: string, targetInstanceId: string) {
    const attackerContainer =
      this.getCardGameObjectByInstanceId(attackerInstanceId);
    const targetContainer =
      this.getCardGameObjectByInstanceId(targetInstanceId);

    if (
      attackerContainer &&
      attackerContainer.active &&
      targetContainer &&
      targetContainer.active
    ) {
      const line = this.add
        .line(
          0,
          0,
          attackerContainer.x,
          attackerContainer.y,
          targetContainer.x,
          targetContainer.y,
          0xff3333, // Bright red
          0.7
        )
        .setOrigin(0, 0)
        .setLineWidth(2)
        .setDepth(attackerContainer.depth); // Same depth or slightly above slots

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
    const $ = getStateCallbacks(colyseusRoom!);

    this.listeners.push(
      $(colyseusRoom.state).listen("currentDay", () => this.updateNavbarText())
    );
    this.listeners.push(
      $(colyseusRoom.state).listen("currentPhase", (newPhase, oldPhase) => {
        // Added oldPhase
        this.currentPhase = newPhase as Phase; // Update currentPhase
        this.updateNavbarText();

        // Show/hide sell zone based on phase
        if (newPhase === Phase.Shop || newPhase === Phase.Preparation) {
          this.sellZone.setVisible(true);
        } else {
          this.sellZone.setVisible(false);
        }

        const processCardVisualsPostBattle = (
          cardContainer: Phaser.GameObjects.Container,
          cardSchema: any | undefined,
          ownerSessionId: string,
          slotKey: string
        ) => {
          if (!cardContainer.active) return;

          const cooldownBarBg = cardContainer.getData(
            "cooldownBarBg"
          ) as Phaser.GameObjects.Rectangle;
          const cooldownBarFill = cardContainer.getData(
            "cooldownBarFill"
          ) as Phaser.GameObjects.Rectangle;

          if (newPhase === Phase.Battle) {
            const cardArea = cardContainer.getData("area");
            if (cardArea === "battlefield") {
              if (cardSchema) {
                if (cooldownBarBg && cooldownBarFill) {
                  cooldownBarBg.setVisible(true);
                  cooldownBarFill.setVisible(true);

                  // Get the cooldown bar width from the card's data or use a fallback
                  const storedWidth = cardContainer.getData(
                    "cooldownBarBaseWidth"
                  );
                  const cooldownBarBaseWidth =
                    typeof storedWidth === "number"
                      ? storedWidth
                      : MINION_CARD_WIDTH - 10;
                  cooldownBarFill.setSize(cooldownBarBaseWidth, 6); // Use the retrieved width value

                  const maxCooldown =
                    (cardSchema.speed > 0 ? cardSchema.speed : 1.5) * 1000;
                  cardContainer.setData("maxAttackCooldown", maxCooldown);
                  cardContainer.setData("attackCooldownTimer", maxCooldown);
                } else {
                  console.warn(
                    `BoardView: Battle Phase - Card ${
                      cardSchema.instanceId
                    } (Owner: ${ownerSessionId}, Slot: ${slotKey}) missing cooldown bar elements in data. Bg: ${!!cooldownBarBg}, Fill: ${!!cooldownBarFill}`
                  );
                }
              } else {
                console.warn(
                  `BoardView: Battle Phase - Battlefield card container (Owner: ${ownerSessionId}, Slot: ${slotKey}) has no cardSchema. No cooldown bar shown.`
                );
              }
            } else {
              // This case should ideally not happen if we are iterating only battlefield cards, but good for diagnostics
              // console.warn(`BoardView: Battle Phase - Card container (Owner: ${ownerSessionId}, Slot: ${slotKey}) has area '${cardArea}' instead of 'battlefield'. No cooldown bar shown.`);
            }
          } else {
            // Not in Battle phase
            if (cooldownBarBg) cooldownBarBg.setVisible(false);
            if (cooldownBarFill) cooldownBarFill.setVisible(false);
          }

          // Reset visuals if transitioning out of battle phases
          if (oldPhase === Phase.Battle || oldPhase === Phase.BattleEnd) {
            if (newPhase !== Phase.Battle && newPhase !== Phase.BattleEnd) {
              if (cardSchema && cardSchema.currentHp > 0) {
                // Only reset if alive
                cardContainer.setAlpha(1.0);
                const mainCardImage = cardContainer.getData(
                  // Changed from bgRect
                  "mainCardImage"
                ) as Phaser.GameObjects.Image;
                if (
                  mainCardImage &&
                  mainCardImage.active &&
                  typeof mainCardImage.clearTint === "function"
                ) {
                  mainCardImage.clearTint();
                }
              }
              // If cardSchema.currentHp <= 0, it should already be tinted/dimmed by HP listener
            }
          }
        };

        this.playerVisuals.forEach((playerData, playerId) => {
          playerData.battlefield.forEach((cardContainer, slotKey) => {
            const cardSchema = colyseusRoom?.state.players
              .get(playerId)
              ?.battlefield.get(slotKey) as ClientCardInstance | undefined; // Use ClientCardInstance
            processCardVisualsPostBattle(
              cardContainer,
              cardSchema,
              playerId,
              slotKey
            );
          });
          // Hand cards generally don't have cooldown bars or battle-specific states other than HP
          playerData.hand.forEach((cardContainer, slotKey) => {
            const cardSchema = colyseusRoom?.state.players
              .get(playerId)
              ?.hand.get(slotKey) as ClientCardInstance | undefined; // Use ClientCardInstance
            // Process hand cards if they need any visual reset (e.g. if they could be 'dead' visually)
            if (oldPhase === Phase.Battle || oldPhase === Phase.BattleEnd) {
              if (newPhase !== Phase.Battle && newPhase !== Phase.BattleEnd) {
                if (cardSchema && cardSchema.currentHp > 0) {
                  cardContainer.setAlpha(1.0);
                  const mainCardImage = cardContainer.getData(
                    // Changed from bgRect
                    "mainCardImage"
                  ) as Phaser.GameObjects.Image;
                  if (
                    mainCardImage &&
                    mainCardImage.active &&
                    typeof mainCardImage.clearTint === "function"
                  ) {
                    mainCardImage.clearTint();
                  }
                }
              }
            }
          });
        });
      })
    );

    this.listeners.push(
      $(colyseusRoom.state.players).onAdd(
        (player: ClientPlayerState, sessionId: string) => {
          console.log(`BoardView: Player added ${sessionId}`);
          this.addPlayerVisuals(sessionId);
          this.addPlayerListeners(player, sessionId);
          this.updatePlayerSlots(player, sessionId); // Initial population
          this.updateNavbarText(); // Update opponent name if they joined
        }
      )
    );

    this.listeners.push(
      $(colyseusRoom.state.players).onRemove(
        (player: ClientPlayerState, sessionId: string) => {
          console.log(`BoardView: Player removed ${sessionId}`);
          this.removePlayerVisuals(sessionId);
          this.updateNavbarText(); // Update opponent name if they left
        }
      )
    );

    // Listener for battle attack events
    this.listeners.push(
      colyseusRoom.onMessage(
        "battleAttackEvent",
        (message: {
          attackerInstanceId: string;
          targetInstanceId: string;
          damageDealt: number;
          attackerPlayerId: string;
          targetPlayerId: string;
        }) => {
          if (this.currentPhase !== Phase.Battle || !this.scene.isActive())
            return;
          console.log("BoardView: Received battleAttackEvent", message);

          // Check if the attacker and target are still visually present
          const attackerCard = this.getCardGameObjectByInstanceId(
            message.attackerInstanceId
          );
          const targetCard = this.getCardGameObjectByInstanceId(
            message.targetInstanceId
          );

          if (
            attackerCard &&
            attackerCard.active &&
            targetCard &&
            targetCard.active
          ) {
            this.drawAttackLine(
              message.attackerInstanceId,
              message.targetInstanceId
            );
            this.showAttackAnimation(message.attackerInstanceId);
            // Server will send HP update, which will trigger its own visual update for HP text and death.
            // We can show damage number here for immediate feedback.
            this.showDamageNumber(
              message.targetInstanceId,
              message.damageDealt
            );

            // Reset attacker's visual cooldown timer
            const attackerMaxCooldown = attackerCard.getData(
              "maxAttackCooldown"
            ) as number;
            if (attackerMaxCooldown > 0) {
              attackerCard.setData("attackCooldownTimer", attackerMaxCooldown);
              const fillBar = attackerCard.getData(
                "cooldownBarFill"
              ) as Phaser.GameObjects.Rectangle;
              const attackerCooldownBarBaseWidth =
                (attackerCard.getData("cooldownBarBaseWidth") as number) ||
                MINION_CARD_WIDTH - 10; // Fallback
              if (fillBar) fillBar.setSize(attackerCooldownBarBaseWidth, 6); // Reset fill bar to full using setSize
            }

            // Client-side visual update for target card's HP
            const targetCardOwnerId = targetCard.getData(
              "ownerSessionId"
            ) as string;
            const targetCardSlotKey = targetCard.getData("slotKey") as string;
            const targetCardArea = targetCard.getData("area") as
              | "hand"
              | "battlefield";

            if (
              targetCardOwnerId === message.targetPlayerId &&
              targetCardArea === "battlefield" &&
              targetCardSlotKey
            ) {
              const targetPlayer = colyseusRoom!.state.players.get(
                message.targetPlayerId
              ) as ClientPlayerState | undefined;
              const cardSchema =
                targetPlayer?.battlefield.get(targetCardSlotKey);

              // Verify instanceId matches, as schema in map might have changed if card moved (unlikely during attack)
              if (
                cardSchema &&
                cardSchema.instanceId === message.targetInstanceId
              ) {
                const newVisualHp = Math.max(
                  0,
                  cardSchema.currentHp - message.damageDealt
                );
                this.updateCardHpVisuals(
                  targetCard,
                  newVisualHp,
                  cardSchema.health
                );
              } else {
                console.warn(
                  `BoardView: battleAttackEvent - Target card schema not found or instanceId mismatch for player ${message.targetPlayerId}, slot ${targetCardSlotKey}, instance ${message.targetInstanceId}.`
                );
              }
            } else {
              console.warn(
                `BoardView: battleAttackEvent - Target card container data inconsistent or not on battlefield. Owner: ${targetCardOwnerId}, Area: ${targetCardArea}, Slot: ${targetCardSlotKey}`
              );
            }
          } else {
            console.warn(
              "BoardView: Attacker or target not found/active for battleAttackEvent",
              message
            );
          }
        }
      )
    );

    colyseusRoom.state.players.forEach(
      (player: ClientPlayerState, sessionId: string) => {
        this.addPlayerVisuals(sessionId);
        this.addPlayerListeners(player, sessionId);
        this.updatePlayerSlots(player, sessionId); // Initial population
      }
    );
    this.updateNavbarText(); // Initial navbar text
  }

  update(time: number, delta: number) {
    if (
      !this.scene.isActive() ||
      this.currentPhase !== Phase.Battle ||
      !colyseusRoom ||
      !colyseusRoom.state
    ) {
      return;
    }

    this.playerVisuals.forEach((playerData) => {
      playerData.battlefield.forEach((cardContainer) => {
        if (!cardContainer.active) return;

        const maxCooldown = cardContainer.getData(
          "maxAttackCooldown"
        ) as number;
        let currentTimer = cardContainer.getData(
          "attackCooldownTimer"
        ) as number;
        const cooldownBarBaseWidth =
          (cardContainer.getData("cooldownBarBaseWidth") as number) ||
          MINION_CARD_WIDTH - 10; // Fallback

        if (maxCooldown > 0) {
          // Only process if it has a valid cooldown
          currentTimer -= delta;
          if (currentTimer < 0) currentTimer = 0;
          cardContainer.setData("attackCooldownTimer", currentTimer);

          const cooldownBarFill = cardContainer.getData(
            "cooldownBarFill"
          ) as Phaser.GameObjects.Rectangle;
          if (cooldownBarFill && cooldownBarFill.visible) {
            const progress = currentTimer / maxCooldown;
            cooldownBarFill.setSize(
              cooldownBarBaseWidth * Math.max(0, progress),
              6
            ); // Use setSize
          }
        }
      });
    });
  }

  private addPlayerListeners(player: ClientPlayerState, sessionId: string) {
    const $ = getStateCallbacks(colyseusRoom!);
    const playerListeners: Array<() => void> = []; // Listeners specific to this player instance/schema

    playerListeners.push(
      $(player).listen("health", () => this.updateNavbarText())
    );
    playerListeners.push(
      $(player).listen("brews", () => this.updateNavbarText())
    );
    playerListeners.push(
      $(player).listen("username", () => this.updateNavbarText())
    );

    // Listen to additions/removals from hand
    playerListeners.push(
      // @ts-ignore
      $(player.hand).onAdd(
        (cardSchema: ClientCardInstance, slotKey: string) => {
          this.updateCardVisual(sessionId, "hand", slotKey, cardSchema);
          this.addCardSchemaListeners(cardSchema);
        }
      )
    );
    playerListeners.push(
      // @ts-ignore
      $(player.hand).onRemove(
        (cardSchema: ClientCardInstance, slotKey: string) => {
          // removeCardVisual will handle cleaning up cardSchemaListeners for this card
          this.removeCardVisual(sessionId, "hand", slotKey);
        }
      )
    );
    // Process existing cards in hand and add their schema listeners
    player.hand.forEach((cardSchema, slotKey) => {
      // updateCardVisual is called by updatePlayerSlots, which is called after addPlayerListeners
      // So, just add schema listeners here for existing cards.
      // updateCardVisual will be called for initial population.
      this.addCardSchemaListeners(cardSchema);
    });

    // Listen to additions/removals from battlefield
    playerListeners.push(
      // @ts-ignore
      $(player.battlefield).onAdd(
        (cardSchema: ClientCardInstance, slotKey: string) => {
          this.updateCardVisual(sessionId, "battlefield", slotKey, cardSchema);
          this.addCardSchemaListeners(cardSchema);
        }
      )
    );
    playerListeners.push(
      // @ts-ignore
      $(player.battlefield).onRemove(
        (cardSchema: ClientCardInstance, slotKey: string) => {
          this.removeCardVisual(sessionId, "battlefield", slotKey);
        }
      )
    );
    // Process existing cards on battlefield and add their schema listeners
    player.battlefield.forEach((cardSchema, slotKey) => {
      this.addCardSchemaListeners(cardSchema);
    });

    this.listeners.push(...playerListeners);
  }

  private addCardSchemaListeners(cardSchema: ClientCardInstance) {
    if (!cardSchema || !cardSchema.instanceId) return;
    const $ = getStateCallbacks(colyseusRoom!);

    // Clean up any existing listeners for this instanceId first to prevent duplicates
    const existingUnsubs = this.cardSchemaListeners.get(cardSchema.instanceId);
    if (existingUnsubs) {
      existingUnsubs.forEach((unsub) => unsub());
      this.cardSchemaListeners.delete(cardSchema.instanceId);
    }

    const newUnsubs: Array<() => void> = [];

    const hpUnsub = $(cardSchema).listen("currentHp", (newHp, oldHp) => {
      const cardContainer = this.getCardGameObjectByInstanceId(
        cardSchema.instanceId
      );
      if (cardContainer) {
        this.updateCardHpVisuals(cardContainer, newHp, cardSchema.health);
      }
    });
    newUnsubs.push(hpUnsub);

    // Add other card-specific listeners here if needed in the future
    // e.g., $(cardSchema).listen("attack", ...)

    if (newUnsubs.length > 0) {
      this.cardSchemaListeners.set(cardSchema.instanceId, newUnsubs);
    }
  }

  private updatePlayerSlots(player: ClientPlayerState, sessionId: string) {
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
        const handX = this.calculateSlotX(i, "hand"); // Pass 'hand'
        const handY = isLocalPlayer ? HAND_Y_PLAYER : HAND_Y_OPPONENT;
        const handOutline = this.add
          .rectangle(handX, handY, FULL_CARD_WIDTH, FULL_CARD_HEIGHT) // Use FULL_CARD dimensions
          .setStrokeStyle(2, isLocalPlayer ? 0xaaaaaa : 0x777777, 0.8)
          .setDepth(0); // Behind cards
        handSlotOutlines.push(handOutline);

        const bfX = this.calculateSlotX(i, "battlefield"); // Pass 'battlefield'
        const bfY = isLocalPlayer
          ? BATTLEFIELD_Y_PLAYER
          : BATTLEFIELD_Y_OPPONENT;
        const bfOutline = this.add
          .rectangle(bfX, bfY, MINION_CARD_WIDTH, MINION_CARD_HEIGHT) // Use MINION_CARD dimensions
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
    cardSchema: ClientCardInstance
  ) {
    if (!this.scene.isActive()) {
      // Don't update visuals if scene isn't active
      return;
    }
    if (!colyseusRoom || !colyseusRoom.state) {
      // Don't update visuals if Colyseus room or state isn't available
      return;
    }
    this.removeCardVisual(sessionId, area, slotKey); // Remove old one if exists

    const playerVisuals = this.playerVisuals.get(sessionId);
    if (!playerVisuals) return;

    const isLocalPlayer = sessionId === colyseusRoom?.sessionId;
    const x = this.calculateSlotX(parseInt(slotKey, 10), area); // Pass area
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
      isLocalPlayer,
      area // Pass the area parameter
    );
    cardContainer.setData("instanceId", cardSchema.instanceId);
    cardContainer.setData("slotKey", slotKey); // Store original slotKey
    cardContainer.setData("area", area); // Store original area
    cardContainer.setData("ownerSessionId", sessionId); // Store owner
    cardContainer.setDepth(1); // Ensure cards are rendered above default depth 0 elements

    // Apply dead style if HP is 0 or less initially
    if (cardSchema.currentHp <= 0) {
      cardContainer.setAlpha(0.6);
      const img = cardContainer.getData(
        "mainCardImage"
      ) as Phaser.GameObjects.Image; // Get the image
      if (img && img.active && typeof img.setTint === "function") {
        img.setTint(0x777777);
      }
      const hpText = cardContainer.getData(
        "hpTextObject"
      ) as Phaser.GameObjects.Text;
      if (hpText && hpText.active) hpText.setColor("#ff0000");
    }

    if (area === "hand") {
      playerVisuals.hand.set(slotKey, cardContainer);
    } else {
      playerVisuals.battlefield.set(slotKey, cardContainer);
    }

    // Add/update schema listeners for this card
    this.addCardSchemaListeners(cardSchema);

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
        const instanceId = existingVisual.getData("instanceId") as string;
        if (instanceId) {
          const listenersToRemove = this.cardSchemaListeners.get(instanceId);
          if (listenersToRemove) {
            console.log(
              `BoardView: Cleaning up ${listenersToRemove.length} listeners for card instance ${instanceId} during removeCardVisual.`
            );
            listenersToRemove.forEach((unsub) => {
              if (typeof unsub === "function") {
                try {
                  unsub();
                } catch (e) {
                  console.warn(
                    `BoardView: Error unsubscribing card listener for ${instanceId}`,
                    e
                  );
                }
              }
            });
            this.cardSchemaListeners.delete(instanceId);
          }
        }

        if (existingVisual.input && existingVisual.input.enabled) {
          this.input.disable(existingVisual); // Disable input before destroying
        }
        // Defer destruction to prevent errors if the object is still in an input queue
        this.time.delayedCall(1, () => {
          if (existingVisual.active) {
            // Check if still active before destroying
            existingVisual.destroy();
          }
        });
        mapArea.delete(slotKey);
      }
    }
  }

  private calculateSlotX(
    slotIndex: number,
    area: "hand" | "battlefield"
  ): number {
    const currentCardWidth =
      area === "hand" ? FULL_CARD_WIDTH : MINION_CARD_WIDTH;
    const totalWidthAllSlots = 5 * currentCardWidth + 4 * SLOT_SPACING;
    const startX =
      (this.cameras.main.width - totalWidthAllSlots) / 2 + currentCardWidth / 2;
    return startX + slotIndex * (currentCardWidth + SLOT_SPACING);
  }

  private createCardGameObject(
    cardSchema: ClientCardInstance,
    x: number,
    y: number,
    isObscured: boolean,
    isLocalPlayer: boolean,
    area: "hand" | "battlefield"
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const displayCardWidth =
      area === "hand" ? FULL_CARD_WIDTH : MINION_CARD_WIDTH;
    const displayCardHeight =
      area === "hand" ? FULL_CARD_HEIGHT : MINION_CARD_HEIGHT;
    container.setData("displayCardWidth", displayCardWidth);
    container.setData("displayCardHeight", displayCardHeight);

    if (isObscured) {
      // For obscured opponent hand cards, use FULL_CARD dimensions for the card back
      const cardBack = this.add
        .image(0, 0, "cardBack")
        .setOrigin(0.5)
        .setDisplaySize(FULL_CARD_WIDTH, FULL_CARD_HEIGHT);
      container.add(cardBack);
      return container;
    }

    const cardTextureKey =
      area === "hand" ? "cardFullTier1" : "cardMinionTier1";
    const cardImage = this.add.image(0, 0, cardTextureKey).setOrigin(0.5);
    cardImage.setDisplaySize(displayCardWidth, displayCardHeight);
    container.add(cardImage);
    container.setData("mainCardImage", cardImage);

    if (area === "hand") {
      // Full Card Sprite (Hand)
      const nameText = this.add
        .text(0, -20, cardSchema.name, {
          // Middle center, moved up
          fontFamily: "Arial",
          fontSize: 16,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
          align: "center",
          wordWrap: { width: displayCardWidth - 20 },
        })
        .setOrigin(0.5, 0.5);
      container.add(nameText);

      const attackText = this.add
        .text(
          -MINION_CARD_WIDTH / 2 + 32,
          MINION_CARD_HEIGHT * 0.03,
          `${cardSchema.attack}`,
          {
            fontFamily: "Arial",
            fontSize: 16,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4,
          }
        )
        .setOrigin(0, 0.5);
      container.add(attackText);

      const hpText = this.add
        .text(
          MINION_CARD_WIDTH / 2 - 18,
          6,
          `${cardSchema.currentHp}  ${cardSchema.health}`,
          {
            fontFamily: "Arial",
            fontSize: 16,
            color: "#00ff00",
            stroke: "#000000",
            strokeThickness: 4,
          }
        )
        .setOrigin(1, 0.5);
      container.add(hpText);
      container.setData("hpTextObject", hpText);

      const speedText = this.add
        .text(0, displayCardHeight / 2 - 50, `${cardSchema.speed}`, {
          fontFamily: "Arial",
          fontSize: 16,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5, 1);
      container.add(speedText);
    } else {
      // Minion Card Sprite (Battlefield)
      // Name Text (Top-center)
      const nameText = this.add
        .text(
          0,
          -displayCardHeight / 2 + 5, // 12px from top
          cardSchema.name,
          {
            fontFamily: "Arial",
            fontSize: 14,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4,
            align: "center",
            wordWrap: { width: displayCardWidth },
          }
        )
        .setOrigin(0.5, 0);
      container.add(nameText);

      // Attack Text (Top-left)
      const attackText = this.add
        .text(-displayCardWidth / 2 + 32, 32, `${cardSchema.attack}`, {
          // Middle-left
          fontFamily: "Arial",
          fontSize: 16, // Value only
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0, 0.5);
      container.add(attackText);

      // Speed Text (Top-right)
      const speedText = this.add
        .text(
          0,
          43, // 30px from top
          `${cardSchema.speed}`,
          {
            fontFamily: "Arial",
            fontSize: 14,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3,
          }
        )
        .setOrigin(1, 0);
      container.add(speedText);

      // HP Text (Bottom-right, above cooldown bar)
      const hpText = this.add
        .text(
          displayCardWidth / 2 - 10,
          displayCardHeight / 2 - 30, // 30px from bottom
          `${cardSchema.currentHp}/${cardSchema.health}`,
          {
            fontFamily: "Arial",
            fontSize: 14,
            color: "#00ff00",
            stroke: "#000000",
            strokeThickness: 3,
          }
        )
        .setOrigin(1, 1);
      container.add(hpText);
      container.setData("hpTextObject", hpText);

      // Cooldown Bar elements for battlefield cards (15px from bottom)
      const cooldownBarY = displayCardHeight / 2 - 15;
      const cooldownBarWidth = displayCardWidth - 10;
      const cooldownBarBg = this.add
        .rectangle(0, cooldownBarY, cooldownBarWidth, 6, 0x000000, 0.5)
        .setVisible(false);
      const cooldownBarFill = this.add
        .rectangle(
          -cooldownBarWidth / 2,
          cooldownBarY,
          cooldownBarWidth,
          6,
          0x44ff44
        )
        .setOrigin(0, 0.5)
        .setVisible(false);
      container.add(cooldownBarBg);
      container.add(cooldownBarFill);
      container.setData("cooldownBarBg", cooldownBarBg);
      container.setData("cooldownBarFill", cooldownBarFill);
      container.setData("attackCooldownTimer", 0);
      container.setData("maxAttackCooldown", 0);
      container.setData("cooldownBarBaseWidth", cooldownBarWidth);
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

    const x = this.calculateSlotX(slotIndex, area); // Pass area
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
    const cardWidth = cardContainer.getData("displayCardWidth") as number;
    const cardHeight = cardContainer.getData("displayCardHeight") as number;

    if (!cardWidth || !cardHeight) {
      console.warn(
        "BoardView: makeCardInteractive - displayCardWidth/Height not found on container.",
        cardContainer.getData("instanceId")
      );
      // Fallback to default if not set, though this shouldn't happen
      // const fallbackWidth = MINION_CARD_WIDTH;
      // const fallbackHeight = MINION_CARD_HEIGHT;
      // For safety, might be better to not make it interactive if dimensions are unknown
      return;
    }

    const hitAreaRectangle = new Phaser.Geom.Rectangle(
      -cardWidth / 2,
      -cardHeight / 2,
      cardWidth,
      cardHeight
    );
    cardContainer.setInteractive({
      hitArea: hitAreaRectangle,
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.input.setDraggable(cardContainer);
    // Explicitly ensure input is enabled for the draggable card container
    if (cardContainer.input) {
      cardContainer.input.enabled = true;
    }

    cardContainer.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      // Guard: Only allow drag actions if in Shop or Preparation phase
      if (
        this.currentPhase !== Phase.Shop &&
        this.currentPhase !== Phase.Preparation
      ) {
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
      cardContainer.setData("isDragging", true);
      cardContainer.setData("originalX", cardContainer.x);
      cardContainer.setData("originalY", cardContainer.y);
      // Store original area and slot key at the start of the drag
      cardContainer.setData(
        "originalAreaOnDragStart",
        cardContainer.getData("area")
      );
      cardContainer.setData(
        "originalSlotKeyOnDragStart",
        cardContainer.getData("slotKey")
      );
      // Original area and slotKey are already set in cardContainer.data when it's created/updated
    });

    cardContainer.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (cardContainer.getData("isDragging")) {
          cardContainer.x = dragX;
          cardContainer.y = dragY;

          // Sell preview logic
          if (
            (this.currentPhase === Phase.Shop ||
              this.currentPhase === Phase.Preparation) &&
            this.sellZone.visible
          ) {
            if (this.isDroppedOnSellZone(cardContainer)) {
              const instanceId = cardContainer.getData("instanceId") as string;
              const originalArea = cardContainer.getData(
                "originalAreaOnDragStart"
              ) as "hand" | "battlefield";
              const originalSlotKey = cardContainer.getData(
                "originalSlotKeyOnDragStart"
              ) as string;
              const ownerId = cardContainer.getData("ownerSessionId") as string;

              const player = colyseusRoom?.state.players.get(ownerId);
              let cardSchema: CardInstanceSchema | undefined;

              if (player) {
                if (originalArea === "hand") {
                  cardSchema = player.hand.get(originalSlotKey);
                } else {
                  cardSchema = player.battlefield.get(originalSlotKey);
                }
              }

              if (cardSchema && cardSchema.instanceId === instanceId) {
                const sellValue = Math.max(
                  1,
                  Math.floor(cardSchema.brewCost / 2)
                );
                this.brewGainText.setText(`Sell: +${sellValue} 🍺`);
                this.brewGainText.setAlpha(1);
              } else {
                this.brewGainText.setAlpha(0); // Hide if card data can't be found
              }
            } else {
              this.brewGainText.setAlpha(0); // Hide if not over sell zone
            }
          } else {
            this.brewGainText.setAlpha(0); // Hide if wrong phase or sell zone not visible
          }
        }
      }
    );

    cardContainer.on("dragend", (pointer: Phaser.Input.Pointer) => {
      if (!cardContainer.getData("isDragging")) return;

      cardContainer.setAlpha(1.0);
      cardContainer.setData("isDragging", false);
      this.brewGainText.setAlpha(0); // Hide preview text on drag end

      const instanceId = cardContainer.getData("instanceId") as string;
      // Use the area and slotKey stored at the beginning of the drag for updating visual maps
      const originalArea = cardContainer.getData("originalAreaOnDragStart") as
        | "hand"
        | "battlefield";
      const originalSlotKey = cardContainer.getData(
        "originalSlotKeyOnDragStart"
      ) as string;
      const ownerSessionId = cardContainer.getData("ownerSessionId") as string;

      // Check if card is dropped on sell zone
      if (
        (this.currentPhase === Phase.Shop ||
          this.currentPhase === Phase.Preparation) &&
        this.sellZone.visible &&
        this.isDroppedOnSellZone(cardContainer)
      ) {
        // Get card information from the server state to calculate value
        const myPlayer = colyseusRoom?.state.players.get(
          colyseusRoom?.sessionId
        ) as ClientPlayerState | undefined;
        let cardSchema: ClientCardInstance | undefined;

        // Find the card schema based on area and slotKey
        if (originalArea === "hand" && myPlayer?.hand.has(originalSlotKey)) {
          cardSchema = myPlayer.hand.get(originalSlotKey);
        } else if (
          originalArea === "battlefield" &&
          myPlayer?.battlefield.has(originalSlotKey)
        ) {
          cardSchema = myPlayer.battlefield.get(originalSlotKey);
        }

        if (cardSchema && cardSchema.instanceId === instanceId) {
          // Calculate sell value (half the brew cost, minimum 1)
          const sellValue = Math.max(1, Math.floor(cardSchema.brewCost / 2));

          // Send sell request to server
          colyseusRoom?.send("sellCard", {
            instanceId: instanceId,
            area: originalArea,
            slotKey: originalSlotKey,
          });

          // Show brew gain animation
          this.showBrewGain(sellValue);

          return; // Exit the handler after selling
        }
        const ownerId = cardContainer.getData("ownerSessionId") as string;

        const player = colyseusRoom?.state.players.get(ownerId) as
          | ClientPlayerState
          | undefined;

        if (player) {
          if (originalArea === "hand") {
            cardSchema = player.hand.get(originalSlotKey);
          } else {
            cardSchema = player.battlefield.get(originalSlotKey);
          }
        }

        let dropped = false;
        let newAreaForServer: "hand" | "battlefield" | undefined;
        let newSlotKeyForServer: string | undefined;

        // Check drop on local player's hand slots
        for (let i = 0; i < 5; i++) {
          const targetSlotKey = String(i);
          const slotPos = this.getSlotPixelPosition(true, "hand", i); // true for local player
          if (slotPos) {
            const dropZone = new Phaser.Geom.Rectangle(
              slotPos.x - FULL_CARD_WIDTH / 2,
              slotPos.y - FULL_CARD_HEIGHT / 2,
              FULL_CARD_WIDTH,
              FULL_CARD_HEIGHT
            );
            if (
              Phaser.Geom.Rectangle.Contains(
                dropZone,
                cardContainer.x,
                cardContainer.y
              )
            ) {
              if (
                this.isSlotEmpty(
                  ownerSessionId,
                  "hand",
                  targetSlotKey,
                  instanceId
                )
              ) {
                // MODIFICATION START: Check if drop to hand is allowed
                let canDropInHandSlot = false;
                if (this.currentPhase === Phase.Shop) {
                  // In Shop phase, cards can be moved within the hand.
                  if (originalArea === "hand") {
                    canDropInHandSlot = true;
                  }
                } else if (this.currentPhase === Phase.Preparation) {
                  // In Preparation phase, only cards originating from the hand can be dropped into a hand slot.
                  if (originalArea === "hand") {
                    canDropInHandSlot = true;
                  }
                }
                // MODIFICATION END

                if (canDropInHandSlot) {
                  // Use the new condition
                  cardContainer.x = slotPos.x;
                  cardContainer.y = slotPos.y;

                  // Change area attribute
                  const areaChanged = originalArea !== "hand";
                  cardContainer.setData("area", "hand");
                  cardContainer.setData("slotKey", targetSlotKey);

                  this.updateVisualMaps(
                    ownerSessionId,
                    originalArea,
                    originalSlotKey,
                    "hand",
                    targetSlotKey,
                    cardContainer
                  );

                  if (areaChanged) {
                    const myPlayer =
                      colyseusRoom?.state.players.get(ownerSessionId);
                    // Try to find the schema from its new potential location first, then original
                    let cardSchema: CardInstanceSchema | undefined;
                    if (myPlayer) {
                      cardSchema = myPlayer.hand.get(targetSlotKey);
                      if (!cardSchema) {
                        if (originalArea === "battlefield") {
                          cardSchema =
                            myPlayer.battlefield.get(originalSlotKey);
                        } else {
                          // originalArea must be 'hand' if not 'battlefield'
                          cardSchema = myPlayer.hand.get(originalSlotKey);
                        }
                      }
                    }

                    if (cardSchema && cardSchema.instanceId === instanceId) {
                      this.updateCardVisual(
                        ownerSessionId,
                        "hand",
                        targetSlotKey,
                        cardSchema
                      );
                    }
                  }

                  dropped = true;
                  newAreaForServer = "hand";
                  newSlotKeyForServer = targetSlotKey;

                  if (
                    this.currentPhase === Phase.Shop &&
                    (originalArea !== "hand" ||
                      originalSlotKey !== targetSlotKey)
                  ) {
                    colyseusRoom?.send("moveCardInHand", {
                      instanceId,
                      fromSlotKey: originalSlotKey,
                      toSlotKey: targetSlotKey,
                    });
                  }
                }
              }
              if (dropped) break; // Break if successfully dropped in any hand slot
            }
          }
        }

        // Check drop on local player's battlefield slots (only if in Preparation phase)
        if (!dropped && this.currentPhase === Phase.Preparation) {
          for (let i = 0; i < 5; i++) {
            const targetSlotKey = String(i);
            const slotPos = this.getSlotPixelPosition(true, "battlefield", i); // true for local player
            if (slotPos) {
              const dropZone = new Phaser.Geom.Rectangle(
                slotPos.x - FULL_CARD_WIDTH / 2,
                slotPos.y - FULL_CARD_HEIGHT / 2,
                FULL_CARD_WIDTH,
                FULL_CARD_HEIGHT
              );
              if (
                Phaser.Geom.Rectangle.Contains(
                  dropZone,
                  cardContainer.x,
                  cardContainer.y
                )
              ) {
                if (
                  this.isSlotEmpty(
                    ownerSessionId,
                    "battlefield",
                    targetSlotKey,
                    instanceId
                  )
                ) {
                  // Valid drop on battlefield
                  cardContainer.x = slotPos.x;
                  cardContainer.y = slotPos.y;

                  // Change area attribute
                  const areaChanged = originalArea !== "battlefield";
                  cardContainer.setData("area", "battlefield");
                  cardContainer.setData("slotKey", targetSlotKey);

                  this.updateVisualMaps(
                    ownerSessionId,
                    originalArea,
                    originalSlotKey,
                    "battlefield",
                    targetSlotKey,
                    cardContainer
                  );

                  // If area has changed, recreate the card visual to update appearance
                  if (areaChanged) {
                    // Get the card data from the server state
                    const myPlayer =
                      colyseusRoom?.state.players.get(ownerSessionId);
                    const cardSchema =
                      myPlayer?.battlefield.get(targetSlotKey) ||
                      myPlayer?.hand.get(originalSlotKey);

                    if (cardSchema && cardSchema.instanceId === instanceId) {
                      // Recreate the card with the correct appearance for its new area
                      this.updateCardVisual(
                        ownerSessionId,
                        "battlefield",
                        targetSlotKey,
                        cardSchema
                      );
                    }
                  }

                  dropped = true;
                  newAreaForServer = "battlefield";
                  newSlotKeyForServer = targetSlotKey;
                  // Preparation.ts will read the final layout for its own send, this is for real-time sync
                }
                break;
              }
            }
          }
        }

        if (!dropped) {
          cardContainer.x = cardContainer.getData("originalX");
          cardContainer.y = cardContainer.getData("originalY");
          // Reset area and slotKey to original if not dropped successfully
          cardContainer.setData("area", originalArea);
          cardContainer.setData("slotKey", originalSlotKey);
        } else {
          // If dropped successfully and in Preparation phase, send update to server
          if (
            this.currentPhase === Phase.Preparation &&
            newAreaForServer &&
            newSlotKeyForServer
          ) {
            // Only send if it actually moved to a new logical slot
            if (
              originalArea !== newAreaForServer ||
              originalSlotKey !== newSlotKeyForServer
            ) {
              colyseusRoom?.send("updatePrepLayout", {
                instanceId,
                newArea: newAreaForServer,
                newSlotKey: newSlotKeyForServer,
              });
            }
          }
        }

        // Notify Preparation scene if it's active and phase is Prep, so it can update button state
        if (this.currentPhase === Phase.Preparation) {
          const prepScene = this.scene.get("Preparation");
          if (
            prepScene &&
            prepScene.scene.isActive() &&
            (prepScene as any).updateStartButtonState
          ) {
            (prepScene as any).updateStartButtonState();
          }
        }
      }
    });
  }

  // Add the new getCardLayouts method
  public getCardLayouts(): {
    handLayout: { [key: string]: string | null };
    battlefieldLayout: { [key: string]: string | null };
  } {
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
        handLayout[slotKey] =
          (cardContainer?.getData("instanceId") as string) || null;
      } else {
        handLayout[slotKey] = null;
      }

      // Battlefield layout
      if (playerVisuals && playerVisuals.battlefield.has(slotKey)) {
        const cardContainer = playerVisuals.battlefield.get(slotKey);
        battlefieldLayout[slotKey] =
          (cardContainer?.getData("instanceId") as string) || null;
      } else {
        battlefieldLayout[slotKey] = null;
      }
    }
    return { handLayout, battlefieldLayout };
  }

  private isSlotEmpty(
    sessionId: string,
    area: "hand" | "battlefield",
    slotKey: string,
    draggedInstanceId: string
  ): boolean {
    const playerVisuals = this.playerVisuals.get(sessionId);
    if (!playerVisuals) return false; // Should not happen for local player

    const targetMap =
      area === "hand" ? playerVisuals.hand : playerVisuals.battlefield;
    const occupantCard = targetMap.get(slotKey);

    if (!occupantCard) return true; // Slot is visually empty
    // Slot is occupied, check if it's the card being dragged (e.g., dragged slightly but still over its original slot)
    return occupantCard.getData("instanceId") === draggedInstanceId;
  }

  private isDroppedOnSellZone(
    cardContainer: Phaser.GameObjects.Container
  ): boolean {
    if (!this.sellZone.visible) return false;

    // Create a slightly larger hit area than the visual rectangle to make selling easier
    const sellZoneBounds = new Phaser.Geom.Rectangle(
      this.sellZone.x - this.sellZoneRect.width / 2 - 20,
      this.sellZone.y - this.sellZoneRect.height / 2 - 20,
      this.sellZoneRect.width + 40,
      this.sellZoneRect.height + 40
    );

    return sellZoneBounds.contains(cardContainer.x, cardContainer.y);
  }

  private showBrewGain(amount: number) {
    this.brewGainText.setText(`+${amount} 🍺`); // Set final confirmed amount
    this.brewGainText.setAlpha(1); // Make it visible for animation
    // Position it relative to the sellZone container's origin (which is the center of the sell zone)
    // If brewGainText is already part of sellZone container, its x,y are relative.
    // Let's ensure it's positioned where the preview was, e.g., above the "SELL" text.
    this.brewGainText.y = -50; // Reset y position if it was moved by another animation
    this.brewGainText.x = 0; // Reset x position

    // Scale up and down for attention
    this.tweens.add({
      targets: this.brewGainText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 100,
      yoyo: true,
      ease: "Cubic.easeOut",
      onComplete: () => {
        // Then float up and fade out
        this.tweens.add({
          targets: this.brewGainText,
          y: this.brewGainText.y - 80,
          alpha: 0,
          duration: 1500,
          ease: "Power2",
        });
      },
    });

    // Flash the sell zone briefly
    this.tweens.add({
      targets: this.sellZoneRect,
      fillAlpha: 0.7,
      duration: 200,
      yoyo: true,
      repeat: 1,
      ease: "Cubic.easeOut",
    });
  }

  private updateVisualMaps(
    sessionId: string,
    originalArea: "hand" | "battlefield",
    originalSlotKey: string,
    newArea: "hand" | "battlefield",
    newSlotKey: string,
    cardContainer: Phaser.GameObjects.Container // This is the card being moved
  ) {
    const playerVisuals = this.playerVisuals.get(sessionId);
    if (!playerVisuals) return;

    // Remove from original map entry if it's indeed this cardContainer
    const originalMap =
      originalArea === "hand" ? playerVisuals.hand : playerVisuals.battlefield;
    if (originalMap.get(originalSlotKey) === cardContainer) {
      originalMap.delete(originalSlotKey);
    }

    // Add to new map entry.
    // The isSlotEmpty method should have ensured that if newMap.get(newSlotKey) exists,
    // it's either cardContainer itself (dropped back to original slot) or the slot was empty.
    // Thus, we don't need to handle destroying a *different* card here.
    const newMap =
      newArea === "hand" ? playerVisuals.hand : playerVisuals.battlefield;
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

  public getLocalPlayerLayoutData(): Array<{
    instanceId: string;
    area: "hand" | "battlefield";
    slotKey: string;
  }> {
    const layoutData: Array<{
      instanceId: string;
      area: "hand" | "battlefield";
      slotKey: string;
    }> = [];
    if (!colyseusRoom || !colyseusRoom.sessionId) return layoutData;

    const localPlayerId = colyseusRoom.sessionId;
    const playerVisuals = this.playerVisuals.get(localPlayerId);

    if (playerVisuals) {
      playerVisuals.hand.forEach((cardContainer, slotKey) => {
        layoutData.push({
          instanceId: cardContainer.getData("instanceId") as string,
          area: "hand",
          slotKey: cardContainer.getData("slotKey") as string, // Use the current data slotKey
        });
      });
      playerVisuals.battlefield.forEach((cardContainer, slotKey) => {
        layoutData.push({
          instanceId: cardContainer.getData("instanceId") as string,
          area: "battlefield",
          slotKey: cardContainer.getData("slotKey") as string, // Use the current data slotKey
        });
      });
    }
    return layoutData;
  }

  private createSellZone() {
    // Create sell zone container at the right side of the screen
    this.sellZone = this.add.container(
      this.cameras.main.width - 80,
      this.cameras.main.height / 2
    );
    this.sellZone.setDepth(1000); // High depth to be on top

    // Create red rectangle for the zone
    this.sellZoneRect = this.add.rectangle(0, 0, 120, 160, 0xff0000, 0.3);
    this.sellZoneRect.setStrokeStyle(2, 0xff0000, 1);
    this.sellZone.add(this.sellZoneRect);

    // Add "SELL" text
    this.sellZoneText = this.add
      .text(0, 0, "SELL", {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5);
    this.sellZone.add(this.sellZoneText);

    // Create the brew gain text (initially invisible, positioned above SELL text)
    this.brewGainText = this.add
      .text(0, -50, "", {
        // Positioned above sellZoneText
        fontFamily: "Arial Black",
        fontSize: 20, // Slightly smaller for preview
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0); // Start invisible
    this.sellZone.add(this.brewGainText); // Add to sellZone container

    // Add "Drag cards here" helper text
    const helperText = this.add
      .text(0, 50, "Drag cards here\nto sell", {
        fontFamily: "Arial",
        fontSize: 14,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5);
    this.sellZone.add(helperText);

    // Add visual feedback when dragging cards
    this.input.on(
      "dragenter",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dropZone: Phaser.GameObjects.GameObject
      ) => {
        if (
          gameObject instanceof Phaser.GameObjects.Container &&
          this.sellZone.visible &&
          this.isDroppedOnSellZone(gameObject as Phaser.GameObjects.Container)
        ) {
          this.sellZoneRect.setFillStyle(0xff0000, 0.5);
          this.sellZoneRect.setStrokeStyle(3, 0xff5555, 1);
        }
      }
    );

    this.input.on(
      "dragleave",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dropZone: Phaser.GameObjects.GameObject
      ) => {
        this.sellZoneRect.setFillStyle(0xff0000, 0.3);
        this.sellZoneRect.setStrokeStyle(2, 0xff0000, 1);
      }
    );

    // Reset the sell zone appearance on any drop
    this.input.on("drop", () => {
      this.sellZoneRect.setFillStyle(0xff0000, 0.3);
      this.sellZoneRect.setStrokeStyle(2, 0xff0000, 1);
    });

    // Initially hide the sell zone
    this.sellZone.setVisible(false);
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
    const myPlayerState = colyseusRoom.state.players.get(myPlayerId) as
      | ClientPlayerState
      | undefined;
    let opponentState: ClientPlayerState | undefined;
    let opponentName = "Opponent: --";

    colyseusRoom.state.players.forEach((player: any, sessionId: any) => {
      // Cast to any or use ClientPlayerState
      if (sessionId !== myPlayerId) {
        opponentState = player as ClientPlayerState;
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

  private cleanupListeners() {
    console.log("BoardView: Cleaning up listeners.");
    this.listeners.forEach((unsub) => {
      if (typeof unsub === "function") {
        try {
          unsub();
        } catch (e) {
          console.warn("BoardView: Error cleaning up listener:", e);
        }
      }
    });
    this.listeners = [];

    // Clean up card schema listeners
    this.cardSchemaListeners.forEach((unsubs, instanceId) => {
      console.log(
        `BoardView cleanup: Cleaning up ${unsubs.length} listeners for card instance ${instanceId}`
      );
      unsubs.forEach((unsub) => {
        if (typeof unsub === "function") {
          try {
            unsub();
          } catch (e) {
            console.warn(
              `BoardView: Error unsubscribing card listener for ${instanceId}`,
              e
            );
          }
        }
      });
    });
    this.cardSchemaListeners.clear();

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

    // Clean up sell zone elements
    this.sellZone?.destroy();
    this.brewGainText?.destroy();

    // Clean up input listeners
    this.input.off("dragenter");
    this.input.off("dragleave");
    this.input.off("drop");
  }

  shutdown() {
    console.log("BoardView shutting down...");
    this.cleanupListeners();

    // Unregister the shutdown event listener for this scene
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
}
