import { Client } from "colyseus.js";
import { Room } from "colyseus.js";

// Import the actual schema definitions from the server.
// This is necessary for Colyseus to be able to deserialize the state
// received from the server. The client application code can still use
// the interfaces from `ClientSchemas.ts` for its own type safety.
import { GameState, PlayerState, CardInstanceSchema } from "../../../server/src/schemas/GameState";

// Log to confirm schemas are imported.
// These are the actual class definitions needed by Colyseus for deserialization.
// Client-side interfaces in ClientSchemas.ts are for TypeScript type checking and are erased at runtime.
console.log("Server schema classes (GameState, PlayerState, CardInstanceSchema) imported for Colyseus runtime:");
console.log("- GameState:", GameState, "GameState.name:", GameState.name);
console.log("- PlayerState:", PlayerState, "PlayerState.name:", PlayerState.name);
console.log("- CardInstanceSchema:", CardInstanceSchema, "CardInstanceSchema.name:", CardInstanceSchema.name);

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
  rarity: string; // Replaced isLegend
  artUrl: string; // URL or key for card art
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

    colyseusRoom!.send("getAllCards");
    
    // Set up one-time listener for the response
    colyseusRoom!.onMessage("allCards", (cardData: CardData[]) => {
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
export async function connectColyseus(accessToken: string, username: string) { // Removed channelId parameter
  // Construct URL consistently. Vite's proxy will handle /.proxy for dev.
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  // Connect to the root of the proxy, room name will be appended.
  const url = `${protocol}://${location.host}/.proxy/`;
  console.log(`Colyseus Client: Attempting to connect to WebSocket base URL: ${url}`);

  colyseusClient = new Client(url);

  try {
    console.log("Colyseus Client: Attempting to join or create Colyseus room 'game' (channelId filter temporarily removed for diagnostics)...");
    console.log("Colyseus Client: Options for joinOrCreate:", {
        accessToken: accessToken,
        username: username,
    });
    // Pass username and potentially other Discord info
    colyseusRoom = await colyseusClient.joinOrCreate("game", {
        accessToken: accessToken, // Pass token for potential server-side validation/use
        username: username,
        // channelId: channelId // Temporarily removed for diagnostics
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
        console.error("Colyseus Client: Connection failed: Network error (ProgressEvent). Potential causes:");
        console.error("- Colyseus server might not be running or accessible at the target URL:", url);
        console.error("- WebSocket connection blocked by firewall or proxy.");
        console.error("- Incorrect WebSocket proxy configuration on the deployment server (if applicable).");
        console.error("- Full ProgressEvent object:", e);
        alert(`Failed to connect to game server: Network Error. Please ensure the server is running and accessible.`);
    } else if (e instanceof Error) {
        // Handle standard errors
        console.error("Colyseus Client: Connection failed due to error:", e.message);
        console.error("Colyseus Client: Full error object:", e);
        alert(`Failed to connect to game server: ${e.message}`);
    } else {
        // Handle other potential throw types
        console.error("Colyseus Client: Connection failed due to unknown error:", e);
        alert(`Failed to connect to game server: An unknown error occurred.`);
    }

    colyseusRoom = null; // Reset room variable on any connection error
    // Rethrow the error so the caller (e.g., authorizeDiscordUser) knows connection failed
    throw e;
  }
}