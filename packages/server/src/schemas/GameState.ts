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
  instanceId: string = "";
  cardId: string = "";
  name: string = "";
  attack: number = 0;
  speed: number = 0;
  health: number = 0;
  currentHp: number = 0;
  brewCost: number = 0;
  description: string = "";
  isLegend: boolean = false;

  static fromCardData(data: any, instanceId: string): CardInstanceSchema {
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

export class PlayerState extends Schema {
  sessionId: string = "";
  username: string = "Player";
  health: number = 100;
  brews: number = 5;
  shopRefreshCost: number = 1;
  hand = new MapSchema<CardInstanceSchema>();
  battlefield = new MapSchema<CardInstanceSchema>();
  isReady: boolean = false;
  shopOfferIds = new ArraySchema<string>();
}

export class GameState extends Schema {
  players = new MapSchema<PlayerState>();
  currentDay: number = 0;
  currentPhase: string = Phase.Lobby;
  battleTimer: number = 0;
}
