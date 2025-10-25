import { heartBeatLogBoolean } from "./server";
import { db } from "./database";

// Map: userId and last heartbeat timestamp
const onlineUsers = new Map<string, number>();
const ONLINE_TIMEOUT = 15000; // 15 seconds

export function recordUserHeartbeat(userId: string): void
{
	console.log(`recordUserHeartbeat()`);
	const now = Date.now();
	onlineUsers.set(userId, now);
	if (heartBeatLogBoolean === true)
	{	
		const usernameResult = db.getUsernameFromUserId.get(userId) as { username: string } | undefined;
		const username = usernameResult?.username || userId;
		console.log(`Heartbeat recorded for user ${username}`);
	}
	}

export function isUserOnline(userId: string): boolean
{
	console.log(`isUserOnline()`);
	const lastHeartbeat = onlineUsers.get(userId);
	if (!lastHeartbeat)
		return (false);
	const now = Date.now();
	const isOnline = (now - lastHeartbeat) <= ONLINE_TIMEOUT;
	if (!isOnline)
		onlineUsers.delete(userId);
	return (isOnline);
}

export function getOnlineUsers(): string[]
{
	console.log(`getOnlineUsers()`);
	const now = Date.now();
	const onlineUsersList: string[] = [];

	for (const [userId, lastHeartbeat] of onlineUsers.entries())
	{
		if ((now - lastHeartbeat) <= ONLINE_TIMEOUT)
			onlineUsersList.push(userId);
		else
			onlineUsers.delete(userId);
	}
	return (onlineUsersList);
}

export function getOnlineUserCount(): number
{
	console.log(`getOnlineUserCount()`);
	return (getOnlineUsers().length);
}

export function removeUserFromOnline(userId: string): void
{
	console.log(`removeUserFromOnline()`);
	const usernameResult = db.getUsernameFromUserId.get(userId) as { username: string } | undefined;
	const username = usernameResult?.username || userId;
	onlineUsers.delete(userId);
	console.log(`User ${username} removed from online tracking`);
}

export function cleanupExpiredUsers(): void
{
	const now = Date.now();
	const timeString = new Date(now).toLocaleTimeString('en-GB', { hour12: false });
	console.log(`${timeString}: cleanupExpiredUsers()`);
	let cleanedCount = 0;
	
	if (onlineUsers.size === 0)
		console.log(`cleanupExpiredUsers: ${timeString}: No users online.`);

	for (const [userId, lastHeartbeat] of onlineUsers.entries())
	{
		const usernameResult = db.getUsernameFromUserId.get(userId) as { username: string } | undefined;
		const username = usernameResult?.username || userId;

		console.log(`cleanupExpiredUsers: ${timeString}: online users in list: ${username}`);

		if ((now - lastHeartbeat) > ONLINE_TIMEOUT) {
			console.log(`cleanupExpiredUsers: ${timeString}: Delete tracking for user: ${username}`);
			onlineUsers.delete(userId);
			cleanedCount++;
		}
		else
			console.log(`cleanupExpiredUsers: ${timeString}: No users to remove, but they exist.`);
	}
	if (cleanedCount > 0)
		console.log(`cleanupExpiredUsers: ${timeString}: Cleaned up ${cleanedCount} expired users from online tracking`);
	else
		console.log(`cleanupExpiredUsers: ${timeString}: Clear count is 0. No users removed.`);

}