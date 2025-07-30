
import { WebSocketServer, WebSocket, Server, RawData } from 'ws';
import { FastifyInstance, RegisterOptions } from "fastify";
import { NewID } from "./game"; // lol
import { LobbyMessage, ClientUUID, LobbyRequest, LobbyID, LobbySessionID } from './lobby.schema';
import { convertTypeAcquisitionFromJson, server } from 'typescript';
import { IncomingMessage } from "http";
import { Tournament, TournamentWebSocket } from './tournament';
import { validateSession } from './cookie';

export const lobbyWebSocketServers = new Map<LobbyID, Lobby>;

export function makeNewLobby(room_code: LobbyID): void {
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

// FIXME: if no one connects to lobby it will never get deleteed i thinkers
export class Lobby {
	room_code: LobbyID;
	wss: Server<typeof TournamentWebSocket>; // can't use ServerWebSocket here or ts will forget that we have LobbyWebSocket's and not regular WebSockets 
	timeout: NodeJS.Timeout | undefined;
	host: TournamentWebSocket | undefined;

	constructor(room_code: LobbyID) {
		this.host = undefined;
		this.wss = new WebSocketServer({
            WebSocket: TournamentWebSocket,
            noServer: true,
        });
		this.room_code = room_code;


		this.wss.on("connection", (ws: TournamentWebSocket) => {
            console.log("new client in lobby !!1!!! yay");
			if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = undefined;
            }

			ws.uuid = NewID(8);
			if (!this.host)
				this.host = ws;
            
			this.sendToAll({ type: "new_client", msg: { client: ws.uuid } });
            ws.on("message", (data, isBinary) => { this.wsOnMessage(ws, data, isBinary) });
            ws.on("close", (code, reason) => { this.wsOnClose(ws, code, reason) });
            ws.on("pong", () => {
				// client responded to ping message, keep the connection alive
                ws.isAlive = true;
            });
		});
		lobbyWebSocketServers.set(this.room_code, this);
		this.setPingInterval(1000);
	} //end contructor

	intoTournament = () => {
		// tells lobby websockets to go to tournament in constructor
		new Tournament(this, NewID(8));
		lobbyWebSocketServers.delete(this.room_code);
	}

	wsOnMessage = async (ws: TournamentWebSocket, data: RawData, isBinary: boolean) => {
		console.log(`msg from client in lobby: (${isBinary}, ${data})`);
		if (!ws.uuid) {
			//TODO: cookies :D yum
			const request: LobbySessionID = JSON.parse(data.toString());
			if (request.type !== "session_id") {
				console.warn("request from unauthorised client, ignoring");
				return;
			}
			var uuid = await validateSession(request.msg.session_id);
			if (!uuid) {
				console.warn("invalid session id");
				return;
			}
			ws.uuid = uuid;
			if (!this.host)
				this.host = ws;
			this.sendToAll({ type: "new_client", msg: { client: ws.uuid } });
			return;
		}
		const request: LobbyRequest = JSON.parse(data.toString());
		switch (request.type) {
			case "infoRequest":
				this.sendInfoResponse(ws);
				break;
			case "startRequest":
				if (ws !== this.host)
					return;
				console.log(`lobby (${this.room_code}) start request receieved`);
				// deletes lobby !!!
				this.intoTournament();
				console.log(`Lobby deleted (${this.room_code}), turned into tournament`);
				break;
			default:
				console.warn("unknown lobby request from client");
		}
	}

	wsOnClose = (ws: TournamentWebSocket, code: number, reason: Buffer<ArrayBufferLike>) => {
		// if there are no sockets connected just kill this game
		if (this.wss.clients.size === 0)
		{
			console.log(`Lobby (${this.room_code}) empty, remove in 10 seconds`);
			this.timeout = setTimeout(() =>
			{
				lobbyWebSocketServers.delete(this.room_code);
				console.log(`Lobby deleted (${this.room_code})`);
			}, 10000)
		}
	
		if (!ws.uuid)
			return;
		this.sendToAll({ type: "client_left", msg: { client: ws.uuid } });
		if (ws == this.host) {
			this.chooseNewHost();
		}
	}

	sendInfoResponse = (ws: TournamentWebSocket) => {
		if (!this.host || !this.host.uuid || !ws.uuid)
			return;
		var clients: ClientUUID[] = [];
		this.wss.clients.forEach((client) => {
			if (client.uuid)
				clients.push(client.uuid);
		});

		var message: LobbyMessage = {
			type: "info",
			msg: {
				whoami: ws.uuid,
				host: this.host.uuid,
				clients: clients,
			}
		}
		ws.send(JSON.stringify(message), { binary: false })
	}

	chooseNewHost = () => {
		console.log("lobby host left !!!");
		if (this.wss.clients.size > 0) {
			// gross, i just want one thing from the list of clients
			for (let c of this.wss.clients) {
				this.host = c;
				break;
			}
		} else {
			this.host = undefined;
		}
		if (this.host && this.host.uuid)
			this.sendToAll({ type: "new_host", msg: { client: this.host.uuid }});
	}

	sendToAll = (message: LobbyMessage) => {
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