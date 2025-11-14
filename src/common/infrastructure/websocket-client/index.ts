import type { WebSocketClient } from "@/common/application/websocket-client/index.js";

type Options = {
	keepAliveIntervalMiliseconds: number;
};

const defaultOptions = {
	keepAliveIntervalMiliseconds: 1000 * 60 * 2,
};

export class DefaultWebScoketClient implements WebSocketClient {
	private socket: WebSocket;

	private keepAliveIntervalId: NodeJS.Timeout | undefined;
	private keepAliveIntervalMiliseconds: number;
	private keepAlivePingCounter: number = 0;

	constructor(url: string | URL, options: Options = defaultOptions) {
		this.socket = new WebSocket(url);
		this.keepAliveIntervalMiliseconds = options.keepAliveIntervalMiliseconds;

		if (this.keepAliveIntervalMiliseconds) {
			this.keepAlive(this.keepAliveIntervalMiliseconds);
		}
	}

	private keepAlive(keepAliveIntervalMiliseconds: number) {
		this.on("open", () => {
			this.keepAliveIntervalId = setInterval(() => {
				this.keepAlivePingCounter++;
				this.socket.send("ping");
			}, keepAliveIntervalMiliseconds);
		});

		this.on("close", () => clearInterval(this.keepAliveIntervalId));
	}

	get aliveTime() {
		const aproxTimeMiliseconds = this.keepAlivePingCounter * this.keepAliveIntervalMiliseconds;
		const aproxTimeSeconds = aproxTimeMiliseconds / 1000;
		console.log(`Connection is alive for about: $${aproxTimeSeconds} s.`);
		return aproxTimeSeconds;
	}

	on(event: "open", callback: (event: Event) => void): void;
	on(event: "message", callback: (event: MessageEvent) => void): void;
	on(event: "error", callback: (event: Event) => void): void;
	on(event: "close", callback: (event: CloseEvent) => void): void;
	// biome-ignore lint/suspicious/noExplicitAny: overloads
	on(event: string, callback: (event: any) => void) {
		this.socket.addEventListener(event, callback);
	}

	send(data: string): void {
		this.socket.send(data);
	}
}
