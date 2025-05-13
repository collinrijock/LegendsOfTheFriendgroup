import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

// Define Game Phases
export enum Phase {
    Lobby = "Lobby",
    Shop = "Shop",
    Preparation = "Preparation",
    Battle = "Battle",
    BattleEnd = "BattleEnd", // Phase for showing results before returning to shop
    GameOver = "GameOver"
}

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
    @type("boolean") isLegend: boolean = false;

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
        card.isLegend = data.isLegend;
        return card;
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
    @type({ map: CardInstanceSchema }) battlefield = new MapSchema<CardInstanceSchema>(); // Keyed by slot index "0"-"4"
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

  // Optional: Server-side battle timer
  @type("number")
  battleTimer: number = 0; // Countdown in seconds
}