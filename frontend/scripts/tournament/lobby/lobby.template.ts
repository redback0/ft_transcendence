import { LobbyStartRequest } from "../../lobby.schema.js";
import { LobbyJoinArea } from "./lobby.controller.js";

export class LobbyJoinPage extends HTMLElement {
	lobby: LobbyJoinArea;
    names_div: HTMLDivElement;
    start_button: HTMLButtonElement;
    constructor() {
        super()
        this.innerHTML += `<style>
            .lobby-button:hover {
                color: var(--color1) !important;
                background-color: var(--color2);
                display: inline-block;
                cursor: pointer;
                margin-bottom: 50px;
            }
            .lobby-button {
                font-weight: bold;
                font-size: 3vh;
                color: var(--color2);
                text-align: left;
                margin-bottom: 50px;
            }
            .lobby-name {
                font-weight: bold;
                font-size: 3vh;
                color: var(--color1);
                background-color: var(--color2);
                text-align: left;
            }
            .lobby-container {
                column-gap: 20px;
            }
            </style>`;
		
        let createCopyLinkBtn = document.createElement('button');
        createCopyLinkBtn.className = "lobby-button px-5";
        createCopyLinkBtn.textContent = "Copy Link to clipboard";
        createCopyLinkBtn.onclick = () => { navigator.clipboard.writeText(document.location.href) };

        // onclick is set in controller class
        this.start_button = document.createElement('button');
        this.start_button.className = "lobby-button px-5";
        this.start_button.textContent = "Start!";
        this.start_button.disabled = true;

        //this.className = "";

        var center_names_div = document.createElement("div");
        center_names_div.className = "flex justify-center items-center";

        this.names_div = document.createElement("div");
        this.names_div.tabIndex = 0;
        this.names_div.className = "lobby-container flex flex-row flex-wrap flex-initial w-3/4 justify-center items-center";
        
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