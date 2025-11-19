type WebScoketEvent = "open" | "message" | "error" | "close";

export interface WebSocketClient {
	on(event: WebScoketEvent, callback: (event: Event) => void): void;
	send(data: string): void;
}
