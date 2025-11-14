type WebScoketEvent = "open" | "message" | "error" | "close";

export type WebSocketClient = {
	on(event: WebScoketEvent, callback: (event: Event) => void): void;
	send(data: string): void;
};
