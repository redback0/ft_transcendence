
import { api } from './api.js'
import { IndexPage } from './index.template.js'

var currPage : HTMLElement

document.body.onload = () => {
    document.title = "Code defined title!"

    if (document.location.pathname == '/') {
        currPage = new IndexPage
        document.body.appendChild(currPage)
    }
}
