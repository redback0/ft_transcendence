import { GameID, TournamentID, TournamentMessage, UserInfo } from "../../tournament.schema.js";
import { LobbyJoinPage } from "../lobby/lobby.template.js";
import { TournamentPage } from "./tournament.template.js";
import { newPage, setCurrentPage } from "../../index.js";

type Matchup = { 
    data: { p1: UserInfo, p2: UserInfo, game_id: GameID },
    html: { div: HTMLDivElement, text: HTMLParagraphElement, button: HTMLButtonElement },
};

const matchup_text_style = " text-white font-bold py-2 px-4";
const matchup_button_style = " ";
const matchup_button_text = "👁️";

export class TournamentArea {
    page: TournamentPage;
    tourney_id: TournamentID;
    ws: WebSocket;
	tournament_host: UserInfo;
	me: UserInfo;
	players: UserInfo[];
    current_games_div: HTMLDivElement;
    matchups: Matchup[];
    byed_html: HTMLParagraphElement | undefined;
    spectating: GameID | undefined;
    game: GameID | undefined;
    join_button: HTMLButtonElement;

	constructor(page: TournamentPage, lobby_page: LobbyJoinPage, room_code: TournamentID) {
        if (!lobby_page.lobby.lobby_host || !lobby_page.lobby.me) {
            throw new Error("lobbyhost id or my id was undefined :(");
        }
        this.page = page;
        this.tourney_id = room_code;
        this.ws = lobby_page.lobby.ws;
		this.ws.onmessage = this.wsMessage;
        window.removeEventListener("popstate", lobby_page.lobby.disconnectOnPop);
        this.tournament_host = lobby_page.lobby.lobby_host;
        this.me = lobby_page.lobby.me;
        this.players = lobby_page.lobby.players.map(p => p.info);
        
        this.join_button = document.createElement("button");
        this.join_button.innerText = "Join next game";
        this.join_button.disabled = this.game === undefined;
        this.join_button.onclick = (ev: MouseEvent) => {
            if (this.game)
                this.joinGame();
        };
        this.page.appendChild(this.join_button);

        this.current_games_div = document.createElement('div');
        this.current_games_div.className = "flex flex-col justify-center items-center";
        this.page.appendChild(this.current_games_div);
        
        this.matchups = [];
        this.log(`me: ${this.me.username}, host: ${this.tournament_host.user_id}, everyone: ${this.players}`);
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
                this.log(`go to game: ${msg.game_id}`);
                this.game = msg.game_id;
                this.join_button.disabled = false;
            break;
            case "game_starting":
                this.log(`game starting: ${msg.game_id}; (${msg.p1}) vs. (${msg.p2})`);
                this.addMatchup(msg.p1, msg.p2, msg.game_id);
            break;
            case "game_finished":
                if (msg.game_id === this.game) {
                    this.leaveGame();
                } else if (msg.game_id === this.spectating) {
                    this.stopSpectating();
                }
                this.log(`game finished (${msg.p1.user_info.username} vs. ${msg.p2.user_info.username}): ${msg.p1.points} ${msg.p2.points}`);
                var matchup = this.matchups.find((matchup) => { return matchup.data.p1.user_id === msg.p1.user_info.user_id && matchup.data.p2.user_id === msg.p2.user_info.user_id && matchup.data.game_id === msg.game_id;});
                if (!matchup)
                    break;
                matchup.html.button.disabled = true;
                if (msg.p1.points > msg.p2.points)
                    matchup.html.text.textContent = `👑 ${matchup.data.p1.username} (${msg.p1.points}) vs. ${matchup.data.p2.username} (${msg.p2.points})`;
                else
                    matchup.html.text.textContent = `${matchup.data.p1.username} (${msg.p1.points}) vs. 👑 ${matchup.data.p2.username} (${msg.p2.points})`;
            break;
            case "go_to_bracket":
                this.tourney_id = msg.tourney_id;
                if (this.game)
                    this.leaveGame();
                else if (this.spectating)
                    this.stopSpectating();
            break;
            case "client_left":
                this.log(`client left: ${msg.client.username}`);
            break;
            case "tournament_finished":
                this.log(`tournament finished`);
                for (let ranking of msg.rankings) {
                    this.log(`${ranking.user_info.username} (${ranking.score})`);
                }
            break;
            case "byed":
                this.log(`${msg.player.username} has been byed`);
            break;
            case "next_round_starting":
                this.matchups.forEach((matchup) => {
                    this.current_games_div.removeChild(matchup.html.div);
                });
                this.matchups = [];
            break;
            default:
                this.log("Unrecognised message from server");
        }
    }

    joinGame = () => {
        if (!this.game)
            return;
        const newURL = "/game/online?id=" + this.game;
        history.pushState({}, "", newURL);
        newPage();
    }

    spectateGame = (game_id: GameID) => {
        this.spectating = game_id;
        const newURL = "/game/online?id=" + game_id;
        history.pushState({}, "", newURL);
        newPage();
    }

    leaveGame = () => {
        this.game = undefined;
        this.join_button.disabled = true;
        setTimeout(() => {
            history.pushState({}, "", "/tournament/bracket?bracket_id=" + this.tourney_id);
            setCurrentPage(this.page);
        }, 3000);
    }

    stopSpectating = () => {
        setTimeout(() => {
                this.spectating = undefined;
                history.pushState({}, "", "/tournament/bracket?bracket_id=" + this.tourney_id);
                setCurrentPage(this.page);
            }, 3000);
        }

    addMatchup = (p1: UserInfo, p2: UserInfo, game_id: GameID) => {
        var both_div = document.createElement('div');
        both_div.className = "flex flex-row justify-center items-center";

        var matchup_text = document.createElement('p');
        matchup_text.innerText = `${p1.username} vs. ${p2.username}`;
        matchup_text.className = 'flex flex-none' + matchup_text_style;

        var spectate_button = document.createElement('button');
        spectate_button.className = 'flex flex-none' + matchup_button_style;
        spectate_button.textContent = matchup_button_text;
        spectate_button.addEventListener("click", () => {
            this.spectateGame(game_id);
        });
        if (game_id === this.game || p1.user_id === this.me.user_id || p2.user_id === this.me.user_id) {
            spectate_button.disabled = true;
        }

        both_div.appendChild(matchup_text);
        both_div.appendChild(spectate_button);
        this.matchups.push({ 
            data: { p1, p2, game_id },
            html: { div: both_div, text: matchup_text, button: spectate_button },
        });
        this.current_games_div.appendChild(both_div);
    }

    log = (msg: any) => {
        console.log(msg);
        var p = document.createElement("p");
        p.innerText = msg;
        //this.page.appendChild(p);
    }
}