import { RoomCode } from "./lobby.schema";

export interface TournamentStartMessage {
	type: "tournament_starting",
	msg: {
		room_code: RoomCode,
	},
}

export type TournamentMessage = TournamentStartMessage;
