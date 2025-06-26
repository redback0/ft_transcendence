import { LobbyJoinArea } from "./lobby.controller.js";

export class LobbyJoinPage extends HTMLElement {
	lobby: LobbyJoinArea;
    div: HTMLDivElement;
    constructor() {
        super()

		let createCopyLinkBtn = document.createElement('button');
        createCopyLinkBtn.textContent = "Copy Link to clipboard";
        createCopyLinkBtn.onclick = () => { navigator.clipboard.writeText(document.location.href) };

        this.div = document.createElement("div");
        this.div.tabIndex = 0;
        this.div.style = "margin: auto;";
        
        this.appendChild(createCopyLinkBtn);
        this.appendChild(this.div);
        
        let searchParams = new URLSearchParams(window.location.search);
        let room_code = searchParams.get("room_code");
        if (!room_code)
            throw Error("no room code. L"); // error page
        
        this.lobby = new LobbyJoinArea(room_code, this);
    }
}

customElements.define('lobby-join-page', LobbyJoinPage)