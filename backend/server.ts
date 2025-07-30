
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
//import { initChat, chatWebSocketServer } from './chat.js';
import cookie, { fastifyCookie } from '@fastify/cookie';
import * as Game from './game.js';
import { registerCookieRoutes, sidToUserIdAndName, validateSession } from './cookie.js';
// export const db = new Database('/database/pong.db');
export const fastify: FastifyInstance = Fastify({ logger: true });
import * as User from './user.js';
import * as Lobby from './lobby.js';
import { SESSION_ID_COOKIE_NAME } from './cookie';
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
        // initChat();
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

    // if (req.url === '/wss/chat')
    // {
    //     chatWebSocketServer.handleUpgrade(req, socket, head, function done(ws)
    //     {
    //         chatWebSocketServer.emit('connection', ws, req);
    //     });
    // }
    if (req.url?.startsWith('/wss/game'))
    {
        const id = req.url.substring("/wss/game/".length)
        if (id === "")
            return; // no ID given
        const gameServer = Game.gameWebSocketServers.get(id)?.wss;
        if (!gameServer)
            return; // invalid game
        gameServer.handleUpgrade(req, socket, head, function done(ws)
        {
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
        if (!req.headers?.cookie)
            return;
        const sid_cookie = fastifyCookie.parse(<string>req.headers.cookie)[SESSION_ID_COOKIE_NAME];
        if (!sid_cookie)
            return;
        const user_info = await sidToUserIdAndName(sid_cookie);
        if (!user_info) {
            console.warn("Warning: Invalid session ID from client");
            return;
        }
        lobbyServer.handleUpgrade(req, socket, head, function done(ws) {
            ws.user_info = user_info;
            lobbyServer.emit('connection', ws, req);
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
