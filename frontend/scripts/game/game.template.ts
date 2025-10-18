
import { api } from "../api.js";
import * as GameCtrl from "./game.controller.js"
import * as LobbyCtrl from "../tournament/lobbynav.controller.js"

export class GamePage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
            <ul>
                <li><button id="gameselect-tourn" class="gameselect-redHover">TOURNAMENT -></a></li>
                <li><button id="gameselect-local" class="gameselect-redHover">LOCAL -></a></li>
                <li><button id="gameselect-online" class="gameselect-redHover">ONLINE -></a></li>
            </ul>
            `

        // let createOnlineGameBtn = document.createElement('button');
        // createOnlineGameBtn.textContent = "Create Online Game";
        // createOnlineGameBtn.onclick = GameCtrl.CreateOnlineGame;

        // let localGameBtn = document.createElement('button');
        // localGameBtn.textContent = "Join Local Game";
        // localGameBtn.onclick = GameCtrl.LocalGame;

        // let testButton = document.createElement('button');
        // testButton.textContent = "this is a test";
        // testButton.onclick = GameCtrl.TestGame;

        // let testWinner = document.createElement('p');
        // api<{ winner: string }>('/api/game/test/winner').then((v) =>
        // {
        //     testWinner.innerText = v.winner;
        // });

        // this.appendChild(createOnlineGameBtn);
        // this.appendChild(localGameBtn);
        // this.appendChild(testButton);
        // this.appendChild(testWinner);
    }
}

export function GamePostLoad(page: HTMLElement)
{
    const createTournBtn = document.getElementById('gameselect-tourn');
    const createLocalBtn = document.getElementById('gameselect-local');
    const createOnlineBtn = document.getElementById('gameselect-online');

    // set tournament onclick
    if (createTournBtn) createTournBtn.onclick = LobbyCtrl.CreateLobby;
    else console.error("FAILED TOURNAMENT BUTTON");
    if (createLocalBtn) createLocalBtn.onclick = GameCtrl.LocalGame;
    else console.log("FAILED LOCAL BUTTON");
    if (createOnlineBtn) createOnlineBtn.onclick = GameCtrl.CreateOnlineGame;
    else console.log("FAILED ONLINE BUTTON");
}

customElements.define('game-page', GamePage)
