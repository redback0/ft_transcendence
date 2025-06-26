import { ClientUUID } from "../../lobby.schema.js";
import { LobbyJoinPage } from "../lobby/lobby.template.js";
import { BracketPage } from "./bracket.template.js";

export class BracketArea {
    page: BracketPage;
    ws: WebSocket;
	tournament_host: ClientUUID;
	me: ClientUUID;
	players: ClientUUID[];

	constructor(page: BracketPage, lobby_page: LobbyJoinPage) {
        this.page = page;
        this.ws = lobby_page.lobby.ws;
        this.tournament_host = lobby_page.lobby.lobby_host;
        this.me = lobby_page.lobby.me;
        this.players = lobby_page.lobby.players;
        console.log(`me: ${this.me}, host: ${this.tournament_host}, everyone: ${this.players}`);
	}
}