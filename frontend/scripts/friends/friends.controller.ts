import { formatDiagnostic } from "typescript";

export function LoginPostLoad(page: HTMLElement)
{
	fetchFriends();
	// TODO: Load friends into id="table-friends"


}

// TODO
// export function messageUserButtonClick(user: string) {}

// TODO
// export function blockUserButtonClick (me: string, them: string) {}

// TODO
// export function defriendButtonClick (me: string, them: string) {}

// TODO or posibly remove. 
// export function playGameWithUserClick (user: string) {}

async function fetchFriends(): Promise <any[]> {
	try
	{
		const response = await fetch('/api/friends') 
		if (!response)
		{
			throw new Error(`Cannot find friends`);
		}
		const data = await response.json();
		return data;
	}
	catch (error)
	{
		console.error(`Cannot find friends`, error);
		return [];
	}
}

	// REFERENCE only for help
	// sendInfoResponse = (ws: TournamentWebSocket) => {
	// 	if (!this.host || !this.host.user_info || !ws.user_info)
	// 		return;
	// 	const clients: UserInfo[] = [];
	// 	this.wss.clients.forEach((client) => {
	// 		if (client.user_info)
	// 			clients.push(client.user_info);
	// 	});
