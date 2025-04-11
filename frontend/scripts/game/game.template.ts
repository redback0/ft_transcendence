
export class GamePage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
            <p>just testing for now</p>
            `
    }
}

customElements.define('game-page', GamePage)
