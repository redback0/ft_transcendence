
import { api } from './api.js'
import { IndexPage } from './index.template.js'
import { LocalGamePage } from './game/local/local.template.js'
import { OnlineGamePage } from './game/online/online.template.js'
import { ErrorPage } from './error.template.js'
import { ChatPage } from './chat/chat.template.js'

const pages = new Map<string, any>([
    ['/', IndexPage],
    ['/game/local', LocalGamePage],
    ['/game/online', OnlineGamePage],
    ['/chat', ChatPage]
])

var currPage : HTMLElement

document.body.onload = () => {
    document.title = "Code defined title!"

    let pageBuilder = pages.get(document.location.pathname)
    if (pageBuilder?.prototype instanceof HTMLElement)
        currPage = new pageBuilder
    else
        currPage = new ErrorPage

    document.body.appendChild(currPage)
}
