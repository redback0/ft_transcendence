import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "./database";

const friends = [
	{ username: "poopy", profilePicture: "./assets/images/profilePics/friend1.jpg" },
	{ username: "coopy", profilePicture: "./assets/images/profilePics/friend2.jpg" },
	{ username: "friend3", profilePicture: "./assets/images/profilePics/friend3.jpg" },
	{ username: "orphan100rox", profilePicture: "./assets/images/profilePics/friend4.jpg" },
	{ username: "momotheally", profilePicture: "./assets/images/profilePics/friend5.jpg" },
	{ username: "3amtoes", profilePicture: "./assets/images/profilePics/friend6.jpg" }
  ]

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

async function ListUsers(request: FastifyRequest, reply: FastifyReply)
{

}


export async function registerRoutes(fastify: FastifyInstance)
{
	fastify.get('/api/friends', async (request: FastifyRequest, reply: FastifyReply) => {
		reply.send(friends);
	});
}