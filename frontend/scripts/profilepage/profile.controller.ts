import { renderMatchesTable, Match } from "./profile.render.js";
import { onPageChange } from "../index.js";

export async function refreshMatchesTable(username: string)
{
	const tableContainer = document.getElementById('table-matches');
	if (!tableContainer) return;

	const matches = await fetchMatches(username);
	if (matches.length > 0)
	{
		renderMatchesTable(matches);
	}
	else
	{
		tableContainer.innerHTML = '<p style="text-align:center; color:#520404;">No matches yet.</p>';
	}
}

export async function ProfilePostLoad(page: HTMLElement)
{
	let searchParams = new URLSearchParams(window.location.search);
	const username = searchParams.get("id");
	if (username)
	{
		try
		{
			window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

			const results = await fetchResults(username);
			const wins = results.wins;
			const losses = results.losses;
			const w = document.getElementById('wins_tally');
			const l = document.getElementById('loss_tally');
			if (w && l)
			{
				w.innerText = wins;
				l.innerText = losses;
			}
			await refreshMatchesTable(username);
					const handleHeartbeatSuccess = async () => {
				await refreshMatchesTable(username);
			};
			window.addEventListener('heartbeat-success', handleHeartbeatSuccess);
					const cleanup = () => {
				window.removeEventListener('heartbeat-success', handleHeartbeatSuccess);
			};
			onPageChange(cleanup);

		}
		catch (err)
		{
			console.error('[MatchesPostLoad] initialization failed', err);
		}
	}
}


export async function fetchMatches(username: string): Promise <any[]>
{
	try
	{
        // const user_href = window.location.href;
        // const username = user_href.replace("https://localhost/users/", "");
		const response = await fetch('/api/userpage/matches', {
            method: 'POST',
			headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username})
		});
		if (!response.ok)
		{
			throw new Error(`Cannot find matches`);
		}
		const data = await response.json();
		return data;
	}
	catch (error)
	{
		console.error(`Cannot find matches`, error);
		return [];
	}
}

export async function fetchResults(username: string)
{
	try
	{
		const response = await fetch('api/users/results', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username})
		});
		if (!response.ok)
		{
			throw new Error(`Cannot find results`);
		}
		const data = await response.json();
		return data;
	}
	catch (error)
	{
		console.error(`Cannot find matches`, error);
		return [];
	}
}