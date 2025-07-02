export type ClientUUID = string | undefined;
export type LobbyID = string;

export interface LobbyInfoMessage {
	type: "info",
	msg: {
		whoami: ClientUUID,
		host: ClientUUID,
		clients: ClientUUID[],
	},
}

export interface LobbyNewClientMessage {
	type: "new_client",
	msg: {
		client: ClientUUID,
	}
}

export interface LobbyClientLeftMessage {
	type: "client_left",
	msg: {
		client: ClientUUID,
	}
}

export interface LobbyNewHostMessage {
	type: "new_host",
	msg: {
		client: ClientUUID,
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

export type LobbyRequest = LobbyInfoRequest
	| LobbyStartRequest;