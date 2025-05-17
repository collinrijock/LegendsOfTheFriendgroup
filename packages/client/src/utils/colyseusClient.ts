import { Client, Room } from "colyseus.js";
// Import GameState schema if needed for type hints - these might still be useful for type checking within this file.
// If they are only for priming, they can be removed if priming is guaranteed in main.ts.
// For safety, let's keep them for now if they are used for types.
import { GameState, PlayerState, CardInstanceSchema } from "../schemas/GameState"; // Adjust path if needed

// --- Enhanced Schema Priming ---
// MOVED TO main.ts
// function primeSchemasForBundler() { ... }
// primeSchemasForBundler();
// --- End Enhanced Schema Priming ---

// --- Global Colyseus Room Variable ---
export let colyseusRoom: Room | null = null;
export let colyseusClient: Client | null = null;

// --- Global Card Data Cache ---
export interface CardData {
  id: string;
  name: string;
  attack: number;
  speed: number;
  health: number;
  brewCost: number;
  description: string;
  isLegend: boolean;
}
export let globalCardDataCache: Map<string, CardData> = new Map();

// Function to request and load all card data
export async function loadAllCardData(): Promise<boolean> {
  if (!colyseusRoom) return false;
  
  return new Promise((resolve) => {
    // Set a timeout to prevent indefinite waiting
    const timeout = setTimeout(() => {
      console.error("loadAllCardData: Timeout while waiting for card data");
      resolve(false);
    }, 5000);

    colyseusRoom.send("getAllCards");
    
    // Set up one-time listener for the response
    colyseusRoom.onMessage("allCards", (cardData: CardData[]) => {
      clearTimeout(timeout);
      console.log(`Received ${cardData.length} cards from server`);
      
      // Populate the global cache
      globalCardDataCache.clear();
      cardData.forEach(card => {
        globalCardDataCache.set(card.id, card);
      });
      
      resolve(true);
    });
  });
}

// Function to connect to Colyseus
export async function connectColyseus(accessToken: string, username: string) {
  const url =
    location.host.includes("localhost") // Check if running locally
      ? `ws://localhost:4001` // Changed from 3001
      : `wss://${location.host}/.proxy/api`; // Adjust proxy path if needed

  colyseusClient = new Client(url);

  try {
    console.log("Attempting to join or create Colyseus room...");
    // Pass username and potentially other Discord info
    colyseusRoom = await colyseusClient.joinOrCreate("game", {
        accessToken: accessToken, // Pass token for potential server-side validation/use
        username: username
    });

    console.log("Successfully joined room:", colyseusRoom.roomId);
    console.log("Session ID:", colyseusRoom.sessionId);
    console.log("Initial room state:", colyseusRoom.state.toJSON()); // Log initial state

    // Load all card data after connecting
    console.log("Loading all card data...");
    await loadAllCardData();
    console.log("Card data loaded, cache size:", globalCardDataCache.size);

    // Listen for state changes (optional global listener)
    colyseusRoom.onStateChange((state) => {
      // console.log("Global state change:", state.toJSON());
    });

    colyseusRoom.onError((code, message) => {
        console.error("Colyseus room error:", code, message);
        // Handle error appropriately, e.g., show message to user, return to main menu
        colyseusRoom = null; // Reset room variable
    });

    colyseusRoom.onLeave((code) => {
        console.log("Left Colyseus room, code:", code);
        // Handle leave appropriately, e.g., return to main menu
        colyseusRoom = null; // Reset room variable
    });

  } catch (e) {
    // Log the specific error object first
    console.error("Failed to connect to Colyseus:", e);

    // Check if it's a network-level event
    if (e instanceof ProgressEvent) {
        console.error("Connection failed: Network error (ProgressEvent). Potential causes:");
        console.error("- Colyseus server might not be running or accessible at the target URL:", url);
        console.error("- WebSocket connection blocked by firewall or proxy.");
        console.error("- Incorrect WebSocket proxy configuration on the deployment server (if applicable).");
        alert(`Failed to connect to game server: Network Error. Please ensure the server is running and accessible.`);
    } else if (e instanceof Error) {
        // Handle standard errors
        console.error("Connection failed due to error:", e.message);
        alert(`Failed to connect to game server: ${e.message}`);
    } else {
        // Handle other potential throw types
        console.error("Connection failed due to unknown error:", e);
        alert(`Failed to connect to game server: An unknown error occurred.`);
    }

    colyseusRoom = null; // Reset room variable on any connection error
    // Rethrow the error so the caller (e.g., authorizeDiscordUser) knows connection failed
    throw e;
  }
}