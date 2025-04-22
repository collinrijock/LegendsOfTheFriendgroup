import { CommandResponse, DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";
// Import the connect function from the new colyseusClient.ts file
import { connectColyseus } from "./colyseusClient"; // Updated import

type Auth = CommandResponse<"authenticate"> | null;
let auth: Auth;

const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get("frame_id") != null;

let discordSdk: DiscordSDK | DiscordSDKMock;

// --- Define Mock IDs using helper function ---
// These need to be defined *before* initiateDiscordSDK uses them.
const mockUserId = getOverrideOrRandomSessionValue("user_id");
const mockGuildId = getOverrideOrRandomSessionValue("guild_id");
const mockChannelId = getOverrideOrRandomSessionValue("channel_id");
// --- End Define Mock IDs ---

const initiateDiscordSDK = async () => {
  // ... existing SDK initiation logic ...
  if (isEmbedded) {
    const discordClientID = import.meta.env.VITE_CLIENT_ID;
    console.log("Discord SDK: Using embedded client ID:", discordClientID);
    discordSdk = new DiscordSDK(discordClientID);
    await discordSdk.ready();
  } else {
    // ... existing mock SDK logic ...

    discordSdk = new DiscordSDKMock(import.meta.env.VITE_CLIENT_ID, mockGuildId, mockChannelId);
    const discriminator = String(mockUserId.charCodeAt(0) % 5);

    // Mock authenticate needs to return the same structure as the real one
    const mockAuthData: Auth = {
        access_token: "mock_token",
        user: {
            username: mockUserId,
            discriminator,
            id: mockUserId,
            avatar: null,
            public_flags: 1,
        },
        scopes: [],
        expires: new Date(2112, 1, 1).toString(),
        application: {
            description: "mock_app_description",
            icon: "mock_app_icon",
            id: "mock_app_id",
            name: "mock_app_name",
        },
    };

    discordSdk._updateCommandMocks({
      authenticate: async () => {
        // Simulate auth success and store mock data
        auth = mockAuthData;
        console.log("Mock Authentication successful:", auth);
        // Connect to Colyseus after mock authentication
        await connectColyseus(auth.access_token, auth.user.username);
        return mockAuthData; // Return the auth data
      },
      // Add mock for authorize if needed for local testing flow
      authorize: async () => {
          console.log("Mock Authorize called");
          // Simulate returning a code, although it's not used directly in mock connect
          return { code: "mock_code" };
      }
    });
  }
};

// Pop open the OAuth permission modal and request for access to scopes listed in scope array below
const authorizeDiscordUser = async () => {
  // If running locally (not embedded), simulate authentication directly
  if (!isEmbedded) {
      console.log("Running locally, attempting mock authentication...");
      try {
          // Trigger the mock authenticate command
          await discordSdk.commands.authenticate();
          // Connection happens inside the mock authenticate handler now
          return true; // Indicate success
      } catch (error) {
          console.error("Mock authentication failed:", error);
          return false; // Indicate failure
      }
  }

  // --- Embedded Flow ---
  try {
      console.log("Requesting Discord authorization...");
      const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_CLIENT_ID,
        response_type: "code",
        state: "",
        prompt: "none",
        // Ensure necessary scopes are requested
        scope: ["identify", "guilds", /* add other scopes if needed */],
      });
      console.log("Authorization code received:", code);

      // Retrieve an access_token from your application's server
      console.log("Fetching access token...");
      const response = await fetch("/.proxy/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });

      if (!response.ok) {
          throw new Error(`Token fetch failed: ${response.statusText}`);
      }

      const { access_token } = await response.json();
      console.log("Access token received.");

      // Authenticate with Discord client (using the access_token)
      console.log("Authenticating with Discord SDK...");
      auth = await discordSdk.commands.authenticate({
        access_token,
      });
      console.log("Discord SDK Authentication successful:", auth);

      // --- Connect to Colyseus AFTER successful Discord Auth ---
      await connectColyseus(auth.access_token, auth.user.username);
      return true; // Indicate success

  } catch (error) {
      console.error("Discord authorization or Colyseus connection failed:", error);
      // Handle error appropriately, maybe show a message to the user
      return false; // Indicate failure
  }
};

const getUserName = () => {
  // ... existing getUserName logic ...
  if (!auth) {
    // Attempt to get username from mock SDK if not embedded and auth failed/not run
    if (!isEmbedded && discordSdk instanceof DiscordSDKMock) {
        // This relies on the mock user_id being set correctly
        const mockUserId = getOverrideOrRandomSessionValue("user_id");
        return mockUserId || "MockUser";
    }
    return "User";
  }
  return auth.user.username;
};

// ... existing SessionStorageQueryParam and getOverrideOrRandomSessionValue ...
enum SessionStorageQueryParam {
  user_id = "user_id",
  guild_id = "guild_id",
  channel_id = "channel_id",
}

function getOverrideOrRandomSessionValue(queryParam: `${SessionStorageQueryParam}`) {
  const overrideValue = queryParams.get(queryParam);
  if (overrideValue != null) {
    return overrideValue;
  }

  const currentStoredValue = sessionStorage.getItem(queryParam);
  if (currentStoredValue != null) {
    return currentStoredValue;
  }

  // Set queryParam to a random 8-character string
  const randomString = Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(queryParam, randomString);
  return randomString;
}


export { discordSdk, initiateDiscordSDK, authorizeDiscordUser, getUserName };