import type { WebSocketClient } from "@/common/application/websocket-client";

export class DefaultWebScoketClient implements WebSocketClient {
	private socket: WebSocket;

	constructor(url: string | URL) {
		this.socket = new WebSocket(url);
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
