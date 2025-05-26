"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.PlayerState = exports.CardInstanceSchema = exports.CardEffectSchema = exports.EffectTrigger = exports.Phase = void 0;
const schema_1 = require("@colyseus/schema");
// Define Game Phases
var Phase;
(function (Phase) {
    Phase["Lobby"] = "Lobby";
    Phase["Shop"] = "Shop";
    Phase["Preparation"] = "Preparation";
    Phase["Battle"] = "Battle";
    Phase["BattleEnd"] = "BattleEnd";
    Phase["GameOver"] = "GameOver";
})(Phase || (exports.Phase = Phase = {}));
// --- Card Effect System ---
var EffectTrigger;
(function (EffectTrigger) {
    EffectTrigger["BATTLE_START"] = "BATTLE_START";
    EffectTrigger["ON_ATTACK"] = "ON_ATTACK";
    EffectTrigger["ON_DEATH"] = "ON_DEATH";
    EffectTrigger["WHILE_ALIVE"] = "WHILE_ALIVE";
    // Add other triggers as needed, e.g., ON_DAMAGE_TAKEN, ON_HEAL, etc.
})(EffectTrigger || (exports.EffectTrigger = EffectTrigger = {}));
class CardEffectSchema extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.effectId = ""; // Unique identifier for the effect logic (e.g., "gainBrewsOnBattleStart")
        this.trigger = EffectTrigger.BATTLE_START; // When the effect triggers
        this.description = ""; // Human-readable description
        this.config = new schema_1.MapSchema(); // Flexible configuration for the effect (e.g., amount, chance, targetType)
        // Using string for values to allow numbers, booleans, or other simple types as strings.
        // Handler functions will parse these strings.
    }
}
exports.CardEffectSchema = CardEffectSchema;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], CardEffectSchema.prototype, "effectId", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], CardEffectSchema.prototype, "trigger", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], CardEffectSchema.prototype, "description", void 0);
__decorate([
    (0, schema_1.type)({ map: "string" }),
    __metadata("design:type", Object)
], CardEffectSchema.prototype, "config", void 0);
// --- End Card Effect System ---
// Schema representing a specific card instance on the server
class CardInstanceSchema extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.instanceId = ""; // Unique ID for this instance
        this.cardId = ""; // Base card type ID (from JSON)
        this.name = "";
        this.attack = 0;
        this.speed = 0;
        this.health = 0; // Max health
        this.currentHp = 0;
        this.brewCost = 0;
        this.description = "";
        this.rarity = "common"; // New field for rarity
        this.artUrl = ""; // URL or key for card art
        // New field for stat buffs
        this.statBuffs = new schema_1.MapSchema(); // Stores modifications to stats like attack, health, speed
        // --- Card Effects ---
        this.effects = new schema_1.ArraySchema();
    }
    // --- End Card Effects ---
    // Helper to create from client-like data
    static fromCardData(data, instanceId) {
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
        card.statBuffs = new schema_1.MapSchema();
        // Populate effects
        if (data.effects && Array.isArray(data.effects)) {
            data.effects.forEach((effectData) => {
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
    getEffectiveAttack() {
        return this.attack + (this.statBuffs.get("attack") || 0);
    }
    getEffectiveSpeed() {
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
    getEffectiveHealth() {
        return this.health + (this.statBuffs.get("health") || 0);
    }
}
exports.CardInstanceSchema = CardInstanceSchema;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], CardInstanceSchema.prototype, "instanceId", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], CardInstanceSchema.prototype, "cardId", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], CardInstanceSchema.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], CardInstanceSchema.prototype, "attack", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], CardInstanceSchema.prototype, "speed", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], CardInstanceSchema.prototype, "health", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], CardInstanceSchema.prototype, "currentHp", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], CardInstanceSchema.prototype, "brewCost", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], CardInstanceSchema.prototype, "description", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], CardInstanceSchema.prototype, "rarity", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], CardInstanceSchema.prototype, "artUrl", void 0);
__decorate([
    (0, schema_1.type)({ map: "number" }),
    __metadata("design:type", Object)
], CardInstanceSchema.prototype, "statBuffs", void 0);
__decorate([
    (0, schema_1.type)([CardEffectSchema]),
    __metadata("design:type", Object)
], CardInstanceSchema.prototype, "effects", void 0);
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
class PlayerState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.sessionId = ""; // Colyseus session ID
        this.username = "Player"; // Discord username
        this.health = 100;
        this.brews = 5; // Starting brews
        this.shopRefreshCost = 1; // Cost to refresh shop, doubles each use
        this.hand = new schema_1.MapSchema(); // Keyed by slot index "0"-"4"
        this.battlefield = new schema_1.MapSchema(); // Keyed by slot index "0"-"4"
        this.isReady = false; // Ready for next phase transition
        // --- Add Shop Offers ---
        this.shopOfferIds = new schema_1.ArraySchema(); // IDs of cards offered in the shop this phase
    }
}
exports.PlayerState = PlayerState;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], PlayerState.prototype, "sessionId", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], PlayerState.prototype, "username", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], PlayerState.prototype, "health", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], PlayerState.prototype, "brews", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], PlayerState.prototype, "shopRefreshCost", void 0);
__decorate([
    (0, schema_1.type)({ map: CardInstanceSchema }),
    __metadata("design:type", Object)
], PlayerState.prototype, "hand", void 0);
__decorate([
    (0, schema_1.type)({ map: CardInstanceSchema }),
    __metadata("design:type", Object)
], PlayerState.prototype, "battlefield", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], PlayerState.prototype, "isReady", void 0);
__decorate([
    (0, schema_1.type)(["string"]),
    __metadata("design:type", Object)
], PlayerState.prototype, "shopOfferIds", void 0);
// Define Main Game State Schema
class GameState extends schema_1.Schema {
    constructor() {
        // Remove old draggables map
        // @type({ map: Draggables })
        // draggables = new MapSchema<Draggables>();
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.currentDay = 0; // Start at day 0, transition to 1 when game starts
        this.currentPhase = Phase.Lobby; // Start in Lobby
        // Optional: Server-controlled shop cards
        // @type([CardInstanceSchema])
        // shopCards = new ArraySchema<CardInstanceSchema>();
        // Timer for the current phase (Shop, Preparation, Battle)
        this.phaseTimer = 0; // Countdown in seconds
        // Match-long timer
        this.matchTimer = 0; // Total elapsed seconds for the match
    }
}
exports.GameState = GameState;
__decorate([
    (0, schema_1.type)({ map: PlayerState }),
    __metadata("design:type", Object)
], GameState.prototype, "players", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "currentDay", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "currentPhase", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "phaseTimer", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "matchTimer", void 0);
