import { RawData, WebSocketServer, WebSocket, Server } from "ws";
import { ClientUUID } from "./lobby.schema";
import { AddNewGame, gameWebSocketServers, NewID } from "./game";
import { Lobby } from "./lobby";
import { GameID, TournamentID, TournamentMessage } from "./tournament.schema";

type Pair<T> = {
	first: T,
	second: T,
}

function compair<T>(pair1: Pair<T>, pair2: Pair<T>): boolean {
	return (
		(pair1.first === pair2.first && pair1.second === pair2.second)
		||	(pair1.first === pair2.second && pair1.second == pair2.first)
	);
}

export const tournamentWebSocketServers = new Map<TournamentID, Tournament>;

export class TournamentWebSocket extends WebSocket {
	isAlive: boolean = true;
	been_byed: boolean = false;
	uuid: ClientUUID;
	wins: number = 0;
}

// monrad system swiss style tournament
export class Tournament {
	id: TournamentID;
	wss: Server<typeof TournamentWebSocket>; // can't use ServerWebSocket here or ts will forget that we have LobbyWebSocket's and not regular WebSockets 
	timeout: NodeJS.Timeout | undefined;
	host: TournamentWebSocket | undefined;
	game_ids: Array<GameID>;
	current_round: number;
	total_rounds_needed: number;	
	prev_pairings: Array<Pair<TournamentWebSocket>>;

	constructor(lobby: Lobby, tourney_id: TournamentID) {
		this.prev_pairings = [];
		this.current_round = 0;
		this.game_ids = [];
		this.host = lobby.host;
		this.wss = lobby.wss;
		this.total_rounds_needed = Math.ceil(Math.log2(this.wss.clients.size));
		console.log(`total rounds needed: ${this.total_rounds_needed}`);
		// TODO: do not accept any more connections (temporary thing)
		this.wss.on("connection", (ws: TournamentWebSocket) => {
			console.log("refusing connection");
			ws.close();
		});
		// TODO: make tournament code or something
		this.id = tourney_id;
		this.timeout = lobby.timeout;
		this.wss.clients.forEach(client => {
			client.on("message", (data, isBinary) => { this.wsOnMessage(client, data, isBinary) });
            client.on("close", (code, reason) => { this.wsOnClose(client, code, reason) });
            client.on("pong", () => {
				// client responded to ping message, keep the connection alive
                client.isAlive = true;
            });
		});
		this.sendToAll({ type: "tournament_starting", msg: { room_code: this.id } });
		tournamentWebSocketServers.set(this.id, this);
		
		this.startNextRound();
	} //end contructor

	startNextRound = () => {
		++this.current_round;
		console.log(`starting round ${this.current_round} !!!`);
		this.sendToAll({ type: "next_round_starting", msg: {} });
		const pairs = this.matchmakeClients();
		for (let { first: p1, second: p2 } of pairs) {
			console.log(`making game: ${p1.uuid} (${p1.wins}) vs. ${p2.uuid} (${p2.wins})`);
			const game_id = NewID(8);
			this.game_ids.push(game_id);
			this.prev_pairings.push({ first: p1, second: p2 });
			AddNewGame(game_id, (winner: "player1" | "player2", p1Score: number, p2Score: number) => {
				console.log("game finished!!!");
				if (p1Score > p2Score) {
					console.log(`${p1.uuid} won vs. ${p2.uuid}!`);
					p1.wins++;
				} else {
					console.log(`${p2.uuid} won vs. ${p1.uuid}!`);
					p2.wins++;
				}
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
						game_id: game_id,
					}
				});
				this.sendTo(p1, { type: "go_to_bracket", msg: { tourney_id: this.id } });
				this.sendTo(p2, { type: "go_to_bracket", msg: { tourney_id: this.id } });

				this.game_ids = this.game_ids.filter(id => id !== game_id);
				gameWebSocketServers.get(game_id)?.kill(); // TODO: need a better way to disconnect players on game end i thnkkkk
				if (this.game_ids.length === 0 && this.current_round >= this.total_rounds_needed) {
					console.log(`tourney finished !!!`);
					var tmp: Array<TournamentWebSocket> = [];
					this.wss.clients.forEach(c => tmp.push(c));
					tmp.sort((a, b) => b.wins - a.wins);
					var rankings = tmp.map(client => {
						return { name: client.uuid, score: client.wins };
					});
					for (let client of rankings) {
						console.log(`${client.name} (${client.score})`);
					}
					this.sendToAll({ type: "tournament_finished", msg: { rankings: rankings } });
				} else {
					this.startNextRound();
				}
			}); // end AddNewGame
			this.sendToAll({
				type: "game_starting",
				msg: {
					p1: p1.uuid,
					p2: p2.uuid,
					game_id: game_id,
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
			console.log(`Tournament (${this.id}) empty, remove in 5 minutes`);
			this.timeout = setTimeout(() =>
			{
				tournamentWebSocketServers.delete(this.id);
				console.log(`Tournament deleted (${this.id})`);
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
		
		var client_pool = [];
		for (let client of this.wss.clients.values()) {
			client_pool.push(client);
		}
		client_pool.sort((a, b) => {
			return (b.wins - a.wins);
		});
		if (client_pool.length % 2 === 1) {
			for (var i = client_pool.length - 1; i >= 0; i--) {
				let client = client_pool[i];
				if (!client.been_byed) {
					console.log(`${client.uuid} has been byed!`);
					this.sendToAll({ type: "byed", msg: { player: client.uuid } });
					client.wins++;
					client.been_byed = true;
					client_pool.slice(i, i);
					break;
				}
			}
		}
		while (client_pool.length > 1) {
			for (let i = 1; i < client_pool.length; ++i) {
				const p1: TournamentWebSocket = client_pool[0];
				const p2: TournamentWebSocket = client_pool[i];
				console.log(`p1: ${p1.uuid}, p2: ${p2.uuid}`);
				let pair: Pair<TournamentWebSocket> = { first: p1, second: p2 };
				if (i != client_pool.length - 1 && this.prev_pairings.find(prev_pair => compair(prev_pair, pair)) !== undefined) {
					continue;
				}	
				pairs.push(pair);
				client_pool = client_pool.filter(sock => !(sock === p1 || sock === p2));
				console.log(`paired: ${pair.first.uuid} vs. ${pair.second.uuid}`);
				for (let client of client_pool) {
					console.log(`clients left: ${client.uuid}`);
				}
				console.log("");
				i = 1;
				break;
			}
		}
		return (pairs);
	}
}