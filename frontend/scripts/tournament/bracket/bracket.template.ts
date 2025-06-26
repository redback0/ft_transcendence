import { ClientUUID } from "../../lobby.schema.js";
import { LobbyJoinPage } from "../lobby/lobby.template.js";
import { BracketArea } from "./bracket.controller.js";

export class BracketPage extends HTMLElement {
	bracket_area: BracketArea;


	constructor(lobby_page: LobbyJoinPage) {
		super();

		this.bracket_area = new BracketArea(this, lobby_page);
		var para = document.createElement("p");
		para.innerHTML = "helo from tournament";
		this.appendChild(para);
	}
}

customElements.define("bracket-page", BracketPage);