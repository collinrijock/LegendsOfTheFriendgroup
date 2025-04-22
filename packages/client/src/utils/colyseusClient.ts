import { Client, Room } from "colyseus.js";
// Import GameState schema if needed for type hints
// import { GameState } from "../../../server/src/schemas/GameState"; // Adjust path if needed

// --- Global Colyseus Room Variable ---
export let colyseusRoom: Room | null = null;
export let colyseusClient: Client | null = null;

// Function to connect to Colyseus
export async function connectColyseus(accessToken: string, username: string) {
  const url =
    location.host.includes("localhost") // Check if running locally
      ? `ws://localhost:3001`
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
    console.error("Failed to connect to Colyseus:", e);
    colyseusRoom = null;
    // Handle connection failure (e.g., show error message)
    alert(`Failed to connect to game server: ${e.message || e}`);
    // Rethrow or return false to indicate failure to the caller
    throw e; // Rethrow the error so the caller knows connection failed
  }
}