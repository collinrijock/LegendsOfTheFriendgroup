"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.PlayerState = exports.CardInstanceSchema = exports.Phase = void 0;
const schema_1 = require("@colyseus/schema");
var Phase;
(function (Phase) {
    Phase["Lobby"] = "Lobby";
    Phase["Shop"] = "Shop";
    Phase["Preparation"] = "Preparation";
    Phase["Battle"] = "Battle";
    Phase["BattleEnd"] = "BattleEnd";
    Phase["GameOver"] = "GameOver";
})(Phase || (exports.Phase = Phase = {}));
class CardInstanceSchema extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.instanceId = "";
        this.cardId = "";
        this.name = "";
        this.attack = 0;
        this.speed = 0;
        this.health = 0;
        this.currentHp = 0;
        this.brewCost = 0;
        this.description = "";
        this.isLegend = false;
    }
    static fromCardData(data, instanceId) {
        const card = new CardInstanceSchema();
        card.instanceId = instanceId;
        card.cardId = data.id;
        card.name = data.name;
        card.attack = data.attack;
        card.speed = data.speed;
        card.health = data.health;
        card.currentHp = data.health;
        card.brewCost = data.brewCost;
        card.description = data.description;
        card.isLegend = data.isLegend;
        return card;
    }
}
exports.CardInstanceSchema = CardInstanceSchema;
class PlayerState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.sessionId = "";
        this.username = "Player";
        this.health = 100;
        this.brews = 5;
        this.shopRefreshCost = 1;
        this.hand = new schema_1.MapSchema();
        this.battlefield = new schema_1.MapSchema();
        this.isReady = false;
        this.shopOfferIds = new schema_1.ArraySchema();
    }
}
exports.PlayerState = PlayerState;
class GameState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.currentDay = 0;
        this.currentPhase = Phase.Lobby;
        this.battleTimer = 0;
    }
}
exports.GameState = GameState;
