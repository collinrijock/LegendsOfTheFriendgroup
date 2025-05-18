import { MonitorOptions, monitor } from "@colyseus/monitor";
import { Server } from "colyseus";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import { WebSocketTransport } from "@colyseus/ws-transport";
import path from "path";

import { GameRoom } from "./rooms/GameRoom";

dotenv.config({ path: "../../.env" });

const app: Application = express();
const router = express.Router();
const port: number = Number(process.env.PORT) || 4001;

// Add this logging middleware
app.use((req, res, next) => {
  console.log(`[BACKEND SERVER INCOMING]: ${req.method} ${req.originalUrl}`);
  next();
});

const server = new Server({
  transport: new WebSocketTransport({
    server: createServer(app),
  }),
});

// Game Rooms
server
  .define("game", GameRoom) // Define room without /api prefix
  // filterBy allows us to call joinOrCreate and then hold one game per channel
  // https://discuss.colyseus.io/topic/345/is-it-possible-to-run-joinorcreatebyid/3
  .filterBy(["channelId"]);

app.use(express.json());
// Mount the main API router under /api
app.use('/api', router);

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientBuildPath));
}

// If you don't want people accessing your server stats, comment this line.
// This is now relative to the '/api' mount point of the router.
router.use("/colyseus", monitor(server as Partial<MonitorOptions>));

// Fetch token from developer portal and return to the embedded app
// Path is now /token, relative to the /api mount point of `router`
router.post("/token", async (req: Request, res: Response) => {
  let b = new URLSearchParams({
    client_id: process.env.VITE_CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code: req.body.code,
  });

  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  const { access_token } = (await response.json()) as {
    access_token: string;
  };

  res.send({ access_token });
});

// The router is already mounted at /api. No need for app.use("/", router);
// server.listen should be called on the Colyseus Server instance directly.

server.listen(port).then(() => {
  console.log(`App is listening on port ${port} !`);
});