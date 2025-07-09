
import { api } from './api.js'
import { IndexPage } from './index.template.js'
import { GamePage } from './game/game.template.js'
import { LocalGamePage } from './game/local/local.template.js'
import { OnlineGamePage } from './game/online/online.template.js'
import { ErrorPage } from './error.template.js'
import { ChatPage } from './chat/chat.template.js'
import { AddNavigation } from './navigation.js'

const pages = new Map<string, any>([
    ['/', IndexPage],
    ['/game', GamePage],
    ['/game/local', LocalGamePage],
    ['/game/online', OnlineGamePage],
    ['/chat', ChatPage]
]);

type cleanupFunc = () => any;
const cleanupFuncs = new Array<cleanupFunc>;

let currPage : HTMLElement;

/**
 * 
 * @param func Function to call on state change
 * 
 * This function will add a given function to a list to be run when the page
 * changes for any reason. Once `func` is called, it will be removed from the
 * list.
 */
export function onPageChange(func: cleanupFunc)
{
    cleanupFuncs.push(func);
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

    cleanupFuncs.forEach((v) =>
    {
        v();
    });
    // clear array
    cleanupFuncs.splice(0);

    if (currPage)
        document.body.removeChild(currPage);
    let pageBuilder = pages.get(document.location.pathname);
    if (pageBuilder?.prototype instanceof HTMLElement)
        currPage = new pageBuilder;
    else
        currPage = new ErrorPage;
    document.body.appendChild(currPage);
}
