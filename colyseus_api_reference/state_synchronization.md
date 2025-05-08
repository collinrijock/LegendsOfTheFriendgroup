Guides
Schema Definition
Client-side Callbacks
State View
Best Practices
Overview
Colyseus uses a schema-based approach to define the state of a room. The server is responsible for mutating the state, and the client listens for state changes to keep the user interface in sync.

The room’s state is defined using the Schema class from @colyseus/schema. Only the server can directly mutate the state.
Clients send messages to the server to request state changes. Your room code processes these requests and updates the state.
Colyseus optimizes performance and bandwidth by tracking property-level changes. Only the latest mutation of each property is queued and sent to clients during the patchRate interval.
On the client side, you listen for state changes to keep the user interface in sync
Server-side: Define your state structures
Define your state structures by extending Schema class from @colyseus/schema:

src/rooms/MyState.ts
import { Schema, type } from "@colyseus/schema";
 
export class Player extends Schema {
    @type("string") name: string;
    @type("number") x: number;
    @type("number") y: number;
}
 
export class MyState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
}
Server-side: Assign and mutate the state
Setting up the state in your room class, and mutating it when clients join or leave the room:

src/rooms/MyRoom.ts
import { Room } from "colyseus";
import { MyState, Player } from "./MyState";
 
export class MyRoom extends Room<MyState> {
    state = new MyState();
 
    onJoin (client, options) {
        this.state.players.set(client.sessionId, new Player());
    }
    onLeave (client) {
        this.state.players.delete(client.sessionId);
    }
}
Client-side: Full state received on join
Clients receive the full state when they join the room. Whenever a mutation occurs in the server-side, the state is automatically synchronized with all clients in the room.

Below is an example of how to listen to player additions and removals on the client-side:

client.js

import { Client, getStateCallbacks } from 'colyseus.js';
 
// ...
const client = new Client('http://localhost:2567');
const room = await client.joinOrCreate('my_room', {/* */});
const $ = getStateCallbacks(room);
 
// Listen to 'player' instance additions
$(room.state).players.onAdd((player, sessionId) => {
    console.log('Player joined:', player);
});
 
// Listen to 'player' instance removals
$(room.state).players.onRemove((player, sessionId) => {
    console.log('Player left:', player);
});
Client-side: request the server to mutate the state
The client-side is not capable of mutating the state directly. Instead, it sends messages to the server to request state changes.

client.js
import { Client, getStateCallbacks } from 'colyseus.js';
 
// ...
room.send("set-position", { x: 16, y: 16 });
Server-side: listen to client messages
The server-side processes the client messages and mutates the state. Colyseus will take care of synchronizing the state with all clients in the room.

src/rooms/MyRoom.ts
// ...
export class MyRoom extends Room<MyState> {
    state = new MyState();
 
    onCreate() {
        this.onMessage("set-position", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            player.x = data.x;
            player.y = data.y;
        });
    }
    // ...
Client-side: Listen to state changes
The client listens to state changes at the direct instance to keep the user interface in sync.

client.js
import { Client, getStateCallbacks } from 'colyseus.js';
// ...
const client = new Client('http://localhost:2567');
const room = await client.joinOrCreate('my_room', {/* */});
const $ = getStateCallbacks(room);
 
// Listen to 'player' instance additions
$(room.state).players.onAdd((player, sessionId) => {
    // Listening for any change on the player instance
    $(player).onChange(() => {
        console.log('Player changed:', player.x, player.y);
    });
});
How does it work, internally?
Handshake: When a client joins a room, the server sends all the types that compose the room’s state to the client, following by the full state.
Enqueueing changes: When the server mutates the state, it holds which properties have changed since the last state synchronization, per Schema instance. Each Schema instance holds a ChangeTree object that tracks its changes.
Sending changes: The server encodes only the changed properties and sends them to the client during the patchRate interval.
refId: Each Schema instance has a unique refId that is used to identify the instance across the network. This is how Colyseus knows which instance has been added, removed, or updated.
Decoding changes: When the client receives the state changes, it decodes them and applies them to each Schema instance, based on the refId - triggering the onChange, listen and onAdd/onRemove callbacks on the client-side.
Troubleshooting
TypeScript Config
If you are using TypeScript, make sure to enable the experimentalDecorators and disable useDefineForClassFields in your tsconfig.json file.

tsconfig.json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "useDefineForClassFields": false
    }
}
