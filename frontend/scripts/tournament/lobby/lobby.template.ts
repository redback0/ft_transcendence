import { LobbyStartRequest } from "../../lobby.schema.js";
import { LobbyJoinArea } from "./lobby.controller.js";

export class LobbyJoinPage extends HTMLElement {
	lobby: LobbyJoinArea;
    names_div: HTMLDivElement;
    start_button: HTMLButtonElement;
    constructor() {
        super()

		let createCopyLinkBtn = document.createElement('button');
        createCopyLinkBtn.textContent = "Copy Link to clipboard";
        createCopyLinkBtn.onclick = () => { navigator.clipboard.writeText(document.location.href) };

        // onclick is set in controller class
        this.start_button = document.createElement('button');
        this.start_button.textContent = "Start!";
        this.start_button.disabled = true;

        //this.className = "";

        var center_names_div = document.createElement("div");
        center_names_div.className = "flex justify-center items-center";

        this.names_div = document.createElement("div");
        this.names_div.tabIndex = 0;
        this.names_div.className = "flex flex-row flex-wrap flex-initial w-3/4 justify-center items-center";
        
        this.appendChild(createCopyLinkBtn);
		this.appendChild(this.start_button);
        
        center_names_div.appendChild(this.names_div);
        this.appendChild(center_names_div);
        
        let searchParams = new URLSearchParams(window.location.search);
        let room_code = searchParams.get("room_code");
        if (!room_code)
            throw Error("no room code. L"); // error page
        
        this.lobby = new LobbyJoinArea(room_code, this);
    }
}

customElements.define('lobby-join-page', LobbyJoinPage)