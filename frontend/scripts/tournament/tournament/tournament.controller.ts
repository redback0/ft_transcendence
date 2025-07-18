import { ClientUUID } from "../../lobby.schema.js";
import { GameID, TournamentMessage } from "../../tournament.schema.js";
import { LobbyJoinPage } from "../lobby/lobby.template.js";
import { TournamentPage } from "./tournament.template.js";
import { newPage, setCurrentPage } from "../../index.js";

const matchup_button_style = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

export class TournamentArea {
    page: TournamentPage;
    ws: WebSocket;
	tournament_host: ClientUUID;
	me: ClientUUID;
	players: ClientUUID[];
    current_games_div: HTMLDivElement;
    matchups: HTMLDivElement[];

	constructor(page: TournamentPage, lobby_page: LobbyJoinPage) {
        this.page = page;
        this.ws = lobby_page.lobby.ws;
		this.ws.onmessage = this.wsMessage;
        window.removeEventListener("popstate", lobby_page.lobby.disconnectOnPop);
        this.tournament_host = lobby_page.lobby.lobby_host;
        this.me = lobby_page.lobby.me;
        this.players = lobby_page.lobby.players;
        this.current_games_div = document.createElement('div');
        this.current_games_div.className = "flex-col";
        this.matchups = [];
        this.page.appendChild(this.current_games_div);
        this.log(`me: ${this.me}, host: ${this.tournament_host}, everyone: ${this.players}`);
	}

    wsMessage = (ev: MessageEvent) => {
        if (typeof ev.data !== "string")
            throw new Error("Unknown data recieved on WebSocket");
		
		// TODO: need a safer way to parse json, this would be bad if data is not a LobbyMessage
        // TODO: handle new_host message
		const data: TournamentMessage = JSON.parse(ev.data);
        const { type, msg } = data;
        switch (type) {
            case "go_to_game":
                this.log(`going to game: ${msg.game_id}`);
                this.goToGame(msg.game_id);
            break;
            case "game_starting":
                this.log(`game starting: ${msg.game_id}; (${msg.p1}) vs. (${msg.p2})`);
                this.addMatchup(msg.p1, msg.p2);
            break;
            case "game_finished":
                this.log(`game finished (${msg.p1.uuid} vs. ${msg.p2.uuid}): ${msg.p1.points} ${msg.p2.points}`);
            break;
            case "go_to_bracket":
                setTimeout(() => {
                    history.pushState({}, "", "/tournament/bracket?bracket_id=" + data.msg.tourney_id);
                    setCurrentPage(this.page);
                }, 3000);
            break;
            case "client_left":
                this.log(`client left: ${msg.client}`);
            break;
            case "tournament_finished":
                this.log(`tournament finished`);
                for (let ranking of msg.rankings) {
                    this.log(`${ranking.name} (${ranking.score})`);
                }
            break;
            case "byed":
                this.log(`${msg.player} has been byed`);
            break;
            default:
                this.log("Unrecognised message from server");
        }
    }

    goToGame = (game_id: GameID) => {
        let seconds_passed = 0;
        this.log(3);
        let interval = setInterval(() => {
            seconds_passed++;
            if (seconds_passed == 3) {
                clearInterval(interval);
                const newURL = "/game/online?id=" + game_id;
                history.pushState({}, "", newURL);
                newPage();
            }
            this.log(3 - seconds_passed);
        }, 1000)
    }

    addMatchup = (p1: ClientUUID, p2: ClientUUID) => {
        var div = document.createElement('div');
        div.className = "flex-row";

        var matchup_text = document.createElement('p');
        matchup_text.innerText = `${p1} vs. ${p2}`;

        var spectate_button = document.createElement('button');
        spectate_button.className = matchup_button_style;
        spectate_button.textContent = "👁️"; // lmao
        spectate_button.addEventListener("click", () => {
            console.log("TODO: go to game to specteate or smth");
        });

        div.appendChild(matchup_text);
        div.appendChild(spectate_button);
        this.matchups.push(div);
        this.current_games_div.appendChild(div);
    }

    log = (msg: any) => {
        console.log(msg);
        var p = document.createElement("p");
        p.innerText = msg;
        this.page.appendChild(p);
    }
}