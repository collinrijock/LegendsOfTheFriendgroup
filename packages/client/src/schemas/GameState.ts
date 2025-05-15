import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export enum Phase {
  Lobby = "Lobby",
  Shop = "Shop",
  Preparation = "Preparation",
  Battle = "Battle",
  BattleEnd = "BattleEnd",
  GameOver = "GameOver",
}

export class CardInstanceSchema extends Schema {
  @type("string") instanceId: string = "";
  @type("string") cardId: string = "";
  @type("string") name: string = "";
  @type("number") attack: number = 0;
  @type("number") speed: number = 0;
  @type("number") health: number = 0;
  @type("number") currentHp: number = 0;
  @type("number") brewCost: number = 0;
  @type("string") description: string = "";
  @type("boolean") isLegend: boolean = false;

  // The static method fromCardData is not strictly part of the schema definition
  // for network synchronization but can be kept for utility if used client-side.
  // However, Colyseus primarily cares about the @type decorators for serialization.
  // For simplicity and to ensure client only has schema definition, we can omit it here
  // or ensure it doesn't cause issues. Let's include it as it was in the server file.
  static fromCardData(data: any, instanceId: string): CardInstanceSchema {
    const card = new CardInstanceSchema();
    card.instanceId = instanceId;
    card.cardId = data.id;
    card.name = data.name;
    card.attack = data.attack;
    card.speed = data.speed;
    card.health = data.health;
    card.currentHp = data.health; // Initialize currentHp to max health
    card.brewCost = data.brewCost;
    card.description = data.description;
    card.isLegend = data.isLegend;
    return card;
  }
}

export class PlayerState extends Schema {
  @type("string") sessionId: string = "";
  @type("string") username: string = "Player";
  @type("number") health: number = 100;
  @type("number") brews: number = 5;
  @type("number") shopRefreshCost: number = 1;
  @type({ map: CardInstanceSchema }) hand = new MapSchema<CardInstanceSchema>();
  @type({ map: CardInstanceSchema }) battlefield = new MapSchema<CardInstanceSchema>();
  @type("boolean") isReady: boolean = false;
  @type(["string"]) shopOfferIds = new ArraySchema<string>();
}

export class GameState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("number") currentDay: number = 0;
  @type("string") currentPhase: string = Phase.Lobby; // Use string type for enums
  @type("number") battleTimer: number = 0;
}