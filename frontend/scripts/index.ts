
import { api } from './api.js'
import { IndexPage } from './index.template.js'
import { GamePage } from './game/game.template.js'
import { LocalGamePage } from './game/local/local.template.js'
import { OnlineGamePage } from './game/online/online.template.js'
import { ErrorPage } from './error.template.js'
import { ChatPage } from './chat/chat.template.js'
import { LobbyNavPage } from './tournament/lobbynav.template.js'
import { AddNavigation } from './navigation.js'
import { LobbyJoinPage } from './tournament/lobby/lobby.template.js'
import { BracketPage } from './tournament/bracket/bracket.template.js'

const pages = new Map<string, any>([
    ['/', IndexPage],
    ['/game', GamePage],
    ['/game/local', LocalGamePage],
    ['/game/online', OnlineGamePage],
    ['/chat', ChatPage],
    ['/lobby', LobbyNavPage],
    ['/lobby/join', LobbyJoinPage],
])

export let currPage : HTMLElement

// prefer newPage over setCurrentPage
export function setCurrentPage(page: HTMLElement) {
    document.title = "page is changing!";
    try {
		document.body.removeChild(currPage);
    } catch (e) {}
	currPage = page;
	document.body.appendChild(currPage);
}

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
    try {
        if (pageBuilder?.prototype instanceof HTMLElement)
            currPage = new pageBuilder;
        else
            currPage = new ErrorPage;
    } catch (e) {
        console.error("Exception thrown while building page");
        if (e instanceof Error) {
            console.error(e.name);
            console.error(e.message);
            console.error(e.stack);
        }
        currPage = new ErrorPage;
    }
    document.body.appendChild(currPage);
}
