import { LOG_FRONTEND_HEARTBEATS } from './index.js'

let heartBeatInterval: number | null = null;
let heartBeatIntervalInit: number = 10000; // 10 seconds
let currentUsername: string | null = null;

export async function initialiseHeartbeat(): Promise<void>
{
	try
	{
		const response = await fetch('/api/user/session', {
			method: 'GET',
			credentials: 'include'
		});
		
		if (response.ok)
		{
			if (LOG_FRONTEND_HEARTBEATS === true)
				console.log(`Heartbeat function initialiseHeartbeat(): Starting Heartbeat.`);
			const userInfo = await response.json();
			startHeartbeat(userInfo.username);
		}
		else
			if (LOG_FRONTEND_HEARTBEATS === true)
			console.log(`Heartbeat function initialiseHeartbeat(): Cannot find logged in user.`);
	}
	catch (error)
	{
		if (LOG_FRONTEND_HEARTBEATS === true)
			console.error(`Heartbeat function initialiseHeartbeat(): Error checking session:`, error);
	}
}

export function startHeartbeat(username: string): void
{
	if (LOG_FRONTEND_HEARTBEATS === true)
		console.log(`startHeartbeat`);
	if (heartBeatInterval)
		clearInterval(heartBeatInterval);
	currentUsername = username; // Store the username globally
	sendHeartbeat();
	heartBeatInterval = window.setInterval(() => {
		sendHeartbeat();
	}, heartBeatIntervalInit); // 10 seconds
	if (LOG_FRONTEND_HEARTBEATS === true)
		console.log(`Hearbeat started at ${heartBeatIntervalInit} miliseconds for ${username}.`);
}

export function stopHeartbeat(): void
{
	if (heartBeatInterval)
	{
		clearInterval(heartBeatInterval);
		heartBeatInterval = null;
		const user = currentUsername || 'unknown user';
		if (LOG_FRONTEND_HEARTBEATS === true)
			console.log(`Heartbeat stopped for ${user}`);
		currentUsername = null; // Clear the stored username
	}
}

async function sendHeartbeat(): Promise<void>
{
	try
	{
		const response = await fetch('/api/user/heartbeat', {
			method: 'POST',
			credentials: 'include' // Cookies
		});

		if (response.ok)
		{
			if (LOG_FRONTEND_HEARTBEATS === true)
				console.log(`Heartbeat sent for ${currentUsername}`);
			if (window.location.pathname === '/friends')
				window.dispatchEvent(new CustomEvent('heartbeat-success'));
		}
		else
		{
			if (LOG_FRONTEND_HEARTBEATS === true)
				console.warn(`Heartbeat failed:`, response.status);
			// Might be logged out
			if (response.status === 401)
			{
				if (LOG_FRONTEND_HEARTBEATS === true)
					console.log(`Heartbeat failure for ${currentUsername}`);
				stopHeartbeat();
			}
		}
	}
	catch (error)
	{
		if (LOG_FRONTEND_HEARTBEATS === true)
			console.error(`Heartbeat sending error:`, error);
	}
}