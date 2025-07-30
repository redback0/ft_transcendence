
import { newPage } from "../index.js"
import { api } from "../api.js";

interface CreateLobbyResponse
{
    success: boolean,
    room_code?: string
}

export async function CreateLobby(e: MouseEvent)
{
    if (e.target instanceof HTMLButtonElement)
        e.target.disabled = true;
    const lobby = await api<CreateLobbyResponse>("/api/lobby/create");

    if (!lobby.success)
    {
        if (e.target instanceof HTMLButtonElement)
            e.target.disabled = false
        console.log("create lobby request failed");
        return;
    }

    const newURL = "/lobby/join?room_code=" + lobby.room_code;

    history.pushState({}, "", newURL);
    newPage();
}