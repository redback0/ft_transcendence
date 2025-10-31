
import { GameArea } from './online.controller.js'

export class OnlineGamePage extends HTMLElement {
    game: GameArea | undefined
    constructor() {
        super()
        let searchParams = new URLSearchParams(window.location.search);
        let id = searchParams.get("id");
        if (!id)
        {
            // error page
            return;
        }

        var canvas = document.createElement('canvas');

        let width = window.outerWidth * 3 / 4;
        let height = width / 2.2;

        if (window.outerHeight * 3 / 4 < height)
        {
            height = window.outerHeight * 3 / 4;
            width = height * 2.2;
        }

        canvas.width = width;
        canvas.height = height;

        canvas.tabIndex = 0;
        this.game = new GameArea(id, canvas);
        this.appendChild(canvas);
    }
}

customElements.define('online-game-page', OnlineGamePage)
