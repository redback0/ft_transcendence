
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
    }
}

customElements.define('game-page', GamePage)
