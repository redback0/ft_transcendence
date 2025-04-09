
import './api.js'
import { IndexPage } from './index.template.js'

document.body.onload = () => {
    document.title = "Code defined title!"

    document.body.appendChild(new IndexPage)
}
