import { renderFriendsTable } from "./friends.render.js";
import { onPageChange } from "../index.js";
import {t} from '../translation.js';

export async function refreshFriendsTable()
{
	const tableContainer = document.getElementById('table-friends');
	if (!tableContainer) return;

	const friends = await fetchFriends();
	if (friends.length > 0)
	{
		renderFriendsTable(friends);
		attachBlockListeners();
	}
	else
	{
		tableContainer.innerHTML = `<p style="text-align:center; color:#520404;">
			${t('noFriends')}
		</p>`;
	}
}

export async function FriendsPostLoad(page: HTMLElement)
{
	try
	{
		window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

		await refreshFriendsTable();
				const handleHeartbeatSuccess = async () => {
			await refreshFriendsTable();
		};
		window.addEventListener('heartbeat-success', handleHeartbeatSuccess);
				const cleanup = () => {
			window.removeEventListener('heartbeat-success', handleHeartbeatSuccess);
		};
		onPageChange(cleanup);

		const addBtn = document.getElementById('friends-redHover');
		if (addBtn) {
			addBtn.addEventListener('click', async () => {
				await routeRequestFriendship();
				await refreshFriendsTable();
			});
		}

		const form = document.getElementById('addFriend') as HTMLFormElement;
		if (form)
		{
			form.addEventListener('submit', async (event) => {
				event.preventDefault();
				await routeRequestFriendship();
				await refreshFriendsTable();
			});
		}
	}
	catch (err)
	{
		console.error('[FriendsPostLoad] initialization failed', err);
	}
}

export async function fetchFriends(): Promise <any[]>
{
	try
	{
		const response = await fetch('/api/friends/withOnlineStatus', {
			headers: { 'Cache-Control': 'no-store' }
		});
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
	const errorMsg = document.getElementById('friend-error');
	const successMsg = document.getElementById('friend-success');

	if (errorMsg) errorMsg.style.display = 'none';
	if (successMsg) successMsg.style.display = 'none';
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
			if (errorMsg) errorMsg.style.display = '';
			return ;
		}
		if (successMsg) {
			successMsg.style.display = '';
			setTimeout(() => {
				const againSuccess = document.getElementById('friend-success');
				if (againSuccess) againSuccess.style.display = 'none';
			}, 5000);
		}
		input.value = '';
	}
	catch (error)
	{
		if (errorMsg) errorMsg.style.display = '';
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
		await refreshFriendsTable();
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
		await refreshFriendsTable();
	}
	catch (error)
	{
		console.error('Error: Cannot unblock user', error);
	}
}

export async function getUserIdFromUsername(username: string): Promise<string | null>
{
	try {
		const response = await fetch('/api/friends/getUserIdFromUsername', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username })
		});
		if (!response.ok)
		{
			return null;
		}
		const data = await response.json();
		return data.user_id || null;
	}
	catch (error)
	{
		console.error('Cannot return user_id from username:', error);
		return null;
	}
}

/*
const status = await fetchBlockStatus('friend_id');
if (status)
{
	console.log('I blocked them:', status.friendsIBlocked);
	console.log('They blocked me:', status.friendsWhomBlockedMe);
}
 */
export async function fetchBlockedStatus(friendUserId: string)
{
	console.log(`getBlockedStatus() of userid: ${friendUserId}`);
	try
	{
		const response = await fetch('/api/friends/getBlockStatusBoolean', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ friendUserId })
		});
		if (!response.ok)
		{
			console.error(`Error: cannot find "friend", are they imaginary?.`);
			return ;
		}
		return await response.json();
	}
	catch (error)
	{
		console.error(`Error: Cannot getBlockedStatus().`);
		return ;
	}
}


/*
 * 
Use:
const data = await response.json();
return data.blockedFriends;
 */
export async function fetchBlockedFriends()
{
		console.log(`fetchBlockedFriends()`);
	try
	{
		const response = await fetch('/api/friends/getBlockStatusArray');
		if (!response.ok)
		{
			console.error(`Error: cannot find "friend", are they imaginary?.`);
			return [];
		}
		const data = await response.json();
		return data.blockedFriends;
	}
	catch (error)
	{
		console.error(`Error: Cannot fetchBlockedFriends().`);
		return [];
	}
}

export async function defriendFriend(friendUserId: string)
{
	console.log(`DEFRIEND: Their userid is: ${friendUserId}`);
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
		await refreshFriendsTable();
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