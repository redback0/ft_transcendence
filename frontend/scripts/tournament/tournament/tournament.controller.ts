import { ClientTournamentMessage, GameID, TournamentID, TournamentMessage, UserInfo } from "../../tournament.schema.js";
import { LobbyJoinPage } from "../lobby/lobby.template.js";
import { TournamentPage } from "./tournament.template.js";
import { newPage, setCurrentPage } from "../../index.js";

type Matchup = { 
    data: { p1: UserInfo, p2: UserInfo, game_id: GameID },
    html: { text: HTMLParagraphElement, button: HTMLButtonElement },
};

const matchup_text_style = " text-white font-bold py-2 px-4";
const matchup_button_style = " ";
const matchup_button_text = "👁️";

export class TournamentArea {
    page: TournamentPage;
    tourney_id: TournamentID;
    ws: WebSocket;
	me: UserInfo | undefined;
    // need to store references to HTML instead of using document.getElementById()
    // because we sometimes make changes to the html while the Game page is showing
    current_games_div: HTMLDivElement | undefined;
    matchups: Matchup[];
    byed_html: HTMLParagraphElement | undefined;
    spectating: GameID | undefined;
    game: GameID | undefined;

	constructor(page: TournamentPage, lobby_info?: { page: LobbyJoinPage, room_code: TournamentID }) {
        if (!lobby_info) {
            let searchParams = new URLSearchParams(window.location.search);
            let bracket_id = searchParams.get("bracket_id");
            if (!bracket_id)
                throw Error("no room code. L"); // error page
            console.log(`requesting ws: '/wss/tournament/${bracket_id}'`);
            this.ws = new WebSocket("/wss/tournament/" + bracket_id);
            this.tourney_id = bracket_id;
        } else {
            this.tourney_id = lobby_info.room_code;
            this.ws = lobby_info.page.lobby.ws;
            window.removeEventListener("popstate", lobby_info.page.lobby.disconnectOnPop);
            if (!lobby_info.page.lobby.lobby_host)
                throw new Error("no host");
            //this.tournament_host = lobby_info.page.lobby.lobby_host;
            this.me = <UserInfo>lobby_info.page.lobby.me;
            //this.players = lobby_info.page.lobby.players.map(p => p.info);
        }
        this.matchups = [];

        this.page = page;
        this.page.innerHTML = `
            <style>
                #nextGameButton:hover {
                    color: var(--color1) !important;
                    background-color: var(--color2);
                    display: inline-block;
                    cursor: pointer;
                }
                #nextGameButton {
                    font-weight: bold;
                    font-size: 3vh;
                    color: var(--color2);
                    text-align: left;
                }
            </style>
            <div>
                <h1 style="font-weight:bold; font-size:10vh; text-align:center !important; background-color:#520404; color:#DED19C; margin-bottom: 3vh; margin-top: 6vh">TOURNAMENT</h1>
                <div style="margin-top: 3vh;">
                    <h1 style="text-align:center; font-weight:bold; font-size:5vh; color:#520404">MATCHUPS:</h1>
                    <div id="table-matchups" class="flex flex-col justify-center items-center"></div>
                    <div id="byed-div" class="flex flex-col justify-center items-center"></div>
                    <div style="text-align: center;">
                        <button type="button" id="nextGameButton">JOIN NEXT GAME -></button>
                    </div>
                </div>
            </div>
        `;

        this.log(`me: ${this.me?.username}`);
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
                let join_button = document.getElementById("nextGameButton");
                if (join_button)
                    (<HTMLButtonElement>join_button).disabled = false;
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
                let matchup = this.matchups.find(e => { return e.data.game_id === msg.game_id });
                if (matchup) {
                    matchup.html.button.disabled = true;
                    if (msg.p1.points > msg.p2.points)
                        matchup.html.text.textContent = `👑 ${msg.p1.user_info.username} (${msg.p1.points}) vs. ${msg.p2.user_info.username} (${msg.p2.points})`;
                    else
                        matchup.html.text.textContent = `${msg.p1.user_info.username} (${msg.p1.points}) vs. 👑 ${msg.p2.user_info.username} (${msg.p2.points})`;
                } else {
                    console.error("spectate button opr text not found");
                    break;
                }
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
                this.displayWinners(msg.rankings);
            break;
            case "byed":
                this.log(`${msg.player.username} has been byed`);
                this.addByedPlayer(msg.player);
            break;
            case "next_round_starting":
                this.log("next round starting...");
                if (!this.current_games_div || !this.byed_html) {
                    console.error("missing html from page ???");
                    break;
                }
                this.current_games_div.innerHTML = '';
                this.byed_html.innerHTML = '';
                this.matchups = [];
            break;
            case "you_are": {
                this.log(`me: ${msg.you}`);
                this.me = msg.you;
                break;
            }
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
        let join_button = document.getElementById("nextGameButton");
        if (join_button)
            (<HTMLButtonElement>join_button).disabled = true;
        setTimeout(() => {
            history.pushState({}, "", "/tournament/bracket?bracket_id=" + this.tourney_id);
            setCurrentPage(this.page, TournamentPostLoad);
        }, 3000);
    }

    stopSpectating = () => {
        setTimeout(() => {
                this.spectating = undefined;
                history.pushState({}, "", "/tournament/bracket?bracket_id=" + this.tourney_id);
                setCurrentPage(this.page, TournamentPostLoad);
            }, 3000);
        }

    addByedPlayer = (player: UserInfo) => {
        if (!this.byed_html) {
            console.error("");
            return;
        }
        const byed_html = `
			<div class="flex items-center gap-4 p-3 bg-[#520404] mb-2" style="height: 5vh;">
				<div class="profile-container flex items-center gap-4" style="padding-left:1rem;">
                    <a id="byed-${player.user_id}" class="profile-name font-bold text-[#DED19C]" style="font-size:1.25rem"></a>
                </div>
            </div>
        `;
        this.byed_html.innerHTML = byed_html;
        let byed_p = this.byed_html.querySelector(`#byed-${player.user_id}`);
        if (byed_p) {
            byed_p.textContent = `${player.username} was byed`;
        }
    }

    addMatchup = (p1: UserInfo, p2: UserInfo, game_id: GameID) => {
        const matchup_html = `
			<div class="flex items-center gap-4 p-3 bg-[#520404] mb-2" style="height: 5vh;">
				<div class="profile-container flex items-center gap-4" style="padding-left:1rem;">
					<p id="text-${p1.user_id}-vs-${p2.user_id}" class="profile-name font-bold text-[#DED19C]" style="font-size:1.25rem"></p>
				</div>
				<div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0" style="margin-left:auto; padding-right:1rem;">
					<div class="relative inline-block text-left">
						<button id="spectate-button-${p1.user_id}-vs-${p2.user_id}" class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold">SPECTATE -></button>
					</div>		
				</div>
			</div>
		`;

        if (!this.current_games_div) {
            console.error("no table-matchups elem");
            return;
        }
        this.current_games_div.innerHTML += matchup_html;
    
        let spectate_button = this.current_games_div.querySelector(`#spectate-button-${p1.user_id}-vs-${p2.user_id}`);
        //var spectate_button = document.getElementById(`spectate-button-${p1.user_id}-vs-${p2.user_id}`);
        if (!spectate_button) {
            console.error("no spectate button");
            return;
        }
        spectate_button.addEventListener("click", () => {
            this.spectateGame(game_id);
        });
        if (!this.me || game_id === this.game || p1.user_id === this.me.user_id || p2.user_id === this.me.user_id) {
            (<HTMLButtonElement>spectate_button).disabled = true;
        }

        let text = this.current_games_div.querySelector(`#text-${p1.user_id}-vs-${p2.user_id}`);
        if (!text) {
            console.error("no matchup text");
            return;
        }
        text.textContent = `${p1.username} vs. ${p2.username}`;

        this.matchups.push({ 
            data: { p1, p2, game_id },
            html: { text: <HTMLParagraphElement>text, button: <HTMLButtonElement>spectate_button},
        });
    }

    displayWinners = (rankings: { user_info: UserInfo, score: number }[]) => {
        let winners_div = document.createElement('div');
        
        let i = 1;
        for (let ranking of rankings) {
            this.log(`${ranking.user_info.username} (${ranking.score})`);
            let ranking_text = document.createElement('a');
            ranking_text.textContent = `${i}. ${ranking.user_info.username} (${ranking.score})`;
            ++i;
            winners_div.appendChild(ranking_text);
        }

    }

    log = (msg: any) => {
        console.log(msg);
        var p = document.createElement("p");
        p.innerText = msg;
        //this.page.appendChild(p);
    }
}

// this is fine
export function TournamentPostLoad(page: HTMLElement) {
    let tournament_page = <TournamentPage>page;
    let join_button_maybe = document.getElementById('nextGameButton');
    if (join_button_maybe) {
        let join_button = <HTMLButtonElement>join_button_maybe;
        join_button.disabled = tournament_page.bracket_area.game === undefined;
        join_button.onclick = (ev: MouseEvent) => {
            if (tournament_page.bracket_area.game)
                tournament_page.bracket_area.joinGame();
        };
    }    

    let current_games_div = document.getElementById("table-matchups");
    if (!current_games_div) {
        console.log("no current_games_div");
        return;
    }
    tournament_page.bracket_area.current_games_div = <HTMLDivElement>current_games_div;

    let byed_div = document.getElementById("byed-div");
    if (!byed_div) {
        console.log("no byed-div");
        return;
    }

    tournament_page.bracket_area.byed_html = <HTMLDivElement>byed_div;
    tournament_page.bracket_area.ws.onmessage = tournament_page.bracket_area.wsMessage;
    let msg: ClientTournamentMessage = { type: "ready" };
    tournament_page.bracket_area.ws.send(JSON.stringify(msg));
}