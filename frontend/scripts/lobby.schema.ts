import { UserInfo } from "./tournament.schema";

export type UserID = string;
export type LobbyID = string;

export interface LobbyInfoMessage {
	type: "info",
	msg: {
		whoami: UserInfo,
		host: UserInfo,
		clients: UserInfo[],
	},
}

export interface LobbyNewClientMessage {
	type: "new_client",
	msg: {
		client: UserInfo,
	}
}

export interface LobbyClientLeftMessage {
	type: "client_left",
	msg: {
		client: UserInfo,
	}
}

export interface LobbyNewHostMessage {
	type: "new_host",
	msg: {
		client: UserInfo,
	}
}

export type LobbyMessage = 
	LobbyInfoMessage
	| LobbyNewClientMessage
	| LobbyClientLeftMessage
	| LobbyNewHostMessage;

export interface LobbyInfoRequest {
	type: "infoRequest",
}

export interface LobbyStartRequest {
	type: "startRequest",
}

export interface LobbySessionID {
	type: "session_id",
	msg: {
		session_id: UserInfo,
	}
}

export type LobbyRequest = LobbyInfoRequest
	| LobbyStartRequest;