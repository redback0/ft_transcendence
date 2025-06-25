import { LobbyJoinArea } from "./join.controller.js";

export class LobbyJoinPage extends HTMLElement {
	lobby: LobbyJoinArea | undefined;
    constructor() {
        super()
        let searchParams = new URLSearchParams(window.location.search);
        let room_code = searchParams.get("room_code");
        if (!room_code)
            return; // error page

		let createCopyLinkBtn = document.createElement('button');
        createCopyLinkBtn.textContent = "Copy Link to clipboard";
        createCopyLinkBtn.onclick = () => { navigator.clipboard.writeText(document.location.href) };

        var div = document.createElement("div");
        div.tabIndex = 0;
        div.style = "margin: auto;";
        this.lobby = new LobbyJoinArea(room_code, div);

        this.appendChild(createCopyLinkBtn);
        this.appendChild(div);
    }
}

customElements.define('lobby-join-page', LobbyJoinPage)