
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

        this.appendChild(createOnlineGameBtn);
        this.appendChild(localGameBtn);
    }
}

customElements.define('game-page', GamePage)
