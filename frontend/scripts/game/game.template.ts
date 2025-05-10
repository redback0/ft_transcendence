
import { api } from "../api.js";
import * as GameCtrl from "./game.controller.js"

export class GamePage extends HTMLElement {
    constructor() {
        super()

        let createOnlineGameBtn = document.createElement('button');
        createOnlineGameBtn.textContent = "Create Online Game";
        createOnlineGameBtn.onclick = GameCtrl.CreateOnlineGame;

        let localGameBtn = document.createElement('button');
        localGameBtn.textContent = "Join Local Game";
        localGameBtn.onclick = GameCtrl.LocalGame;

        let testButton = document.createElement('button');
        testButton.textContent = "this is a test";
        testButton.onclick = GameCtrl.TestGame;

        let testWinner = document.createElement('p');
        api<{ winner: string }>('/api/game/test/winner').then((v) =>
        {
            testWinner.innerText = v.winner;
        });

        this.appendChild(createOnlineGameBtn);
        this.appendChild(localGameBtn);
        this.appendChild(testButton);
        this.appendChild(testWinner);
    }
}

customElements.define('game-page', GamePage)
