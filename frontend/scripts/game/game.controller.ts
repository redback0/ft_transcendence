
import { newPage } from "../index.js"
import { api } from "../api.js";

interface CreateGameResponse
{
    success: boolean,
    id?: string
}

export async function CreateOnlineGame(e: MouseEvent)
{
    if (e.target instanceof HTMLButtonElement)
        e.target.disabled = true;
    const game = await api<CreateGameResponse>("/api/game/create/casual");

    if (!game.success)
    {
        if (e.target instanceof HTMLButtonElement)
            e.target.disabled = false;
        console.log("create game request failed");
        return ;
    }

    const newURL = "/game/online?id=" + game.id;

    history.pushState({}, "", newURL);
    newPage();
}

export function LocalGame(e: MouseEvent)
{
    const newURL = "/game/local";

    history.pushState({}, "", newURL);
    newPage();
}
