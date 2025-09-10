
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
//import { initChat, chatWebSocketServer } from './chat.js';
import * as Chat from './betterchat.js';
import cookie, { fastifyCookie } from '@fastify/cookie';
import * as Game from './game.js';
import { registerCookieRoutes, sidToUserIdAndName, validateSession } from './cookie.js';
// export const db = new Database('/database/pong.db');
export const fastify: FastifyInstance = Fastify({ logger: true });
import * as User from './user.js';
import * as Lobby from './lobby.js';
import { SESSION_ID_COOKIE_NAME } from './cookie';
import * as Tournament from './tournament.js';
// all the requests to the backend should go through /api
fastify.get('/api/buttonpressed', function handler(request, reply)
{
    reply.send({ text: "server response!!" });
});

fastify.register(Game.gameInit);
fastify.register(Lobby.lobbyInit);
fastify.register(cookie);
fastify.register(registerCookieRoutes);
fastify.register(User.registerRoutes);

// Run the fastify!
const start = async () =>
{
    try
    {
        Chat.initChat();
        fastify.log.info("now listening...");
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    }
    catch (err)
    {
        fastify.log.error(err);
        process.exit(1);
    }
}

// TODO: display error page when client request a lobby that does not exist (this issue probably affects games too)
// NOTE: since Tournaments reuse the websockets of a Lobby, they get created by a Lobby, not here
fastify.server.on("upgrade", async function (req, socket, head)
{
    // if (!req.url)
    //     return;
    // console.log(req.url);
    // const { pathname } = new URL(req.url);

    const sid_cookie = req.headers?.cookie?
        fastifyCookie.parse(<string>req.headers.cookie)[SESSION_ID_COOKIE_NAME] :
        undefined;
    const user_info = sid_cookie? await sidToUserIdAndName(sid_cookie): undefined;

    if (req.url === '/wss/chat')
    {
         Chat.chatWebSocketServer.handleUpgrade(req, socket, head, function done(ws)
         {
            (ws as Chat.HBWebSocket).uid = user_info?.user_id;
            (ws as Chat.HBWebSocket).username = user_info?.username;
             Chat.chatWebSocketServer.emit('connection', ws, req);
         });
    }
    else if (req.url?.startsWith('/wss/game'))
    {
        const id = req.url.substring("/wss/game/".length)
        if (id === "")
            return; // no ID given
        const gameServer = Game.gameWebSocketServers.get(id)?.wss;
        if (!gameServer)
            return; // invalid game
        gameServer.handleUpgrade(req, socket, head, function done(ws)
        {
            (ws as Game.GameWebSocket).uid = user_info?.user_id;
            gameServer.emit('connection', ws, req);
        });
    }
    else if (req.url?.startsWith('/wss/lobby'))
    {
        const room_code = req.url.substring("/wss/lobby/".length);
        if (room_code === "")
            return;
        const lobbyServer = Lobby.lobbyWebSocketServers.get(room_code)?.wss;
        if (!lobbyServer) {
            return;
        }
        if (!user_info)
            return;
		let already_here = false;
		lobbyServer.clients.forEach((c) => {
			if (user_info.user_id === c.user_info?.user_id) {
				already_here = true;
			}
		});
        if (already_here) {
            return;
        }
        lobbyServer.handleUpgrade(req, socket, head, function done(ws) {
            ws.user_info = user_info;
            lobbyServer.emit('connection', ws, req);
        });
    }
    else if (req.url?.startsWith('/wss/tournament'))
    {
        const bracket_id = req.url.substring("/wss/tournament/".length);
        if (bracket_id === "")
            return;
        const tourney = Tournament.tournamentWebSocketServers.get(bracket_id);
        if (!tourney) {
            return;
        }
        if (!user_info)
            return;
        if (tourney.players.every(player => player.user_id !== user_info.user_id)) {
            console.warn("refusing connection: not part of this tournament");
            return;
        }
        let already_here = false;
		tourney.wss.clients.forEach((c) => {
			if (user_info.user_id === c.user_info?.user_id) {
				already_here = true;
			}
		});
        if (already_here) {
            return;
        }
        tourney.wss.handleUpgrade(req, socket, head, function done(ws) {
            ws.user_info = user_info;
            tourney.wss.emit('connection', ws, req);
        });
    }
    else
    {
        socket.destroy();
    }
})

// these 2 functions are so the server will close nicely with docker
process.on('SIGINT', () =>
{
    Game.gameWebSocketServers.forEach((v, k, m) =>
    {
        v.wss.close();
    });
    // chatWebSocketServer.close();
    process.exit(0);
})
process.on('SIGTERM', () =>
{
    process.exit(0);
})

start();
