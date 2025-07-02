import { ClientUUID } from "../../lobby.schema.js";
import { TournamentMessage } from "../../tournament.schema.js";
import { LobbyJoinPage } from "../lobby/lobby.template.js";
import { TournamentPage } from "./tournament.template.js";
import { newPage, setCurrentPage } from "../../index.js";

export class TournamentArea {
    page: TournamentPage;
    ws: WebSocket;
	tournament_host: ClientUUID;
	me: ClientUUID;
	players: ClientUUID[];

	constructor(page: TournamentPage, lobby_page: LobbyJoinPage) {
        this.page = page;
        this.ws = lobby_page.lobby.ws;
		this.ws.onmessage = this.wsMessage;
        this.tournament_host = lobby_page.lobby.lobby_host;
        this.me = lobby_page.lobby.me;
        this.players = lobby_page.lobby.players;
        this.log(`me: ${this.me}, host: ${this.tournament_host}, everyone: ${this.players}`);
	}

    wsMessage = (ev: MessageEvent) => {
        if (typeof ev.data !== "string")
            throw new Error("Unknown data recieved on WebSocket");
		
		// TODO: need a safer way to parse json, this would be bad if data is not a LobbyMessage
        // TODO: handle new_host message
		const data: TournamentMessage = JSON.parse(ev.data);
        const { type, msg } = data;
        switch (type) {
            case "go_to_game":
                this.log(`going to game: ${msg.game_id}`);
                const newURL = "/game/online?id=" + msg.game_id;
                history.pushState({}, "", newURL);
                newPage();
            break;
            case "game_finished":
                this.log(`game finished (${msg.p1.uuid} vs. ${msg.p2.uuid}): ${msg.p1.points} ${msg.p2.points}`);
            break;
            case "go_to_bracket":
                history.pushState({}, "", "/tournament/bracket?bracket_id=" + data.msg.tourney_id);
				setCurrentPage(this.page);
            break;
            case "client_left":
                this.log(`client left: ${msg.client}`);
            break;
            default:
                this.log("Unrecognised message from server");
        }
    }

    log = (msg: any) => {
        console.log(msg);
        var p = document.createElement("p");
        p.innerText = JSON.stringify(msg);
        this.page.appendChild(p);
    }
}