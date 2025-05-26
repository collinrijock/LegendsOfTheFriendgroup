import { Scene } from "phaser";
import {
  colyseusRoom,
  globalCardDataCache,
  CardData,
} from "../utils/colyseusClient";
import {
  ClientGameState,
  ClientPlayerState,
  ClientCardInstance,
  Phase,
} from "../schemas/ClientSchemas";
import { getStateCallbacks } from "colyseus.js";
import {
  createCardGameObject,
  updateCardHpVisuals as utilUpdateCardHpVisuals,
  MINION_CARD_WIDTH,
  MINION_CARD_HEIGHT,
  FULL_CARD_WIDTH,
  FULL_CARD_HEIGHT,
  CardRenderData,
} from "../utils/renderCardUtils";

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
  private opponentBattlefieldSnapshotAtPrepStart: Map<string, Set<string>> =
    new Map(); // sessionId -> Set<instanceId>

  // Add sell zone properties
  private sellZone!: Phaser.GameObjects.Container;
  private sellZoneRect!: Phaser.GameObjects.Rectangle;
  private sellZoneText!: Phaser.GameObjects.Text;
  private brewGainText!: Phaser.GameObjects.Text;

  // Properties for enlarged card display
  private enlargedCardDisplay!: Phaser.GameObjects.Container;
  private enlargedCardBackground!: Phaser.GameObjects.Rectangle;
  private enlargedCardVisual!: Phaser.GameObjects.Container | null;
  private enlargedCardEffectsText!: Phaser.GameObjects.Text;
  private enlargedCardBuffsText!: Phaser.GameObjects.Text;
  // End enlarged card display properties

  // Navbar elements
  private playerHealthText!: Phaser.GameObjects.Text;
  private opponentHealthText!: Phaser.GameObjects.Text;
  private playerBrewsText!: Phaser.GameObjects.Text;
  private dayPhaseText!: Phaser.GameObjects.Text;
  private opponentUsernameText!: Phaser.GameObjects.Text; // For opponent's name
  private phaseTimerText!: Phaser.GameObjects.Text; // For phase timer display
  private matchTimerText!: Phaser.GameObjects.Text; // For match-long timer display

  // Listeners
  private listeners: Array<() => void> = [];
  private cardSchemaListeners: Map<string, Array<() => void>> = new Map(); // Added: For card-specific schema listeners

  constructor() {
    super("BoardView");
  }

  private formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }

  private updateCardHpVisuals(
    cardContainer: Phaser.GameObjects.Container,
    currentHp: number,
    maxHealth: number
  ) {
    // Use the utility function instead of local implementation
    utilUpdateCardHpVisuals(cardContainer, currentHp, maxHealth);
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

    // Initialize enlarged card display container
    this.enlargedCardDisplay = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY)
      .setVisible(false)
      .setDepth(3000); // Very high depth to be on top of everything

    this.enlargedCardBackground = this.add.rectangle(0, 0, 300, 450, 0x000000, 0.9) // Example size, will adjust
      .setStrokeStyle(2, 0xffffff);
    this.enlargedCardDisplay.add(this.enlargedCardBackground);

    // Placeholder for the card visual itself, will be added dynamically
    this.enlargedCardVisual = null;

    const effectsAndBuffsTextStyle = {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#ffffff",
      wordWrap: { width: 280, useAdvancedWrap: true }, // Adjust width as needed
      align: "left" as const,
    };

    this.enlargedCardEffectsText = this.add.text(0, 0, "", effectsAndBuffsTextStyle).setOrigin(0.5, 0);
    this.enlargedCardDisplay.add(this.enlargedCardEffectsText);

    this.enlargedCardBuffsText = this.add.text(0, 0, "", effectsAndBuffsTextStyle).setOrigin(0.5, 0);
    this.enlargedCardDisplay.add(this.enlargedCardBuffsText);
    // End enlarged card display initialization

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

    this.phaseTimerText = this.add
      .text(gameWidth * 0.65, navbarY, `Timer: --`, {
        // Positioned to the right of day/phase
        ...navTextStyle,
        fontSize: 24,
        align: "left", // Or center if preferred
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5) // Adjust origin if centered: .setOrigin(0.5)
      .setDepth(1001)
      .setVisible(false); // Initially hidden, shown by phase logic
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
      $(colyseusRoom.state).listen(
        "currentPhase",
        (newPhaseVal, oldPhaseVal) => {
          const newPhase = newPhaseVal as Phase;
          const oldPhase = oldPhaseVal as Phase;
          const previousPhaseIsPrep = oldPhase === Phase.Preparation;
          this.currentPhase = newPhase;
          this.updateNavbarText(); // This will update day/phase text

          // Show/hide sell zone based on phase
          if (newPhase === Phase.Shop || newPhase === Phase.Preparation) {
            this.sellZone.setVisible(true);
          } else {
            this.sellZone.setVisible(false);
          }

          // Update phase timer display based on new phase
          if (this.phaseTimerText && this.phaseTimerText.active) {
            const timedPhases = [Phase.Shop, Phase.Preparation, Phase.Battle];
            if (timedPhases.includes(newPhase)) {
              // Set initial text for the new phase, actual countdown handled by phaseTimer listener
              this.phaseTimerText.setText(
                `Timer: ${colyseusRoom?.state.phaseTimer ?? "--"}`
              );
              this.phaseTimerText.setVisible(true);
            } else {
              this.phaseTimerText.setVisible(false);
            }
          }

          // Snapshotting and re-rendering logic based on phase transitions
          if (newPhase === Phase.Preparation) {
            // Transitioning into Preparation phase
            colyseusRoom!.state.players.forEach(
              (player: ClientPlayerState, sessionId: string) => {
                if (sessionId !== colyseusRoom?.sessionId) {
                  // If opponent
                  const snapshotSet = new Set<string>();
                  player.battlefield.forEach((cardSchema) => {
                    snapshotSet.add(cardSchema.instanceId);
                  });
                  this.opponentBattlefieldSnapshotAtPrepStart.set(
                    sessionId,
                    snapshotSet
                  );
                  console.log(
                    `BoardView: Snapshot for opponent ${sessionId} at Prep start:`,
                    Array.from(snapshotSet)
                  );

                  // Re-render opponent's battlefield cards to apply initial Prep visuals
                  player.battlefield.forEach((cardSchema, slotKey) => {
                    this.updateCardVisual(
                      sessionId,
                      "battlefield",
                      slotKey,
                      cardSchema
                    );
                  });
                }
              }
            );
          } else if (newPhase === Phase.Battle && previousPhaseIsPrep) {
            // Transitioning from Prep to Battle: Re-render opponent's battlefield cards to make them visible
            colyseusRoom!.state.players.forEach(
              (player: ClientPlayerState, sessionId: string) => {
                if (sessionId !== colyseusRoom?.sessionId) {
                  // If opponent
                  player.battlefield.forEach((cardSchema, slotKey) => {
                    this.updateCardVisual(
                      sessionId,
                      "battlefield",
                      slotKey,
                      cardSchema
                    );
                  });
                }
              }
            );
            // Optionally clear snapshots now, or wait until next Prep phase
            // this.opponentBattlefieldSnapshotAtPrepStart.clear();
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

                    const effectiveSpeed =
                      cardSchema.speed -
                      (cardSchema.statBuffs?.get("speed") || 0);
                    const maxCooldown =
                      (effectiveSpeed > 0
                        ? Math.max(0.1, effectiveSpeed)
                        : 1.5) * 1000;
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
        }
      )
    );

    this.listeners.push(
      $(colyseusRoom.state).listen("phaseTimer", (newTime: number) => {
        if (
          this.phaseTimerText &&
          this.phaseTimerText.active &&
          this.phaseTimerText.visible
        ) {
          // Only update if the text is supposed to be visible for the current phase
          const timedPhases = [Phase.Shop, Phase.Preparation, Phase.Battle];
          if (timedPhases.includes(this.currentPhase as Phase)) {
            if (newTime >= 0) {
              // Show 0 before it disappears or phase changes
              this.phaseTimerText.setText(`Timer: ${newTime}`);
            }
          }
        }
      })
    );

    this.listeners.push(
      $(colyseusRoom.state).listen("matchTimer", (newTime: number) => {
        if (this.matchTimerText && this.matchTimerText.active) {
          if (
            newTime > 0 ||
            (colyseusRoom?.state.currentPhase !== Phase.Lobby &&
              colyseusRoom?.state.currentPhase !== Phase.GameOver)
          ) {
            this.matchTimerText.setText(`Match: ${this.formatTime(newTime)}`);
            this.matchTimerText.setVisible(true);
          } else if (colyseusRoom?.state.currentPhase === Phase.GameOver) {
            // Keep visible at game over to show final time, or hide if preferred
            this.matchTimerText.setText(`Match: ${this.formatTime(newTime)}`);
            this.matchTimerText.setVisible(true);
          } else {
            this.matchTimerText.setVisible(false);
          }
        }
      })
    );

    this.listeners.push(
      $(colyseusRoom.state.players).onAdd(
        $(colyseusRoom.state.players).onAdd(
          (player: ClientPlayerState, sessionId: string) => {
            console.log(`BoardView: Player added ${sessionId}`);
            this.addPlayerVisuals(sessionId);
            this.addPlayerListeners(player, sessionId);
            this.updatePlayerSlots(player, sessionId); // Initial population
            this.updateNavbarText(); // Update opponent name if they joined
          }
        )
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
            const attackerCardSchema = colyseusRoom!.state.players
              .get(message.attackerPlayerId)
              ?.battlefield.get(attackerCard.getData("slotKey") as string);
            if (attackerCardSchema) {
              const attackerEffectiveSpeed =
                attackerCardSchema.speed -
                (attackerCardSchema.statBuffs?.get("speed") || 0);
              const attackerMaxCooldown =
                (attackerEffectiveSpeed > 0
                  ? Math.max(0.1, attackerEffectiveSpeed)
                  : 1.5) * 1000;

              // Update the container's maxAttackCooldown if it changed due to buffs
              attackerCard.setData("maxAttackCooldown", attackerMaxCooldown);
              attackerCard.setData("attackCooldownTimer", attackerMaxCooldown);

              const fillBar = attackerCard.getData(
                "cooldownBarFill"
              ) as Phaser.GameObjects.Rectangle;
              const attackerCooldownBarBaseWidth =
                (attackerCard.getData("cooldownBarBaseWidth") as number) ||
                MINION_CARD_WIDTH - 10; // Fallback
              if (fillBar) fillBar.setSize(attackerCooldownBarBaseWidth, 6); // Reset fill bar to full using setSize
            }
          } else {
            console.warn(
              "BoardView: Attacker or target not found/active for battleAttackEvent",
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

    this.playerVisuals.forEach((playerData, playerId) => {
      // Added playerId
      playerData.battlefield.forEach((cardContainer, slotKey) => {
        // Added slotKey
        if (!cardContainer.active) return;

        const cardSchema = colyseusRoom!.state.players
          .get(playerId)
          ?.battlefield.get(slotKey);
        if (!cardSchema) return; // Card might have been removed

        const effectiveSpeed =
          cardSchema.speed - (cardSchema.statBuffs?.get("speed") || 0);
        const maxCooldown = cardContainer.getData(
          // Use maxAttackCooldown from container, set by createCardGameObject
          "maxAttackCooldown"
        ) as number; // This was set using effectiveSpeed initially

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
        const effectiveMaxHealth =
          cardSchema.health + (cardSchema.statBuffs?.get("health") || 0);
        this.updateCardHpVisuals(cardContainer, newHp, effectiveMaxHealth);
      }
    });
    newUnsubs.push(hpUnsub);

    // Listen to statBuffs changes to update visuals
    const statBuffsUnsub = $(cardSchema.statBuffs).onChange(() => {
      const cardContainer = this.getCardGameObjectByInstanceId(
        cardSchema.instanceId
      );
      if (cardContainer) {
        // Re-render the card's text elements to reflect new effective stats
        const effectiveAttack =
          cardSchema.attack + (cardSchema.statBuffs?.get("attack") || 0);
        const effectiveSpeed = Math.max(
          0.1,
          cardSchema.speed - (cardSchema.statBuffs?.get("speed") || 0)
        );
        const effectiveMaxHealth =
          cardSchema.health + (cardSchema.statBuffs?.get("health") || 0);

        const attackText = cardContainer.getData(
          "attackTextObject"
        ) as Phaser.GameObjects.Text;
        if (attackText) attackText.setText(`${effectiveAttack}`);

        const speedText = cardContainer.getData(
          "speedTextObject"
        ) as Phaser.GameObjects.Text;
        if (speedText) speedText.setText(`${effectiveSpeed.toFixed(1)}`);

        // Update HP text and visuals
        this.updateCardHpVisuals(
          cardContainer,
          cardSchema.currentHp,
          effectiveMaxHealth
        );

        // Update cooldown data if speed changed
        const newMaxCooldownMs =
          (effectiveSpeed > 0 ? effectiveSpeed : 1.5) * 1000;
        cardContainer.setData("maxAttackCooldown", newMaxCooldownMs);
        // Optionally reset current cooldown timer or adjust proportionally
      }
    });
    newUnsubs.push(statBuffsUnsub);

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
    this.opponentBattlefieldSnapshotAtPrepStart.delete(sessionId); // Clear snapshot for removed player
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
      if (!isLocalPlayer) {
        isObscured = true; // Opponent's hand is always obscured
      }
    } else {
      // battlefield
      y = isLocalPlayer ? BATTLEFIELD_Y_PLAYER : BATTLEFIELD_Y_OPPONENT;
      if (!isLocalPlayer && this.currentPhase === Phase.Preparation) {
        // If it's an opponent's card on their battlefield during Preparation phase
        const snapshot =
          this.opponentBattlefieldSnapshotAtPrepStart.get(sessionId);
        if (snapshot && snapshot.has(cardSchema.instanceId)) {
          isObscured = false; // Card was in snapshot (existed at Prep start), so visible
        } else {
          isObscured = true; // Card not in snapshot (newly played in Prep) or no snapshot, so obscure
        }
      }
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
    // Convert ClientCardInstance to CardRenderData
    const cardRenderData: CardRenderData = {
      name: cardSchema.name,
      attack: cardSchema.attack,
      speed: cardSchema.speed,
      health: cardSchema.health,
      currentHp: cardSchema.currentHp,
      brewCost: cardSchema.brewCost,
      artUrl: cardSchema.artUrl,
      instanceId: cardSchema.instanceId,
      statBuffs: cardSchema.statBuffs, // Pass statBuffs
    };

    const cardType = area === "hand" ? "full" : "minion";
    const container = createCardGameObject(
      this,
      cardRenderData,
      cardType,
      isObscured
    );

    // Position the container
    container.setPosition(x, y);

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
    console.log(`BoardView: Card ${cardContainer.getData('instanceId')} interactive set. Enabled: ${cardContainer.input?.enabled}`); // Log interactivity status
    this.input.setDraggable(cardContainer);
    // Explicitly ensure input is enabled for the draggable card container
    if (cardContainer.input) {
      cardContainer.input.enabled = true;
    }
    
    cardContainer.on('pointerover', () => {
      // Don't show enlarged view if a drag operation is active on any card
      if (this.input.activePointer.isDown && this.input.manager.dragTarget) {
        return;
      }
      this.showEnlargedCard(cardContainer);
    });
    
    cardContainer.on('pointerout', () => {
      this.hideEnlargedCard();
    });
    
    cardContainer.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      this.hideEnlargedCard(); // Hide enlarged view when starting a drag
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
      this.hideEnlargedCard(); // Hide enlarged view when starting a drag
  
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
      // Guard for inactive scene
      if (!this.scene.isActive()) {
        if (cardContainer.active) {
          // Check if cardContainer itself is still active
          cardContainer.setAlpha(1.0); // Reset visual state if possible
          // Attempt to place it back at original position if data exists
          const originalX = cardContainer.getData("originalX");
          const originalY = cardContainer.getData("originalY");
          if (typeof originalX === "number" && typeof originalY === "number") {
            cardContainer.x = originalX;
            cardContainer.y = originalY;
          }
        }
        if (cardContainer.getData("isDragging")) {
          // Only reset if it was dragging
          cardContainer.setData("isDragging", false);
        }
        if (this.brewGainText && this.brewGainText.active) {
          // Check brewGainText exists and is active
          this.brewGainText.setAlpha(0);
        }
        return;
      }

      if (!cardContainer.getData("isDragging")) return;

      cardContainer.setAlpha(1.0);
      cardContainer.setData("isDragging", false);
      if (this.brewGainText && this.brewGainText.active) {
        // Check brewGainText exists and is active
        this.brewGainText.setAlpha(0); // Hide preview text on drag end
      }

      const instanceId = cardContainer.getData("instanceId") as string;
      const originalArea = cardContainer.getData("originalAreaOnDragStart") as
        | "hand"
        | "battlefield";
      const originalSlotKey = cardContainer.getData(
        "originalSlotKeyOnDragStart"
      ) as string;
      const ownerSessionId = cardContainer.getData("ownerSessionId") as string;

      // --- Sell Logic ---
      if (
        (this.currentPhase === Phase.Shop ||
          this.currentPhase === Phase.Preparation) &&
        this.sellZone.visible &&
        this.isDroppedOnSellZone(cardContainer)
      ) {
        const myPlayer = colyseusRoom?.state.players.get(
          colyseusRoom?.sessionId // Should be ownerSessionId if we allow selling opponent's cards (which we don't)
          // For now, assume only local player can sell their own cards.
        ) as ClientPlayerState | undefined;
        let cardSchemaToSell: ClientCardInstance | undefined;

        // Ensure we are trying to sell a card owned by the local player (who is doing the dragging)
        if (myPlayer && ownerSessionId === myPlayer.sessionId) {
          if (originalArea === "hand" && myPlayer.hand.has(originalSlotKey)) {
            cardSchemaToSell = myPlayer.hand.get(originalSlotKey);
          } else if (
            originalArea === "battlefield" &&
            myPlayer.battlefield.has(originalSlotKey)
          ) {
            cardSchemaToSell = myPlayer.battlefield.get(originalSlotKey);
          }
        }

        if (cardSchemaToSell && cardSchemaToSell.instanceId === instanceId) {
          const sellValue = Math.max(
            1,
            Math.floor(cardSchemaToSell.brewCost / 2)
          );
          colyseusRoom?.send("sellCard", {
            instanceId: instanceId,
            area: originalArea,
            slotKey: originalSlotKey,
          });
          this.showBrewGain(sellValue);
          return; // Exit the handler after selling
        } else {
          console.warn(
            `BoardView: Sell attempt failed. Card schema not found, instanceId mismatch, or not owned by local player. Instance: ${instanceId}, OriginalArea: ${originalArea}, OriginalSlot: ${originalSlotKey}, Owner: ${ownerSessionId}`
          );
          // Card will snap back due to !dropped
        }
      }

      // Declare `dropped` and related variables *after* sell logic.
      let dropped = false;
      let newAreaForServer: "hand" | "battlefield" | undefined;
      let newSlotKeyForServer: string | undefined;

      // Check drop on local player's hand slots
      if (!dropped) {
        // Check if not already dropped (e.g. by successful sell)
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
                let canDropInHandSlot = false;
                if (this.currentPhase === Phase.Shop) {
                  // In Shop phase, only cards originating from the hand can be moved within the hand.
                  if (originalArea === "hand") {
                    canDropInHandSlot = true;
                  }
                } else if (this.currentPhase === Phase.Preparation) {
                  // In Preparation phase, any card (from hand or battlefield) can be moved to an empty hand slot.
                  canDropInHandSlot = true;
                }

                if (canDropInHandSlot) {
                  cardContainer.x = slotPos.x;
                  cardContainer.y = slotPos.y;

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
                    let schemaToUse: ClientCardInstance | undefined;
                    const playerState =
                      colyseusRoom?.state.players.get(ownerSessionId);
                    if (playerState) {
                      const findSchema = (
                        id: string,
                        pState: ClientPlayerState
                      ): ClientCardInstance | undefined => {
                        let found: ClientCardInstance | undefined;
                        pState.hand.forEach((c) => {
                          if (c.instanceId === id) found = c;
                        });
                        if (found) return found;
                        pState.battlefield.forEach((c) => {
                          if (c.instanceId === id) found = c;
                        });
                        return found;
                      };
                      schemaToUse = findSchema(instanceId, playerState);
                    }

                    if (schemaToUse) {
                      this.updateCardVisual(
                        ownerSessionId,
                        "hand", // newArea is "hand"
                        targetSlotKey, // newSlotKey
                        schemaToUse
                      );
                    } else {
                      console.warn(
                        `BoardView: dragend (to hand) - Could not find card schema for instanceId ${instanceId} to update visual on area change.`
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
                  break; // Break from hand slot loop
                }
              }
            }
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
              slotPos.x - MINION_CARD_WIDTH / 2,
              slotPos.y - MINION_CARD_HEIGHT / 2,
              MINION_CARD_WIDTH,
              MINION_CARD_HEIGHT
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
                cardContainer.x = slotPos.x;
                cardContainer.y = slotPos.y;

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

                if (areaChanged) {
                  let schemaToUse: ClientCardInstance | undefined;
                  const playerState =
                    colyseusRoom?.state.players.get(ownerSessionId);
                  if (playerState) {
                    const findSchema = (
                      id: string,
                      pState: ClientPlayerState
                    ): ClientCardInstance | undefined => {
                      let found: ClientCardInstance | undefined;
                      pState.hand.forEach((c) => {
                        if (c.instanceId === id) found = c;
                      });
                      if (found) return found;
                      pState.battlefield.forEach((c) => {
                        if (c.instanceId === id) found = c;
                      });
                      return found;
                    };
                    schemaToUse = findSchema(instanceId, playerState);
                  }

                  if (schemaToUse) {
                    this.updateCardVisual(
                      ownerSessionId,
                      "battlefield", // newArea is "battlefield"
                      targetSlotKey, // newSlotKey
                      schemaToUse
                    );
                  } else {
                    console.warn(
                      `BoardView: dragend (to battlefield) - Could not find card schema for instanceId ${instanceId} to update visual on area change.`
                    );
                  }
                }
                dropped = true;
                newAreaForServer = "battlefield";
                newSlotKeyForServer = targetSlotKey;
                break; // Break from battlefield slot loop
              }
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
  
  private showEnlargedCard(hoveredCardContainer: Phaser.GameObjects.Container) {
    const instanceId = hoveredCardContainer.getData("instanceId") as string;
    console.log(`BoardView: showEnlargedCard called for card ${instanceId}`);

    if (!colyseusRoom || !colyseusRoom.state || !this.scene.isActive()) {
      console.warn(`BoardView: showEnlargedCard - Colyseus room/state not available or scene inactive for ${instanceId}.`);
      return;
    }

    const ownerSessionId = hoveredCardContainer.getData("ownerSessionId") as string;
    const area = hoveredCardContainer.getData("area") as "hand" | "battlefield";
    const slotKey = hoveredCardContainer.getData("slotKey") as string;

    console.log(`BoardView: showEnlargedCard - Hovered card details: instanceId=${instanceId}, ownerSessionId=${ownerSessionId}, area=${area}, slotKey=${slotKey}`);

    const playerState = colyseusRoom.state.players.get(ownerSessionId) as ClientPlayerState | undefined;
    if (!playerState) {
      console.warn(`BoardView: showEnlargedCard - Player state not found for owner ${ownerSessionId}.`);
      return;
    }

    const cardCollection = area === "hand" ? playerState.hand : playerState.battlefield;
    const cardSchema = cardCollection.get(slotKey) as ClientCardInstance | undefined;

    if (!cardSchema || cardSchema.instanceId !== instanceId) {
      console.warn(`BoardView: Card schema not found or mismatch for enlarged display. Expected InstanceId: ${instanceId}, Area: ${area}, SlotKey: ${slotKey}, Owner: ${ownerSessionId}`);
      if (cardSchema) {
          console.warn(`BoardView: Found cardSchema with instanceId: ${cardSchema.instanceId} instead.`);
      } else {
          console.warn(`BoardView: cardSchema is undefined in collection for slotKey ${slotKey}.`);
      }
      console.warn(`BoardView: Looked in playerState.${area}. Collection size: ${cardCollection?.size}. Keys: ${cardCollection ? JSON.stringify(Array.from(cardCollection.keys())) : 'undefined'}`);
      return;
    }
    console.log(`BoardView: showEnlargedCard - Found card schema for ${cardSchema.name} (${instanceId})`);

    // Clear previous card visual if any
    if (this.enlargedCardVisual && this.enlargedCardVisual.active) {
      this.enlargedCardVisual.destroy();
    }
    this.enlargedCardVisual = null;

    // Create and add the new enlarged card visual
    const cardRenderData: CardRenderData = {
        name: cardSchema.name,
        attack: cardSchema.attack,
        speed: cardSchema.speed,
        health: cardSchema.health,
        currentHp: cardSchema.currentHp,
        brewCost: cardSchema.brewCost,
        artUrl: cardSchema.artUrl,
        instanceId: cardSchema.instanceId,
        rarity: cardSchema.rarity,
        statBuffs: cardSchema.statBuffs,
    };
    this.enlargedCardVisual = createCardGameObject(this, cardRenderData, 'full', false);
    this.enlargedCardVisual.setScale(1.5); // Scale it up
    this.enlargedCardDisplay.add(this.enlargedCardVisual);
    this.enlargedCardVisual.setPosition(0, -this.enlargedCardBackground.height / 2 + (FULL_CARD_HEIGHT * 1.5) / 2 + 10);

    // Effects Text
    let effectsContent = "Effects:\n";
    if (cardSchema.effects && cardSchema.effects.length > 0) {
      cardSchema.effects.forEach(effect => {
        effectsContent += `- ${effect.description}\n`;
      });
    } else {
      effectsContent += "- None\n";
    }
    this.enlargedCardEffectsText.setText(effectsContent);
    const effectsTextY = this.enlargedCardVisual.y + (FULL_CARD_HEIGHT * 1.5) / 2 + 10;
    this.enlargedCardEffectsText.setPosition(0, effectsTextY);

    // Buffs Text
    let buffsContent = "Buffs:\n";
    if (cardSchema.statBuffs && cardSchema.statBuffs.size > 0) {
      cardSchema.statBuffs.forEach((value, key) => {
        buffsContent += `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value > 0 ? '+' : ''}${value}\n`;
      });
    } else {
      buffsContent += "- None\n";
    }
    this.enlargedCardBuffsText.setText(buffsContent);
    const buffsTextY = this.enlargedCardEffectsText.y + this.enlargedCardEffectsText.height + 5;
    this.enlargedCardBuffsText.setPosition(0, buffsTextY);

    // Adjust background size
    const totalContentHeight = (FULL_CARD_HEIGHT * 1.5) + 20 + this.enlargedCardEffectsText.height + 5 + this.enlargedCardBuffsText.height + 20;
    this.enlargedCardBackground.setSize(300, Math.max(450, totalContentHeight));
    if (this.enlargedCardVisual) {
        this.enlargedCardVisual.setPosition(0, -this.enlargedCardBackground.height / 2 + (FULL_CARD_HEIGHT * 1.5) / 2 + 10);
    }

    // Refined positioning logic
    const hoveredCardActualWidth = hoveredCardContainer.getData('displayCardWidth') as number || FULL_CARD_WIDTH;

    let displayX = hoveredCardContainer.x + (hoveredCardActualWidth / 2) + (this.enlargedCardBackground.width / 2) + 10;
    let displayY = hoveredCardContainer.y;

    // Check right boundary
    if (displayX + this.enlargedCardBackground.width / 2 > this.cameras.main.width) {
        displayX = hoveredCardContainer.x - (hoveredCardActualWidth / 2) - (this.enlargedCardBackground.width / 2) - 10;
    }
    // Check left boundary (if placing to the left made it go off-screen left)
    if (displayX - this.enlargedCardBackground.width / 2 < 0) {
        displayX = this.enlargedCardBackground.width / 2 + 5; // Add a small margin
    }

    // Vertical boundary checks
    if (displayY - this.enlargedCardBackground.height / 2 < 0) {
        displayY = this.enlargedCardBackground.height / 2 + 5; // Add a small margin
    }
    if (displayY + this.enlargedCardBackground.height / 2 > this.cameras.main.height) {
        displayY = this.cameras.main.height - this.enlargedCardBackground.height / 2 - 5; // Add a small margin
    }
    this.enlargedCardDisplay.setPosition(displayX, displayY);
    console.log(`BoardView: showEnlargedCard - Positioning enlarged display at X=${displayX}, Y=${displayY} for card ${cardSchema.name}`);
  
    this.enlargedCardDisplay.setAlpha(0); // Start transparent for fade-in
    this.enlargedCardDisplay.setVisible(true);
    this.children.bringToTop(this.enlargedCardDisplay); // Ensure it's on top
  
    // Stop any existing tweens on the enlargedCardDisplay before starting a new one
    this.tweens.killTweensOf(this.enlargedCardDisplay);
    this.tweens.add({
      targets: this.enlargedCardDisplay,
      alpha: 1,
      duration: 200, // Adjust duration as needed
      ease: 'Power2'
    });
  
    console.log(`BoardView: showEnlargedCard - Enlarged display for ${cardSchema.name} is now visible.`);
  }
  
  private hideEnlargedCard() {
    if (this.enlargedCardDisplay && this.enlargedCardDisplay.visible) {
      console.log("BoardView: hideEnlargedCard called.");
      // Stop any existing tweens on the enlargedCardDisplay before starting a new one
      this.tweens.killTweensOf(this.enlargedCardDisplay);
      this.tweens.add({
        targets: this.enlargedCardDisplay,
        alpha: 0,
        duration: 150, // Adjust duration as needed
        ease: 'Power2',
        onComplete: () => {
          if (this.enlargedCardDisplay) { // Check if still exists
            this.enlargedCardDisplay.setVisible(false);
            if (this.enlargedCardVisual && this.enlargedCardVisual.active) {
              this.enlargedCardVisual.destroy();
            }
            this.enlargedCardVisual = null;
          }
        }
      });
    }
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
    this.phaseTimerText?.destroy(); // Destroy phase timer text
    this.matchTimerText?.destroy(); // Destroy match timer text

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
    this.hideEnlargedCard(); // Hide and clean up enlarged display
    if (this.enlargedCardDisplay && this.enlargedCardDisplay.active) {
        this.enlargedCardDisplay.destroy(); // Destroy the main container
    }
    // this.enlargedCardVisual is handled by hideEnlargedCard or if it's part of enlargedCardDisplay
    // this.enlargedCardBackground, this.enlargedCardEffectsText, this.enlargedCardBuffsText are children of enlargedCardDisplay
  
    this.cleanupListeners();
  
    // Unregister the shutdown event listener for this scene
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
}