import { LobbyRequest, LobbyMessage, ClientUUID, LobbyStartRequest } from "../../lobby.schema.js";
import { LobbyJoinPage } from "./lobby.template.js";
import { TournamentStartMessage } from '../../tournament.schema.js';
import { currPage, newPage } from "../../index.js";
import { BracketPage } from "../bracket/bracket.template.js";
import { setCurrentPage } from '../../index.js';

const htmlClientNamePrefix = "name-of-client-";
const hostPrefix = "👑 ";
const meSuffix = " (You)";

export class LobbyJoinArea {
	parent: LobbyJoinPage;
    ws: WebSocket;
	lobby_host: ClientUUID;
	me: ClientUUID;
	start_button: HTMLButtonElement;
	names: HTMLElement[]; // TODO: use this
	players: ClientUUID[];

	constructor(room_code: string, parent: LobbyJoinPage) {
		this.parent = parent;
		console.log("heelo from new lobby join area");
		this.ws = new WebSocket("/wss/lobby/" + room_code);
		let ws = this.ws;
		window.addEventListener("popstate", function disconnectGame(e) {
            ws.close();
            window.removeEventListener("popstate", disconnectGame);
        });
		this.ws.onopen = this.wsConnect;
		this.ws.onmessage = this.wsMessage;
		this.ws.onclose = (ev: CloseEvent) => { console.log("disconnected from lobby"); };

        this.start_button = document.createElement('button');
        this.start_button.textContent = "Start!";
        this.start_button.disabled = true;
        this.start_button.onclick = () => {
			const req: LobbyStartRequest = { type: "startRequest" };
			this.ws.send(JSON.stringify(req));
        };

		this.names = [];
		this.players = []

		this.parent.appendChild(this.start_button);
	}

    wsConnect = () => {
        console.log("Lobby WebSocket connected");
		let message: LobbyRequest = {
			type: "infoRequest",
		}
		this.ws.send(JSON.stringify(message));
    }

	wsMessage = (ev: MessageEvent) => {
		if (typeof ev.data !== "string") {
            throw new Error("Unknown data recieved on WebSocket");
        }
		
		// TODO: need a safer way to parse json, this would be bad if data is not a LobbyMessage
		const data: LobbyMessage | TournamentStartMessage = JSON.parse(ev.data);
		switch (data.type) {
			case "info":
				console.log(`whoami: ${data.msg.whoami}, host: ${data.msg.host}, clients: ${data.msg.clients}`);
				this.me = data.msg.whoami;
				data.msg.clients.forEach((client) => this.addClient(client));
				this.updateHost(data.msg.host);
				break;
			case "new_client":
				console.log(`new client ${data.msg.client} joined lobby !!!`);
				if (!this.me)
					this.me = data.msg.client;
				this.addClient(data.msg.client);
				break;
			case "client_left":
				console.log(`client (${data.msg.client}) left !!!`);
				this.removeClient(data.msg.client);
				break;
			case "new_host":
				console.log(`new host: ${data.msg.client}`);
				this.updateHost(data.msg.client);
				break;
			case "tournament_starting":
				console.log("tournament is starting !!!");
				history.pushState({}, "", "/tournament/bracket?bracket_id=" + data.msg.room_code);
				setCurrentPage(new BracketPage(this.parent));
				break;
			default:
				console.warn("unrecognised message from lobby !!!");
		}
    }

	addClient = (client: ClientUUID) => {
		if (!client || this.players.includes(client))
			return;
		this.players.push(client);
	
		var text = document.createElement("b");
		text.innerText = client;
		if (client == this.me)
			text.innerText += meSuffix;

		var textdiv = document.createElement("div");
		textdiv.id = htmlClientNamePrefix + client;
		textdiv.style = "text-align: center;padding: 10px;border: black;";
		textdiv.appendChild(text);

		this.parent.div.appendChild(textdiv);
	}

	removeClient = (client: ClientUUID) => {
		if (!client)
			return;
		this.players = this.players.filter(c => c !== client);
		var textdiv = document.getElementById(htmlClientNamePrefix + client);
		if (!textdiv)
			return;
		this.parent.div.removeChild(textdiv);
	}

	updateHost = (new_host: ClientUUID) => {
		var old_host_b = document.getElementById(htmlClientNamePrefix + this.lobby_host)?.getElementsByTagName("b")[0];
		if (old_host_b && old_host_b.innerText.startsWith(hostPrefix))
			old_host_b.innerText.slice(hostPrefix.length);
		
		this.lobby_host = new_host;
		this.start_button.disabled = this.lobby_host != this.me;
		var new_host_b = document.getElementById(htmlClientNamePrefix + new_host)?.getElementsByTagName("b")[0];
		if (!new_host_b)
			return;
		new_host_b.innerText = hostPrefix + new_host_b.innerText;
	}
}