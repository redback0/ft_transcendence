
import { newPage } from './index.js'

const nav = new Map<string, string>([
    ["Home", "/"],
    ["Game", "/game"],
    // ["Chat", "/chat"],
    ["Login/Sign In","/login"],
    ["My Home Page", "/mypage"],
]);

export function AddNavigation()
{
    const navBar = document.createElement("nav");

    navBar.id = "nav";
    navBar.className = "flex bg-gray-600 p-6";

    nav.forEach((v, k, m) =>
    {
        const link = document.createElement("a");
        link.text = k;
        link.href = v;
        link.className = "block mt-4 mr-4"
        link.onclick = NavOnClick;
        navBar.appendChild(link);
        navBar.appendChild(document.createElement("br"));
    })
    document.body.appendChild(navBar);
}

export function NavOnClick(e: MouseEvent)
{
    if (!(e.target instanceof HTMLAnchorElement))
        return;

    e.preventDefault();

    const newURL = e.target.href;

    history.pushState({}, "", newURL);

    newPage();
}
