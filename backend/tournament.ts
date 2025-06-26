import { RawData, WebSocketServer, WebSocket, Server } from "ws";
import { ClientUUID, LobbyMessage, LobbyRequest, RoomCode } from "./lobby.schema";
import { NewID } from "./game";
import { Lobby } from "./lobby";
import { TournamentMessage } from "./tournament.schema";

export const tournamentWebSocketServers = new Map<RoomCode, Tournament>;
export type TournamentSocketState = "inLobby";

export class TournamentWebSocket extends WebSocket {
	state: TournamentSocketState = "inLobby";
	isAlive: boolean = true;
	uuid: ClientUUID;
	wins: number = 0;
}

export class Tournament {
	room_code: RoomCode;
	wss: Server<typeof TournamentWebSocket>; // can't use ServerWebSocket here or ts will forget that we have LobbyWebSocket's and not regular WebSockets 
	timeout: NodeJS.Timeout | undefined;
	host: TournamentWebSocket | undefined;

	constructor(lobby: Lobby) {
		this.host = lobby.host;
		this.wss = lobby.wss;
		// TODO: do not accept any more connections (temporary thing)
		this.wss.on("connection", (ws: TournamentWebSocket) => {
			ws.close();
		});
		// TODO: make tournament code or something
		this.room_code = lobby.room_code;
		this.timeout = lobby.timeout;
		this.wss.clients.forEach(client => {
			client.on("message", (data, isBinary) => { this.wsOnMessage(client, data, isBinary) });
            client.on("close", (code, reason) => { this.wsOnClose(client, code, reason) });
            client.on("pong", () => {
				// client responded to ping message, keep the connection alive
                client.isAlive = true;
            });
		});
		this.sendToAll({ type: "tournament_starting", msg: { room_code: this.room_code } });
		tournamentWebSocketServers.set(this.room_code, this);
	} //end contructor

	wsOnMessage = (ws: TournamentWebSocket, data: RawData, isBinary: boolean) => {
		console.log(`msg from client in tournament: (${isBinary}, ${data})`);
		// const request: LobbyRequest = JSON.parse(data.toString());
		// switch (request.type) {
		// 	case "infoRequest":
		// 		break;
		// 	case "startRequest":
		// 		console.log(`lobby (${this.room_code}) start request receieved`);
		// 		break;
		// 	default:
		// 		console.warn("unknown lobby request from client");
		// }
	}

	wsOnClose = (ws: TournamentWebSocket, code: number, reason: Buffer<ArrayBufferLike>) => {
		// if there are no sockets connected just kill this game
		if (this.wss.clients.size === 0)
		{
			console.log(`Tournament (${this.room_code}) empty, remove in 5 minutes`);
			this.timeout = setTimeout(() =>
			{
				tournamentWebSocketServers.delete(this.room_code);
				console.log(`Tournament deleted (${this.room_code})`);
			}, 300000)
		}
	}

	sendToAll = (message: TournamentMessage) => {
		this.wss.clients.forEach((client) => {
			client.send(JSON.stringify(message), { binary: false });
		});
	}

	setPingInterval = (interval: number) => {
		const thing = setInterval(() => {
            this.wss.clients.forEach(ws => {
                if (ws.isAlive === false)
                {
                    console.debug("client failed to ping (game)");
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, interval);
	}
}