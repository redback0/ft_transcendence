
import { GameArea } from './local.controller.js'

export class LocalGamePage extends HTMLElement {
    game: GameArea
    constructor() {
        super()
        var canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        canvas.tabIndex = 0;
        this.game = new GameArea(canvas);
        this.appendChild(canvas);
    }
}

customElements.define('local-game-page', LocalGamePage)
