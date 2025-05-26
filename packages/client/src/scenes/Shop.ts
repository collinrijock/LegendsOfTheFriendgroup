import { Scene } from "phaser";
import { colyseusRoom, globalCardDataCache, CardData } from "../utils/colyseusClient";
import {
  Phase,
  ClientPlayerState,
  ClientCardInstance,
} from "../schemas/ClientSchemas";
import { getStateCallbacks } from "colyseus.js";
import {
  createCardGameObject,
  FULL_CARD_WIDTH as CARD_WIDTH,
  FULL_CARD_HEIGHT as CARD_HEIGHT,
  CardRenderData
} from "../utils/renderCardUtils";

// Removed local CardData interface, using imported one from colyseusClient

export class Shop extends Scene {
  private continueButton!: Phaser.GameObjects.Text;
  private shopCardObjects: Phaser.GameObjects.Container[] = [];
  private waitingText!: Phaser.GameObjects.Text;
  private refreshButton!: Phaser.GameObjects.Text;
  private cardDataCache: Map<string, CardData> = new Map(); // Add card data cache

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
      this.add
        .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY,
          "Error: Connection lost.\nPlease return to Main Menu.",
          {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ff0000",
            align: "center",
          }
        )
        .setOrigin(0.5);
      this.input.once("pointerdown", () => {
        try {
          colyseusRoom?.leave(true);
        } catch (e) {}
        this.scene.start("MainMenu");
      });
      return;
    }

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    this.createShopCardsDisplay(centerX, centerY, gameWidth);
    this.setupDragAndDrop(); // For shop offers
    
    // Request data for shop cards
    this.requestMissingCardData();
    
    // Create refresh button
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    const refreshCost = myPlayerState?.shopRefreshCost || 2;
    
    this.refreshButton = this.add.text(gameWidth - 150, 180, `Refresh: ${refreshCost} 🍺`, {
      fontFamily: "Arial",
      fontSize: 22, // Increased from 18
      color: "#FFFFFF",
      backgroundColor: "#4444AA",
      padding: { x: 15, y: 8 }, // Increased padding
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
  
    this.refreshButton.on("pointerdown", () => {
      const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId);
      if (colyseusRoom && myPlayerState && myPlayerState.brews >= myPlayerState.shopRefreshCost) {
        colyseusRoom.send("refreshShop");
      }
    });
  
    this.refreshButton.on("pointerover", () => {
      if (this.refreshButton.input?.enabled) {
        this.refreshButton.setBackgroundColor("#6666CC");
      }
    });
  
    this.refreshButton.on("pointerout", () => {
      if (this.refreshButton.input?.enabled) {
        this.refreshButton.setBackgroundColor("#4444AA");
      }
    });
  
    // Initial update of button state
    this.updateRefreshButtonState();
  
    this.continueButton = this.add
      .text(centerX, gameHeight - 50, "Continue", {
        fontFamily: "Arial Black",
        fontSize: 40,
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    this.continueButton.on("pointerdown", () => {
      const myPlayerState = colyseusRoom?.state.players.get(
        colyseusRoom.sessionId
      ) as ClientPlayerState | undefined; // Added type cast

      if (
        colyseusRoom &&
        myPlayerState &&
        colyseusRoom.state.currentPhase === Phase.Shop
      ) {
        if (myPlayerState.isReady) {
          // Player is already ready, so send unready
          colyseusRoom.send("playerUnready");
        } else {
          // Player is not ready, so send ready
          colyseusRoom.send("playerReady");
        }
      }
    });

    this.continueButton.on("pointerover", () => {
      if (this.continueButton.input?.enabled) {
        const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId) as ClientPlayerState | undefined;
        if (myPlayerState?.isReady) {
          this.continueButton.setColor("#ffaa55"); // Hover color for "Cancel Ready"
        } else {
          this.continueButton.setColor("#55ff55"); // Hover color for "Continue"
        }
      }
    });
    this.continueButton.on("pointerout", () => {
      if (this.continueButton.input?.enabled) {
        const myPlayerState = colyseusRoom?.state.players.get(colyseusRoom.sessionId) as ClientPlayerState | undefined;
        if (myPlayerState?.isReady) {
          this.continueButton.setColor("#ff8800"); // Normal color for "Cancel Ready"
        } else {
          this.continueButton.setColor("#00ff00"); // Normal color for "Continue"
        }
      } else {
        this.continueButton.setColor("#888888"); // Disabled color
      }
    });

    this.waitingText = this.add
      .text(centerX, gameHeight - 20, "", {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#ffff00",
        align: "center",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.setupColyseusListeners();
    this.updateWaitingStatus();
    this.time.delayedCall(50, () =>
      this.createShopCardsDisplay(centerX, centerY, gameWidth)
    ); // Recreate shop display

    // Toggle Shop Button
    this.toggleShopButton = this.add
      .text(
        gameWidth - 100, // Position top-right or similar
        centerY - 250, // Adjust Y to be above shop offers
        "Toggle Shop",
        {
          fontFamily: "Arial",
          fontSize: 16,
          color: "#FFFFFF",
          backgroundColor: "#555555",
          padding: { x: 5, y: 5 },
        }
      )
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true });

    this.toggleShopButton.on("pointerdown", () => {
      this.shopOffersVisible = !this.shopOffersVisible;
      this.shopOffersContainer.setVisible(this.shopOffersVisible);
      this.toggleShopButton.setText(
        this.shopOffersVisible ? "Hide Shop" : "Show Shop"
      );
    });
    // Initial text
    this.toggleShopButton.setText(
      this.shopOffersVisible ? "Hide Shop" : "Show Shop"
    );
  
    // Register shutdown event listener
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
  
  private createShopCardsDisplay(
    centerX: number,
    centerY: number,
    gameWidth: number
  ) {
    // Destroy previous container if it exists
    this.shopOffersContainer?.destroy();

    // Create a container for shop offers and their background
    this.shopOffersContainer = this.add.container(0, 0);
    this.shopOffersContainer.setVisible(this.shopOffersVisible);

    // Clear old card objects from the main scene list, they will be in the container
    this.shopCardObjects.forEach((obj) => obj.destroy());
    this.shopCardObjects = [];

    const myPlayerState = colyseusRoom?.state.players.get(
      colyseusRoom.sessionId
    );
    const shopOfferIds = myPlayerState?.shopOfferIds;

    if (!shopOfferIds || shopOfferIds.length === 0) {
      console.log("Shop: No shop offers from server.");
      if (this.shopOffersBackground && this.shopOffersBackground.active)
        this.shopOffersBackground.setVisible(false);
      return;
    }

    // Get card data directly from server state instead of local JSON
    const shopCardSpacing = 20;
    const numOffers = shopOfferIds.length > 0 ? shopOfferIds.length : 4;
    const shopY = centerY;
    const totalShopWidth =
      numOffers * CARD_WIDTH + (numOffers - 1) * shopCardSpacing;
    const startShopX = centerX - totalShopWidth / 2 + CARD_WIDTH / 2;

    const bgWidth = totalShopWidth + shopCardSpacing * 2;
    const bgHeight = CARD_HEIGHT + shopCardSpacing * 2;
    if (this.shopOffersBackground && this.shopOffersBackground.active) {
      this.shopOffersBackground.destroy();
    }
    this.shopOffersBackground = this.add.rectangle(
      centerX,
      shopY,
      bgWidth,
      bgHeight,
      0x000033,
      0.6
    );
    this.shopOffersContainer.add(this.shopOffersBackground);

    shopOfferIds.forEach((cardId: string, index: number) => {
      const cardData = this.getCardDataFromServer(cardId);
      
      if (!cardData) {
        console.warn(`Shop: Card data not found for ID: ${cardId}`);
        return;
      }

      const cardX = startShopX + index * (CARD_WIDTH + shopCardSpacing);
      
      // Convert CardData to CardRenderData
      const cardRenderData: CardRenderData = {
        name: cardData.name,
        attack: cardData.attack,
        speed: cardData.speed,
        health: cardData.health,
        brewCost: cardData.brewCost,
        artUrl: cardData.artUrl,
        statBuffs: new Map<string, number>() // Shop offers don't have buffs yet
      };

      // Use the utility function to create the card
      const cardContainer = createCardGameObject(this, cardRenderData, 'full', false);
      cardContainer.setPosition(cardX, shopY);

      cardContainer.setSize(CARD_WIDTH, CARD_HEIGHT);
      cardContainer.setInteractive({ useHandCursor: true });
      cardContainer.setData("cardId", cardData.id);
      cardContainer.setData("cardData", cardData);
      this.input.setDraggable(cardContainer);

      // Add pointerdown and pointerup listeners for click-to-buy
      cardContainer.off('pointerdown').on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!cardContainer.input?.enabled) return;
        cardContainer.setData('isBeingDragged', false);
      });

      cardContainer.off('pointerup').on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (!cardContainer.input?.enabled) return;
        if (!colyseusRoom || !colyseusRoom.sessionId) return;

        if (cardContainer.getData('isBeingDragged') === true) {
            cardContainer.setData('isBeingDragged', false);
            return;
        }

        // Click-to-buy logic remains the same
        const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
        if (!myPlayerState) return;

        let firstEmptyHandSlot = -1;
        for (let i = 0; i < 5; i++) {
            if (!myPlayerState.hand.has(String(i))) {
                firstEmptyHandSlot = i;
                break;
            }
        }

        if (firstEmptyHandSlot !== -1) {
            const cardId = cardContainer.getData('cardId') as string;
            const currentCardData = cardContainer.getData('cardData') as CardData;

            if (cardId && currentCardData && myPlayerState.brews >= currentCardData.brewCost) {
                console.log(`Shop: Click-to-buy card ${cardId} (Cost: ${currentCardData.brewCost}) into hand slot ${firstEmptyHandSlot}. Brews: ${myPlayerState.brews}`);
                colyseusRoom.send("buyCard", {
                    cardId: cardId,
                    handSlotIndex: firstEmptyHandSlot,
                });
            } else {
                if (currentCardData && myPlayerState.brews < currentCardData.brewCost) {
                    console.log(`Shop: Not enough brews (${myPlayerState.brews}) to click-buy card ${cardId} (Cost: ${currentCardData.brewCost}).`);
                } else {
                    console.log(`Shop: Click-to-buy failed for card ${cardId}. CardData: ${!!currentCardData}`);
                }
            }
        } else {
            console.log("Shop: Hand is full, cannot click-buy.");
        }
      });

      this.shopCardObjects.push(cardContainer);
      this.shopOffersContainer.add(cardContainer);
    });
  }

  private requestMissingCardData() {
    if (!colyseusRoom || !colyseusRoom.state || !colyseusRoom.sessionId) return;
    
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId);
    if (!myPlayerState) return;
    
    const shopOfferIds = myPlayerState.shopOfferIds;
    
    if (shopOfferIds && shopOfferIds.length > 0) {
      // Get IDs for cards not in global cache
      const missingIds: string[] = [];
      shopOfferIds.forEach((id: string) => { // Type 'string' inferred from shopOfferIds: ArraySchema<string>
        if (!globalCardDataCache.has(id)) {
          missingIds.push(id);
        }
      });
      
      // Request missing card data
      if (missingIds.length > 0) {
        console.log("Requesting missing cards from server:", missingIds);
        colyseusRoom.send("getCardsByIds", { cardIds: missingIds });
      }
    }
  }

  private getCardDataFromServer(cardId: string): CardData | undefined {
    // First check the global card cache
    if (globalCardDataCache.has(cardId)) {
      return globalCardDataCache.get(cardId);
    }
    
    // If not in global cache, check existing instances in the state
    if (!colyseusRoom || !colyseusRoom.state) return undefined;

    let cardData: CardData | undefined = undefined;

    colyseusRoom.state.players.forEach((player: any) => { // Cast to any or use ClientPlayerState
      // Look in player's hand
      (player as ClientPlayerState).hand.forEach((card: ClientCardInstance) => {
        if (card.cardId === cardId) {
          cardData = {
            id: card.cardId,
            name: card.name,
            attack: card.attack,
            speed: card.speed,
            health: card.health,
            brewCost: card.brewCost,
            description: card.description,
            isLegend: card.isLegend
          };
        }
      });
      
      // Look in player's battlefield
      (player as ClientPlayerState).battlefield.forEach((card: ClientCardInstance) => {
        if (card.cardId === cardId) {
          cardData = {
            id: card.cardId,
            name: card.name,
            attack: card.attack,
            speed: card.speed,
            health: card.health,
            brewCost: card.brewCost,
            description: card.description,
            isLegend: card.isLegend
          };
        }
      });
    });
    
    // Create a placeholder if we still don't have data
    if (!cardData) {
      cardData = {
        id: cardId,
        name: `Card ${cardId.split('_').pop()}`,
        attack: 1,
        speed: 1,
        health: 1,
        brewCost: 1,
        description: "Loading card details...",
        isLegend: false
      };
      console.warn(`Shop: Card data not found for ID: ${cardId} in global cache or state`);
    }
    
    return cardData;
  }

  private setupDragAndDrop() {
    this.input.off("dragstart");
    this.input.off("drag");
    this.input.off("dragend");
    this.input.off("pointerdown"); // Ensure we clear previous general pointerdown if any
    this.input.off("pointerup");   // Ensure we clear previous general pointerup if any

    // Remove individual pointerdown/pointerup from shopCardObjects if set previously
    this.shopCardObjects.forEach(cardContainer => {
        cardContainer.off('pointerdown');
        cardContainer.off('pointerup');
    });


    this.input.on(
      "dragstart",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        if (
          !(gameObject instanceof Phaser.GameObjects.Container) ||
          !this.shopCardObjects.includes(gameObject)
        )
          return;
        if (!gameObject.input?.enabled) return;

        this.children.bringToTop(gameObject); // Bring container to top
        gameObject.setAlpha(0.7);
        gameObject.setData("startX", gameObject.x);
        gameObject.setData("startY", gameObject.y);
        gameObject.setData('isBeingDragged', true); // Flag that dragging has started
      }
    );

    this.input.on(
      "drag",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number
      ) => {
        if (
          !(gameObject instanceof Phaser.GameObjects.Container) ||
          !this.shopCardObjects.includes(gameObject)
        )
          return;
        if (!gameObject.input?.enabled) return;
        if (gameObject.getData('isBeingDragged') === true) { // Only move if dragging
            gameObject.x = dragX;
            gameObject.y = dragY;
        }
      }
    );

    this.input.on(
      "dragend",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        if (
          !colyseusRoom ||
          !(gameObject instanceof Phaser.GameObjects.Container) ||
          !this.shopCardObjects.includes(gameObject)
        ) {
          if (gameObject instanceof Phaser.GameObjects.Container) {
            gameObject.setData('isBeingDragged', false); // Reset flag even if other conditions fail
          }
          return;
        }
        
        gameObject.setAlpha(1.0);
        let buyAttempted = false;

        if (gameObject.getData('isBeingDragged') === true) { // Process drop only if it was a drag
            const droppedX = gameObject.x;
            const droppedY = gameObject.y;

            const boardViewScene = this.scene.get(
              "BoardView"
            ) as import("./BoardView").BoardView;

            // Check hand slots
            for (let i = 0; i < 5; i++) {
              const slotPos = boardViewScene?.getSlotPixelPosition(true, "hand", i);
              if (slotPos) {
                const handSlotDropZone = new Phaser.Geom.Rectangle(
                  slotPos.x - 50,
                  slotPos.y - 70,
                  100,
                  140
                );
                if (
                  Phaser.Geom.Rectangle.Contains(
                    handSlotDropZone,
                    droppedX,
                    droppedY
                  )
                ) {
                  const myPlayerState = colyseusRoom.state.players.get(
                    colyseusRoom.sessionId
                  );
                  if (myPlayerState && !myPlayerState.hand.has(String(i))) {
                    const cardId = gameObject.getData("cardId") as string;
                    const cardData = gameObject.getData("cardData") as CardData;
                    if (cardId && cardData && myPlayerState.brews >= cardData.brewCost) {
                      colyseusRoom.send("buyCard", {
                        cardId: cardId,
                        handSlotIndex: i,
                      });
                      buyAttempted = true;
                    } else {
                        // Not enough brews or cardData missing
                        console.log("Shop: Drag-to-buy failed (not enough brews or card data missing).");
                    }
                  }
                  break;
                }
              }
            }

            // Check battlefield slots (No battlefield drop from shop)
            // This part can be removed if shop cards can only go to hand.
            // If shop cards *can* go to battlefield, this logic is fine.
            // For now, let's assume shop cards only go to hand.

            if (!buyAttempted) {
              // Snap back if not bought
              if (gameObject.active) {
                gameObject.x = gameObject.getData("startX");
                gameObject.y = gameObject.getData("startY");
              }
            }
        }
        gameObject.setData('isBeingDragged', false); // Reset drag flag
      }
    );
  }

  private updateRefreshButtonState() {
    if (!colyseusRoom || !this.refreshButton || !this.refreshButton.active) return;
    
    const myPlayerState = colyseusRoom.state.players.get(colyseusRoom.sessionId) as ClientPlayerState | undefined; // Cast for type safety
    if (!myPlayerState) return;
    
    // Update text with current cost
    this.refreshButton.setText(`Refresh Shop: ${myPlayerState.shopRefreshCost} 🍺`);
    
    // Enable/disable based on whether player has enough brews AND is not ready AND is in Shop phase
    const canRefresh = myPlayerState.brews >= myPlayerState.shopRefreshCost &&
                    !myPlayerState.isReady && // Player cannot refresh if they are ready
                    colyseusRoom.state.currentPhase === Phase.Shop;
    
    if (canRefresh) {
      this.refreshButton.setColor("#FFFFFF");
      this.refreshButton.setBackgroundColor("#4444AA");
      this.refreshButton.setInteractive({ useHandCursor: true });
    } else {
      this.refreshButton.setColor("#AAAAAA");
      this.refreshButton.setBackgroundColor("#555555");
      this.refreshButton.disableInteractive();
    }
  }
  
  private setupColyseusListeners() {
    if (!colyseusRoom || !colyseusRoom.sessionId) return;
    const $ = getStateCallbacks(colyseusRoom);
    const myPlayerId = colyseusRoom.sessionId;

    this.phaseListenerUnsub = $(colyseusRoom.state).listen(
      "currentPhase",
      (currentPhase) => {
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
      }
    );

    colyseusRoom.state.players.forEach((player: any, sessionId: string) => { // Cast to any or use ClientPlayerState
      const unsub = $(player as ClientPlayerState).listen("isReady", () => {
        if (this.scene.isActive()) this.updateWaitingStatus();
      });
      this.playerStateListenersUnsub.set(sessionId, unsub);
    });

    this.listeners.push(
      $(colyseusRoom.state.players).onAdd((player: any, sessionId: string) => { // Cast to any or use ClientPlayerState
        if (this.playerStateListenersUnsub.has(sessionId)) {
          this.playerStateListenersUnsub.get(sessionId)?.();
        }
        const unsub = $(player as ClientPlayerState).listen("isReady", () => {
          if (this.scene.isActive()) this.updateWaitingStatus();
        });
        this.playerStateListenersUnsub.set(sessionId, unsub);
        if (this.scene.isActive()) this.updateWaitingStatus();
      })
    );

    this.listeners.push(
      $(colyseusRoom.state.players).onRemove((player: any, sessionId: string) => {
        this.playerStateListenersUnsub.get(sessionId)?.();
        this.playerStateListenersUnsub.delete(sessionId);
        if (this.scene.isActive()) this.updateWaitingStatus();
      })
    );

    // Listen for card data responses
    this.listeners.push(
      colyseusRoom.onMessage("cardsByIds", (data: { [cardId: string]: CardData }) => {
        if (this.scene.isActive()) {
          // Update the global cache
          Object.entries(data).forEach(([cardId, cardData]) => {
            globalCardDataCache.set(cardId, cardData);
          });
          
          // Update shop display with the new data
          const centerX = this.cameras.main.centerX;
          const centerY = this.cameras.main.centerY;
          const gameWidth = this.cameras.main.width;
          this.createShopCardsDisplay(centerX, centerY, gameWidth);
        }
      })
    );

    const myPlayerState = colyseusRoom.state.players.get(myPlayerId);
    if (myPlayerState) {
      const onShopOffersChanged = () => {
        if (!this.scene.isActive()) return;
        // Request data for any new shop cards
        this.requestMissingCardData();
        // Immediate update with what data we have
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const gameWidth = this.cameras.main.width;
        this.createShopCardsDisplay(centerX, centerY, gameWidth);
      };
      this.shopOfferListenersUnsub.push(
        $(myPlayerState.shopOfferIds).onAdd(onShopOffersChanged)
      );
      this.shopOfferListenersUnsub.push(
        $(myPlayerState.shopOfferIds).onRemove(onShopOffersChanged)
      );
      onShopOffersChanged(); // Initial call
      
      // Add listeners for brews and shopRefreshCost to update refresh button state
      this.listeners.push(
        $(myPlayerState).listen("brews", () => {
          if (this.scene.isActive()) this.updateRefreshButtonState();
        })
      );
      
      this.listeners.push(
        $(myPlayerState).listen("shopRefreshCost", () => {
          if (this.scene.isActive()) this.updateRefreshButtonState();
        })
      );
    }
  }

  private cleanupListeners() {
    console.log("Shop Scene: Cleaning up listeners.");
    this.phaseListenerUnsub?.();
    this.phaseListenerUnsub = null;

    this.playerStateListenersUnsub.forEach((unsub) => unsub());
    this.playerStateListenersUnsub.clear();

    this.shopOfferListenersUnsub.forEach((unsub) => unsub());
    this.shopOfferListenersUnsub = [];

    this.listeners.forEach((unsub) => unsub());
    this.listeners = [];

    this.input.off("dragstart");
    this.input.off("drag");
    this.input.off("dragend");
    this.continueButton?.off("pointerdown");
    this.continueButton?.off("pointerover");
    this.continueButton?.off("pointerout");
  }

  private updateWaitingStatus() {
    if (
      !colyseusRoom ||
      !colyseusRoom.sessionId ||
      !this.continueButton ||
      !this.waitingText ||
      !this.scene.isActive()
    )
      return;

    const myPlayerState = colyseusRoom.state.players.get(
      colyseusRoom.sessionId
    );
    if (!myPlayerState) return;

    let allPlayersReady = true;
    colyseusRoom.state.players.forEach((player: any) => { // Cast to any or use ClientPlayerState
      if (!(player as ClientPlayerState).isReady) allPlayersReady = false;
    });

    const amReady = myPlayerState.isReady;
    const isShopPhase = colyseusRoom.state.currentPhase === Phase.Shop;
    const canInteract = isShopPhase; // Player can always interact with the button in Shop phase if it's enabled

    this.continueButton.setInteractive(canInteract);
    
    if (amReady) {
      this.continueButton.setText("Cancel Ready").setColor("#ff8800"); // Orange for cancel
    } else {
      this.continueButton.setText("Continue").setColor("#00ff00"); // Green for continue
    }
    // Ensure disabled color is applied if interaction is not allowed (e.g. wrong phase, though canInteract handles this for Shop)
    if (!canInteract) {
        this.continueButton.setColor("#888888").disableInteractive();
    }


    if (amReady && !allPlayersReady && isShopPhase) {
      this.waitingText
        .setText("Waiting for other player(s)...")
        .setVisible(true);
      // Button text is already "Cancel Ready"
    } else if (!isShopPhase) {
      this.waitingText
        .setText(`Waiting for ${colyseusRoom.state.currentPhase} phase...`)
        .setVisible(true);
      this.continueButton.setText("Continue").setColor("#888888").disableInteractive(); // Disable if not shop phase
    } else {
      this.waitingText.setVisible(false);
      // Button text is "Continue" or "Cancel Ready" based on amReady
    }

    this.shopCardObjects.forEach((cardObj) => {
      if (cardObj.input) cardObj.input.enabled = !amReady && isShopPhase; // Can only interact with cards if not ready
    });

    // Update refresh button interactability based on ready state
    this.updateRefreshButtonState(); // Call this to ensure refresh button is disabled if player is ready
  }

  shutdown() {
    console.log("Shop scene shutting down.");
    this.cleanupListeners();

    this.shopCardObjects.forEach((obj) => obj.destroy());
    this.shopCardObjects = [];

    this.continueButton?.destroy();
    this.waitingText?.destroy();
    this.refreshButton?.off("pointerdown");
    this.refreshButton?.off("pointerover");
    this.refreshButton?.off("pointerout");
    this.refreshButton?.destroy();
    this.toggleShopButton?.destroy();
    this.shopOffersContainer?.destroy(); // Destroy container which holds background and cards

    // Unregister the shutdown event listener for this scene
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }
}