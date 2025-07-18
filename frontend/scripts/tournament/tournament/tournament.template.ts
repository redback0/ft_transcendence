import { ClientUUID } from "../../lobby.schema.js";
import { LobbyJoinPage } from "../lobby/lobby.template.js";
import { TournamentArea } from "./tournament.controller.js";

export class TournamentPage extends HTMLElement {
	bracket_area: TournamentArea;


	constructor(lobby_page: LobbyJoinPage) {
		super();

		this.bracket_area = new TournamentArea(this, lobby_page);
	}
}

customElements.define("bracket-page", TournamentPage);