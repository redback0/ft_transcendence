import { LobbyRequest, LobbyMessage, LobbyStartRequest, LobbySessionID } from "../../lobby.schema.js";
import { LobbyJoinPage } from "./lobby.template.js";
import { TournamentStartMessage, UserInfo } from '../../tournament.schema.js';
import { currPage, newPage } from "../../index.js";
import { TournamentPage } from "../tournament/tournament.template.js";
import { setCurrentPage } from '../../index.js';

const htmlClientNamePrefix = "name-of-client-";
const hostPrefix = "👑 ";
const meSuffix = " (You)";

function NewID(length: number)
{
    let result = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    for (let i = 0; i < length; i++)
    {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (result);
}

export class LobbyJoinArea {
	parent: LobbyJoinPage;
    ws: WebSocket;
	lobby_host: UserInfo | undefined;
	me: UserInfo | undefined;
	names: HTMLElement[];
	players: UserInfo[];

	constructor(room_code: string, parent: LobbyJoinPage) {
		this.parent = parent;
		console.log("heelo from new lobby join area");
		this.ws = new WebSocket("/wss/lobby/" + room_code);
		window.addEventListener("popstate", this.disconnectOnPop);
		this.ws.onopen = this.wsConnect;
		this.ws.onmessage = this.wsMessage;
		this.ws.onclose = (ev: CloseEvent) => { console.log("disconnected from lobby"); };

        this.parent.start_button.onclick = () => {
			const req: LobbyStartRequest = { type: "startRequest" };
			this.ws.send(JSON.stringify(req));
        };

		this.names = [];
		this.players = []
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
				console.log(`whoami: ${data.msg.whoami.username}, host: ${data.msg.host.username}, clients: ${data.msg.clients.length}`);
				this.me = data.msg.whoami;
				data.msg.clients.forEach((client) => this.addClient(client));
				this.updateHost(data.msg.host);
				break;
			case "new_client":
				console.log(`new client ${data.msg.client.username} joined lobby !!!`);
				if (!this.me)
					this.me = data.msg.client;
				this.addClient(data.msg.client);
				break;
			case "client_left":
				console.log(`client (${data.msg.client.username}) left !!!`);
				this.removeClient(data.msg.client);
				break;
			case "new_host":
				console.log(`new host: ${data.msg.client.username}`);
				this.updateHost(data.msg.client);
				break;
			case "tournament_starting":
				console.log(`tournament is starting !!! rom code ${data.msg.room_code}`);
				history.pushState({}, "", "/tournament/bracket?bracket_id=" + data.msg.room_code);
				setCurrentPage(new TournamentPage(this.parent, data.msg.room_code));
				break;
			default:
				console.warn("unrecognised message from lobby !!!");
		}
    }

	addClient = (client: UserInfo) => {
		if (!this.players.every(user => user.user_id !== client.user_id))
			return;
		this.players.push(client);
	
		var text = document.createElement("b");
		text.innerText = client.username;
		if (client.user_id === this.me?.user_id)
			text.innerText += meSuffix;

		var textdiv = document.createElement("div");
		textdiv.id = htmlClientNamePrefix + client.user_id;
		textdiv.className = "flex px-5 text-center border-black";
		textdiv.appendChild(text);

		this.parent.names_div.appendChild(textdiv);
		this.names.push(text);
	}

	removeClient = (client: UserInfo) => {
		if (!client)
			return;
		this.players = this.players.filter(c => c.user_id !== client.user_id);
		var idx = this.names.findIndex(name => {
			if (client.user_id === this.lobby_host?.user_id) {
				return name.innerText.slice(hostPrefix.length) === client.username;
			}
			return name.innerText === client.username;
		});
		if (idx === -1)
			return;
		var textparent = this.names[idx].parentElement;
		if (textparent === null)
			return;
		this.parent.names_div.removeChild(textparent);
		this.names.splice(idx, 1);
	}

	updateHost = (new_host: UserInfo) => {
		console.log("updateing host");
		console.log(this.names.length);
		var old_host_b = this.names.find(name => {
			console.log(name.innerText);
			return (name.innerText.startsWith(hostPrefix));
		});
		if (old_host_b)
			old_host_b.innerText = old_host_b.innerText.slice(hostPrefix.length);
		
		this.lobby_host = new_host;
		this.parent.start_button.disabled = this.lobby_host.user_id != this.me?.user_id;
		var new_host_b = this.names.find(name => {
			if (new_host.user_id === this.me?.user_id)
				return name.innerText.slice(0, -meSuffix.length) === new_host.username;
			return name.innerText === new_host.username;
		});
		if (!new_host_b)
			return;
		new_host_b.innerText = hostPrefix + new_host_b.innerText;
	}

	disconnectOnPop = (e: PopStateEvent) => {
		console.log("disconnect cuz pop");
		this.ws.close();
		window.removeEventListener("popstate", this.disconnectOnPop);
	}
}