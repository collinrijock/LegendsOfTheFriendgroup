Client-side SDK
Getting Started
Client-side Callbacks
Overview
Every client SDK provides the same set of methods and events to interact with the server.

Client - The SDK entrypoint
Room - Room connection.
HTTP Requests - Utility to perform HTTP requests.
Auth (Optional) - Authentication module.
Client
The Client instance is the entrypoint to connect to the server. It is used to create or join rooms, and perform HTTP requests.

client.ts
import { Client } from "colyseus.js";
// ...
 
let client = new Client("ws://localhost:2567");
Methods
Join or Create a Room
Join an existing room or create a new one, by provided roomName and options.

Signature
client.joinOrCreate (roomName: string, options: any)
client.ts
try {
  const room = await client.joinOrCreate("battle", {/* options */});
  console.log("joined successfully", room);
 
} catch (e) {
  console.error("join error", e);
}
Locked or private rooms are ignored by this method.

Create a Room
Creates a new room by provided roomName and options.

Signature
client.create (roomName: string, options: any)
client.ts
try {
  const room = await client.create("battle", {/* options */});
  console.log("joined successfully", room);
 
} catch (e) {
  console.error("join error", e);
}
Join existing Room
Joins an existing room by provided roomName and options.

Signature
client.join (roomName: string, options: any)
client.ts
try {
  const room = await client.join("battle", {/* options */});
  console.log("joined successfully", room);
 
} catch (e) {
  console.error("join error", e);
}
Locked or private rooms are ignored by this method.

Join Room by ID
Joins an existing room by its roomId. Private rooms can be joined by id.

Signature
client.joinById (roomId: string, options: any)
client.ts
try {
  const room = await client.joinById("KRYAKzRo2", {/* options */});
  console.log("joined successfully", room);
 
} catch (e) {
  console.error("join error", e);
}
Reconnect into a Room
Reconnects the client back into a previously connected room.

You must store/cache the room.reconnectionToken from an active room connection to be able to reconnect.
To enable the reconnection of a particular client, the server needs to call .allowReconnection() for that client instance.
Signature
client.reconnect (reconnectionToken)
client.ts
try {
  const room = await client.reconnect(cachedReconnectionToken);
  console.log("joined successfully", room);
 
} catch (e) {
  console.error("join error", e);
}
Consume Seat Reservation
Join a room by manually consuming a “seat reservation”.

Signature
client.consumeSeatReservation (reservation)
client.ts
try {
  const room = await client.consumeSeatReservation(reservation);
  console.log("joined successfully", room);
 
} catch (e) {
  console.error("join error", e);
}
Advanced usage - See Match-maker API to learn how to manually reserve a seat for a client within a room.

Room
Properties
state: any
The current room’s state. This variable is always synched with the latest state from the server. To listen for updates on the whole state, see onStateChange event.

For fine-grained control over state updates, see State Synchronization → Client-side Callbacks.

sessionId: string
Unique identifier for the current connected client. This property matches the client.sessionId from the server.

id: string
The unique idenfitier of the room. You can share this id with other clients in order to allow them to connect directly to this room.

client.js
// get `roomId` from the query string
let roomId = location.href.match(/roomId=([a-zA-Z0-9\-_]+)/)[1];
 
// joining a room by its id
client.joinById(roomId).then(room => {
  // ...
});
name: string
Name of the room handler. Ex: "battle".

Methods
Send Message
Send a type of message to the room handler. Messages are encoded with MsgPack and can hold any JSON-serializable data structure.

Signature
room.send (type, message)
client.ts
//
// sending message with string type
//
room.send("move", { direction: "left"});
 
//
// sending message with number type
//
room.send(0, { direction: "left"});
Use Room#onMessage() from the server-side to receive the messages - Check out Room API → onMessage section.

Send Message (in bytes)
Send a raw byte array as a message to the server. A byte array is an array of numbers from 0 to 255.

This is useful if you’d like to manually encode a message, rather than the default encoding (MsgPack).

Signature
client.sendBytes (type, bytes)
client.js
//
// sending message with number type
//
room.sendBytes(0, [ 172, 72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33 ]);
 
 
//
// sending message with string type
//
room.sendBytes("some-bytes", [ 172, 72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33 ]);
Leave Room
Disconnect client from the room.

Signature
room.leave (consented: boolean)
Parameters

consented: Whether the act of leaving has been “consented” or not (Default is true)
client.ts
// consented leave
room.leave();
 
// force unconsented leave
room.leave(false);
Use Room API → onLeave to handle the disconnection from the server-side.

Remove All Listeners
Removes onMessage, onStateChange, onLeave and onError listeners.

Signature
room.removeAllListeners()
Events
On Message
This event is triggered when the server sends a message directly to the client, or via broadcast.

client.ts
room.onMessage("powerup", (message) => {
  console.log("message received from server");
  console.log(message);
});
To send a message from the server directly to the clients you’ll need to use either client.send() or room.broadcast()

On Leave
This event is triggered when the client leave the room.

client.ts
room.onLeave((code) => {
  console.log("client left the room");
});
Possible closing codes and their meaning:

1000 - Regular socket shutdown
Between 1001 and 1015 - Abnormal socket shutdown
Between 4000 and 4999 - Custom socket close code (See more details)
On State Change
This event is triggered whenever the server’s state is synchronized with the client. It occurs both when the client first connects to the room and when state updates are sent by the server

For fine-grained control over state updates, you should use the schema callbacks.

Check out the State Synchronization » Client-side Callbacks section for more details.

client.ts
room.onStateChange.once((state) => {
  console.log("this is the first room state!", state);
});
 
room.onStateChange((state) => {
  console.log("the room state has been updated:", state);
});
On Error
This event is triggered when some error occurs in the room handler.

client.ts
room.onError((code, message) => {
  console.log("oops, error ocurred:");
  console.log(message);
});
HTTP Requests
The client.http utility can perform HTTP requests to your server endpoint.

The client.auth.token property is sent automatically as Authorization header in all HTTP requests. See Authentication → HTTP Middleware for more details.

GET
Perform a GET request to the server.

client.js
client.http.get("/profile").then((response) => {
    console.log(response.data);
});
POST
Perform a POST request to the server.

client.js
client.http.post("/profile", { name: "Jake Badlands" }).then((response) => {
    console.log(response.data);
});
DELETE
Perform a DELETE request to the server.

client.js
client.http.delete("/profile").then((response) => {
    console.log(response.data);
});
PUT
Perform a PUT request to the server.

client.js
client.http.put("/profile", { name: "Jake Badlands" }).then((response) => {
    console.log(response.data);
});