import { UserID, LobbyID, LobbyClientLeftMessage } from './lobby.schema';

export type GameID = string;
export type SessionID = string;
export type TournamentID = string;
export type UserInfo = { user_id: UserID, username: string };

export interface TournamentByedMessage {
	type: "byed",
	msg: {
		player: UserInfo,
	}
}

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
		p1: UserInfo,
		p2: UserInfo,
		game_id: GameID,
	}
}

export interface TournamentGameFinishedMessage {
	type: "game_finished",
	msg: {
		p1: {
			user_info: UserInfo,
			points: number,
		}
		p2: {
			user_info: UserInfo,
			points: number,
		}
		game_id: GameID,
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
		rankings: Array<{ user_info: UserInfo, score: number }>,
	}
}

export type TournamentNextRoundStart = {
	type: "next_round_starting",
	msg: {},
}

export type TournamentMessage = TournamentStartMessage
	| TournamentGameFinishedMessage
	| TournamentGoToBracketMessage
	| TournamentGoToGameMessage
	| TournamentGameStartingMessage
	| TournamentFinishedMessage
	| TournamentByedMessage
	| TournamentNextRoundStart
	| LobbyClientLeftMessage;
