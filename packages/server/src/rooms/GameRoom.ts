import { Client, Room, Delayed } from "colyseus";
// Import the updated schemas and Phase enum
import { GameState, PlayerState, CardInstanceSchema, Phase } from "../schemas/GameState";
// Assume card data is loaded somehow, e.g., from a JSON file
// import cardDatabase from '../data/cards.json'; // Adjust path as needed

// Placeholder for card database loading
const cardDatabase: any[] = [
    { id: "test_card_01", name: "Test Card", attack: 5, speed: 4, health: 10, brewCost: 5, description: "A basic test card.", isLegend: false },
    { id: "test_card_02", name: "Quick Jab", attack: 3, speed: 2, health: 8, brewCost: 4, description: "Fast but frail.", isLegend: false },
    { id: "test_card_03", name: "Tanky Boi", attack: 2, speed: 6, health: 20, brewCost: 6, description: "Takes a beating.", isLegend: false },
    { id: "test_card_04", name: "Glass Cannon", attack: 10, speed: 5, health: 5, brewCost: 7, description: "Hits hard, dies fast.", isLegend: false },
    { id: "test_card_05", name: "Balanced Bud", attack: 6, speed: 4, health: 12, brewCost: 6, description: "Good all-around.", isLegend: false },
    { id: "test_card_06", name: "Speedy Scout", attack: 4, speed: 1.5, health: 7, brewCost: 5, description: "Attacks very quickly.", isLegend: false }
]; // Load properly in a real scenario

// Helper function for unique IDs (consider a more robust library like uuid)
function generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export class GameRoom extends Room<GameState> {
  // Remove old state initialization if present
  // state = new GameState(); // This is handled by Colyseus now

  maxClients = 2; // Set max clients for 1v1
  battleEndTimeout: Delayed | null = null; // For delayed transition after battle ends
  battleTimerInterval: Delayed | null = null; // For server-side battle timer countdown

  onCreate(options: any): void | Promise<any> {
    console.log("GameRoom created!");
    this.setState(new GameState());
    this.state.currentPhase = Phase.Lobby;
    this.state.currentDay = 0;

    // Remove old draggable initialization
    /*
    const draggableList = [...];
    draggableList.forEach((draggable, index) => { ... });
    */

    // --- Message Handlers ---
    this.onMessage("playerReady", (client, message) => {
        const player = this.state.players.get(client.sessionId);
        if (player && player.isReady === false) {
            console.log(`Player ${client.sessionId} is ready for phase: ${this.state.currentPhase}`);
            player.isReady = true;
            this.checkPhaseTransition();
        }
    });

    this.onMessage("buyCard", (client, message: { cardData: any, handSlotIndex: number }) => {
        const player = this.state.players.get(client.sessionId);
        const cardData = message.cardData; // The base data of the card being bought
        const slotIndex = message.handSlotIndex;

        if (!player || this.state.currentPhase !== Phase.Shop) {
            console.warn(`Buy attempt failed: Invalid state (Player: ${!!player}, Phase: ${this.state.currentPhase})`);
            return; // Wrong phase or player not found
        }
        if (slotIndex < 0 || slotIndex > 4) {
            console.warn(`Buy attempt failed: Invalid slot index ${slotIndex}`);
            return; // Invalid slot
        }
        if (player.hand.has(String(slotIndex))) {
            console.warn(`Buy attempt failed: Hand slot ${slotIndex} is already full.`);
            return; // Slot already full
        }
        if (!cardData || typeof cardData.brewCost !== 'number') {
             console.warn(`Buy attempt failed: Invalid card data received.`);
             return; // Invalid card data
        }
        if (player.brews < cardData.brewCost) {
            console.warn(`Buy attempt failed: Insufficient brews (Player: ${player.brews}, Cost: ${cardData.brewCost})`);
            return; // Not enough brews
        }

        // Process the purchase
        player.brews -= cardData.brewCost;
        const newInstanceId = generateUniqueId();
        const newCardInstance = CardInstanceSchema.fromCardData(cardData, newInstanceId);
        player.hand.set(String(slotIndex), newCardInstance);

        console.log(`Player ${client.sessionId} bought ${cardData.name} for ${cardData.brewCost}. Placed in hand slot ${slotIndex}. Remaining brews: ${player.brews}`);
        // Client UI should update based on state change automatically
    });

    this.onMessage("setPreparation", (client, message: { handLayout: (any | null)[], battlefieldLayout: (any | null)[] }) => {
        const player = this.state.players.get(client.sessionId);
        if (!player || this.state.currentPhase !== Phase.Preparation) {
            console.warn(`SetPreparation failed: Invalid state (Player: ${!!player}, Phase: ${this.state.currentPhase})`);
            return; // Wrong phase or player not found
        }

        console.log(`Received preparation layout from ${client.sessionId}`);

        // Clear existing layouts and repopulate based on message
        player.hand.clear();
        player.battlefield.clear();

        message.handLayout.forEach((cardInstanceData, index) => {
            if (cardInstanceData) {
                // Re-create schema instance - assumes client sends full CardInstance data
                const card = new CardInstanceSchema();
                Object.assign(card, cardInstanceData); // Copy properties
                player.hand.set(String(index), card);
            }
        });

        message.battlefieldLayout.forEach((cardInstanceData, index) => {
            if (cardInstanceData) {
                const card = new CardInstanceSchema();
                Object.assign(card, cardInstanceData);
                player.battlefield.set(String(index), card);
            }
        });

        player.isReady = true;
        this.checkPhaseTransition();
    });

    // Remove old "move" message handler if present
    /*
    this.onMessage("move", (client, message) => { ... });
    */
  }

  onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
    console.log(`Client joined: ${client.sessionId}`);

    const newPlayer = new PlayerState();
    newPlayer.sessionId = client.sessionId;
    newPlayer.username = options?.username || `Player_${client.sessionId.substring(0, 4)}`; // Get username from options if provided
    newPlayer.health = 50;
    newPlayer.brews = 10; // Starting brews
    newPlayer.isReady = false;
    // Initialize empty hand/battlefield maps - MapSchema starts empty, no need to set undefined
    // for (let i = 0; i < 5; i++) {
    //     // newPlayer.hand.set(String(i), undefined); // Incorrect: MapSchema doesn't store undefined values this way
    //     // newPlayer.battlefield.set(String(i), undefined); // Incorrect
    // }

    this.state.players.set(client.sessionId, newPlayer);
    console.log(`Player ${newPlayer.username} (${client.sessionId}) added to state.`);
    console.log(`Current player count: ${this.state.players.size}`);


    // Check if the lobby is full, but DON'T transition automatically
    if (this.state.players.size === this.maxClients && this.state.currentPhase === Phase.Lobby) {
        console.log("Lobby is full. Waiting for players to ready up.");
        // The transition to Shop now happens in checkPhaseTransition when all players are ready
        // this.state.currentDay = 1; // Moved to checkPhaseTransition
        // this.transitionToPhase(Phase.Shop); // REMOVED automatic transition
    }
  }

  onLeave(client: Client, consented: boolean): void | Promise<any> {
    console.log(`Client left: ${client.sessionId}`);
    const player = this.state.players.get(client.sessionId);
    if (player) {
        player.isReady = true; // Mark leaving player as ready to not block transitions
        this.state.players.delete(client.sessionId);
        console.log(`Player ${player.username} removed. Remaining players: ${this.state.players.size}`);

        // Handle game over if not enough players left during active gameplay
        if (this.state.players.size < this.maxClients && this.state.currentPhase !== Phase.Lobby && this.state.currentPhase !== Phase.GameOver) {
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
    if (this.state.players.size < this.maxClients && this.state.currentPhase !== Phase.Lobby) {
        console.log("Waiting for more players before transitioning.");
        return; // Don't transition if not enough players (unless in Lobby)
    }

    let allReady = true;
    this.state.players.forEach(player => {
        if (!player.isReady) {
            allReady = false;
        }
    });

    if (allReady) {
        console.log(`All ${this.state.players.size} players ready. Transitioning from ${this.state.currentPhase}`);
        switch (this.state.currentPhase) {
            case Phase.Lobby: // Added case for Lobby
                if (this.state.players.size === this.maxClients) { // Ensure lobby is full before starting
                    this.state.currentDay = 1; // Set day 1 when starting from lobby
                    this.transitionToPhase(Phase.Shop);
                } else {
                    console.log("Cannot start from Lobby: Not enough players.");
                    // Reset ready status if needed? Or just wait.
                    this.state.players.forEach(p => p.isReady = false);
                }
                break;
            case Phase.Shop:
                this.transitionToPhase(Phase.Preparation);
                break;
            case Phase.Preparation:
                this.transitionToPhase(Phase.Battle);
                break;
            case Phase.BattleEnd:
                this.state.currentDay++;
                if (this.state.currentDay > 10) { // Win condition check
                    this.determineWinnerByHealth();
                } else {
                    this.transitionToPhase(Phase.Shop);
                }
                break;
            // Lobby -> Shop is handled in onJoin
            // Battle -> BattleEnd is handled by battle logic/timer
            // GameOver is terminal
        }
    } else {
        console.log("Not all players are ready yet.");
        // Optionally count ready players:
        let readyCount = 0;
        this.state.players.forEach(p => { if(p.isReady) readyCount++; });
        console.log(`${readyCount} / ${this.state.players.size} players ready.`);
    }
  }

  transitionToPhase(newPhase: Phase) {
    console.log(`Transitioning phase: ${this.state.currentPhase} -> ${newPhase}`);
    this.state.currentPhase = newPhase;

    // Reset ready status for all players for the new phase
    this.state.players.forEach(player => {
        player.isReady = false;
    });

    // Phase-specific start actions
    if (newPhase === Phase.Battle) {
        this.startBattle();
    }
    if (newPhase === Phase.GameOver) {
        // Clean up timers if any
        if (this.battleTimerInterval) this.battleTimerInterval.clear();
        if (this.battleEndTimeout) this.battleEndTimeout.clear();
    }

    console.log(`Phase is now ${this.state.currentPhase}. Day: ${this.state.currentDay}. Players reset to not ready.`);
  }

  // --- Battle Logic ---

  startBattle() {
    console.log("Starting Battle Phase!");
    this.state.battleTimer = 45; // Set battle duration

    // Clear previous interval if any
    if (this.battleTimerInterval) this.battleTimerInterval.clear();

    // Start server-side timer countdown
    this.battleTimerInterval = this.clock.setInterval(() => {
        if (this.state.currentPhase === Phase.Battle) {
            this.state.battleTimer--;
            // console.log(`Battle timer: ${this.state.battleTimer}`); // Optional: Log countdown
            if (this.state.battleTimer <= 0) {
                console.log("Battle timer reached zero.");
                this.endBattle(true); // End battle due to time limit
            }
            // TODO: Add check for board empty condition if needed
        } else {
             if (this.battleTimerInterval) this.battleTimerInterval.clear(); // Stop timer if phase changed unexpectedly
        }
    }, 1000); // Update every second
  }

  // Called when battle ends (timer, or potentially board clear)
  endBattle(timeoutReached: boolean = false) {
    if (this.state.currentPhase !== Phase.Battle) return; // Prevent double execution

    console.log(`Ending Battle Phase. Timeout: ${timeoutReached}`);
    if (this.battleTimerInterval) this.battleTimerInterval.clear(); // Stop the timer

    // --- Calculate Results (Server-Side) ---
    let player1SessionId = "";
    let player2SessionId = "";
    let player1: PlayerState | undefined;
    let player2: PlayerState | undefined;

    const playerIds = Array.from(this.state.players.keys());
    if (playerIds.length === 2) {
        player1SessionId = playerIds[0];
        player2SessionId = playerIds[1];
        player1 = this.state.players.get(player1SessionId);
        player2 = this.state.players.get(player2SessionId);
    } else {
        console.error("Cannot calculate battle results without exactly 2 players.");
        this.transitionToPhase(Phase.GameOver); // Or handle appropriately
        return;
    }

    if (!player1 || !player2) {
         console.error("Player state missing during battle end calculation.");
         this.transitionToPhase(Phase.GameOver);
         return;
    }

    // Determine survivors (based on current server state)
    const player1Survivors = Array.from(player1.battlefield.values()).filter(card => card && card.currentHp > 0);
    const player2Survivors = Array.from(player2.battlefield.values()).filter(card => card && card.currentHp > 0);

    // Calculate face damage
    const p1FaceDamage = player2Survivors.reduce((sum, card) => sum + card.attack, 0);
    const p2FaceDamage = player1Survivors.reduce((sum, card) => sum + card.attack, 0);

    player1.health = Math.max(0, player1.health - p1FaceDamage);
    player2.health = Math.max(0, player2.health - p2FaceDamage);

    // Calculate brews earned (flat + kills - simplified: assume client reports kills or derive if needed)
    // For now, just flat reward
    const flatBrewReward = 4;
    player1.brews += flatBrewReward;
    player2.brews += flatBrewReward;
    // TODO: Add brew calculation based on kills if implementing server-side tracking or client reports

    // Update board/hand state (cards persist with current HP)
    // This happens implicitly as we modify the state directly.
    // We need to ensure dead cards are removed or marked if not done by client updates.
    // For simplicity, assume client `setPreparation` handles the state correctly before battle.
    // We might need to explicitly update currentHp based on a more detailed simulation or client reports if needed.
    // For now, health is updated, brews are added. Hand/Board structure remains as set in Prep.

    console.log(`Battle Results: P1 HP=${player1.health}, P2 HP=${player2.health}. P1 Brews=${player1.brews}, P2 Brews=${player2.brews}`);

    // Check Game Over conditions
    if (player1.health <= 0 || player2.health <= 0) {
        this.determineWinnerByHealth(); // This will transition to GameOver
    } else {
        // Transition to BattleEnd phase to show results
        this.transitionToPhase(Phase.BattleEnd);

        // Add a delay before automatically transitioning to the next Shop phase
        if (this.battleEndTimeout) this.battleEndTimeout.clear();
        this.battleEndTimeout = this.clock.setTimeout(() => {
            if (this.state.currentPhase === Phase.BattleEnd) { // Check if still in BattleEnd
                 // Players don't need to ready up from BattleEnd, server controls transition
                 this.state.players.forEach(p => p.isReady = true); // Mark as ready
                 this.checkPhaseTransition(); // Trigger transition Shop
            }
        }, 5000); // 5 second delay to show results
    }
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
          console.log(`Game Over - ${winner.username} wins with ${winner.health} HP!`);
      }
      this.transitionToPhase(Phase.GameOver);
      // TODO: Broadcast winner/loser/draw message
  }

  // Utility to get card data from the "database"
  getCardDataById(cardId: string): any | null {
      return cardDatabase.find(card => card.id === cardId) || null;
  }

}