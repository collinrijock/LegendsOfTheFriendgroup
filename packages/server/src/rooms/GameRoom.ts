import { Client, Room, Delayed } from "colyseus";
// Import the updated schemas and Phase enum
import {
  GameState,
  PlayerState,
  CardInstanceSchema,
  Phase,
} from "../schemas/GameState";
// Add fs module import for reading JSON
import * as fs from 'fs';
import * as path from 'path';

// Load card database from JSON file
const cardDatabasePath = path.join(__dirname, '../../src/data/cards.json');
const cardDatabase = JSON.parse(fs.readFileSync(cardDatabasePath, 'utf8'));

// --- Constants for Rewards ---
const DAILY_BREW_BONUS = 5;
const BREW_PER_KILL = 1;
// --- End Constants ---

// Helper function for unique IDs (consider a more robust library like uuid)
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Helper method to generate shop offers for a specific player

export class GameRoom extends Room<GameState> {
  // Remove old state initialization if present
  // state = new GameState(); // This is handled by Colyseus now

  maxClients = 2; // Set max clients for 1v1
  battleEndTimeout: Delayed | null = null; // For delayed transition after battle ends
  battleTimerInterval: Delayed | null = null; // For server-side battle timer countdown
  private cardAttackReadiness: Map<string, number> = new Map(); // instanceId -> msToNextAttack
  private generatePlayerShopOffers(player: PlayerState) {
    player.shopOfferIds.clear(); // Clear previous offers
    const availableCards = [
      ...cardDatabase.filter((card: { isLegend: any }) => !card.isLegend),
    ]; // Create a copy to modify, exclude legends
    const selectedIds = new Set<string>();

    while (selectedIds.size < 4 && availableCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const chosenCard = availableCards.splice(randomIndex, 1)[0];
      selectedIds.add(chosenCard.id);
    }

    selectedIds.forEach((id) => player.shopOfferIds.push(id));
    console.log(
      `Generated shop offers for ${
        player.username
      }: [${player.shopOfferIds.join(", ")}]`
    );
  }
  onCreate(options: any): void | Promise<any> {
    console.log("GameRoom created!");
    this.setState(new GameState());
    this.state.currentPhase = Phase.Lobby;
    this.state.currentDay = 0;

    // Add getAllCards message handler
    this.onMessage("getAllCards", (client) => {
      client.send("allCards", cardDatabase);
    });

    // Add getCardsByIds message handler
    this.onMessage("getCardsByIds", (client, message: { cardIds: string[] }) => {
      const cardIds = message.cardIds;
      const cardsData: Record<string, any> = {};
      cardIds.forEach(cardId => {
        const cardData = this.getCardDataById(cardId);
        if (cardData) {
          cardsData[cardId] = cardData;
        }
      });
      client.send("cardsByIds", cardsData);
    });

    this.onMessage("playerReady", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player && player.isReady === false) {
        console.log(
          `Player ${client.sessionId} is ready for phase: ${this.state.currentPhase}`
        );
        player.isReady = true;
        this.checkPhaseTransition();
      }
    });

    this.onMessage("refreshShop", (client) => {
      const player = this.state.players.get(client.sessionId);

      if (!player) {
        console.warn(
          `refreshShop: Player not found for session ID: ${client.sessionId}`
        );
        return;
      }

      if (this.state.currentPhase !== Phase.Shop) {
        console.warn(
          `refreshShop: Incorrect phase. Player ${player.username} tried to refresh shop outside Shop phase. Current phase: ${this.state.currentPhase}`
        );
        return;
      }

      if (player.brews < player.shopRefreshCost) {
        console.warn(
          `refreshShop: Player ${player.username} doesn't have enough brews (${player.brews}) to refresh shop (cost: ${player.shopRefreshCost}).`
        );
        return;
      }

      // Deduct refresh cost from player's brews
      player.brews -= player.shopRefreshCost;

      // Store current cost before doubling for logging
      const oldCost = player.shopRefreshCost;

      // Double the refresh cost for next time
      player.shopRefreshCost *= 2;

      // Generate new shop offers for this player
      this.generatePlayerShopOffers(player);

      console.log(
        `Player ${player.username} refreshed shop for ${oldCost} brews. New refresh cost: ${player.shopRefreshCost}. Remaining brews: ${player.brews}`
      );
    });

    // Update message type hint to expect cardId (string)
    this.onMessage(
      "buyCard",
      (client, message: { cardId: string; handSlotIndex: number }) => {
        const player = this.state.players.get(client.sessionId);
        const cardId = message.cardId; // Get the base card ID being bought
        const slotIndex = message.handSlotIndex;

        if (!player || this.state.currentPhase !== Phase.Shop) {
          console.warn(
            `Buy attempt failed: Invalid state (Player: ${!!player}, Phase: ${
              this.state.currentPhase
            })`
          );
          return; // Wrong phase or player not found
        }
        if (slotIndex < 0 || slotIndex > 4) {
          console.warn(`Buy attempt failed: Invalid slot index ${slotIndex}`);
          return; // Invalid slot
        }
        if (player.hand.has(String(slotIndex))) {
          console.warn(
            `Buy attempt failed: Hand slot ${slotIndex} is already full.`
          );
          return; // Slot already full
        }
        // --- Validate against shopOfferIds ---
        if (!player.shopOfferIds.includes(cardId)) {
          console.warn(
            `Buy attempt failed: Card ID ${cardId} not found in player's shop offers.`
          );
          return; // Card not offered to this player
        }
        // --- End Validation ---

        // Fetch full card data using the ID
        const cardData = this.getCardDataById(cardId);

        if (!cardData || typeof cardData.brewCost !== "number") {
          console.warn(
            `Buy attempt failed: Invalid card data found for ID ${cardId}.`
          );
          return; // Invalid card data in database?
        }
        if (player.brews < cardData.brewCost) {
          console.warn(
            `Buy attempt failed: Insufficient brews (Player: ${player.brews}, Cost: ${cardData.brewCost})`
          );
          return; // Not enough brews
        }

        // Process the purchase
        player.brews -= cardData.brewCost;
        const newInstanceId = generateUniqueId();
        const newCardInstance = CardInstanceSchema.fromCardData(
          cardData,
          newInstanceId
        );
        player.hand.set(String(slotIndex), newCardInstance);

        console.log(
          `Player ${client.sessionId} bought ${cardData.name} (ID: ${cardId}) for ${cardData.brewCost}. Placed in hand slot ${slotIndex}. Remaining brews: ${player.brews}`
        );

        // --- Remove bought card ID from shop offers ---
        const offerIndex = player.shopOfferIds.findIndex((id) => id === cardId);
        if (offerIndex > -1) {
          player.shopOfferIds.splice(offerIndex, 1);
          console.log(
            `Removed card ID ${cardId} from shop offers for player ${client.sessionId}.`
          );
        } else {
          console.warn(
            `Could not find bought card ID ${cardId} in shop offers for player ${client.sessionId} to remove it.`
          );
        }
        // --- End Remove ---

        // Client UI should update based on state change automatically
      }
    );

    // Update the type hint for the message payload to expect instance IDs
    this.onMessage(
      "setPreparation",
      (
        client,
        message: {
          handLayout: { [key: string]: string | null };
          battlefieldLayout: { [key: string]: string | null };
        }
      ) => {
        const player = this.state.players.get(client.sessionId);
        if (!player || this.state.currentPhase !== Phase.Preparation) {
          console.warn(
            `SetPreparation failed: Invalid state (Player: ${!!player}, Phase: ${
              this.state.currentPhase
            })`
          );
          return; // Wrong phase or player not found
        }

        console.log(`Received preparation layout from ${client.sessionId}`);

        // --- Server-Side Rearrangement Logic ---
        // 1. Gather all current card instances owned by the player
        const currentCards = new Map<string, CardInstanceSchema>();
        player.hand.forEach((card) => currentCards.set(card.instanceId, card));
        player.battlefield.forEach((card) =>
          currentCards.set(card.instanceId, card)
        );

        // 2. Clear the player's current hand and battlefield in the state
        player.hand.clear();
        player.battlefield.clear();

        // 3. Repopulate hand based on the received layout and existing instances
        Object.entries(message.handLayout).forEach(([index, instanceId]) => {
          if (instanceId) {
            const cardInstance = currentCards.get(instanceId);
            if (cardInstance) {
              // Don't reset HP - we want to preserve damage between phases
              player.hand.set(String(index), cardInstance);
            } else {
              console.warn(
                `SetPreparation Warning: Player ${client.sessionId} tried to place unknown card instance ID ${instanceId} in hand slot ${index}.`
              );
            }
          }
        });

        // 4. Repopulate battlefield based on the received layout and existing instances
        Object.entries(message.battlefieldLayout).forEach(
          ([index, instanceId]) => {
            if (instanceId) {
              const cardInstance = currentCards.get(instanceId);
              if (cardInstance) {
                // Don't reset HP - we want to preserve damage between phases
                player.battlefield.set(String(index), cardInstance);
              } else {
                console.warn(
                  `SetPreparation Warning: Player ${client.sessionId} tried to place unknown card instance ID ${instanceId} in battlefield slot ${index}.`
                );
              }
            }
          }
        );
        // --- End Server-Side Rearrangement Logic ---

        console.log(
          `Player ${client.sessionId} preparation set. Hand size: ${player.hand.size}, Battlefield size: ${player.battlefield.size}`
        );

        player.isReady = true;
        this.checkPhaseTransition();
      }
    );

    this.onMessage(
      "moveCardInHand",
      (
        client,
        message: { instanceId: string; fromSlotKey: string; toSlotKey: string }
      ) => {
        const player = this.state.players.get(client.sessionId);

        if (!player) {
          console.warn(
            `moveCardInHand: Player not found for session ID: ${client.sessionId}`
          );
          return;
        }

        if (this.state.currentPhase !== Phase.Shop) {
          console.warn(
            `moveCardInHand: Incorrect phase. Player ${player.username} tried to move card outside Shop phase. Current phase: ${this.state.currentPhase}`
          );
          return;
        }

        const { instanceId, fromSlotKey, toSlotKey } = message;

        if (fromSlotKey === toSlotKey) {
          console.log(
            `moveCardInHand: fromSlotKey and toSlotKey are the same (${fromSlotKey}). No action needed for player ${player.username}.`
          );
          return;
        }

        const cardToMove = player.hand.get(fromSlotKey);

        if (!cardToMove || cardToMove.instanceId !== instanceId) {
          console.warn(
            `moveCardInHand: Card with instanceId ${instanceId} not found at fromSlotKey ${fromSlotKey} for player ${player.username}. Card found: ${cardToMove?.name}`
          );
          // Attempt to find the card by instanceId anywhere in hand as a fallback diagnostic
          let foundElsewhere = false;
          player.hand.forEach((card, key) => {
            if (card.instanceId === instanceId) {
              console.warn(
                `moveCardInHand: Diagnostic - Card ${instanceId} was found at slot ${key} instead of ${fromSlotKey}.`
              );
              foundElsewhere = true;
            }
          });
          if (!foundElsewhere)
            console.warn(
              `moveCardInHand: Diagnostic - Card ${instanceId} not found anywhere in hand.`
            );
          return;
        }

        if (player.hand.has(toSlotKey)) {
          const occupantCard = player.hand.get(toSlotKey);
          console.warn(
            `moveCardInHand: Target toSlotKey ${toSlotKey} is already occupied by card ${occupantCard?.name} (${occupantCard?.instanceId}) for player ${player.username}. Move aborted.`
          );
          // Client-side logic should ideally prevent this, but server validates.
          return;
        }

        // Perform the move
        player.hand.delete(fromSlotKey);
        player.hand.set(toSlotKey, cardToMove);

        console.log(
          `Player ${player.username} moved card ${cardToMove.name} (${instanceId}) from hand slot ${fromSlotKey} to ${toSlotKey}.`
        );
      }
    );

    this.onMessage(
      "updatePrepLayout",
      (
        client,
        message: {
          instanceId: string;
          newArea: "hand" | "battlefield";
          newSlotKey: string;
        }
      ) => {
        const player = this.state.players.get(client.sessionId);
        if (!player || this.state.currentPhase !== Phase.Preparation) {
          console.warn(
            `updatePrepLayout: Invalid state. Player: ${!!player}, Phase: ${
              this.state.currentPhase
            }, From: ${client.sessionId}`
          );
          return;
        }

        console.log(
          `Player ${client.sessionId} wants to move card ${message.instanceId} to ${message.newArea}[${message.newSlotKey}]`
        );

        let cardToMove: CardInstanceSchema | undefined;
        let foundInArea: "hand" | "battlefield" | undefined;
        let foundAtKey: string | undefined;

        // Find the card in player's hand
        player.hand.forEach((card, key) => {
          if (card.instanceId === message.instanceId) {
            cardToMove = card;
            foundInArea = "hand";
            foundAtKey = key;
          }
        });

        // If not in hand, find in player's battlefield
        if (!cardToMove) {
          player.battlefield.forEach((card, key) => {
            if (card.instanceId === message.instanceId) {
              cardToMove = card;
              foundInArea = "battlefield";
              foundAtKey = key;
            }
          });
        }

        if (!cardToMove || !foundInArea || foundAtKey === undefined) {
          console.warn(
            `updatePrepLayout: Card instance ${message.instanceId} not found for player ${client.sessionId}.`
          );
          return;
        }

        // If the card is already in the target destination, do nothing.
        if (
          foundInArea === message.newArea &&
          foundAtKey === message.newSlotKey
        ) {
          console.log(
            `updatePrepLayout: Card ${message.instanceId} is already at ${message.newArea}[${message.newSlotKey}]. No change.`
          );
          return;
        }

        // Remove from its current location
        if (foundInArea === "hand") {
          player.hand.delete(foundAtKey);
        } else {
          player.battlefield.delete(foundAtKey);
        }

        // Place in new location
        const targetMap =
          message.newArea === "hand" ? player.hand : player.battlefield;

        // If the target slot is occupied by another card, client should have prevented this.
        // For server robustness, we'll log a warning and overwrite.
        // The card previously in targetMap.get(message.newSlotKey) will be removed from schema.
        if (targetMap.has(message.newSlotKey)) {
          const occupant = targetMap.get(message.newSlotKey);
          console.warn(
            `updatePrepLayout: Target slot ${message.newArea}[${message.newSlotKey}] for card ${cardToMove.instanceId} is occupied by ${occupant?.instanceId}. Overwriting.`
          );
        }

        targetMap.set(message.newSlotKey, cardToMove);
        console.log(
          `Card ${cardToMove.instanceId} moved from ${foundInArea}[${foundAtKey}] to ${message.newArea}[${message.newSlotKey}] for player ${client.sessionId}`
        );
      }
    );
    this.onMessage(
      "sellCard",
      (
        client,
        message: {
          instanceId: string;
          area: "hand" | "battlefield";
          slotKey: string;
        }
      ) => {
        const player = this.state.players.get(client.sessionId);

        if (!player) {
          console.warn(
            `sellCard: Player not found for session ID: ${client.sessionId}`
          );
          return;
        }

        if (
          this.state.currentPhase !== Phase.Shop &&
          this.state.currentPhase !== Phase.Preparation
        ) {
          console.warn(
            `sellCard: Incorrect phase. Player ${player.username} tried to sell card outside Shop/Preparation phase. Current phase: ${this.state.currentPhase}`
          );
          return;
        }

        const area = message.area;
        const slotKey = message.slotKey;
        const cardCollection =
          area === "hand" ? player.hand : player.battlefield;

        if (!cardCollection.has(slotKey)) {
          console.warn(
            `sellCard: Card not found at ${area}[${slotKey}] for player ${player.username}`
          );
          return;
        }

        const card = cardCollection.get(slotKey);
        if (card!.instanceId !== message.instanceId) {
          console.warn(
            `sellCard: Card instance ID mismatch. Expected ${
              message.instanceId
            }, found ${card!.instanceId}`
          );
          return;
        }

        // Calculate sell value (half the brew cost, minimum 1)
        const sellValue = Math.max(1, Math.floor(card!.brewCost / 2));

        // Remove card from player's collection
        cardCollection.delete(slotKey);

        // Add brews to player
        player.brews += sellValue;

        console.log(
          `Player ${player.username} sold card ${card!.name} (${
            card!.instanceId
          }) from ${area}[${slotKey}] for ${sellValue} brews. New brew total: ${
            player.brews
          }`
        );
      }
    );
  }

  onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
    console.log(`Client joined: ${client.sessionId}`);
    // Log the received options to check for username
    console.log(
      `Received options for ${client.sessionId}:`,
      JSON.stringify(options)
    );

    const newPlayer = new PlayerState();
    newPlayer.sessionId = client.sessionId;
    // Assign username from options, log the result
    newPlayer.username =
      options?.username || `Player_${client.sessionId.substring(0, 4)}`;
    console.log(
      `Assigned username for ${client.sessionId}: ${newPlayer.username}`
    );

    newPlayer.health = 50;
    newPlayer.brews = 10; // Starting brews
    newPlayer.isReady = false; // Ensure player starts as not ready

    this.state.players.set(client.sessionId, newPlayer);
    console.log(
      `Player ${newPlayer.username} (${client.sessionId}) added to state.`
    );
    console.log(`Current player count: ${this.state.players.size}`);

    // Check if the lobby is full, but DON'T transition automatically
    if (
      this.state.players.size === this.maxClients &&
      this.state.currentPhase === Phase.Lobby
    ) {
      console.log("Lobby is full. Waiting for players to ready up.");
      // The transition to Shop now happens in checkPhaseTransition when all players are ready
      // DO NOT transition phase or set day here.
    }
  }

  onLeave(client: Client, consented: boolean): void | Promise<any> {
    console.log(`Client left: ${client.sessionId}`);
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.isReady = true; // Mark leaving player as ready to not block transitions
      this.state.players.delete(client.sessionId);
      console.log(
        `Player ${player.username} removed. Remaining players: ${this.state.players.size}`
      );

      // Handle game over if not enough players left during active gameplay
      if (
        this.state.players.size < this.maxClients &&
        this.state.currentPhase !== Phase.Lobby &&
        this.state.currentPhase !== Phase.GameOver
      ) {
        console.log("Not enough players to continue. Ending game.");
        // TODO: Determine winner based on who is left? Or just end.
        this.transitionToPhase(Phase.GameOver);
        // Optionally broadcast a "Player Left" message or handle winner declaration
      } else {
        // If a player leaves during a phase where readiness matters, check if transition can now occur
        this.checkPhaseTransition();
      }
    }
  }

  // --- Phase Transition Logic ---

  checkPhaseTransition() {
    // First, check if we have enough players for phases other than Lobby or GameOver
    if (
      this.state.currentPhase !== Phase.Lobby &&
      this.state.currentPhase !== Phase.GameOver &&
      this.state.players.size < this.maxClients
    ) {
      console.log(
        `Waiting for ${this.maxClients} players before transitioning from ${this.state.currentPhase}. Current: ${this.state.players.size}`
      );
      // If a player left, and we are below maxClients, we might need to reset readiness of remaining player(s)
      // so they don't get stuck in a "ready" state waiting for a non-existent player.
      // However, this might interfere if one player is legitimately waiting for another to ready up.
      // For now, let's assume player.isReady is handled correctly by onLeave or other logic.
      return;
    }

    let allReady = true;
    if (
      this.state.players.size === 0 &&
      this.state.currentPhase !== Phase.GameOver
    ) {
      // No players, can't be all ready unless game over
      allReady = false;
    } else {
      this.state.players.forEach((player) => {
        if (!player.isReady) {
          allReady = false;
        }
      });
    }

    if (allReady) {
      console.log(
        `All ${this.state.players.size} players ready. Transitioning from ${this.state.currentPhase}`
      );
      switch (this.state.currentPhase) {
        case Phase.Lobby:
          if (this.state.players.size === this.maxClients) {
            // Ensure lobby is full before starting
            this.state.currentDay = 1; // Set day 1 when starting from lobby
            this.transitionToPhase(Phase.Shop);
          } else {
            console.log(
              `Cannot start from Lobby: Not enough players (${this.state.players.size}/${this.maxClients}). Resetting ready status.`
            );
            // Reset ready status so players have to click again if someone leaves and rejoins.
            this.state.players.forEach((p) => (p.isReady = false));
          }
          break;
        case Phase.Shop:
          this.transitionToPhase(Phase.Preparation);
          break;
        case Phase.Preparation:
          this.transitionToPhase(Phase.Battle);
          break;
        case Phase.BattleEnd:
          // Increment day only if not transitioning to GameOver
          if (this.state.currentDay <= 10) {
            // Assuming 10 is max days, check before increment
            this.state.currentDay++;
          }

          if (this.state.currentDay > 10) {
            // Win condition check (e.g., max days reached)
            this.determineWinnerByHealth(); // This will transition to GameOver
          } else {
            // Check for player health <= 0 again, as determineWinnerByHealth might not have been called if day limit not reached
            let gameOver = false;
            this.state.players.forEach((p) => {
              if (p.health <= 0) gameOver = true;
            });
            if (gameOver) {
              this.determineWinnerByHealth();
            } else {
              this.transitionToPhase(Phase.Shop);
            }
          }
          break;
        // Battle -> BattleEnd is handled by battle logic/timer
        // GameOver is terminal
      }
    } else {
      console.log("Not all players are ready yet.");
      // Optionally count ready players:
      let readyCount = 0;
      this.state.players.forEach((p) => {
        if (p.isReady) readyCount++;
      });
      console.log(
        `${readyCount} / ${this.state.players.size} players ready for phase ${this.state.currentPhase}.`
      );
    }
  }

  transitionToPhase(newPhase: Phase) {
    // --- Add Logging Here ---
    console.log(
      `--- Preparing for Phase Transition: ${this.state.currentPhase} -> ${newPhase} ---`
    );
    this.state.players.forEach((player, sessionId) => {
      const handContents = JSON.stringify(
        Object.fromEntries(player.hand.entries())
      );
      const battlefieldContents = JSON.stringify(
        Object.fromEntries(player.battlefield.entries())
      );
      console.log(`Player ${player.username} (${sessionId}) State:`);
      console.log(`  Hand: ${handContents}`);
      console.log(`  Battlefield: ${battlefieldContents}`);
    });
    console.log(`--- End State Log ---`);
    // --- End Logging ---

    const oldPhase = this.state.currentPhase;
    console.log(`Transitioning phase: ${oldPhase} -> ${newPhase}`);

    // Reset shopRefreshCost when leaving Shop phase
    if (oldPhase === Phase.Shop && newPhase !== Phase.Shop) {
      this.state.players.forEach((player) => {
        player.shopRefreshCost = 2; // Reset to initial value
        console.log(
          `Reset shop refresh cost for ${player.username} to ${player.shopRefreshCost}`
        );
      });
    }

    this.state.currentPhase = newPhase;

    // Reset ready status for all players for the new phase
    this.state.players.forEach((player) => {
      player.isReady = false;
    });

    // --- Add Post-Transition Logging Here ---
    console.log(`--- State AFTER Transition to: ${newPhase} ---`);
    this.state.players.forEach((player, sessionId) => {
      const handContents = JSON.stringify(
        Object.fromEntries(player.hand.entries())
      );
      const battlefieldContents = JSON.stringify(
        Object.fromEntries(player.battlefield.entries())
      );
      console.log(`Player ${player.username} (${sessionId}) State:`);
      console.log(`  Hand: ${handContents}`);
      console.log(`  Battlefield: ${battlefieldContents}`);
      console.log(`  IsReady: ${player.isReady}`); // Also log ready status
    });
    console.log(`--- End Post-Transition State Log ---`);

    // Phase-specific start actions
    if (newPhase === Phase.Shop) {
      // currentDay is incremented in checkPhaseTransition for BattleEnd -> Shop
      // currentDay is set to 1 in checkPhaseTransition for Lobby -> Shop
      // So, no need to set currentDay here explicitly unless it's a direct transition not covered by checkPhaseTransition
      this.generateShopOffers(); // Generate new offers for each player
    }
    if (newPhase === Phase.Battle) {
      this.startBattle();
    }
    if (newPhase === Phase.GameOver) {
      // Clean up timers if any
      if (this.battleTimerInterval) this.battleTimerInterval.clear();
      if (this.battleEndTimeout) this.battleEndTimeout.clear();
    }

    console.log(
      `Phase is now ${this.state.currentPhase}. Day: ${this.state.currentDay}. Players reset to not ready.`
    );
  }

  // --- Battle Logic ---

  startBattle() {
    console.log("Starting Battle Phase!");
    this.state.battleTimer = 45; // Set battle duration

    // Clear previous interval if any
    if (this.battleTimerInterval) this.battleTimerInterval.clear();

    // --- Initialize card attack readiness ---
    this.cardAttackReadiness.clear();
    this.state.players.forEach((player) => {
      player.battlefield.forEach((card) => {
        if (card.currentHp > 0) {
          // Ensure speed is positive to avoid infinite loops or zero division if speed is 0
          const speedInMs = (card.speed > 0 ? card.speed : 1.5) * 1000; // Default to 1.5s if speed is 0 or less
          this.cardAttackReadiness.set(card.instanceId, speedInMs);
        }
      });
    });
    // --- End Initialize ---

    // Start server-side timer countdown
    this.battleTimerInterval = this.clock.setInterval(() => {
      if (this.state.currentPhase === Phase.Battle) {
        const delta = 1000; // Interval duration in ms

        // --- Server-Side Card Attack Simulation ---
        const attacksThisTick: Array<{
          attackerPlayerId: string;
          attackerCard: CardInstanceSchema;
          targetPlayerId: string;
          targetCard: CardInstanceSchema;
          damage: number;
        }> = [];

        const playerIds = Array.from(this.state.players.keys());
        if (playerIds.length === 2) {
          this.state.players.forEach((currentPlayer, currentPlayerId) => {
            const opponentId = playerIds.find((id) => id !== currentPlayerId);
            if (!opponentId) return;
            const opponentPlayer = this.state.players.get(opponentId);
            if (!opponentPlayer) return;

            const livingOpponentCards = Array.from(
              opponentPlayer.battlefield.values()
            ).filter((c) => c.currentHp > 0);

            currentPlayer.battlefield.forEach((attackerCard) => {
              if (attackerCard.currentHp <= 0) return; // Skip dead attackers

              let timeToNext =
                this.cardAttackReadiness.get(attackerCard.instanceId) ||
                (attackerCard.speed > 0 ? attackerCard.speed : 1.5) * 1000;
              timeToNext -= delta;

              if (timeToNext <= 0) {
                if (livingOpponentCards.length > 0) {
                  const targetCard =
                    livingOpponentCards[
                      Math.floor(Math.random() * livingOpponentCards.length)
                    ];
                  attacksThisTick.push({
                    attackerPlayerId: currentPlayerId,
                    attackerCard: attackerCard,
                    targetPlayerId: opponentId,
                    targetCard: targetCard,
                    damage: attackerCard.attack,
                  });
                }
                // Reset timer regardless of whether a target was found
                const speedInMs =
                  (attackerCard.speed > 0 ? attackerCard.speed : 1.5) * 1000;
                this.cardAttackReadiness.set(
                  attackerCard.instanceId,
                  speedInMs
                );
              } else {
                this.cardAttackReadiness.set(
                  attackerCard.instanceId,
                  timeToNext
                );
              }
            });
          });

          // Process collected attacks
          attacksThisTick.forEach((attack) => {
            // attack.targetCard is the CardInstanceSchema object from the state.
            // attack.attackerCard is the CardInstanceSchema object from the state.

            // Ensure the attacker and target are still valid and alive.
            const attackerPlayer = this.state.players.get(
              attack.attackerPlayerId
            );
            const targetPlayer = this.state.players.get(attack.targetPlayerId);

            if (attackerPlayer && targetPlayer) {
              // Verify the attacker is still on their board and alive
              let currentAttackerOnBoard: CardInstanceSchema | undefined;
              attackerPlayer.battlefield.forEach((card) => {
                if (
                  card.instanceId === attack.attackerCard.instanceId &&
                  card.currentHp > 0
                ) {
                  currentAttackerOnBoard = card;
                }
              });

              // Verify the target is still on their board and alive
              let currentTargetOnBoard: CardInstanceSchema | undefined;
              let foundTargetCardDataForLog: {
                id: string;
                hp: number;
                name: string;
              } | null = null;

              targetPlayer.battlefield.forEach((card) => {
                if (card.instanceId === attack.targetCard.instanceId) {
                  foundTargetCardDataForLog = {
                    id: card.instanceId,
                    hp: card.currentHp,
                    name: card.name,
                  };
                  if (card.currentHp > 0) {
                    currentTargetOnBoard = card;
                  }
                }
              });

              if (!currentAttackerOnBoard) {
                console.log(
                  `[SERVER BATTLE DEBUG] Attacker ${attack.attackerCard.name} (ID: ${attack.attackerCard.instanceId}, Player: ${attackerPlayer.username}) not found on board or not alive for processing attack.`
                );
              }
              if (!foundTargetCardDataForLog) {
                console.log(
                  `[SERVER BATTLE DEBUG] Target card (ID: ${attack.targetCard.instanceId}) not found on ${targetPlayer.username}'s battlefield when processing attack from ${attack.attackerCard.name}.`
                );
              } else if (!currentTargetOnBoard) {
                console.log(
                  `[SERVER BATTLE DEBUG] Target ${foundTargetCardDataForLog} Attack by ${
                    currentAttackerOnBoard?.name || attack.attackerCard.name
                  } aborted.`
                );
              }

              if (currentAttackerOnBoard && currentTargetOnBoard) {
                const oldHp = currentTargetOnBoard.currentHp;
                console.log(
                  `[SERVER BATTLE DEBUG] Applying damage: Target ${currentTargetOnBoard.name} (Player: ${targetPlayer.username}) HP before: ${oldHp}, Damage from ${currentAttackerOnBoard.name} (Player: ${attackerPlayer.username}): ${attack.damage}`
                );
                currentTargetOnBoard.currentHp = Math.max(
                  0,
                  currentTargetOnBoard.currentHp - attack.damage
                );
                console.log(
                  `[SERVER BATTLE] ${currentAttackerOnBoard.name} (P: ${attackerPlayer.username}) attacks ${currentTargetOnBoard.name} (P: ${targetPlayer.username}) for ${attack.damage} damage. HP: ${oldHp} -> ${currentTargetOnBoard.currentHp}`
                );

                // Broadcast the attack event to all clients
                this.broadcast("battleAttackEvent", {
                  attackerInstanceId: currentAttackerOnBoard.instanceId,
                  targetInstanceId: currentTargetOnBoard.instanceId,
                  damageDealt: attack.damage,
                  attackerPlayerId: attack.attackerPlayerId,
                  targetPlayerId: attack.targetPlayerId,
                });
              }
            }
          });
        }
        // --- End Server-Side Card Attack Simulation ---

        // --- Check for Battle End by Board Clear ---
        // let player1Cleared = true; // Old logic
        // let player2Cleared = true; // Old logic
        // const playerIds = Array.from(this.state.players.keys()); // Already defined above
        if (playerIds.length === 2) {
          const player1 = this.state.players.get(playerIds[0]);
          const player2 = this.state.players.get(playerIds[1]);

          if (player1 && player2) {
            const player1HasLivingCards = Array.from(
              player1.battlefield.values()
            ).some((c) => c.currentHp > 0);
            const player2HasLivingCards = Array.from(
              player2.battlefield.values()
            ).some((c) => c.currentHp > 0);

            const player1BoardWasPopulated = player1.battlefield.size > 0;
            const player2BoardWasPopulated = player2.battlefield.size > 0;

            // End condition:
            // A player's board was populated AND they now have no living cards.
            if (
              (player1BoardWasPopulated && !player1HasLivingCards) ||
              (player2BoardWasPopulated && !player2HasLivingCards)
            ) {
              console.log(
                `Battle timer loop: Board clear condition met. P1 HasLiving: ${player1HasLivingCards} (WasPopulated: ${player1BoardWasPopulated}), P2 HasLiving: ${player2HasLivingCards} (WasPopulated: ${player2BoardWasPopulated}). Calling endBattle.`
              );
              this.endBattle(false); // End battle, not due to timeout
              return; // Stop further processing for this interval tick
            }
          }
        }
        // --- End Board Clear Check ---

        this.state.battleTimer--;
        // console.log(`Battle timer: ${this.state.battleTimer}`); // Optional: Log countdown
        if (this.state.battleTimer <= 0) {
          console.log(
            "Battle timer loop: Timer reached zero. Calling endBattle."
          ); // Log before call
          this.endBattle(true); // End battle due to time limit
        }
        // TODO: Add check for board empty condition if needed
      } else {
        if (this.battleTimerInterval) this.battleTimerInterval.clear(); // Stop timer if phase changed unexpectedly
      }
    }, 1000); // Update every second
  }

  // Called when battle ends (timer, board clear)
  endBattle(timeoutReached: boolean = false) {
    console.log(
      `--- Entering endBattle function --- Timeout: ${timeoutReached}`
    ); // Log entry
    if (this.state.currentPhase !== Phase.Battle) {
      console.log(
        `--- endBattle exiting early: Current phase is ${this.state.currentPhase}, not Battle. ---`
      ); // Log exit reason
      return; // Prevent double execution
    }

    // Clear attack readiness map
    this.cardAttackReadiness.clear();

    // --- Mark Battle as Over Internally ---
    // This prevents the battle timer interval from calling endBattle again if it fires slightly after.
    const previousPhaseForBattleEnd = this.state.currentPhase; // Store current phase before changing
    this.state.currentPhase = Phase.BattleEnd; // Tentatively set phase to prevent re-entry
    console.log(
      `--- Starting endBattle --- Phase changed from ${previousPhaseForBattleEnd} to ${this.state.currentPhase}`
    );

    console.log(`Ending Battle Phase. Timeout: ${timeoutReached}`);
    if (this.battleTimerInterval) this.battleTimerInterval.clear(); // Stop the timer

    // --- Calculate Results (Server-Side) ---
    let player1SessionId = "";
    let player2SessionId = "";
    let player1: PlayerState | undefined;
    let player2: PlayerState | undefined;

    const playerIdsList = Array.from(this.state.players.keys()); // Renamed to avoid conflict
    if (playerIdsList.length === 2) {
      player1SessionId = playerIdsList[0];
      player2SessionId = playerIdsList[1];
      player1 = this.state.players.get(player1SessionId);
      player2 = this.state.players.get(player2SessionId);
    } else {
      console.error(
        "endBattle: Cannot calculate battle results without exactly 2 players."
      );
      // Transition directly to GameOver if player count is wrong
      this.transitionToPhase(Phase.GameOver); // Use the proper transition function
      return;
    }

    if (!player1 || !player2) {
      console.error(
        "endBattle: Player state missing during battle end calculation."
      );
      this.transitionToPhase(Phase.GameOver); // Use the proper transition function
      return;
    }

    // --- Log Initial Battlefield States (Server Authority) ---
    console.log(
      `endBattle: Player 1 (${player1.username}) Battlefield State (Server):`
    );
    player1.battlefield.forEach((card, key) => {
      console.log(
        `  Slot ${key}: ${card.name} (ID: ${card.instanceId}, HP: ${card.currentHp}/${card.health})`
      ); // Use instanceId
    });
    console.log(
      `endBattle: Player 2 (${player2.username}) Battlefield State (Server):`
    );
    player2.battlefield.forEach((card, key) => {
      console.log(
        `  Slot ${key}: ${card.name} (ID: ${card.instanceId}, HP: ${card.currentHp}/${card.health})`
      ); // Use instanceId
    });
    // --- End Log ---

    // Determine survivors (based on current server state's currentHp)
    const player1Survivors = Array.from(player1.battlefield.values()).filter(
      (card) => card && card.currentHp > 0
    );
    const player2Survivors = Array.from(player2.battlefield.values()).filter(
      (card) => card && card.currentHp > 0
    );

    // --- Log Survivor Counts ---
    console.log(
      `endBattle: Player 1 Survivors Count (Server): ${player1Survivors.length}`
    );
    player1Survivors.forEach((s) =>
      console.log(`  P1 Survivor: ${s.name} HP: ${s.currentHp}`)
    );
    console.log(
      `endBattle: Player 2 Survivors Count (Server): ${player2Survivors.length}`
    );
    player2Survivors.forEach((s) =>
      console.log(`  P2 Survivor: ${s.name} HP: ${s.currentHp}`)
    );
    // --- End Log ---

    // Determine winner/loser based on survivors
    let winner: PlayerState | null = null;
    let loser: PlayerState | null = null;
    let isDraw = false;

    // --- Determine Winner/Loser/Draw ---
    if (player1Survivors.length > 0 && player2Survivors.length === 0) {
      winner = player1;
      loser = player2;
      console.log(
        `endBattle: Winner determined (Server): Player 1 (${winner.username})`
      );
    } else if (player2Survivors.length > 0 && player1Survivors.length === 0) {
      winner = player2;
      loser = player1;
      console.log(
        `endBattle: Winner determined (Server): Player 2 (${winner.username})`
      );
    } else if (player1Survivors.length === 0 && player2Survivors.length === 0) {
      isDraw = true;
      console.log(
        `endBattle: Battle determined as Draw (Server - both boards cleared).`
      );
    } else {
      // Both have survivors (timeout or simultaneous clear?)
      isDraw = true;
      console.log(
        `endBattle: Battle determined as Draw (Server - both have survivors or timeout).`
      );
    }
    // --- End Winner/Loser/Draw Determination ---

    // Calculate face damage based on opponent survivors' attack stat
    const p1FaceDamage = player2Survivors.reduce(
      (sum, card) => sum + card.attack,
      0
    );
    const p2FaceDamage = player1Survivors.reduce(
      (sum, card) => sum + card.attack,
      0
    );

    // --- Log Calculated Damage ---
    console.log(
      `endBattle: Calculated Face Damage for Player 1 (Server): ${p1FaceDamage} (from ${player2Survivors.length} P2 survivors)`
    );
    console.log(
      `endBattle: Calculated Face Damage for Player 2 (Server): ${p2FaceDamage} (from ${player1Survivors.length} P1 survivors)`
    );
    // --- End Log ---

    // --- Log Health Before Damage ---
    console.log(
      `endBattle: Player 1 Health BEFORE damage (Server): ${player1.health}`
    );
    console.log(
      `endBattle: Player 2 Health BEFORE damage (Server): ${player2.health}`
    );
    // --- End Log ---

    // Apply face damage ONLY to the loser, or both if it's a draw
    // --- Add Detailed Damage Application Logging ---
    if (loser === player1 || isDraw) {
      console.log(
        `endBattle: Applying ${p1FaceDamage} damage to Player 1 (${
          player1.username
        }) because ${
          isDraw ? "it was a draw" : "they were the loser"
        } (Server).`
      );
      player1.health = Math.max(0, player1.health - p1FaceDamage);
      console.log(`endBattle: Player 1 New HP (Server): ${player1.health}`);
    } else {
      console.log(
        `endBattle: NOT applying ${p1FaceDamage} damage to Player 1 (${player1.username}) because they won (Server).`
      );
    }
    if (loser === player2 || isDraw) {
      console.log(
        `endBattle: Applying ${p2FaceDamage} damage to Player 2 (${
          player2.username
        }) because ${
          isDraw ? "it was a draw" : "they were the loser"
        } (Server).`
      );
      player2.health = Math.max(0, player2.health - p2FaceDamage);
      console.log(`endBattle: Player 2 New HP (Server): ${player2.health}`);
    } else {
      console.log(
        `endBattle: NOT applying ${p2FaceDamage} damage to Player 2 (${player2.username}) because they won (Server).`
      );
    }
    // --- End Detailed Damage Application Logging ---

    // Calculate brews earned based on opponent's dead cards + daily bonus
    // Count dead cards based on server state BEFORE removing them
    const player1OpponentDeadCards = Array.from(
      player2.battlefield.values()
    ).filter((card) => card && card.currentHp <= 0).length;
    const player2OpponentDeadCards = Array.from(
      player1.battlefield.values()
    ).filter((card) => card && card.currentHp <= 0).length;

    const p1BrewReward =
      DAILY_BREW_BONUS + player1OpponentDeadCards * BREW_PER_KILL;
    const p2BrewReward =
      DAILY_BREW_BONUS + player2OpponentDeadCards * BREW_PER_KILL;

    // --- Log Brew Calculation ---
    console.log(
      `endBattle: Player 1 Brew Reward Calculation (Server): Daily=${DAILY_BREW_BONUS}, Kills=${player1OpponentDeadCards} * ${BREW_PER_KILL} = Total: ${p1BrewReward}`
    );
    console.log(
      `endBattle: Player 2 Brew Reward Calculation (Server): Daily=${DAILY_BREW_BONUS}, Kills=${player2OpponentDeadCards} * ${BREW_PER_KILL} = Total: ${p2BrewReward}`
    );
    console.log(
      `endBattle: Player 1 Brews BEFORE reward (Server): ${player1.brews}`
    );
    console.log(
      `endBattle: Player 2 Brews BEFORE reward (Server): ${player2.brews}`
    );
    // --- End Log ---

    player1.brews += p1BrewReward;
    player2.brews += p2BrewReward;

    console.log(
      `endBattle: Final Battle Results (Server): P1 HP=${player1.health}, P2 HP=${player2.health}.`
    );
    console.log(
      `endBattle: P1 Brews (Server): +${p1BrewReward} => Total: ${player1.brews}`
    );
    console.log(
      `endBattle: P2 Brews (Server): +${p2BrewReward} => Total: ${player2.brews}`
    );

    // --- Remove Dead Cards from Battlefield State (Server Authority) ---
    console.log(
      "endBattle: Removing dead cards from server battlefield state..."
    );
    const p1DeadKeys: string[] = [];
    player1.battlefield.forEach((card, key) => {
      if (card.currentHp <= 0) {
        console.log(
          `  Marking P1 card for removal: ${card.name} (Key: ${key})`
        );
        p1DeadKeys.push(key);
      }
    });
    p1DeadKeys.forEach((key) => player1.battlefield.delete(key));

    const p2DeadKeys: string[] = [];
    player2.battlefield.forEach((card, key) => {
      if (card.currentHp <= 0) {
        console.log(
          `  Marking P2 card for removal: ${card.name} (Key: ${key})`
        );
        p2DeadKeys.push(key);
      }
    });
    p2DeadKeys.forEach((key) => player2.battlefield.delete(key));
    console.log("endBattle: Finished removing dead cards from server state.");
    // --- End Remove Dead Cards ---

    // Check Game Over conditions based on updated health
    if (player1.health <= 0 || player2.health <= 0) {
      console.log(
        "endBattle: Game Over condition met (player health <= 0). Determining winner by health."
      );
      this.determineWinnerByHealth(); // This will transition to GameOver
    } else {
      // Transition formally to BattleEnd phase to show results
      console.log("endBattle: Transitioning formally to BattleEnd phase.");
      // We already set state.currentPhase = Phase.BattleEnd at the start of this function
      // Reset player readiness for the BattleEnd phase (they need to implicitly "ready" by waiting)
      this.state.players.forEach((p) => (p.isReady = false)); // Reset ready status

      // Add a delay before automatically transitioning to the next Shop phase
      if (this.battleEndTimeout) this.battleEndTimeout.clear();
      this.battleEndTimeout = this.clock.setTimeout(() => {
        // Check if we are *still* in BattleEnd before proceeding
        if (this.state.currentPhase === Phase.BattleEnd) {
          console.log(
            "endBattle: BattleEnd timeout reached. Marking players ready and checking phase transition."
          );
          // Mark players as ready to trigger the transition check
          this.state.players.forEach((p) => (p.isReady = true));
          this.checkPhaseTransition(); // This should trigger transition to Shop
        } else {
          console.log(
            `endBattle: BattleEnd timeout reached, but phase is no longer BattleEnd (${this.state.currentPhase}). No transition triggered.`
          );
        }
      }, 5000); // 5 second delay to show results
    }
    console.log(`--- Finished endBattle ---`);
  }

  determineWinnerByHealth() {
    let winner: PlayerState | null = null;
    let loser: PlayerState | null = null;
    let highScore = -1;
    let isDraw = false;

    if (this.state.players.size === 0) {
      console.log("Game Over - No players left.");
      this.transitionToPhase(Phase.GameOver);
      return;
    }

    if (this.state.players.size === 1) {
      winner = Array.from(this.state.players.values())[0];
      console.log(`Game Over - ${winner.username} wins by default.`);
      this.transitionToPhase(Phase.GameOver);
      // TODO: Broadcast winner message
      return;
    }

    // Compare health for 2 players
    const players = Array.from(this.state.players.values());
    if (players[0].health > players[1].health) {
      winner = players[0];
      loser = players[1];
    } else if (players[1].health > players[0].health) {
      winner = players[1];
      loser = players[0];
    } else {
      isDraw = true;
    }

    if (isDraw) {
      console.log("Game Over - Draw!");
    } else if (winner) {
      console.log(
        `Game Over - ${winner.username} wins with ${winner.health} HP!`
      );
    }
    this.transitionToPhase(Phase.GameOver);
    // TODO: Broadcast winner/loser/draw message
  }

  // --- Shop Generation ---
  generateShopOffers() {
    console.log("Generating new shop offers for all players...");
    this.state.players.forEach((player) => {
      this.generatePlayerShopOffers(player);

      // Reset shop refresh cost to initial value
      player.shopRefreshCost = 2;
      console.log(
        `Reset shop refresh cost for ${player.username} to ${player.shopRefreshCost}`
      );
    });
  }

  // Utility to get card data from the "database"
  getCardDataById(cardId: string): any | null {
    return cardDatabase.find((card: { id: any }) => card.id === cardId) || null;
  }
}