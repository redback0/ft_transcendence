import { api } from '../api.js'
import { CreateLobby } from './lobbynav.controller.js';

function isRoomCode(room_code: string): boolean {
	return true;
}

function genRoomCode(): string {
	return ("1234");
}

export class LobbyNavPage extends HTMLElement {
    constructor() {
        super()

        this.innerHTML =
            `
            <p>heelo from lobbay</p>
            `;

        let createCreateLobbyBtn = document.createElement('button');
        createCreateLobbyBtn.textContent = "Create lobby";
        createCreateLobbyBtn.onclick = CreateLobby;

		this.appendChild(createCreateLobbyBtn);
    }
}

customElements.define('lobby-page', LobbyNavPage)