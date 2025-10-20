import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "./database";
import { Friend } from "./friend.schema";
import { SESSION_ID_COOKIE_NAME, sidToUserIdAndName, getUserInfo } from "./cookie";

export async function checkFriendRecordExists(myId: string, theirId: string): Promise<boolean>
{
		const statement = db.prepare(`SELECT 1 FROM friend WHERE my_id = ? AND friend_id = ? LIMIT 1;`);
		const result = statement.get(myId, theirId);
		if (result)
		{
			console.log(`${myId} has a friend record on ${theirId}`);
			return (true);
		}
		console.log(`${myId} has no friend record on ${theirId}`);
		return (false);
}

export async function setupFriendRecordIfNotExist(myId: string, theirId: string): Promise<boolean>
{
	if (await checkFriendRecordExists(myId, theirId) === true)
	{
		console.log(`Friend record alread exists`);
		return (true);
	}
	try
	{
		db.prepare('BEGIN TRANSACTION').run();
		const statement = db.prepare(`INSERT INTO friend (my_id, friend_id)
			VALUES (?, ?)`);
		statement.run(myId, theirId);
		db.prepare('COMMIT').run();
		console.log(`Friend records setup.`);
		return (true);
	}
	catch (error)
	{
		db.prepare('ROLLBACK').run();
		console.error('Error: Cannot setup friend record.', error);
		return (false);
	}
}

export async function getFriendsFromDatabase(myId: string): Promise<Friend[] | null>
{
	try
	{
		const statement = db.prepare(`SELECT u.user_id, u.username, f.blocked_by_me, f.friend_status FROM users as u INNER JOIN friend as f ON u.user_id = f.friend_id WHERE f.my_id = ?;`);
		const friends = statement.all(myId) as Friend[];
		return (friends);
	}
    catch (error)
    {
		console.log(`Cannot select frinds from database: ${error}`);
		return (null);
	}
}

export async function getFriendsIBlockedFromDatabase(myId: string): Promise<Friend[] | null>
{
	try
	{
		const statement = db.prepare(`SELECT u.user_id, u.username FROM users as u INNER JOIN friend as f ON u.user_id = f.friend_id WHERE f.my_id = ? AND f.blocked_by_me = 1;`);
		const friends = statement.all(myId) as Friend[];
		return (friends);
	}
    catch (error)
    {
		console.log(`Error getFriendsIBlockedFromDatabase: ${error}`);
		return (null);
	}
}

export async function getDidIBlockThemFromDatabase(myId: string, theirId: string): Promise<boolean>
{
	try
	{
		const statement = db.prepare(`SELECT 1 FROM friend WHERE my_id = ? AND friend_id = ? AND blocked_by_me = 1 LIMIT 1;`);
		const result = statement.get(myId, theirId);
		if (result)
		{
			return (true);
		}
		return (false);
	}
    catch (error)
    {
		console.log(`Error getDidIBlockThemFromDatabase: ${error}`);
		return (false);
	}
}

export async function getDidTheyBlockMeFromDatabase(myId: string, theirId: string): Promise<boolean>
{
	try
	{
		const statement = db.prepare(`SELECT 1 FROM friend WHERE my_id = ? AND friend_id = ? AND blocked_by_me = 1 LIMIT 1;`);
		const result = statement.get(theirId, myId);
		if (result)
			return (true);
		return (false);
	}
    catch (error)
    {
		console.log(`Error getDidTheyBlockMeFromDatabase: ${error}`);
		return (false);
	}
}

export async function setIBlockThem(myId: string, theirId: string): Promise<boolean>
{
	await setupFriendRecordIfNotExist(myId, theirId);
	try
	{
		db.prepare(`BEGIN TRANSACTION`).run();
		const statement = db.prepare(`UPDATE friend SET blocked_by_me = 1 WHERE my_id = ? AND friend_id = ?;`);
		statement.run(myId, theirId);
		db.prepare(`COMMIT`).run();
		console.log(`Friend blocked: ${theirId}`);
		return (true);
	}
	catch (error)
	{
		db.prepare('ROLLBACK').run();
		console.error(`Cannot block person ${theirId}`);
		return (false);
	}
}

export async function setIUnblockThem(myId: string, theirId: string): Promise<boolean>
{
	await setupFriendRecordIfNotExist(myId, theirId);
	try
	{
		db.prepare(`BEGIN TRANSACTION`).run();
		const statement = db.prepare(`UPDATE friend SET blocked_by_me = 0 WHERE my_id = ? AND friend_id = ?;`);
		statement.run(myId, theirId);
		db.prepare(`COMMIT`).run();
		console.log(`Friend unblocked: ${theirId}`);
		return (true);
	}
	catch (error)
	{
		db.prepare('ROLLBACK').run();
		console.error(`Cannot unblock person ${theirId}`);
		return (false);
	}
}

// Let's make friends slowly 
export async function checkAreTheyWaitingForFriendAproval(myId: string, theirId: string): Promise<boolean>
{
	console.log("checkAreTheyWaitingForFriendAproval");
	try
	{
		const statement = db.prepare(`SELECT 1 FROM friend WHERE my_id = ? AND friend_id = ? LIMIT 1;`);
		const result = statement.get(theirId, myId);
		console.log(`result: ${result}`);
		if (result)
		{
			console.log(`result is true`);
			return (true);
		}
			console.log(`result is false`);
			return (false);
	}
	catch (error)
	{
		return (false);
	}
}

export async function requestFriendship(myId: string, theirId: string): Promise<boolean>
{
	// Don't need anymore. 
	// if (await getDidTheyBlockMeFromDatabase(myId, theirId) === true)
	// {
	// 	console.log(`There will be cake.`);
	// 	return (false);
	// }

	await setupFriendRecordIfNotExist(myId, theirId);
	await setupFriendRecordIfNotExist(theirId, myId);
	try
	{
		db.prepare(`BEGIN TRANSACTION`).run();
		const statement = db.prepare(`UPDATE friend SET friend_status = 1, blocked_by_me = 0 WHERE my_id = ? AND friend_id = ?;`);
		statement.run(myId, theirId);
		statement.run(theirId, myId);
		db.prepare('COMMIT').run();
		console.log(`Friend request success.`);
		// tryToApproveFriendship(myId, theirId);
		return (true);
	}
	catch (error)
	{
		db.prepare('ROLLBACK').run();
		console.error('Error: Cannot request friendship to create user.', error);
		return (false);
	}
}

// No longer using
export async function tryToApproveFriendship(myId: string, theirId: string): Promise<boolean>
{
	// No longer using. 
	// Check they are ready for the next level with you. 
	// if (await checkAreTheyWaitingForFriendAproval(myId, theirId) === false)
	// {
	// 	console.log(`false yay`);
	// 	return (false);
	// }
	try
	{
		db.prepare('BEGIN TRANSACTION').run();
		let statement = db.prepare(`UPDATE friend SET friend_status = 1 WHERE my_id = ? AND friend_id = ?;`);
		statement.run(myId, theirId);
		statement.run(theirId, myId);
		db.prepare('COMMIT').run();
		console.log(`Friendship paperwork complete between ${myId} and ${theirId}`);
		return (true);
	}
	catch (error)
	{
		db.prepare('ROLLBACK').run();
		console.error(`Error: Cannot approve friendship, probally for the best.`, error);
		return (false);
	}
}


export async function defriend(myId: string, theirId: string): Promise<boolean>
{
	try
	{
		db.prepare('BEGIN TRANSACTION').run();
		let statement = db.prepare(`DELETE FROM friend WHERE my_id = ? AND friend_id = ?`);
		statement.run(myId, theirId);
		statement.run(theirId, myId);
		db.prepare('COMMIT').run();
		return (true);
	}
	catch (error)
	{
		db.prepare('ROLLBACK').run();
		console.error(`Cannot defriend user ${theirId}: `, error);
		return (false);
	}
}