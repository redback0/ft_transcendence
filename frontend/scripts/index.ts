
import { api } from './api.js'
import { IndexPage } from './index.template.js'
import { GamePage } from './game/game.template.js'
import { LocalGamePage } from './game/local/local.template.js'
import { OnlineGamePage } from './game/online/online.template.js'
import { ErrorPage } from './error.template.js'
import { ChatPage } from './chat/chat.template.js'
import { AddNavigation } from './navigation.js'
import { LoginPage } from './login/login.template.js'

const pages = new Map<string, any>([
    ['/', IndexPage],
    ['/game', GamePage],
    ['/game/local', LocalGamePage],
    ['/game/online', OnlineGamePage],
    ['/chat', ChatPage],
    ['/login', LoginPage]
])

let currPage : HTMLElement

document.body.onload = () => {
    document.title = "Code defined title!";

    AddNavigation();

    newPage();
    history.replaceState(null, "", document.location.href);

}

window.addEventListener("popstate", (e) =>
{
    newPage();
});

export function newPage()
{
    document.title = "page is changing!";

    if (currPage)
        document.body.removeChild(currPage);
    let pageBuilder = pages.get(document.location.pathname);
    if (pageBuilder?.prototype instanceof HTMLElement)
        currPage = new pageBuilder;
    else
        currPage = new ErrorPage;
    document.body.appendChild(currPage);
}
