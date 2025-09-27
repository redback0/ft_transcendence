import { formatDiagnostic } from "typescript";

export function FriendsPostLoad(page: HTMLElement)
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

export async function fetchFriends(): Promise <any[]> {
	try
	{
		const response = await fetch('/api/friends');
		if (!response.ok)
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

export async function routeRequestFriendship()
{
	const input = document.getElementById('friends-user-search') as HTMLInputElement;
	if (!input)
		return ;
	const friendUsername = input.value;

	try
	{
		const response = await fetch(`/api/friends/request`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ friendUsername })
		});
		if (!response.ok)
		{
			return ;
		}
	}
	catch (error)
	{
		return ;
	}
}

export async function blockFriend(friendUserId: string)
{
	try
	{
		const response = await fetch('/api/friends/block', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ friendUserId })
		});
		if (!response.ok)
		{
			console.error(`Error: cannot block user`);
			return; 
		}
	}
	catch (error)
	{
		console.error('Error: Cannot block user', error);
	}
}

export async function unblockFriend(friendUserId: string)
{
	try
	{
		const response = await fetch('/api/friends/unblock', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ friendUserId })
		});
		if (!response.ok)
		{
			console.error(`Error: cannot unblock user`);
			return; 
		}
	}
	catch (error)
	{
		console.error('Error: Cannot unblock user', error);
	}
}

export async function defriendFriend(friendUserId: string)
{
	try
	{
		const response = await fetch('/api/friends/defriend', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ friendUserId })
		});
		if (!response.ok)
		{
			console.error(`Error: cannot defriend user`);
			return; 
		}
	}
	catch (error)
	{
		console.error('Error: Cannot defriend user', error);
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

document.addEventListener('DOMContentLoaded', async () => {
	const friends = await fetchFriends();
	
	const addBtn = document.getElementById('friends-redHover');
	if (addBtn)
		addBtn.addEventListener('click', routeRequestFriendship);

});

export function attachBlockListeners()
{
	document.querySelectorAll('button[data-action]').forEach(btn => {
		btn.addEventListener('click', function(event)
		{
			const target = event.currentTarget as HTMLButtonElement;
			const theirUserId = target.getAttribute('data-userid');
			const action = target.getAttribute('data-action');
			if (theirUserId && action === 'block')
				blockFriend(theirUserId);
			else if (theirUserId && action === 'unblock')
				unblockFriend(theirUserId);
			else if (theirUserId && action == 'defriend')
				defriendFriend(theirUserId);
			else
				return ;
		});
	});
}