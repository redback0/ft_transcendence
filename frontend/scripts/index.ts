
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
import { SignUpPage } from './signup/signup.template.js'
import { SignUpPostLoad } from './signup/signup.controller.js'
import { FriendsPage } from './friends/friends.template.js'
import { UserPage } from './userpage/userpage.template.js'
import { TournamentPage } from './tournament/tournament/tournament.template.js'
import { SettingsPage } from './settings/settings.template.js'
import './navigation.js'
import { FriendsPostLoad } from './friends/friends.controller.js'

type Page = {
    builder: typeof HTMLElement,
    postLoad?: ((page: HTMLElement) => any),
    title?: string
}
const pages = new Map<string, Page>([
    ['/', {builder: IndexPage, postLoad: IndexPostLoad, title: "Login"}],
    ['/game', {builder: GamePage, postLoad: GamePostLoad, title: "Game Select"}],
    ['/game/local', {builder: LocalGamePage}],
    ['/game/online', {builder: OnlineGamePage, title: "Play Pong"}],
    ['/lobby', {builder: LobbyNavPage, title: "Tournament Lobby"}],
    ['/lobby/join', {builder: LobbyJoinPage, title: "Tournament Lobby"}],
    // ['/chat', {builder: ChatPage}],
    ['/signup', {builder: SignUpPage, postLoad: SignUpPostLoad, title: "Sign Up"}],
    ['/mypage', {builder: UserPage, title: "My Page"}],
    ['/tournament/bracket', {builder: TournamentPage, title: "Tournament Bracket"}],
    ['/settings', {builder: SettingsPage, title: "Settings"}],
	['/friends', {builder: FriendsPage, postLoad: FriendsPostLoad }]]
);

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

export async function NavOnClick(e: MouseEvent)
{
    e.preventDefault();

    closeMenu();
    if (!(e.target instanceof HTMLAnchorElement))
        return;

    if (e.target.id === "logout")
    {
        console.log("attempting to log out");
        await fetch("/api/user/session", { method: "DELETE" });
        const usernameElement = document.getElementById("username");
        if (usernameElement instanceof HTMLParagraphElement)
            usernameElement.innerText = "";
    }

    const newURL = e.target.href;

    history.pushState({}, "", newURL);

    newPage();
}


document.body.onload = async () => {
    document.title = "Transvengence";

    const usernameElement = document.getElementById("username");
    const sessionInfo = await fetch("/api/user/session");

    if (sessionInfo.ok)
    {
        const userInfo = await sessionInfo.json();
        if (usernameElement instanceof HTMLParagraphElement)
            usernameElement.innerText = userInfo?.username;
        if (document.location.pathname === "/")
            history.pushState({}, "", "/game");
    }

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

    if (pageBuilder?.title)
        document.title = pageBuilder.title + " - Transvengence";
    else
        document.title = "Transvengence";

    if (pageBuilder?.postLoad)
        pageBuilder.postLoad(currPage);
}
