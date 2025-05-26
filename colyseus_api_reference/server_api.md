Server
The Colyseus Server instance holds the server configuration options, such as transport options, presence, matchmaking driver, etc.

Transport is the layer for bidirectional communication between server and client.
Presence is the implementation that enables communication between rooms and/or Node.js processes.
Driver is the storage driver used for storing and querying rooms during matchmaking.
Overview
The recommended structure to initialize a new Colyseus server is created using npm create colyseus-app@latest command.

It includes a basic structure with Express and an empty room handler, ready to be customized.

Terminal
npm create colyseus-app@latest ./my-server
You may add your own Room Definitions, and API routes to your server:

app.config.ts

import config from "@colyseus/tools";
import { MyRoom } from "./rooms/MyRoom";
 
export default config({
    options: {
        // transport: new uWebSocketsTransport(),
        // driver: new RedisDriver(),
        // presence: new RedisPresence(),
    },
    initializeGameServer: (gameServer) => {
        // Define your room handlers:
        gameServer.define('my_room', MyRoom);
    },
    initializeExpress: (app) => {
        // Bind your express routes here:
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });
    }
});
Constructor
When using the recommended structure from the template project, the Server instance is created automatically. You may customize the server options by editing the app.config.ts file.

app.config.ts
import config from "@colyseus/tools";
 
export default config({
    options: {
        // Server options here
    },
    initializeGameServer: (gameServer) => {
        // Define your room handlers:
        // gameServer.define("my_room", MyRoom);
    },
});
Server options
Transport (transport)
The Transport Layer is responsible for the networked communication between the server and the client. Colyseus uses TCP/WebSockets for communication by default.

Each Transport has its own options you may customize.

The default transport is WebSocketTransport. See Transport → WebSocket Transport (ws) for more details.

app.config.ts
import config from "@colyseus/tools";
import { WebSocketTransport } from "@colyseus/ws-transport";
 
export default config({
    initializeTransport: (options) => {
        return new WebSocketTransport({
            ...options,
            pingInterval: 10000
        });
    },
});
See Transport for more details.

Driver (driver)
The match-making driver. Rooms are cached and queried against a Driver implementation. When scaling your Colyseus servers, you may need to provide a driver option that fits your needs.

See Driver for more details.

Presence (presence)
When scaling Colyseus through multiple processes / machines, you need to provide a presence server. Read more about Scalability, and the Presence API.

import { Server, RedisPresence } from "colyseus";
 
const gameServer = new Server({
    // ...
    presence: new RedisPresence()
});
Select Process ID to Create Room
The selectProcessIdToCreateRoom is a callback that allows you to customize which processs the new rooms should be created at, when your deployment uses multiple Colyseus processes.

By default, the process with the least amount of rooms is selected to create a new room.

app.config.ts
import config from "@colyseus/tools";
 
export default config({
    options: {
        selectProcessIdToCreateRoom: async function (roomName: string, clientOptions: any) {
            return (await matchMaker.stats.fetchAll())
                .sort((p1, p2) => p1.roomCount > p2.roomCount ? 1 : -1)[0]
                .processId;
        }
    },
});
A common alternative is to use the process with least amount of connections:

app.config.ts
import config from "@colyseus/tools";
 
export default config({
    options: {
        selectProcessIdToCreateRoom: async function (roomName: string, clientOptions: any) {
            return (await matchMaker.stats.fetchAll())
                .sort((p1, p2) => p1.ccu > p2.ccu ? 1 : -1)[0]
                .processId;
        }
    },
});
Development Mode
When devMode is enabled, it is capable of restoring previous Rooms and Room State when the server restarts due to a code change, when iteratively updating your room code in a local environment.

Default is false.

app.config.ts
import config from "@colyseus/tools";
 
export default config({
    options: {
        devMode: true
    },
});
See Development Mode.

Gracefully Shutdown (gracefullyShutdown)
Wether to register shutdown routine automatically. Default is true.

If disabled, you should call gracefullyShutdown() method manually in your shutdown process.

app.config.ts
import config from "@colyseus/tools";
 
export default config({
    options: {
        gracefullyShutdown: false
    },
});
See Graceful Shutdown.

options.server
This option should be provided for the Transport instead - See WebSocket Transport Options

The HTTP server to bind the WebSocket Server into. You may use express for your server too.

server.ts
// Colyseus + Express
import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
 
const app = express();
app.use(express.json());
 
const gameServer = new Server({
  server: createServer(app)
});
 
gameServer.listen(2567);
Methods
Define Room Type
Define a new type of room for the match-maker.

Rooms are not created during .define()
Rooms are created upon client request (See client-side methods)
Signature
gameServer.define (roomName: string, room: typeof Room, defaultOptions?: any)
Parameters:

roomName - The public name of the room. You’ll use this name when joining the room from the client-side
room - The Room class
defaultOptions - (optional) Default options to provide for room creation and onAuth/onJoin methods
// Define "chat" room
gameServer.define("chat", ChatRoom);
 
// Define "battle" room
gameServer.define("battle", BattleRoom);
 
// Define "battle" room with custom options
gameServer.define("battle_woods", BattleRoom, { map: "woods" });
You may define the same room handler multiple times with different options. When Room#onCreate() is called, the options will contain the merged values you specified on Server#define() with the options provided by the client SDK.

Definition Options
Filter By (.filterBy())
Whenever a room is created by the create() or joinOrCreate() methods, only the options defined by the filterBy() method are going to be stored internally, and used to filter out rooms in further join() or joinOrCreate() calls.

Signature
gameServer
    .define(roomName, RoomClass)
    .filterBy(options);
Parameters

options: string[] - a list of option names
Examples

Filter match-making by mode option.

server.ts
gameServer
    .define("battle", BattleRoom)
    .filterBy(['mode']);
Whenever the room is created, the mode option is going to be stored internally.

client.js
client.joinOrCreate("battle", { mode: "duo" }).then(room => {/* ... */});
You can handle the provided option in the onCreate() and/or onJoin() to implement the requested feature inside your room implementation.

BattleRoom.ts
class BattleRoom extends Room {
    onCreate(options) {
        if (options.mode === "duo") {
            // do something!
        }
    }
    onJoin(client, options) {
        if (options.mode === "duo") {
            // put this player into a team!
        }
    }
}
Sort By (.sortBy())
You can also give a different priority for joining rooms depending on their information upon creation.

Signature
gameServer
    .define(roomName, RoomClass)
    .sortBy(options);
The options parameter is a key-value object containing the field name in the left, and the sorting direction in the right. Sorting direction can be one of these values: -1, "desc", "descending", 1, "asc" or "ascending".

Example

The clients is an internal variable stored for matchmaking, which contains the current number of connected clients. On the example below, the rooms with the highest amount of clients connected will have priority. Use -1, "desc" or "descending" for descending order:

gameServer
    .define("battle", BattleRoom)
    .sortBy({ clients: -1 });
To sort by the fewest amount of players, you can do the opposite. Use 1, "asc" or "ascending" for ascending order:

gameServer
    .define("battle", BattleRoom)
    .sortBy({ clients: 1 });
Realtime Listing for Lobby
To allow the LobbyRoom to receive updates from a specific room type, you should define them with realtime listing enabled:

gameServer
  .define("battle", BattleRoom)
  .enableRealtimeListing();
See Built-in Rooms → LobbyRoom for more details.

Lifecycle Events
You can listen for matchmaking events from outside the room instance scope, such as:

"create" - when a room has been created
"dispose" - when a room has been disposed
"join" - when a client join a room
"leave" - when a client leave a room
"lock" - when a room has been locked
"unlock" - when a room has been unlocked
Usage:

gameServer
  .define("chat", ChatRoom)
  .on("create", (room) => console.log("room created:", room.roomId))
  .on("dispose", (room) => console.log("room disposed:", room.roomId))
  .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
  .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
Use these events for logging and monitoring purposes only. It is not encouraged to manipulate a room’s state through these events. Use the Room’s Lifecycle Events in your room handler instead.

Remove Room Type
Revert a .define() call. Makes a roomName unavailable for matchmaking. This method is usually not recommended but it may be useful in some scenarios.

gameServer.removeRoomType("battle");
Simulate Latency
Colyseus allows you to simulate latency between the server and the client. This is a convenience method for simulating clients with high latency during development.

server.ts
// Make sure to never call the `simulateLatency()` method in production.
if (process.env.NODE_ENV !== "production") {
 
  // simulate 200ms latency between server and client.
  gameServer.simulateLatency(200);
}
Make sure to never enable this feature in production environments.

Listen
Binds the Transport layer into the specified port.

src/index.ts
import { listen } from "@colyseus/tools";
import app from "./app.config";
listen(app, 2567);
On Before Shutdown
Register a custom callback that is called before the Graceful Shutdown routine starts.

server.ts
gameServer.onBeforeShutdown(async () => {
    // ... custom logic
});
See Graceful Shutdown.

On Shutdown
Register a custom callback that is called after the graceful shutdown is fully complete.

gameServer.onShutdown(async () => {
    // ... custom logic
});
See Graceful Shutdown.

Gracefully Shutdown
Triggers the Graceful Shutdown routine.

app.config.ts
gameServer.gracefullyShutdown();
This method is called automatically when the process received SIGINT or SIGTERM signal.

If gracefullyShutdown: false has been provided on Server constructor, you should call this method manually.