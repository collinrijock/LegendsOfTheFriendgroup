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
exports.GameState = exports.PlayerState = exports.CardInstanceSchema = exports.Phase = void 0;
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
        this.isLegend = false;
    }
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
        card.isLegend = data.isLegend;
        return card;
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
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], CardInstanceSchema.prototype, "isLegend", void 0);
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
        // Optional: Server-side battle timer
        this.battleTimer = 0; // Countdown in seconds
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
], GameState.prototype, "battleTimer", void 0);
