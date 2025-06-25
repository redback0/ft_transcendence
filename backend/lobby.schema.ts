export type ClientUUID = string | undefined;

export interface LobbyResponse {
	type: "new_client" | "client_left" | "info",
	msg: LobbyInfoResponse | ClientUUID;
}

export interface LobbyInfoResponse {
	whoami: ClientUUID,
	host: ClientUUID,
	clients: ClientUUID[],
}

export interface LobbyRequest {
	type: "infoRequest"
}


