
import { GameArea } from './local.controller.js'

export class LocalGamePage extends HTMLElement {
    game: GameArea
    constructor() {
        super()
        var canvas = document.createElement('canvas');
        canvas.width = window.outerWidth * 3 / 4;
        canvas.height = canvas.width / 2.2;
        canvas.tabIndex = 0;
        this.game = new GameArea(canvas);
        this.appendChild(canvas);
    }
}

customElements.define('local-game-page', LocalGamePage)
