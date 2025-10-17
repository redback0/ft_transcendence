import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "./database";
import { Friend } from "./friend.schema";
import  { getFriendsFromDatabase, setIBlockThem, defriend, getFriendsIBlockedFromDatabase, getDidIBlockThemFromDatabase, getDidTheyBlockMeFromDatabase, requestFriendship, setIUnblockThem }  from "./friend.logic";
import { SESSION_ID_COOKIE_NAME, sidToUserIdAndName, getUserInfo } from "./cookie";



// Get list of friends
async function routeGetFriends(request: FastifyRequest, reply: FastifyReply)
{
		const myUserId = await getUserInfo(request);
		if (!myUserId)
		{
			reply.code(401).send({ error: `Authenticaion error` });
			return ;
		}
		const friends = await getFriendsFromDatabase(myUserId);
		if (friends)
			reply.send(friends);
		else
			reply.code(500).send({ error: `Cannot find friends` });
}

async function routeRequestFriendship(request: FastifyRequest, reply: FastifyReply)
{
	const myUserId = await getUserInfo(request);
	if (!myUserId)
	{
		reply.code(401).send({ error: `Authenticaion error` });
		return ;
	}
	const { friendUsername } = request.body as { friendUsername: string };
	
	const friendDbObject = db.getUserIdFromUsername.get(friendUsername) as { user_id: string } | undefined;
	if (!friendDbObject)
	{
		reply.code(404).send({ error: `User not found` });
		return ;
	}

	if (myUserId === friendDbObject.user_id)
	{
		reply.code(401).send({ error: `Cannot make friends with yourself` });
		return ;
	}
	
	const result = await requestFriendship(myUserId, friendDbObject.user_id);
	if (result)
		reply.send({ message: `Friend request sent, but why?` });
	else
		reply.code(401).send({ error: `Person doesn't exist or you are blocked from friending this person.` });
}

// Block a friend
async function routeBlockFriends(request: FastifyRequest, reply: FastifyReply)
{
	const myUserId = await getUserInfo(request);
	if (!myUserId)
	{
		reply.code(401).send({ error: "Auth error" });
		return;
	}
	const { friendUserId } = request.body as { friendUserId: string };
	if (!friendUserId)
		{
		reply.code(400).send({ error: "Friend id doesnot exist." });
		return;
	}
	const result = await setIBlockThem(myUserId, friendUserId);
	if (result)
		reply.send({ message: `User ${friendUserId} blocked.` });
	else
		reply.code(500).send({ error: `Failed to block user ${friendUserId}.` });
}

// Block a friend
async function routeUnblockFriends(request: FastifyRequest, reply: FastifyReply)
{
	const myUserId = await getUserInfo(request);
	if (!myUserId)
	{
		reply.code(401).send({ error: "Auth error" });
		return;
	}
	const { friendUserId } = request.body as { friendUserId: string };
	if (!friendUserId)
	{
		reply.code(400).send({ error: "Friend id doesnot exist." });
		return;
	}
	const result = await setIUnblockThem(myUserId, friendUserId);
	if (result)
		reply.send({ message: `User ${friendUserId} blocked.` });
	else
		reply.code(500).send({ error: `Failed to unblock user ${friendUserId}.` });
}

// Defriend
async function routeDefriendFriends(request: FastifyRequest, reply: FastifyReply)
{
	const myUserId = await getUserInfo(request);
	if (!myUserId)
	{
		reply.code(401).send({ error: "Auth error" });
		return;
	}
	const { friendUserId } = request.body as { friendUserId: string };
	if (!friendUserId)
	{
		reply.code(400).send({ error: "Friend id doesnot exist." });
		return;
	}
	const result = await defriend(myUserId, friendUserId);
	if (result)
		reply.send({ message: `User ${friendUserId} defriended.` });
	else
		reply.code(500).send({ error: `Failed to defriend user ${friendUserId}. Seek counciling` });
}

export async function registerRoutes(fastify: FastifyInstance)
{
	fastify.get('/api/friends', routeGetFriends);
	fastify.post('/api/friends/request', routeRequestFriendship);
	fastify.post('/api/friends/block', routeBlockFriends);
	fastify.post('/api/friends/unblock', routeUnblockFriends);
	fastify.post('/api/friends/defriend', routeDefriendFriends);
}