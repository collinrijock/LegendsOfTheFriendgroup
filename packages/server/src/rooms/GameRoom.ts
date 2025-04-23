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

// --- Constants for Rewards ---
const DAILY_BREW_BONUS = 5;
const BREW_PER_KILL = 1;
// --- End Constants ---

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

    // Update message type hint to expect cardId (string)
    this.onMessage("buyCard", (client, message: { cardId: string, handSlotIndex: number }) => {
        const player = this.state.players.get(client.sessionId);
        const cardId = message.cardId; // Get the base card ID being bought
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
        // --- Validate against shopOfferIds ---
        if (!player.shopOfferIds.includes(cardId)) {
            console.warn(`Buy attempt failed: Card ID ${cardId} not found in player's shop offers.`);
            return; // Card not offered to this player
        }
        // --- End Validation ---

        // Fetch full card data using the ID
        const cardData = this.getCardDataById(cardId);

        if (!cardData || typeof cardData.brewCost !== 'number') {
             console.warn(`Buy attempt failed: Invalid card data found for ID ${cardId}.`);
             return; // Invalid card data in database?
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

        console.log(`Player ${client.sessionId} bought ${cardData.name} (ID: ${cardId}) for ${cardData.brewCost}. Placed in hand slot ${slotIndex}. Remaining brews: ${player.brews}`);

        // --- Remove bought card ID from shop offers ---
        const offerIndex = player.shopOfferIds.findIndex(id => id === cardId);
        if (offerIndex > -1) {
            player.shopOfferIds.splice(offerIndex, 1);
            console.log(`Removed card ID ${cardId} from shop offers for player ${client.sessionId}.`);
        } else {
            console.warn(`Could not find bought card ID ${cardId} in shop offers for player ${client.sessionId} to remove it.`);
        }
        // --- End Remove ---

        // Client UI should update based on state change automatically
    });

    // Update the type hint for the message payload to expect objects
    this.onMessage("setPreparation", (client, message: { handLayout: { [key: string]: any | null }, battlefieldLayout: { [key: string]: any | null } }) => {
        const player = this.state.players.get(client.sessionId);
        if (!player || this.state.currentPhase !== Phase.Preparation) {
            console.warn(`SetPreparation failed: Invalid state (Player: ${!!player}, Phase: ${this.state.currentPhase})`);
            return; // Wrong phase or player not found
        }

        console.log(`Received preparation layout from ${client.sessionId}`);

        // Clear existing layouts and repopulate based on message
        player.hand.clear();
        player.battlefield.clear();

        // Iterate over the handLayout object
        Object.entries(message.handLayout).forEach(([index, cardInstanceData]) => {
            if (cardInstanceData) {
                // Re-create schema instance - assumes client sends full CardInstance data
                const card = new CardInstanceSchema();
                Object.assign(card, cardInstanceData); // Copy properties
                player.hand.set(String(index), card); // Use the string index as the key
            }
        });

        // Iterate over the battlefieldLayout object
        Object.entries(message.battlefieldLayout).forEach(([index, cardInstanceData]) => {
            if (cardInstanceData) {
                const card = new CardInstanceSchema();
                Object.assign(card, cardInstanceData);
                player.battlefield.set(String(index), card); // Use the string index as the key
            }
        });

        player.isReady = true;
        this.checkPhaseTransition();
    });

    // --- Add clientBattleOver handler ---
    this.onMessage("clientBattleOver", (client) => {
        const player = this.state.players.get(client.sessionId);
        console.log(`Received clientBattleOver message from ${player?.username ?? client.sessionId}`);
        // Check if we are actually in the Battle phase before ending it
        if (this.state.currentPhase === Phase.Battle) {
            console.log("clientBattleOver handler: Phase is Battle. Calling endBattle."); // Log before call
            this.endBattle(false); // End battle, not due to timeout
        } else {
            console.warn(`Received clientBattleOver message during non-Battle phase (${this.state.currentPhase}). Ignoring.`);
        }
    });
    // --- End clientBattleOver handler ---

    // Remove old "move" message handler if present
    /*
    this.onMessage("move", (client, message) => { ... });
    */
  }

  onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
    console.log(`Client joined: ${client.sessionId}`);
    // Log the received options to check for username
    console.log(`Received options for ${client.sessionId}:`, JSON.stringify(options));

    const newPlayer = new PlayerState();
    newPlayer.sessionId = client.sessionId;
    // Assign username from options, log the result
    newPlayer.username = options?.username || `Player_${client.sessionId.substring(0, 4)}`;
    console.log(`Assigned username for ${client.sessionId}: ${newPlayer.username}`);

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
    // --- Add Logging Here ---
    console.log(`--- Preparing for Phase Transition: ${this.state.currentPhase} -> ${newPhase} ---`);
    this.state.players.forEach((player, sessionId) => {
        const handContents = JSON.stringify(Object.fromEntries(player.hand.entries()));
        const battlefieldContents = JSON.stringify(Object.fromEntries(player.battlefield.entries()));
        console.log(`Player ${player.username} (${sessionId}) State:`);
        console.log(`  Hand: ${handContents}`);
        console.log(`  Battlefield: ${battlefieldContents}`);
    });
    console.log(`--- End State Log ---`);
    // --- End Logging ---

    console.log(`Transitioning phase: ${this.state.currentPhase} -> ${newPhase}`);
    this.state.currentPhase = newPhase;

    // Reset ready status for all players for the new phase
    this.state.players.forEach(player => {
        player.isReady = false;
    });

    // --- Add Post-Transition Logging Here ---
    console.log(`--- State AFTER Transition to: ${newPhase} ---`);
    this.state.players.forEach((player, sessionId) => {
        const handContents = JSON.stringify(Object.fromEntries(player.hand.entries()));
        const battlefieldContents = JSON.stringify(Object.fromEntries(player.battlefield.entries()));
        console.log(`Player ${player.username} (${sessionId}) State:`);
        console.log(`  Hand: ${handContents}`);
        console.log(`  Battlefield: ${battlefieldContents}`);
        console.log(`  IsReady: ${player.isReady}`); // Also log ready status
    });
    console.log(`--- End Post-Transition State Log ---`);
    // --- End Logging ---


    // Phase-specific start actions
    if (newPhase === Phase.Shop) {
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

            // --- Check for Battle End by Board Clear ---
            let player1Cleared = true;
            let player2Cleared = true;
            const playerIds = Array.from(this.state.players.keys());
            if (playerIds.length === 2) {
                const player1 = this.state.players.get(playerIds[0]);
                const player2 = this.state.players.get(playerIds[1]);

                if (player1 && player1.battlefield.size > 0) { // Only check if board has cards
                    player1.battlefield.forEach(card => {
                        if (card.currentHp > 0) player1Cleared = false;
                    });
                } else {
                    player1Cleared = false; // Cannot be cleared if empty initially? Or treat as cleared? Decide logic. Assume not cleared if empty.
                }

                if (player2 && player2.battlefield.size > 0) { // Only check if board has cards
                    player2.battlefield.forEach(card => {
                        if (card.currentHp > 0) player2Cleared = false;
                    });
                 } else {
                    player2Cleared = false; // Assume not cleared if empty.
                 }

                // If one side is cleared AND the board wasn't empty to begin with (or both boards were non-empty initially)
                const wasPlayer1BoardPopulated = player1 && player1.battlefield.size > 0;
                const wasPlayer2BoardPopulated = player2 && player2.battlefield.size > 0;

                if ((player1Cleared && wasPlayer1BoardPopulated) || (player2Cleared && wasPlayer2BoardPopulated)) {
                    console.log(`Battle timer loop: Board clear detected. Player 1 Cleared: ${player1Cleared}, Player 2 Cleared: ${player2Cleared}. Calling endBattle.`); // Log before call
                    this.endBattle(false); // End battle, not due to timeout
                    return; // Stop further processing for this interval tick
                }
            }
            // --- End Board Clear Check ---


            this.state.battleTimer--;
            // console.log(`Battle timer: ${this.state.battleTimer}`); // Optional: Log countdown
            if (this.state.battleTimer <= 0) {
                console.log("Battle timer loop: Timer reached zero. Calling endBattle."); // Log before call
                this.endBattle(true); // End battle due to time limit
            }
            // TODO: Add check for board empty condition if needed
        } else {
             if (this.battleTimerInterval) this.battleTimerInterval.clear(); // Stop timer if phase changed unexpectedly
        }
    }, 1000); // Update every second
  }

    // Called when battle ends (timer, board clear, or client message)
    endBattle(timeoutReached: boolean = false) {
        console.log(`--- Entering endBattle function --- Timeout: ${timeoutReached}`); // Log entry
        if (this.state.currentPhase !== Phase.Battle) {
             console.log(`--- endBattle exiting early: Current phase is ${this.state.currentPhase}, not Battle. ---`); // Log exit reason
             return; // Prevent double execution
        }

        console.log(`--- Starting endBattle ---`);
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
            console.error("endBattle: Cannot calculate battle results without exactly 2 players.");
            this.transitionToPhase(Phase.GameOver); // Or handle appropriately
            return;
        }

        if (!player1 || !player2) {
             console.error("endBattle: Player state missing during battle end calculation.");
             this.transitionToPhase(Phase.GameOver);
             return;
        }

        // --- Log Initial Battlefield States ---
        console.log(`endBattle: Player 1 (${player1.username}) Battlefield State:`);
        player1.battlefield.forEach((card, key) => {
            console.log(`  Slot ${key}: ${card.name} (ID: ${card.cardId}, HP: ${card.currentHp}/${card.health})`);
        });
        console.log(`endBattle: Player 2 (${player2.username}) Battlefield State:`);
        player2.battlefield.forEach((card, key) => {
            console.log(`  Slot ${key}: ${card.name} (ID: ${card.cardId}, HP: ${card.currentHp}/${card.health})`);
        });
        // --- End Log ---

        // Determine survivors (based on current server state)
        const player1Survivors = Array.from(player1.battlefield.values()).filter(card => card && card.currentHp > 0);
        const player2Survivors = Array.from(player2.battlefield.values()).filter(card => card && card.currentHp > 0);

        // --- Log Survivor Counts ---
        console.log(`endBattle: Player 1 Survivors Count: ${player1Survivors.length}`);
        console.log(`endBattle: Player 2 Survivors Count: ${player2Survivors.length}`);
        // --- End Log ---

        // Determine winner/loser based on survivors
        let winner: PlayerState | null = null;
        let loser: PlayerState | null = null;
        let isDraw = false;

        // --- Determine Winner/Loser/Draw ---
        if (player1Survivors.length > 0 && player2Survivors.length === 0) {
            // Player 1 wins if they have survivors and Player 2 does not
            winner = player1;
            loser = player2;
            console.log(`endBattle: Winner determined: Player 1 (${winner.username})`);
        } else if (player2Survivors.length > 0 && player1Survivors.length === 0) {
            // Player 2 wins if they have survivors and Player 1 does not
            winner = player2;
            loser = player1;
            console.log(`endBattle: Winner determined: Player 2 (${winner.username})`);
        } else if (player1Survivors.length === 0 && player2Survivors.length === 0) {
            // Draw if both players have no survivors
            isDraw = true;
            console.log(`endBattle: Battle determined as Draw (both boards cleared).`);
        } else {
            // Draw if both players have survivors (e.g., timeout)
            // Note: Could add logic here to determine winner by total HP/attack if desired for timeout draws
            isDraw = true;
            console.log(`endBattle: Battle determined as Draw (both have survivors or timeout).`);
        }
        // --- End Winner/Loser/Draw Determination ---


        // Calculate face damage based on opponent survivors
        const p1FaceDamage = player2Survivors.reduce((sum, card) => sum + card.attack, 0);
        const p2FaceDamage = player1Survivors.reduce((sum, card) => sum + card.attack, 0);

        // --- Log Calculated Damage ---
        console.log(`endBattle: Calculated Face Damage for Player 1: ${p1FaceDamage} (from ${player2Survivors.length} P2 survivors)`);
        console.log(`endBattle: Calculated Face Damage for Player 2: ${p2FaceDamage} (from ${player1Survivors.length} P1 survivors)`);
        // --- End Log ---

        // --- Log Health Before Damage ---
        console.log(`endBattle: Player 1 Health BEFORE damage: ${player1.health}`);
        console.log(`endBattle: Player 2 Health BEFORE damage: ${player2.health}`);
        // --- End Log ---

        // Apply face damage ONLY to the loser, or both if it's a draw
        // --- Add Detailed Damage Application Logging ---
        if (loser === player1 || isDraw) {
            // Apply damage to Player 1 if they lost OR if it's a draw
            console.log(`endBattle: Applying ${p1FaceDamage} damage to Player 1 (${player1.username}) because ${isDraw ? 'it was a draw' : 'they were the loser'}.`);
            player1.health = Math.max(0, player1.health - p1FaceDamage);
            console.log(`endBattle: Player 1 New HP: ${player1.health}`);
        } else {
             // Player 1 won, do not apply damage
             console.log(`endBattle: NOT applying ${p1FaceDamage} damage to Player 1 (${player1.username}) because they won.`);
        }
        if (loser === player2 || isDraw) {
            // Apply damage to Player 2 if they lost OR if it's a draw
            console.log(`endBattle: Applying ${p2FaceDamage} damage to Player 2 (${player2.username}) because ${isDraw ? 'it was a draw' : 'they were the loser'}.`);
            player2.health = Math.max(0, player2.health - p2FaceDamage);
            console.log(`endBattle: Player 2 New HP: ${player2.health}`);
        } else {
             // Player 2 won, do not apply damage
             console.log(`endBattle: NOT applying ${p2FaceDamage} damage to Player 2 (${player2.username}) because they won.`);
        }
        // --- End Detailed Damage Application Logging ---

        // Calculate brews earned based on opponent's dead cards + daily bonus
        const player1OpponentDeadCards = Array.from(player2.battlefield.values()).filter(card => card && card.currentHp <= 0).length;
        const player2OpponentDeadCards = Array.from(player1.battlefield.values()).filter(card => card && card.currentHp <= 0).length;

        const p1BrewReward = DAILY_BREW_BONUS + (player1OpponentDeadCards * BREW_PER_KILL);
        const p2BrewReward = DAILY_BREW_BONUS + (player2OpponentDeadCards * BREW_PER_KILL);

        // --- Log Brew Calculation ---
        console.log(`endBattle: Player 1 Brew Reward Calculation: Daily=${DAILY_BREW_BONUS}, Kills=${player1OpponentDeadCards} * ${BREW_PER_KILL} = Total: ${p1BrewReward}`);
        console.log(`endBattle: Player 2 Brew Reward Calculation: Daily=${DAILY_BREW_BONUS}, Kills=${player2OpponentDeadCards} * ${BREW_PER_KILL} = Total: ${p2BrewReward}`);
        console.log(`endBattle: Player 1 Brews BEFORE reward: ${player1.brews}`);
        console.log(`endBattle: Player 2 Brews BEFORE reward: ${player2.brews}`);
        // --- End Log ---

        player1.brews += p1BrewReward;
        player2.brews += p2BrewReward;

        console.log(`endBattle: Final Battle Results: P1 HP=${player1.health}, P2 HP=${player2.health}.`);
        console.log(`endBattle: P1 Brews: +${p1BrewReward} => Total: ${player1.brews}`);
        console.log(`endBattle: P2 Brews: +${p2BrewReward} => Total: ${player2.brews}`);

        // --- Remove Dead Cards from Battlefield State ---
        console.log("endBattle: Removing dead cards from battlefield state...");
        player1.battlefield.forEach((card, key) => {
            if (card.currentHp <= 0) {
                console.log(`  Removing P1 card: ${card.name} (Key: ${key})`);
                player1.battlefield.delete(key);
            }
        });
        player2.battlefield.forEach((card, key) => {
            if (card.currentHp <= 0) {
                console.log(`  Removing P2 card: ${card.name} (Key: ${key})`);
                player2.battlefield.delete(key);
            }
        });
        console.log("endBattle: Finished removing dead cards.");
        // --- End Remove Dead Cards ---

        // Check Game Over conditions
        if (player1.health <= 0 || player2.health <= 0) {
            console.log("endBattle: Game Over condition met (player health <= 0). Determining winner by health.");
            this.determineWinnerByHealth(); // This will transition to GameOver
        } else {
            // Transition to BattleEnd phase to show results
            console.log("endBattle: Transitioning to BattleEnd phase.");
            this.transitionToPhase(Phase.BattleEnd);

            // Add a delay before automatically transitioning to the next Shop phase
            if (this.battleEndTimeout) this.battleEndTimeout.clear();
            this.battleEndTimeout = this.clock.setTimeout(() => {
                if (this.state.currentPhase === Phase.BattleEnd) { // Check if still in BattleEnd
                     console.log("endBattle: BattleEnd timeout reached. Marking players ready and checking phase transition.");
                     this.state.players.forEach(p => p.isReady = true); // Mark as ready
                     this.checkPhaseTransition(); // Trigger transition Shop
                } else {
                    console.log("endBattle: BattleEnd timeout reached, but phase is no longer BattleEnd. No transition triggered.");
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
          console.log(`Game Over - ${winner.username} wins with ${winner.health} HP!`);
      }
      this.transitionToPhase(Phase.GameOver);
      // TODO: Broadcast winner/loser/draw message
  }

  // --- Shop Generation ---
  generateShopOffers() {
    console.log("Generating new shop offers for all players...");
    const allCards = cardDatabase.filter(card => !card.isLegend); // Filter out legends

    this.state.players.forEach(player => {
        player.shopOfferIds.clear(); // Clear previous offers
        const availableCards = [...allCards]; // Create a copy to modify
        const selectedIds = new Set<string>();

        while (selectedIds.size < 4 && availableCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCards.length);
            const chosenCard = availableCards.splice(randomIndex, 1)[0];
            selectedIds.add(chosenCard.id);
        }

        selectedIds.forEach(id => player.shopOfferIds.push(id));
        console.log(`Generated shop offers for ${player.username}: [${player.shopOfferIds.join(', ')}]`);
    });
  }

  // Utility to get card data from the "database"
  getCardDataById(cardId: string): any | null {
      return cardDatabase.find(card => card.id === cardId) || null;
  }

}