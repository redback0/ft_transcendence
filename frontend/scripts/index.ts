
import { api } from './api.js'
import { IndexPage } from './index.template.js'
import { GamePage } from './game/game.template.js'
import { ErrorPage } from './error.template.js'

const pages = new Map<string, any>([
    ['/', IndexPage],
    ['/game', GamePage]
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
