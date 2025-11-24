import "dotenv/config";
import { DefaultWebScoketClient } from "@/common/infrastructure/websocket-client/index.js";
import { IrcParser } from "@/module/chat/application/irc-parser/index.js";
import { IrcSerializer } from "@/module/chat/application/irc-serializer/index.js";

// biome-ignore-start lint/style/noNonNullAssertion: .env is set
const TWITCH_WEBSOCKET_URL = process.env.TWITCH_WEBSOCKET_URL!;
const TWITCH_USER = process.env.TWITCH_USER!;
const TWITCH_TOKEN = process.env.TWITCH_TOKEN!;
// biome-ignore-end lint/style/noNonNullAssertion: .env is set
const TWITCH_CHANNEL = "jaskol95";

const socket = new DefaultWebScoketClient(TWITCH_WEBSOCKET_URL);
const parser = new IrcParser();
const serializer = new IrcSerializer();

socket.on("open", () => {
	console.log("Connecting...");

	socket.send(`PASS oauth:${TWITCH_TOKEN}`);
	socket.send(`NICK ${TWITCH_USER}`);
	socket.send(`JOIN #${TWITCH_CHANNEL}`);
	socket.send(`CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands`);

	console.log("Connected.");
});

socket.on("message", (event) => {
	const { data } = event;

	console.log(data);

	if (typeof data !== "string") {
		console.log("Data is not a string. Skipping.");
		return;
	}

	/**
	 * Sometimes data comes as message chunks:
	 *
	 * :tmi.twitch.tv 001 <user> :Welcome, GLHF!\r\n +
	 * :tmi.twitch.tv 002 <user> :Your host is tmi.twitch.tv\r\n +
	 * :tmi.twitch.tv 003 <user> :This server is rather new\r\n +
	 * :tmi.twitch.tv 004 <user> :-\r\n +
	 * :tmi.twitch.tv 375 <user> :-\r\n +
	 * :tmi.twitch.tv 372 <user> :You are in a maze of twisty passages, all alike.\r\n +
	 * :tmi.twitch.tv 376 <user> :>\r\n +
	 *
	 * So split it into separate messages.
	 */

	const messages = data.split("\r\n").filter((message) => !!message);

	messages.forEach((message) => {
		const messageResult = parser.parse(message);

		if (!messageResult.success) {
			console.log(messageResult.error);
			return;
		}

		const { data } = messageResult;

		console.log(messageResult.data.tags);
		console.log(messageResult.data.source);
		console.log(messageResult.data.command);
		console.log(messageResult.data.parameters);

		if (data.command === "PING") {
			console.log("\x1b[33m%s\x1b[0m", `\r\n RESPONDED WITH PONG ${data.parameters} \r\n`);

			const serializeResult = serializer.serialize({
				command: "PONG",
				parameters: data.parameters || [],
			});

			if (!serializeResult.success) {
				console.log(serializeResult.error);
				return;
			}

			socket.send(serializeResult.data);
		}
	});
});

socket.on("error", (event) => {
	console.log("WebScoket error: ", event);
});

socket.on("close", (event) => {
	console.log("WebSocket close: ", event.reason);
});
