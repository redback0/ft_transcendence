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

        var canvas = document.createElement('canvas');
        canvas.width = window.outerWidth * 3 / 4;
        canvas.height = canvas.width / 2.2;
        canvas.tabIndex = 0;
        this.lobby = new LobbyJoinArea(room_code, canvas);



        this.appendChild(createCopyLinkBtn);
        this.appendChild(canvas);
    }
}

customElements.define('lobby-join-page', LobbyJoinPage)