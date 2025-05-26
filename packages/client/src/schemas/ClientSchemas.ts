export enum Phase {
    Lobby = "Lobby",
    Shop = "Shop",
    Preparation = "Preparation",
    Battle = "Battle",
    BattleEnd = "BattleEnd", // Phase for showing results before returning to shop
    GameOver = "GameOver"
}

// --- Card Effect System (Client-side) ---
export enum EffectTrigger {
    BATTLE_START = "BATTLE_START",
    ON_ATTACK = "ON_ATTACK",
    ON_DEATH = "ON_DEATH",
    WHILE_ALIVE = "WHILE_ALIVE",
}

export interface ClientCardEffect {
    effectId: string;
    trigger: EffectTrigger;
    description: string;
    config: Map<string, string>; // Config values are strings, parsed by handlers
}
// --- End Card Effect System (Client-side) ---

export interface ClientCardInstance {
    instanceId: string; // Unique ID for this instance
    cardId: string; // Base card type ID (from JSON)
    name: string;
    attack: number;
    speed: number;
    health: number; // Max health
    currentHp: number;
    brewCost: number;
    description: string;
    rarity: string;
    artUrl: string; // URL or key for card art
    statBuffs: Map<string, number>; // Stores modifications to stats
    effects: ClientCardEffect[]; // Added effects
}

export interface ClientPlayerState {
    sessionId: string; // Colyseus session ID
    username: string; // Discord username
    health: number;
    brews: number; // Starting brews
    shopRefreshCost: number; // Cost to refresh shop, doubles each use
    hand: Map<string, ClientCardInstance>; // Keyed by slot index "0"-"4"
    battlefield: Map<string, ClientCardInstance>; // Keyed by slotIndex "0"-"4"
    isReady: boolean; // Ready for next phase transition
    shopOfferIds: string[]; // IDs of cards offered in the shop this phase
}

export interface ClientGameState {
    players: Map<string, ClientPlayerState>;
    currentDay: number;
    currentPhase: Phase; // Use the Phase enum from this file
    battleTimer: number; // Countdown in seconds
}