import { ClientUUID, LobbyID, LobbyClientLeftMessage } from './lobby.schema';

export type GameID = string;
export type TournamentID = string;

export interface TournamentStartMessage {
	type: "tournament_starting",
	msg: {
		room_code: LobbyID,
	},
}

export interface TournamentGoToGameMessage {
	type: "go_to_game",
	msg: {
		game_id: GameID,
	},
}

export interface TournamentGameStartingMessage {
	type: "game_starting",
	msg: {
		p1: ClientUUID,
		p2: ClientUUID,
		game_id: GameID,
	}
}

export interface TournamentGameFinishedMessage {
	type: "game_finished",
	msg: {
		p1: {
			uuid: ClientUUID,
			points: number,
		}
		p2: {
			uuid: ClientUUID,
			points: number,
		}
	}
}

export interface TournamentGoToBracketMessage {
	type: "go_to_bracket",
	msg: {
		tourney_id: TournamentID, // TODO: this is tem
	}
}

export interface TournamentFinishedMessage {
	type: "tournament_finished",
	msg: {
		rankings: Array<{ name: ClientUUID, score: number }>,
	}
}

export type TournamentMessage = TournamentStartMessage
	| TournamentGameFinishedMessage
	| TournamentGoToBracketMessage
	| TournamentGoToGameMessage
	| LobbyClientLeftMessage;


