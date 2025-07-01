import { RawData, WebSocketServer, WebSocket, Server } from "ws";
import { ClientUUID, LobbyMessage, LobbyRequest, RoomCode } from "./lobby.schema";
import { AddNewGame, gameWebSocketServers, NewID } from "./game";
import { Lobby } from "./lobby";
import { GameID, TournamentMessage } from "./tournament.schema";

type Pair<T> = {
	first: T,
	second: T,
}

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
	game_ids: Array<GameID>;
	round_number: number;

	constructor(lobby: Lobby) {
		this.round_number = 0;
		this.game_ids = [];
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
		
		this.startNextRound();
	} //end contructor

	startNextRound = () => {
		++this.round_number;
		const pairs = this.matchmakeClients();
		for (let { first: p1, second: p2 } of pairs) {
			console.log(`making game: ${p1.uuid} vs. ${p2.uuid}`);
			const game_id = NewID(8);
			this.game_ids.push(game_id);
			AddNewGame(game_id, (winner: "player1" | "player2", p1Score: number, p2Score: number) => {
				console.log("game finished!!!");
				this.sendToAll({ 
					type: "game_finished",
					msg: {
						p1: {
							uuid: p1.uuid, // TODO: figure this out
							points: p1Score,
						},
						p2: {
							uuid: p2.uuid,
							points: p2Score,
						},
					}
				});
				this.sendTo(p1, { type: "go_to_bracket", msg: { bracket_id: this.room_code } });
				this.sendTo(p2, { type: "go_to_bracket", msg: { bracket_id: this.room_code } });

				this.game_ids = this.game_ids.filter(id => id !== game_id);
				gameWebSocketServers.get(game_id)?.kill(); // TODO: need a better way to disconnect players on game end i thnkkkk
				if (this.game_ids.length === 0) {
					this.startNextRound();
				}
			});

			if (p1 && p2) {
				this.sendTo(p1, { type: "go_to_game", msg: { game_id: game_id } });
				this.sendTo(p2, { type: "go_to_game", msg: { game_id: game_id } });
			}
		}
	}

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
			this.sendTo(client, message);
		});
	}

	sendTo = (client: TournamentWebSocket, message: TournamentMessage) => {
		client.send(JSON.stringify(message), { binary: false });
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

	matchmakeClients = (): Array<Pair<TournamentWebSocket>> => {
		var pairs: Array<Pair<TournamentWebSocket>> = [];
		
		var i = 0;
		var prev: TournamentWebSocket;
		this.wss.clients.forEach((client) => {
			if (i % 2 == 1) {
				pairs.push({
					first: prev,
					second: client,
				});
			} else {
				prev = client;
			}
			++i;
		})
		return pairs;
	}
}