import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "./database";
import { Friend } from "./friend.schema";
import  { getFriendsFromDatabase, getFriendsIBlockedFromDatabase, getDidIBlockThemFromDatabase, getDidTheyBlockMeFromDatabase }  from "./friend.logic";
import { SESSION_ID_COOKIE_NAME, sidToUserIdAndName, getUserInfo } from "./cookie";


const getUsers = {

};

// TODO
// export function messageUserButtonClick(user: string) {}

// TODO
// export function blockUserButtonClick (me: string, them: string) {}

// TODO
// export function defriendButtonClick (me: string, them: string) {}

// TODO or posibly remove. 
// export function playGameWithUserClick (user: string) {}

// export async function registerRoutes(fastify: FastifyInstance)
// {
//     fastify.get('/api/friends', async (request: FastifyInstance, reply: FastifyReply) => {
// 		reply.send(friends);
// 	});
//     fastify.post('/api/friends/block', { schema: getLogin },  LoginUser);
//     fastify.post('/api/friends/defriend', { schema: postChangePw }, ChangePw);
//     fastify.post('/api/friends/message', { schema: postDeleteUser }, DeleteUser);
//     fastify.post('/api/friends/play', { schema: postDeleteUser }, DeleteUser);
// }

// async function ListUsers(request: FastifyRequest, reply: FastifyReply)
// {

// }





export async function registerRoutes(fastify: FastifyInstance)
{
	fastify.get('/api/friends', async (request: FastifyRequest, reply: FastifyReply) => {

		const myUserId = await getUserInfo(request);
		if (!myUserId)
		{
			reply.code(401).send({ error: `Authenticaion error` });
			return ;
		}
		const friends = await getFriendsFromDatabase(myUserId);
		if (friends)
		{
			reply.send(friends);
		}
		else
		{
			reply.code(500).send({ error: `Cannot find friends` });
		}
	});
}