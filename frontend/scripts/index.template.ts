
import { api } from './api.js'

export class IndexPage extends HTMLElement {
    constructor() {
        super()
        // this.innerHTML = 
        //     `
        //     <script src="scripts/index.controller.ts"></script>
        //     <p>${document.location.pathname}</p>
        //     <button onclick="apiTestOnClick()">this is a button</button>
        //     <p id="api-response"></p>
        //     `
        let path = document.createElement('p')
        path.textContent = document.location.pathname
        this.appendChild(path)

        let apiButton = document.createElement('button')
        apiButton.textContent = "this is a button"
        apiButton.onclick = apiTestOnClick
        this.appendChild(apiButton)

        let apiResponseTB = document.createElement('p')
        apiResponseTB.id = 'api-response'
        this.appendChild(apiResponseTB)
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
