
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

        // TODO: resize canvas when page resized
        var canvas = document.createElement('canvas');
        canvas.width = window.outerWidth * 3 / 4;
        canvas.height = canvas.width / 2.2;
        canvas.tabIndex = 0;
        this.game = new GameArea(id, canvas);
        this.appendChild(canvas);
    }
}

customElements.define('online-game-page', OnlineGamePage)
