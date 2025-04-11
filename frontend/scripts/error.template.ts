
import { api } from './api.js'

export class ErrorPage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
            <p>this is an error page</p>
            `
    }
}

customElements.define('error-page', ErrorPage)
