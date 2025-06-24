
import { WebSocketServer, WebSocket } from "ws";
import { FastifyInstance, RegisterOptions } from "fastify";
import { NewID } from "./game"; // lol
import { LobbyResponse, LobbyInfoResponse, ClientUUID, LobbyRequest } from './lobby.schema';

export type RoomCode = string;
export const lobbyWebSocketServers = new Map<RoomCode, Lobby>;

export function makeNewLobby(room_code: RoomCode): void {
	lobbyWebSocketServers.set(room_code, new Lobby(room_code));
}

export function lobbyInit(fastify: FastifyInstance, opts: RegisterOptions, done: Function): void {
	fastify.get('/api/lobby/create', (request, reply) => {
		console.log("makin new lobby");
		let room_code = NewID(6);
		while (room_code in lobbyWebSocketServers.keys()) {
			room_code = NewID(6);
		}
		makeNewLobby(room_code);
		console.log(`room code: ${room_code}`);
		reply.send({ success: true, room_code: room_code });
	});
	done();
}

class LobbyWebSocket extends WebSocket {
	isAlive: boolean = true;
	uuid: ClientUUID;
}

// FIXME: if no one connects to lobby it will never get deleteed i thinkers
class Lobby {
	room_code: RoomCode;
	wss: WebSocketServer;
	timeout: NodeJS.Timeout | undefined;
	clients: LobbyWebSocket[];

	constructor(room_code: RoomCode) {
		this.clients = [];
		this.wss = new WebSocketServer({
            WebSocket: LobbyWebSocket,
            noServer: true,
        });

		this.room_code = room_code;

		const lobby = this;
		const wss = this.wss;

		this.wss.on("connection", function (ws: LobbyWebSocket) {
            console.log("new client in lobby !!1!!! yay");
			// TODO: get an actual UUID lmao
			ws.uuid = NewID(8);
			console.log(`client id: ${ws.uuid}`);
			lobby.clients.push(ws);
			console.log(ws.uuid);
			wss.clients.forEach((client) => {
				console.log(ws.uuid);
				client.send(JSON.stringify({ type: "new_client", msg: ws.uuid }), { binary: false });
			});
            if (lobby.timeout)
            {
                clearTimeout(lobby.timeout);
                lobby.timeout = undefined;
            }

            ws.on("message", function onMessage(data, isBinary) {
				console.log(`msg from client in lobby: (${isBinary}, ${data})`);
				const request: LobbyRequest = JSON.parse(data.toString());
				switch (request.type) {
					case "infoRequest":
						lobby.wsInfoMessage(ws);
						break;
					default:
						console.warn("unknown lobby request from client");
				}
            });

            ws.on("close", function (code, reason)
            {
				let idx = 0;
				while (idx < lobby.clients.length) {
					if (lobby.clients[idx] === this) {
						lobby.clients.splice(idx, 1);
						console.log(`removed clinet ${lobby.clients[idx]} !!!!!!!!!!`);
						break;
					}
					++idx;
				}
				wss.clients.forEach((client) => {
					client.send(JSON.stringify({ type: "client_left", uuid: ws.uuid }), { binary: false });
				});
                // if there are no sockets connected just kill this game
                if (lobby.wss.clients.size === 0)
                {
                    console.log(`Lobby (${lobby.room_code}) empty, remove in 10 seconds`);
                    lobby.timeout = setTimeout(() =>
                    {
                        lobbyWebSocketServers.delete(lobby.room_code);
                        console.log(`Lobby deleted (${lobby.room_code})`);
                    }, 10000)
                }
            });

            ws.on("pong", function ()
            {
                ws.isAlive = true;
            });
		});
		lobbyWebSocketServers.set(this.room_code, this);
	}

	wsInfoMessage = (ws: LobbyWebSocket) => {
		var clients: ClientUUID[] = [];
		this.clients.forEach((client) => {
			clients.push(client.uuid);
		});

		var message: LobbyResponse = {
			type: "info",
			msg: {
				whoami: ws.uuid,
				clients: clients,
			}
		}
		ws.send(JSON.stringify(message), { binary: false });
	};
}