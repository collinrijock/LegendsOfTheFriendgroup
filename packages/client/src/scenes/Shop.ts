import { Scene } from "phaser";
import { colyseusRoom } from "../utils/colyseusClient";
import { Phase, PlayerState, CardInstanceSchema } from "../../../server/src/schemas/GameState";
import { getStateCallbacks } from "colyseus.js";

const CARD_WIDTH = 120; // Was 100, updated for Full Card Sprite
const CARD_HEIGHT = 168; // Was 140, updated for Full Card Sprite

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

export class Shop extends Scene {
  private continueButton!: Phaser.GameObjects.Text;
  private shopCardObjects: Phaser.GameObjects.Container[] = [];
  private waitingText!: Phaser.GameObjects.Text;

  // For shop offers UI
  private shopOffersContainer!: Phaser.GameObjects.Container;
  private shopOffersBackground!: Phaser.GameObjects.Rectangle;
  private toggleShopButton!: Phaser.GameObjects.Text;
  private shopOffersVisible: boolean = true;

  private phaseListenerUnsub: (() => void) | null = null;
  private playerStateListenersUnsub: Map<string, () => void> = new Map();
  private shopOfferListenersUnsub: Array<() => void> = [];
  private listeners: Array<() => void> = [];

  constructor() {
    super("Shop");
  }

  create() {
    this.scene.launch("background");

    if (!this.scene.get("BoardView")?.scene.isActive()) {
        this.scene.launch("BoardView");
    }
    this.scene.bringToTop();

    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) {
        console.error("Shop Scene: Colyseus room not available!");
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Error: Connection lost.\nPlease return to Main Menu.", {
            fontFamily: "Arial",
            fontSize: '24px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);
        this.input.once('pointerdown', () => {
            try { colyseusRoom?.leave(true); } catch (e) {}
            this.scene.start('MainMenu');
        });
        return;
    }

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    this.add.text(centerX, 80, `Shop`, {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    this.add.text(centerX, 120, `Drag cards to your hand below to buy`, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#dddddd",
        align: "center",
      })
      .setOrigin(0.5);

    this.createShopCardsDisplay(centerX, centerY, gameWidth);
    this.setupDragAndDrop(); // For shop offers

    this.continueButton = this.add.text(
        centerX,
        gameHeight - 50,
        "Continue",
        {
          fontFamily: "Arial Black",
          fontSize: 40,
          color: "#00ff00",
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.continueButton.on('pointerdown', () => {
        const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId);
        if (colyseusRoom && myPlayerState && !myPlayerState.isReady && colyseusRoom.state.currentPhase === Phase.Shop) {
            colyseusRoom.send("playerReady");
        }
    });

    this.continueButton.on('pointerover', () => {
        if (this.continueButton.input?.enabled) this.continueButton.setColor('#55ff55');
    });
    this.continueButton.on('pointerout', () => {
         if (this.continueButton.input?.enabled) this.continueButton.setColor('#00ff00');
         else this.continueButton.setColor('#888888');
    });

    this.waitingText = this.add.text(centerX, gameHeight - 20, "", {
        fontFamily: "Arial", fontSize: 18, color: "#ffff00", align: "center"
    }).setOrigin(0.5).setVisible(false);

    this.setupColyseusListeners();
    this.updateWaitingStatus();
    this.time.delayedCall(50, () => this.createShopCardsDisplay(centerX, centerY, gameWidth)); // Recreate shop display

    // Toggle Shop Button
    this.toggleShopButton = this.add.text(
        gameWidth - 100, // Position top-right or similar
        centerY - 250, // Adjust Y to be above shop offers
        "Toggle Shop",
        {
            fontFamily: "Arial",
            fontSize: 16,
            color: "#FFFFFF",
            backgroundColor: "#555555",
            padding: { x: 5, y: 5 }
        }
    ).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    this.toggleShopButton.on('pointerdown', () => {
        this.shopOffersVisible = !this.shopOffersVisible;
        this.shopOffersContainer.setVisible(this.shopOffersVisible);
        this.toggleShopButton.setText(this.shopOffersVisible ? "Hide Shop" : "Show Shop");
    });
    // Initial text
    this.toggleShopButton.setText(this.shopOffersVisible ? "Hide Shop" : "Show Shop");
  }

  private createShopCardsDisplay(centerX: number, centerY: number, gameWidth: number) {
    // Destroy previous container if it exists
    this.shopOffersContainer?.destroy();

    // Create a container for shop offers and their background
    this.shopOffersContainer = this.add.container(0,0);
    this.shopOffersContainer.setVisible(this.shopOffersVisible);

    // Clear old card objects from the main scene list, they will be in the container
    this.shopCardObjects.forEach(obj => obj.destroy());
    this.shopCardObjects = [];

    const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId);
    const shopOfferIds = myPlayerState?.shopOfferIds;

    if (!shopOfferIds || shopOfferIds.length === 0) {
        console.log("Shop: No shop offers from server.");
        if (this.shopOffersBackground && this.shopOffersBackground.active) this.shopOffersBackground.setVisible(false);
        return;
    }

    const allCardsData = this.cache.json.get("cardData") as CardData[];
    if (!allCardsData) {
        console.error("Shop: Card data cache not loaded!");
        return;
    }

    const shopCardSpacing = 20;
    const numOffers = shopOfferIds.length > 0 ? shopOfferIds.length : 4;
    const shopY = centerY - 150;
    const totalShopWidth = numOffers * CARD_WIDTH + (numOffers - 1) * shopCardSpacing;
    const startShopX = centerX - totalShopWidth / 2 + CARD_WIDTH / 2;

    const bgWidth = totalShopWidth + shopCardSpacing * 2;
    const bgHeight = CARD_HEIGHT + shopCardSpacing * 2;
    if (this.shopOffersBackground && this.shopOffersBackground.active) {
        this.shopOffersBackground.destroy();
    }
    this.shopOffersBackground = this.add.rectangle(centerX, shopY, bgWidth, bgHeight, 0x000033, 0.6);
    this.shopOffersContainer.add(this.shopOffersBackground);

    shopOfferIds.forEach((cardId, index) => {
        const cardData = allCardsData.find(c => c.id === cardId);
        if (!cardData) {
            console.warn(`Shop: Card data not found for ID: ${cardId}`);
            return;
        }

        const cardX = startShopX + index * (CARD_WIDTH + shopCardSpacing);
        const cardContainer = this.add.container(cardX, shopY);

        const cardImage = this.add.image(0, 0, "cardFullTier1")
            .setOrigin(0.5)
            .setDisplaySize(CARD_WIDTH, CARD_HEIGHT);
        cardContainer.add(cardImage);

        // Name: Middle center
        const nameText = this.add.text(0, 0, cardData.name, {
            fontFamily: "Arial", fontSize: 14, color: "#ffffff", stroke: "#000000", strokeThickness: 2, align: "center", wordWrap: { width: CARD_WIDTH - 20 }
        }).setOrigin(0.5, 0.5);
        cardContainer.add(nameText);

        // Attack: Under name, to the left
        const attackText = this.add.text(-CARD_WIDTH / 2 + 15, CARD_HEIGHT * 0.25, `${cardData.attack}`, {
            fontFamily: "Arial", fontSize: 16, color: "#ffffff", stroke: "#000000", strokeThickness: 3
        }).setOrigin(0, 0.5);
        cardContainer.add(attackText);

        // HP: Middle right (currentHp/maxHealth format, for shop cards currentHp is maxHealth)
        const healthText = this.add.text(CARD_WIDTH / 2 - 15, 0, `${cardData.health}/${cardData.health}`, {
            fontFamily: "Arial", fontSize: 16, color: "#00ff00", stroke: "#000000", strokeThickness: 3
        }).setOrigin(1, 0.5);
        cardContainer.add(healthText);
        
        // Speed: Middle bottom
        const speedText = this.add.text(0, CARD_HEIGHT / 2 - 20, `${cardData.speed}`, {
            fontFamily: "Arial", fontSize: 16, color: "#ffffff", stroke: "#000000", strokeThickness: 3
        }).setOrigin(0.5, 1);
        cardContainer.add(speedText);

        // Brew Cost: Top-right corner (remains)
        const costText = this.add.text(CARD_WIDTH / 2 - 8, -CARD_HEIGHT / 2 + 8, `${cardData.brewCost}B`, {
            fontFamily: "Arial", fontSize: 14, color: "#ffff00", stroke: "#000000", strokeThickness: 3, align: "right"
        }).setOrigin(1, 0);
        cardContainer.add(costText);
        
        cardContainer.setSize(CARD_WIDTH, CARD_HEIGHT);
        // const descriptionText = this.add.text(0, CARD_HEIGHT / 2 - 25, cardData.description, {
        //     fontFamily: "Arial", fontSize: 9, color: "#dddddd", wordWrap: { width: CARD_WIDTH - 10 }, align: 'center'
        // }).setOrigin(0.5, 0);
        // cardContainer.add(descriptionText);

        cardContainer.setSize(CARD_WIDTH, CARD_HEIGHT); // Important for hit area
        cardContainer.setInteractive({ useHandCursor: true });
        cardContainer.setData("cardId", cardData.id);
        cardContainer.setData("cardData", cardData); // Store full card data if needed
        this.input.setDraggable(cardContainer);
        
        this.shopCardObjects.push(cardContainer);
        this.shopOffersContainer.add(cardContainer);
    });
  }

  private setupDragAndDrop() {
    this.input.off('dragstart');
    this.input.off('drag');
    this.input.off('dragend');

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        if (!(gameObject instanceof Phaser.GameObjects.Container) || !this.shopCardObjects.includes(gameObject)) return;
        if (!gameObject.input?.enabled) return;

        this.children.bringToTop(gameObject); // Bring container to top
        gameObject.setAlpha(0.7);
        gameObject.setData('startX', gameObject.x);
        gameObject.setData('startY', gameObject.y);
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
        if (!(gameObject instanceof Phaser.GameObjects.Container) || !this.shopCardObjects.includes(gameObject)) return;
        if (!gameObject.input?.enabled) return;
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        if (!colyseusRoom || !(gameObject instanceof Phaser.GameObjects.Container) || !this.shopCardObjects.includes(gameObject)) return;
        
        gameObject.setAlpha(1.0);
        const droppedX = gameObject.x;
        const droppedY = gameObject.y;
        let buyAttempted = false;

        const boardViewScene = this.scene.get("BoardView") as import("./BoardView").BoardView;

        for (let i = 0; i < 5; i++) {
            const slotPos = boardViewScene?.getSlotPixelPosition(true, 'hand', i);
            if (slotPos) {
                const handSlotDropZone = new Phaser.Geom.Rectangle(slotPos.x - 50, slotPos.y - 70, 100, 140);
                if (Phaser.Geom.Rectangle.Contains(handSlotDropZone, droppedX, droppedY)) {
                    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
                    if (myPlayerState && !myPlayerState.hand.has(String(i))) {
                        const cardId = gameObject.getData("cardId") as string;
                        if (cardId) {
                            colyseusRoom.send("buyCard", { cardId: cardId, handSlotIndex: i });
                            buyAttempted = true;
                        }
                    }
                    break;
                }
            }
        }

        if (gameObject.active) {
            gameObject.x = gameObject.getData('startX');
            gameObject.y = gameObject.getData('startY');
        }
    });
  }

  private setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.sessionId) return;
    const $ = getStateCallbacks(colyseusRoom);
    const myPlayerId = colyseusRoom.sessionId;

    this.phaseListenerUnsub = $(colyseusRoom.state).listen("currentPhase", (currentPhase) => {
        if (!this.scene.isActive()) return;
        if (currentPhase === Phase.Preparation) {
            if (this.scene.isActive()) {
                this.scene.stop();
                this.scene.start("Preparation");
            }
        } else if (currentPhase !== Phase.Shop) {
            if (this.scene.isActive()) {
                this.scene.stop();
                this.scene.start("Lobby");
            }
        }
        this.updateWaitingStatus();
    });

    colyseusRoom.state.players.forEach((player, sessionId) => {
        const unsub = $(player).listen("isReady", () => {
            if (this.scene.isActive()) this.updateWaitingStatus();
        });
        this.playerStateListenersUnsub.set(sessionId, unsub);
    });

    this.listeners.push($(colyseusRoom.state.players).onAdd((player, sessionId) => {
        if (this.playerStateListenersUnsub.has(sessionId)) {
            this.playerStateListenersUnsub.get(sessionId)?.();
        }
        const unsub = $(player).listen("isReady", () => {
            if (this.scene.isActive()) this.updateWaitingStatus();
        });
        this.playerStateListenersUnsub.set(sessionId, unsub);
        if (this.scene.isActive()) this.updateWaitingStatus();
    }));

    this.listeners.push($(colyseusRoom.state.players).onRemove((player, sessionId) => {
        this.playerStateListenersUnsub.get(sessionId)?.();
        this.playerStateListenersUnsub.delete(sessionId);
        if (this.scene.isActive()) this.updateWaitingStatus();
    }));

    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    if (myPlayerState) {
        const onShopOffersChanged = () => {
            if (!this.scene.isActive()) return;
            const centerX = this.cameras.main.centerX;
            const centerY = this.cameras.main.centerY;
            const gameWidth = this.cameras.main.width;
            this.createShopCardsDisplay(centerX, centerY, gameWidth);
        };
        this.shopOfferListenersUnsub.push($(myPlayerState.shopOfferIds).onAdd(onShopOffersChanged));
        this.shopOfferListenersUnsub.push($(myPlayerState.shopOfferIds).onRemove(onShopOffersChanged));
        onShopOffersChanged(); // Initial call
    }
  }

  private cleanupListeners() {
    console.log("Shop Scene: Cleaning up listeners.");
    this.phaseListenerUnsub?.();
    this.phaseListenerUnsub = null;

    this.playerStateListenersUnsub.forEach(unsub => unsub());
    this.playerStateListenersUnsub.clear();
    
    this.shopOfferListenersUnsub.forEach(unsub => unsub());
    this.shopOfferListenersUnsub = [];

    this.listeners.forEach(unsub => unsub());
    this.listeners = [];

    this.input.off('dragstart');
    this.input.off('drag');
    this.input.off('dragend');
    this.continueButton?.off('pointerdown');
    this.continueButton?.off('pointerover');
    this.continueButton?.off('pointerout');
  }

  private updateWaitingStatus() {
    if (!colyseusRoom || !colyseusRoom.sessionId || !this.continueButton || !this.waitingText || !this.scene.isActive()) return;

    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    if (!myPlayerState) return;

    let allPlayersReady = true;
    colyseusRoom.state.players.forEach((player) => {
        if (!player.isReady) allPlayersReady = false;
    });

    const amReady = myPlayerState.isReady;
    const isShopPhase = colyseusRoom.state.currentPhase === Phase.Shop;
    const canInteract = !amReady && isShopPhase;

    this.continueButton.setInteractive(canInteract);
    if (this.continueButton.input) this.continueButton.input.useHandCursor = canInteract;
    this.continueButton.setColor(canInteract ? "#00ff00" : "#888888");

    if (amReady && !allPlayersReady && isShopPhase) {
        this.waitingText.setText("Waiting for other player(s)...").setVisible(true);
        this.continueButton.setText("Waiting...");
    } else if (!isShopPhase) {
        this.waitingText.setText(`Waiting for ${colyseusRoom.state.currentPhase} phase...`).setVisible(true);
        this.continueButton.setText("Continue");
    } else {
        this.waitingText.setVisible(false);
        this.continueButton.setText("Continue");
    }

    this.shopCardObjects.forEach(cardObj => {
        if (cardObj.input) cardObj.input.enabled = canInteract;
    });
  }

  shutdown() {
    console.log("Shop scene shutting down.");
    this.cleanupListeners();

    this.shopCardObjects.forEach(obj => obj.destroy());
    this.shopCardObjects = [];
    
    this.continueButton?.destroy();
    this.waitingText?.destroy();
    this.toggleShopButton?.destroy();
    this.shopOffersContainer?.destroy(); // Destroy container which holds background and cards
  }
}