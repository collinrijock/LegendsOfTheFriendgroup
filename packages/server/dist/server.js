"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const monitor_1 = require("@colyseus/monitor");
const colyseus_1 = require("colyseus");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_transport_1 = require("@colyseus/ws-transport");
const path_1 = __importDefault(require("path"));
const GameRoom_1 = require("./rooms/GameRoom");
dotenv_1.default.config({ path: "../../.env" });
const app = (0, express_1.default)();
const router = express_1.default.Router();
const port = Number(process.env.PORT) || 4001;
// Add this logging middleware
app.use((req, res, next) => {
    console.log(`[BACKEND SERVER INCOMING]: ${req.method} ${req.originalUrl}`);
    next();
});
const server = new colyseus_1.Server({
    transport: new ws_transport_1.WebSocketTransport({
        server: (0, http_1.createServer)(app),
    }),
});
// Game Rooms
server
    .define("game", GameRoom_1.GameRoom) // Define room without /api prefix
    // filterBy allows us to call joinOrCreate and then hold one game per channel
    // https://discuss.colyseus.io/topic/345/is-it-possible-to-run-joinorcreatebyid/3
    .filterBy(["channelId"]);
app.use(express_1.default.json());
// Mount the main API router under /api
app.use('/api', router);
if (process.env.NODE_ENV === "production") {
    const clientBuildPath = path_1.default.join(__dirname, "../../client/dist");
    app.use(express_1.default.static(clientBuildPath));
}
// If you don't want people accessing your server stats, comment this line.
// This is now relative to the '/api' mount point of the router.
router.use("/colyseus", (0, monitor_1.monitor)(server));
// Fetch token from developer portal and return to the embedded app
// Path is now /token, relative to the /api mount point of `router`
router.post("/token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let b = new URLSearchParams({
        client_id: process.env.VITE_CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.body.code,
    });
    const response = yield fetch(`https://discord.com/api/oauth2/token`, {
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
    const { access_token } = (yield response.json());
    res.send({ access_token });
}));
// The router is already mounted at /api. No need for app.use("/", router);
// server.listen should be called on the Colyseus Server instance directly.
server.listen(port).then(() => {
    console.log(`App is listening on port ${port} !`);
});
