import "dotenv/config";
import { DefaultWebScoketClient } from "@/common/infrastructure/websocket-client/index.js";

// biome-ignore-start lint/style/noNonNullAssertion: .env is set
const TWITCH_WEBSOCKET_URL = process.env.TWITCH_WEBSOCKET_URL!;
const TWITCH_USER = process.env.TWITCH_USER!;
const TWITCH_TOKEN = process.env.TWITCH_TOKEN!;
// biome-ignore-end lint/style/noNonNullAssertion: .env is set
const TWITCH_CHANNEL = "jaskol95";

const socket = new DefaultWebScoketClient(TWITCH_WEBSOCKET_URL);

socket.on("open", () => {
	console.log("Connecting...");

	socket.send(`PASS oauth:${TWITCH_TOKEN}`);
	socket.send(`NICK ${TWITCH_USER}`);
	socket.send(`JOIN #${TWITCH_CHANNEL}`);

	console.log("Connected.");
});

socket.on("message", (event) => {
	console.log(event.data);
});

socket.on("error", (event) => {
	console.log("WebScoket error: ", event);
});

socket.on("close", (event) => {
	console.log("WebSocket close: ", event.reason);
});
