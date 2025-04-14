
import { GameArea } from './game.controller.js'

export class GamePage extends HTMLElement {
    game: GameArea
    constructor() {
        super()
        var canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        this.game = new GameArea(canvas);
        this.appendChild(canvas);

        var startButton = document.createElement('button');
        startButton.id = "game-start-button";
        startButton.onclick = this.game.start;
        startButton.textContent = "Start game!"
        this.appendChild(startButton)
    }
}

customElements.define('game-page', GamePage)
