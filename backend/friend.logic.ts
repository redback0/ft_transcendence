import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "./database";
import { Friend } from "./friend.schema";
import { SESSION_ID_COOKIE_NAME, sidToUserIdAndName, getUserInfo } from "./cookie";

export async function getFriendsFromDatabase(myId: string): Promise<Friend[] | null>
{
	try
	{
		const statement = db.prepare(`SELECT u.user_id, u.username FROM users as u INNER JOIN friend as f ON u.user_id = f.friend_id WHERE f.my_id = ? AND f.friend_status = 1;`);
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
		console.log(`Cannot select frinds from database: ${error}`);
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
		console.log(`Error getDidTheyBlockMeFromDatabase: ${error}`);
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
		{
			return (true);
		}
		return (false);
	}
    catch (error)
    {
		console.log(`Error getDidTheyBlockMeFromDatabase: ${error}`);
		return (false);
	}
}