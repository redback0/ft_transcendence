import { LobbyInfoResponse, LobbyRequest, LobbyResponse } from "../../lobby.schema";

export class LobbyJoinArea {
	canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    ws: WebSocket;
    h: number;
    w: number;
    ratio: number; // ratio between canvas height and game height, used for correct rendering
    sidePadding: number;
	constructor(room_code: string, canvas: HTMLCanvasElement, h = 100, w = 200) {
        let temp = canvas.getContext("2d");
        if (temp) this.context = temp;
        else throw new Error("Failed to get context from canvas");
		this.ws = new WebSocket("/wss/lobby/" + room_code);
		let ws = this.ws;
		window.addEventListener("popstate", function disconnectGame(e) {
            ws.close();
            this.removeEventListener("popstate", disconnectGame);
        });
		this.ws.onopen = this.wsConnect;
		this.ws.onmessage = this.wsMessage;
		this.canvas = canvas;
        this.h = h;
        this.w = w;
        this.ratio = canvas.height / this.h;
        this.sidePadding = (canvas.width - (this.w * this.ratio)) / 2;
	}

    wsConnect = () => {
        console.log("Lobby WebSocket connected");
		let message: LobbyRequest = {
			type: "infoRequest",
		}
		this.ws.send(JSON.stringify(message));
    }

	wsMessage = (ev: MessageEvent) => {
		console.log("Recieved lobby message from server");	
		if (typeof ev.data !== "string")
        {
            throw new Error("Unknown data recieved on WebSocket");
        }
		
		const data: LobbyResponse = JSON.parse(ev.data);
		switch (data.type) {
			case "new_client":
				console.log(`new client ${data.msg} joined lobby !!!`);
				break;
			case "client_left":
				console.log(`client (${data.msg}) left !!!`);
				break;
			case "info":
				if (!data.msg || typeof data.msg === "string") {
					console.warn("bad info response from lobby");
					break;
				}
				const lobby_info: LobbyInfoResponse = data.msg;
				console.log(`whoami: ${data.msg?.whoami}, host: ${data.msg?.host}, clients: ${data.msg?.clients}`);
				break;
			default:
				console.warn("unrecognised message from lobby !!!");
		}
    }
}