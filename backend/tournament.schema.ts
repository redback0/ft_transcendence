import { ClientUUID, RoomCode, LobbyClientLeftMessage } from './lobby.schema';

export type GameID = string;
export type BracketId = string;

export interface TournamentStartMessage {
	type: "tournament_starting",
	msg: {
		room_code: RoomCode,
	},
}

export interface TournamentGoToGameMessage {
	type: "go_to_game",
	msg: {
		game_id: GameID,
	},
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
		bracket_id: BracketId, // TODO: this is tem
	}
}

export type TournamentMessage = TournamentStartMessage
	| TournamentGameFinishedMessage
	| TournamentGoToBracketMessage
	| TournamentGoToGameMessage
	| LobbyClientLeftMessage;


