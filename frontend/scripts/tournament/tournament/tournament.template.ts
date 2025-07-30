import { ClientUUID } from "../../lobby.schema.js";
import { TournamentID } from "../../tournament.schema.js";
import { LobbyJoinPage } from "../lobby/lobby.template.js";
import { TournamentArea } from "./tournament.controller.js";

export class TournamentPage extends HTMLElement {
	bracket_area: TournamentArea;


	constructor(lobby_page: LobbyJoinPage, room_code: TournamentID) {
		super();

		this.bracket_area = new TournamentArea(this, lobby_page, room_code);
	}
}

customElements.define("bracket-page", TournamentPage);