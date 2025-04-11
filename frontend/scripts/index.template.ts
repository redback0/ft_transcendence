
import { api } from './api.js'

export class IndexPage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
            <button id="api-test-button">this is a button</button>
            <p id="api-response"></p>
            `
        let apiButton = this.querySelector("#api-test-button")
        if (apiButton instanceof HTMLElement) apiButton.onclick = apiTestOnClick
    }
}

const apiTestOnClick = async (event: Event) => {
    let apiResponseTB = document.getElementById('api-response')
    if (apiResponseTB != null) {
        // just a stupid example to show api's use
        const serverText = await api<{text: string}>("/api/buttonpressed");
        apiResponseTB.textContent = serverText.text;
    }
}

customElements.define('index-page', IndexPage)
