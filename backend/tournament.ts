import { RawData, WebSocketServer, WebSocket, Server } from "ws";
import { UserID, LobbySessionID } from "./lobby.schema";
import { AddNewGame, gameWebSocketServers, NewID } from "./game";
import { Lobby } from "./lobby";
import { GameID, SessionID, TournamentID, TournamentMessage, UserInfo, TournamentNextRoundStart } from './tournament.schema';
import { db } from "./database";

type Pair<T> = {
	first: T,
	second: T,
}

type GameRecord = {
	game_id: GameID,
	p1: {
		user_info: UserInfo,
		points: number,
	}
	p2: {
		user_info: UserInfo,
		points: number,
	}
}	

function compair<T>(pair1: Pair<T>, pair2: Pair<T>): boolean {
	return (
		(pair1.first === pair2.first && pair1.second === pair2.second)
		||	(pair1.first === pair2.second && pair1.second == pair2.first)
	);
}

export const tournamentWebSocketServers = new Map<TournamentID, Tournament>;

// sid must be valid if it is not undefined
export class TournamentWebSocket extends WebSocket {
	isAlive: boolean = true;
	been_byed: boolean = false;
	user_info: UserInfo | undefined;
	wins: number = 0;
}

// monrad system swiss style tournament
export class Tournament {
	id: TournamentID;
	players: UserInfo[];
	wss: Server<typeof TournamentWebSocket>; // can't use ServerWebSocket here or ts will forget that we have LobbyWebSocket's and not regular WebSockets 
	timeout: NodeJS.Timeout | undefined;
	host: TournamentWebSocket | undefined;
	byed_player: UserInfo | undefined;
	active_games: Array<{ game_id: GameID, p1: UserInfo, p2: UserInfo }>;
	finished_games: Array<GameRecord>;
	current_round: number;
	total_rounds_needed: number;	
	prev_pairings: Array<Pair<TournamentWebSocket>>;

	constructor(lobby: Lobby, tourney_id: TournamentID) {
		this.prev_pairings = [];
		this.current_round = 0;
		this.active_games = [];
		this.finished_games = [];
		this.host = lobby.host;
		this.wss = lobby.wss;
		this.players = [];
		this.wss.clients.forEach(client => this.players.push(<UserInfo>client.user_info));
		this.total_rounds_needed = Math.ceil(Math.log2(this.wss.clients.size));
		console.log(`total rounds needed: ${this.total_rounds_needed}`);
		
		this.wss.removeListener("connection", lobby.wssOnConnection);
		this.wss.on("connection", (ws: TournamentWebSocket) => {
			console.log(`tournament reconnect: ${ws.user_info?.username}`);
			this.sendTo(ws, { type: "you_are", msg: { you: <UserInfo>ws.user_info }})
			this.sendTo(ws, { type: "next_round_starting", msg: {}});
			if (this.byed_player)
				this.sendTo(ws, { type: "byed", msg: { player: this.byed_player } });
			this.active_games.forEach(game => {
				this.sendTo(ws, { type: "game_starting", msg: game })
				if (game.p1.user_id === ws.user_info?.user_id || game.p2.user_id === ws.user_info?.user_id) {
					this.sendTo(ws, { type: "go_to_game", msg: { game_id: game.game_id } });
				}
			});
			this.finished_games.forEach(game => {
				this.sendTo(ws, { type: "game_starting", msg: {
					game_id: game.game_id,
					p1: game.p1.user_info,
					p2: game.p2.user_info
				}});
				this.sendTo(ws, { 
					type: "game_finished",
					msg: game
				});
			});
		});

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
		
		try {
			db.prepare('BEGIN TRANSACTION').run();
			const statement = db.prepare(
				`INSERT INTO tournament (tour_id, number_of_players, round_number, tour_name)
				VALUES (?, ?, ?, ?)`
			);
			statement.run(this.id, this.wss.clients.size, this.current_round, "coolio");
			db.prepare("COMMIT").run();
		} catch (error) {
			db.prepare("ROLLBACK").run();
			console.error(`Fail to save tournament on creation, closing active tournament (id: ${this.id})`);
			tournamentWebSocketServers.delete(this.id);
			return;
		}
		
		this.startNextRound();
	} //end contructor

	startNextRound = () => {
		++this.current_round;
		console.log(`starting round ${this.current_round} !!!`);
		this.sendToAll({ type: "next_round_starting", msg: {} });
		this.finished_games = [];
		this.byed_player = undefined;
		const pairs = this.matchmakeClients();
		for (let { first: p1, second: p2 } of pairs) {
			const game_id = NewID(8);
			console.log(`making game (${game_id}): ${p1.user_info?.user_id} (${p1.wins}) vs. ${p2.user_info?.user_id} (${p2.wins})`);
			this.active_games.push({ game_id: game_id, p1: <UserInfo>p1.user_info, p2: <UserInfo>p2.user_info });
			this.prev_pairings.push({ first: p1, second: p2 });
			AddNewGame(game_id, (winner: "player1" | "player2" | undefined, p1Score: number, p2Score: number) => {
				console.log("game finished!!!");
				if (p1Score > p2Score) {
					console.log(`${p1.user_info?.user_id} won vs. ${p2.user_info?.user_id}!`);
					p1.wins++;
				} else {
					console.log(`${p2.user_info?.user_id} won vs. ${p1.user_info?.user_id}!`);
					p2.wins++;
				}
				let game_record: GameRecord = {
					p1: {
						user_info: <UserInfo>p1.user_info, // TODO: figure this out
						points: p1Score,
					},
					p2: {
						user_info: <UserInfo>p2.user_info,
						points: p2Score,
					},
					game_id: game_id,
				};
				this.sendToAll({ type: "game_finished", msg: game_record });
				this.sendTo(p1, { type: "go_to_bracket", msg: { tourney_id: this.id } });
				this.sendTo(p2, { type: "go_to_bracket", msg: { tourney_id: this.id } });

				this.active_games = this.active_games.filter(info => info.game_id !== game_id);
				this.finished_games.push(game_record);
				gameWebSocketServers.get(game_id)?.kill();
				if (this.active_games.length === 0 && this.current_round >= this.total_rounds_needed) {
					console.log(`tourney finished !!!`);
					const tmp: Array<TournamentWebSocket> = [];
					this.wss.clients.forEach(c => tmp.push(c));
					tmp.sort((a, b) => b.wins - a.wins);
					const rankings = tmp.map(client => {
						return { user_info: <UserInfo>client.user_info, score: client.wins };
					});
					for (let client of rankings) {
						console.log(`${client.user_info?.username} (${client.score})`);
					}
					this.sendToAll({ type: "tournament_finished", msg: { rankings: rankings } });
				} else if (this.active_games.length === 0) {
					this.startNextRound();
				}
			}, p1.user_info?.user_id, p2.user_info?.user_id); // end AddNewGame
			this.sendToAll({
				type: "game_starting",
				msg: {
					p1: <UserInfo>p1.user_info,
					p2: <UserInfo>p2.user_info,
					game_id: game_id,
				}
			});
			if (p1 && p2) {
				console.log(`sending clients to game: ${p1.user_info?.user_id}, ${p2.user_info?.user_id}`);
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
		console.log(`sending message to ${client.user_info?.username} !!! | ${JSON.stringify(message)}`);
		client.send(JSON.stringify(message), { binary: false });
	}

	setPingInterval = (interval: number) => {
		const thing = setInterval(() => {
            this.wss.clients.forEach(ws => {
                if (ws.isAlive === false)
                {
                    console.debug("client failed to ping (tournament)");
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
					console.log(`${client.user_info?.user_id} has been byed!`);
					this.byed_player = client.user_info;
					this.sendToAll({ type: "byed", msg: { player: <UserInfo>client.user_info } });
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
				console.log(`p1: ${p1.user_info?.user_id}, p2: ${p2.user_info?.user_id}`);
				let pair: Pair<TournamentWebSocket> = { first: p1, second: p2 };
				if (i != client_pool.length - 1 && this.prev_pairings.find(prev_pair => compair(prev_pair, pair)) !== undefined) {
					continue;
				}	
				pairs.push(pair);
				client_pool = client_pool.filter(sock => !(sock === p1 || sock === p2));
				console.log(`paired: ${pair.first.user_info?.user_id} vs. ${pair.second.user_info?.user_id}`);
				for (let client of client_pool) {
					console.log(`clients left: ${client.user_info?.user_id}`);
				}
				console.log("");
				i = 1;
				break;
			}
		}
		return (pairs);
	}
}