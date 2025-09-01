
//import { Fastify } from "fastify";
import { api } from './api.js'
import { IndexPage, IndexPostLoad } from './index.template.js'
import { GamePage, GamePostLoad } from './game/game.template.js'
import { LocalGamePage } from './game/local/local.template.js'
import { OnlineGamePage } from './game/online/online.template.js'
import { ErrorPage } from './error.template.js'
import { ChatPage } from './chat/chat.template.js'
import { LobbyNavPage } from './tournament/lobbynav.template.js'
import { LobbyJoinPage } from './tournament/lobby/lobby.template.js'
import { LoginPage } from './login/login.template.js'
import { LoginPostLoad } from './login/login.controller.js'
import { UserPage } from './userpage/userpage.template.js'
import { TournamentPage } from './tournament/tournament/tournament.template.js'
import './navigation.js'

type Page = {
    builder: typeof HTMLElement,
    postLoad?: ((page: HTMLElement) => any)
}
const pages = new Map<string, Page>([
    ['/', {builder: IndexPage, postLoad: IndexPostLoad}],
    ['/game', {builder: GamePage, postLoad: GamePostLoad}],
    ['/game/local', {builder: LocalGamePage}],
    ['/game/online', {builder: OnlineGamePage}],
    ['/lobby', {builder: LobbyNavPage}],
    ['/lobby/join', {builder: LobbyJoinPage}],
    // ['/chat', {builder: ChatPage}],
    ['/login', {builder: LoginPage, postLoad: LoginPostLoad}],
    ['/mypage', {builder: UserPage}],
    ['/tournament/bracket', {builder: TournamentPage}]
]);

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

// this is available so we don't have to change the index every time we add
// a new page
export function AddPage(path: string, page: Page)
{
    pages.set(path, page);
}

type cleanupFunc = () => any;
const cleanupFuncs = new Array<cleanupFunc>;

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

export function NavOnClick(e: MouseEvent)
{
    closeMenu();
    if (!(e.target instanceof HTMLAnchorElement))
        return;

    e.preventDefault();

    const newURL = e.target.href;

    history.pushState({}, "", newURL);

    newPage();
}


document.body.onload = () => {
    document.title = "Code defined title!";

    newPage();
    history.replaceState(null, "", document.location.href);

    const navButtons = document.getElementsByClassName("nav-button");

    for (let navButton of navButtons)
    {
        if (navButton instanceof HTMLElement) navButton.onclick = NavOnClick;
    }
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
    try {
        if (pageBuilder?.builder.prototype instanceof HTMLElement)
            currPage = new pageBuilder.builder;
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

    if (pageBuilder?.postLoad)
        pageBuilder.postLoad(currPage);
}
