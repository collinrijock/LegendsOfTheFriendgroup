You are an expert game developer specializing in multiplayer web games using TypeScript, Phaser, Colyseus, and the Discord Embedded App SDK. Your task is to implement the core game logic for "Legends of the Friendgroup," a 1v1 multiplayer online auto-battler card game, by modifying the provided template project structure and files for a phaser-based discord activity game. The code provided was for a single player version of the game, feel free to plow over it and just stick with the prompt provided for building the multiplayer version.

**Project Context:**

You will be working with a template project designed for Discord multiplayer games. The file structure and key existing files are provided below. You must integrate the new game logic into this structure, modifying existing files and potentially creating new ones where necessary, while adhering to the template's conventions.

**Provided File Tree:**

**Core Game Concept: "Legends of the Friendgroup"**

This is a 1v1 auto-battler card game with distinct phases:

1.  **Lobby:** Players join and ready up. Initial game room before the core game starts. The lobby is open to 2 players, but any other players from the discord server can spectate the match.
2.  **Shop:** Players spend currency ("Brews") to buy cards for their hand. The shop will have 4 randomly generated finite set of cards in it, that can be taken / purchased from the set and added to your hand. This phase has a timer that counts down to zero, and the game transitions to the Preparation phase when the timer reaches zero. Players should be able to sell their cards from their hand or battlefield slots during this phase for half of the card's base cost. The shop will also have a refresh button that populates all of the card slots with a random set of new ones. The price to use this refresh button is low. Players can always see the board state of the game, and the face down cards that the enemy has in their hand, during all phases. The board has 5 slots on each side, and each slot can hold a card.
3.  **Preparation:** Players arrange cards from their hand onto their battlefield slots. This phase has a timer that counts down to zero, and the game transitions to the Battle phase when the timer reaches zero.
4.  **Battle:** Cards on the battlefield automatically fight each other based on their stats until one side is eliminated or a timer runs out. Cards attack a random enemy card every time their attack timer expires. The attack timer is based on the card's speed stat. Cards deal damage based on their attack stat. The damage is applied to the target card's health stat. If the target card's health is reduced to zero, it is eliminated from the battlefield.
5.  **Battle End:** Results are calculated, player health is updated, brews are awarded, and the game transitions back to the Shop phase for the next "Day" (round), unless a player's health reaches zero.
6.  **Game Over:** A final winner is declared.

**Cards**
Cards have 3 main stats: Attack, Speed, and Health. Cards also have some metadata: Name, Description, Brew Cost, Image, Rarity and optional effects. The rarities are common, rare and legendary. Common cards are very basic cards that just play off of the main 3 stats. Rare and legendary cards have additional, special effects on them. These effects are simple, but powerful. They can trigger on death, on attack, a passive effect, start/end of battle effects, or a passive buff to neighboring cards.

**Technology Stack:**

*   **Server:** Node.js, Colyseus (latest 0.16.x or compatible), TypeScript, Express.
*   **Client:** Phaser 3 (latest compatible), TypeScript, Vite, Colyseus.js (latest 0.16.x or compatible), Discord Embedded App SDK (latest).
*   **State Sync:** Colyseus Schema (`@colyseus/schema`).

**Architecture Principle: Server Authoritative**

Implement a strict server-authoritative architecture:

*   **Server (`GameRoom.ts`):** The single source of truth for ALL game state (`GameState.ts`). Handles all game logic, rule enforcement, phase transitions, calculations (damage, rewards), and state mutations. It processes client requests and updates the state.
*   **Client (Phaser Scenes):** Acts as a reactive visualizer. Connects to the server, receives state updates, renders the UI accordingly, captures user input (clicks, drags), and sends messages to the server to request actions. **Clients MUST NOT mutate game state directly or perform authoritative calculations.** They should rely entirely on the state received from the server.

**Detailed Implementation Requirements:**

1.  **Game State (`GameState.ts`):**
    *   Ensure the `GameState` schema contains:
        *   `players`: `MapSchema<PlayerState>` keyed by `sessionId`.
        *   `currentDay`: `number` (starts at 0, increments).
        *   `currentPhase`: `string` (using the `Phase` enum: `Lobby`, `Shop`, `Preparation`, `Battle`, `BattleEnd`, `GameOver`).
        *   `battleTimer`: `number` (server-controlled countdown for the battle phase).
    *   Ensure the `PlayerState` schema contains:
        *   `sessionId`: `string`.
        *   `username`: `string`.
        *   `health`: `number` (player's main HP, e.g., starts at 50).
        *   `brews`: `number` (in-game currency, e.g., starts at 10).
        *   `hand`: `MapSchema<CardInstanceSchema>` (keyed by slot index "0"-"4"). Represents cards owned but not deployed.
        *   `battlefield`: `MapSchema<CardInstanceSchema>` (keyed by slot index "0"-"4"). Represents cards deployed for battle.
        *   `isReady`: `boolean` (used for players to signal readiness for phase transitions).
        *   `shopOfferIds`: `ArraySchema<string>` (stores the `cardId`s offered to the player in the current Shop phase).
    *   Ensure the `CardInstanceSchema` schema contains:
        *   `instanceId`: `string` (A unique ID generated by the server when a card is purchased/created).
        *   `cardId`: `string` (The base ID linking to `cards.json`).
        *   `name`, `attack`, `speed`, `health` (max HP), `brewCost`, `description`, `isLegend` (copied from `cards.json`).
        *   `currentHp`: `number` (The current health of this specific card instance, mutated by the server during battle).

2.  **Server Logic (`GameRoom.ts`):**
    *   **Lifecycle:** Implement `onCreate`, `onJoin`, `onLeave`.
        *   `onCreate`: Initialize the `GameState` with default values and set the initial phase to `Lobby`. Set up message handlers.
        *   `onJoin`: Create a new `PlayerState` for the joining client, assign username from options, initialize default values (health, brews), add to `state.players`. Check if lobby is full (2 players) but *do not* transition automatically; wait for `playerReady`.
        *   `onLeave`: Remove the player from `state.players`. If the game is in progress (not Lobby/GameOver), handle game ending or awarding win to remaining player. Check for phase transitions if the leaving player was blocking one.
    *   **Message Handlers (`this.onMessage(...)`):**
        *   `"playerReady"`: Set the corresponding `player.isReady = true`. Call `checkPhaseTransition()`.
        *   `"buyCard"` (Payload: `{ cardId: string, handSlotIndex: number }`): Validate phase (`Shop`), check if `cardId` is in `player.shopOfferIds`, check if hand slot is empty, check if player has enough `brews`. If valid: deduct brews, generate a unique `instanceId`, create a `CardInstanceSchema` from `cards.json` data + `instanceId`, add it to `player.hand` at the specified `handSlotIndex`, and remove the `cardId` from `player.shopOfferIds`.
        *   `"setPreparation"` (Payload: `{ handLayout: { [key: string]: string | null }, battlefieldLayout: { [key: string]: string | null } }` where values are `instanceId`s): Validate phase (`Preparation`). **Crucially, use the received `instanceId`s to rearrange the existing `CardInstanceSchema` objects (already owned by the player on the server) between the server's `player.hand` and `player.battlefield` maps.** Do not create new cards here. Reset `currentHp` to max `health` for all cards involved. Set `player.isReady = true`. Call `checkPhaseTransition()`.
    *   **Phase Transitions:**
        *   Implement `checkPhaseTransition()`: Checks if all connected players have `isReady = true`. If so, calls `transitionToPhase()` based on the `currentPhase`.
        *   Implement `transitionToPhase(newPhase: Phase)`: Updates `state.currentPhase`, resets `isReady = false` for all players. Perform phase-specific setup:
            *   Entering `Shop`: Call `generateShopOffers()`. Increment `state.currentDay` (except when coming from Lobby).
            *   Entering `Battle`: Call `startBattle()`.
            *   Entering `GameOver`: Clean up any timers.
    *   **Shop Logic:**
        *   Implement `generateShopOffers()`: For each player, clear `player.shopOfferIds`, select a defined number (e.g., 4) of non-legendary `cardId`s from `cards.json`, and populate `player.shopOfferIds`.
    *   **Battle Logic:**
        *   Implement `startBattle()`: Set `state.battleTimer` (e.g., 45 seconds). Start a server-side `this.clock.setInterval` to decrement the timer and check for end conditions (timer <= 0 OR one player's battlefield is cleared of cards with `currentHp > 0`). When an end condition is met, call `endBattle()`.
        *   Implement `endBattle(timeoutReached: boolean)`:
            *   Stop the battle timer interval.
            *   **Calculate results based *only* on server state:** Determine survivors (`currentHp > 0`) for each player. Calculate face damage based on the sum of surviving opponents' attack stats. Apply damage to player `health` (loser takes damage, or both take damage on draw/timeout).
            *   Calculate brew rewards (e.g., base daily amount + bonus per kill based on opponent cards with `currentHp <= 0`). Add rewards to `player.brews`.
            *   **Remove dead cards:** Iterate through both players' `battlefield` maps and remove any `CardInstanceSchema` where `currentHp <= 0`.
            *   Check for game over (`player.health <= 0`). If game over, call `determineWinnerByHealth()`.
            *   If not game over, transition to `Phase.BattleEnd`. Start a short `this.clock.setTimeout` (e.g., 5 seconds) after which players are marked ready to trigger the transition back to `Shop` via `checkPhaseTransition()`.
        *   Implement `determineWinnerByHealth()`: Compare player health, determine winner/loser/draw, and transition to `Phase.GameOver`.
    *   **Card Data Loading:** Load `cards.json` data on the server for use in creating `CardInstanceSchema` and generating shop offers.

3.  **Client Logic (Phaser Scenes):**
    *   **General:** Use TypeScript. Scenes should primarily react to Colyseus state changes. Use `getStateCallbacks($)` from `colyseus.js` 0.16+ for attaching listeners reliably. Clean up listeners properly in scene `shutdown()` methods.
    *   **Connection/Auth (`main.ts`, `colyseusClient.ts`, `discordSDK.ts`):** Ensure the flow correctly handles Discord authentication and passes the necessary info (`accessToken`, `username`) to `connectColyseus` to join the `game` room.
    *   **`Lobby.ts`:**
        *   Display connected players and their usernames (read from `state.players`).
        *   Show player `isReady` status visually (e.g., "[Ready]" text, color change).
        *   Display a "Ready Up" button. Enable it only when 2 players are present and the local player is not ready.
        *   On button click, send `"playerReady"` message. Visually disable the button and show "Waiting...".
        *   Listen for `state.players` additions/removals and `player.isReady` changes to update the UI.
        *   Listen for `state.currentPhase` changes; transition to `Shop` scene when the phase changes accordingly.
    *   **`Shop.ts`:**
        *   Display player `health` and `brews` in a persistent navbar area (updated via listeners).
        *   Display the current `Day` and `Phase` (updated via listeners).
        *   Display cards available for purchase based on the local player's `state.players.get(myId).shopOfferIds`. Fetch card details from the preloaded `cards.json` cache. Make these shop cards draggable.
        *   Display the player's current hand cards (read from `state.players.get(myId).hand`) in designated hand slots. These should *not* be draggable in the shop.
        *   Implement drag-and-drop for shop cards onto hand slots. On drop:
            *   Check if the target hand slot is visually empty *and* empty in the server state (`player.hand.has(slotIndex)`).
            *   If empty, send the `"buyCard"` message to the server with the `cardId` (from the dragged shop card's data) and the target `handSlotIndex`.
            *   **Do not** add the card visually to the hand immediately. Snap the dragged shop card back to its origin.
            *   The visual update to the hand and shop (removing the bought card) will happen when the client receives the state update from the server via the `player.hand.onAdd` and `player.shopOfferIds.onRemove` listeners.
        *   Display a "Continue" button. Enable it only when the player is not ready and the phase is `Shop`.
        *   On button click, send `"playerReady"`. Visually disable the button and show "Waiting...".
        *   Listen for `player.isReady` changes (self and opponent) to manage button state and waiting text.
        *   Listen for `state.currentPhase` changes; transition to `Preparation`.
    *   **`Preparation.ts`:**
        *   Display navbar (Health, Brews, Day, Phase).
        *   Display hand slots and battlefield slots visually.
        *   Render draggable card visuals based *only* on the server state in `player.hand` and `player.battlefield`. Use the `instanceId` from the schema. Store the `instanceId` in the Phaser GameObject's data.
        *   Implement drag-and-drop for cards *between* the hand and battlefield areas. Update the visual placement immediately.
        *   Display a "Start Battle" button. Enable it only when the player is not ready, the phase is `Preparation`, AND at least one card is visually placed on the battlefield.
        *   On button click:
            *   Construct the `handLayout` and `battlefieldLayout` objects based on the *current visual placement* of cards, mapping slot indices ("0"-"4") to the corresponding card's `instanceId` (retrieved from the GameObject's data) or `null` if empty.
            *   Send the `"setPreparation"` message with this layout payload.
            *   Visually disable the button and show "Waiting...".
        *   Listen for `player.isReady` changes to manage button state/waiting text.
        *   Listen for `state.currentPhase` changes; transition to `Battle`.
        *   Listen for `player.hand` and `player.battlefield` `onAdd`/`onRemove` events to redraw the board visuals if the state changes unexpectedly (e.g., due to server correction, though ideally layout is only set once). Handle the initial population of cards using these listeners, potentially with a slight delay after scene creation to ensure the scene is active.
    *   **`Battle.ts`:**
        *   Display navbar.
        *   Render non-draggable card visuals on the player and opponent battlefields based on `state.players[id].battlefield`. Store `instanceId` and reference to the `CardInstanceSchema` with the visual object.
        *   **Crucially:** Implement listeners for `currentHp` changes on *each individual* `CardInstanceSchema` on the battlefield (for both players). Use `$(cardInstanceSchema).listen("currentHp", ...)`.
            *   When `currentHp` changes, update the visual HP display (text and color).
            *   If the new `currentHp` is <= 0, trigger the card's death visual (e.g., tint grey, remove attack bar) but **do not** remove the object immediately (server handles removal from state).
        *   Implement visual-only attack animations in the `update` loop:
            *   Each card visual has an attack timer based on its `speed`.
            *   When the timer expires, pick a random living target on the opposing side.
            *   Show a visual effect (e.g., tween, particle, line).
            *   Trigger the target card's `takeDamage(damage)` method *only* to display a floating damage number animation. **Do not modify the target's HP here.**
            *   Reset the attack timer.
        *   Listen for `state.currentPhase` changes:
            *   On `BattleEnd`: Stop local attack animations/timers. Display results (Victory/Defeat/Draw) based on the final player health comparison from the server state received *just before* the phase change. Show "Waiting for next round...".
            *   On `GameOver`: Stop local animations. Display final game result. Add a button/input handler to return to the `MainMenu`.
            *   On unexpected phase change (e.g., back to `Lobby`): Stop scene, potentially leave room, go to `MainMenu`.
        *   Listen for `player.battlefield` `onAdd`/`onRemove` to handle cards appearing/disappearing mid-battle (unlikely but good practice) and manage `currentHp` listeners accordingly. Clean up HP listeners when cards are removed or the scene shuts down.

4.  **Card Data (`cards.json`):**
    *   Ensure the server loads this data to create card instances.
    *   Ensure the client preloads this data in `Preloader.ts` for displaying shop offers and potentially card details.

5.  **General:**
    *   Use TypeScript throughout.
    *   Ensure proper cleanup of listeners and Phaser objects in scene `shutdown` methods to prevent memory leaks.
    *   Maintain the server-authoritative principle rigorously.