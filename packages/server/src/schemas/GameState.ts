import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

// Define Game Phases
export enum Phase {
  Lobby = "Lobby",
  Shop = "Shop",
  Preparation = "Preparation",
  Battle = "Battle",
  BattleEnd = "BattleEnd", // Phase for showing results before returning to shop
  GameOver = "GameOver",
}
// --- Card Effect System ---
export enum EffectTrigger {
  BATTLE_START = "BATTLE_START",
  ON_ATTACK = "ON_ATTACK",
  ON_DEATH = "ON_DEATH",
  WHILE_ALIVE = "WHILE_ALIVE", // For passive auras or continuous checks
  // Add other triggers as needed, e.g., ON_DAMAGE_TAKEN, ON_HEAL, etc.
}

export class CardEffectSchema extends Schema {
  @type("string") effectId: string = ""; // Unique identifier for the effect logic (e.g., "gainBrewsOnBattleStart")
  @type("string") trigger: string = EffectTrigger.BATTLE_START; // When the effect triggers
  @type("string") description: string = ""; // Human-readable description
  @type({ map: "string" }) config = new MapSchema<string>(); // Flexible configuration for the effect (e.g., amount, chance, targetType)
  // Using string for values to allow numbers, booleans, or other simple types as strings.
  // Handler functions will parse these strings.
}
// --- End Card Effect System ---

// Schema representing a specific card instance on the server
export class CardInstanceSchema extends Schema {
  @type("string") instanceId: string = ""; // Unique ID for this instance
  @type("string") cardId: string = ""; // Base card type ID (from JSON)
  @type("string") name: string = "";
  @type("number") attack: number = 0;
  @type("number") speed: number = 0;
  @type("number") health: number = 0; // Max health
  @type("number") currentHp: number = 0;
  @type("number") brewCost: number = 0;
  @type("string") description: string = "";
  @type("string") rarity: string = "common"; // New field for rarity
  @type("string") artUrl: string = ""; // URL or key for card art

  // New field for stat buffs
  @type({ map: "number" }) statBuffs = new MapSchema<number>(); // Stores modifications to stats like attack, health, speed

  // --- Card Effects ---
  @type([CardEffectSchema]) effects = new ArraySchema<CardEffectSchema>();
  // --- End Card Effects ---

  // Helper to create from client-like data
  static fromCardData(data: any, instanceId: string): CardInstanceSchema {
    const card = new CardInstanceSchema();
    card.instanceId = instanceId;
    card.cardId = data.id;
    card.name = data.name;
    card.attack = data.attack;
    card.speed = data.speed;
    card.health = data.health;
    card.currentHp = data.health; // Start at full health
    card.brewCost = data.brewCost;
    card.description = data.description;
    card.rarity = data.rarity || "common"; // Initialize rarity
    card.artUrl = data.artUrl || "lola.png"; // Default if not provided
    // Initialize statBuffs as an empty map
    card.statBuffs = new MapSchema<number>();

    // Populate effects
    if (data.effects && Array.isArray(data.effects)) {
      data.effects.forEach((effectData: any) => {
        const effect = new CardEffectSchema();
        effect.effectId = effectData.effectId || "";
        effect.trigger = effectData.trigger || EffectTrigger.BATTLE_START;
        effect.description = effectData.description || "";
        if (effectData.config && typeof effectData.config === "object") {
          for (const key in effectData.config) {
            // Ensure config values are stored as strings.
            // JSON numbers and booleans will be converted to strings here.
            effect.config.set(key, String(effectData.config[key]));
          }
        }
        card.effects.push(effect);
      });
    }

    return card;
  }

  // Methods to get effective stats (base + buffs)
  // These are not part of the schema sent to client, but used server-side.
  getEffectiveAttack(): number {
    return this.attack + (this.statBuffs.get("attack") || 0);
  }

  getEffectiveSpeed(): number {
    // Speed buffs reduce the cooldown, so a positive speed buff means faster.
    // However, speed stat itself is usually 'time per attack'.
    // Let's assume speed stat is 'attacks per unit time' or similar, so higher is better.
    // If speed is 'cooldown time', then buffs should subtract.
    // Current implementation: card.speed is 'seconds per attack'. So higher is SLOWER.
    // A "speed buff" should DECREASE this value.
    // So, a buff value of +1 would mean -1 second to cooldown.
    // Let's clarify: if `speed` is cooldown time, then `effectiveSpeed = this.speed - buff`.
    // If `speed` is a rate, then `effectiveSpeed = this.speed + buff`.
    // The game currently uses `speed * 1000` as msToNextAttack. So lower speed value is faster.
    // A positive "speed" buff in `statBuffs` should make it faster (reduce the number).
    const rawEffectiveSpeed = this.speed - (this.statBuffs.get("speed") || 0);
    return Math.max(0.1, rawEffectiveSpeed); // Ensure speed doesn't go to 0 or negative, minimum 0.1s cooldown.
  }

  getEffectiveHealth(): number {
    return this.health + (this.statBuffs.get("health") || 0);
  }
}

// Remove old Draggables schema if it exists
/*
export class Draggables extends Schema {
  @type("string")
  imageId = "";

  @type("number")
  x = 0;

  @type("number")
  y = 0;
}
*/

// Define Player State Schema
export class PlayerState extends Schema {
  @type("string") sessionId: string = ""; // Colyseus session ID
  @type("string") username: string = "Player"; // Discord username
  @type("number") health: number = 100;
  @type("number") brews: number = 5; // Starting brews
  @type("number") shopRefreshCost: number = 1; // Cost to refresh shop, doubles each use
  @type({ map: CardInstanceSchema }) hand = new MapSchema<CardInstanceSchema>(); // Keyed by slot index "0"-"4"
  @type({ map: CardInstanceSchema }) battlefield =
    new MapSchema<CardInstanceSchema>(); // Keyed by slot index "0"-"4"
  @type("boolean") isReady: boolean = false; // Ready for next phase transition

  // --- Add Shop Offers ---
  @type(["string"]) shopOfferIds = new ArraySchema<string>(); // IDs of cards offered in the shop this phase
}

// Define Main Game State Schema
export class GameState extends Schema {
  // Remove old draggables map
  // @type({ map: Draggables })
  // draggables = new MapSchema<Draggables>();

  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>();

  @type("number")
  currentDay: number = 0; // Start at day 0, transition to 1 when game starts

  @type("string")
  currentPhase: string = Phase.Lobby; // Start in Lobby

  // Optional: Server-controlled shop cards
  // @type([CardInstanceSchema])
  // shopCards = new ArraySchema<CardInstanceSchema>();

  // Timer for the current phase (Shop, Preparation, Battle)
  @type("number")
  phaseTimer: number = 0; // Countdown in seconds

  // Match-long timer
  @type("number")
  matchTimer: number = 0; // Total elapsed seconds for the match
}