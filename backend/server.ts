
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { initChat, chatWebSocketServer } from './chat.js';
import { initGame, gameWebSocketServer } from './game.js';
import { IncomingMessage } from 'http';

export const fastify: FastifyInstance = Fastify({});
// all the requests to the backend should go through /api
fastify.get('/api/buttonpressed', function handler(request, reply)
{
    reply.send({ text: "server response!!" });
})

// Run the fastify!
const start = async () =>
{
    try
    {
        initChat(fastify);
        initGame(fastify);
        fastify.log.info("now listening...");
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    }
    catch (err)
    {
        fastify.log.error(err);
        process.exit(1);
    }
}

fastify.server.on("upgrade", function (req, socket, head)
{
    // if (!req.url)
    //     return;
    // console.log(req.url);
    // const { pathname } = new URL(req.url);

    if (req.url === '/wss/chat')
    {
        chatWebSocketServer.handleUpgrade(req, socket, head, function done(ws)
        {
            chatWebSocketServer.emit('connection', ws, req);
        });
    }
    else if (req.url === '/wss/game')
    {
        gameWebSocketServer.handleUpgrade(req, socket, head, function done(ws)
        {
            gameWebSocketServer.emit('connection', ws, req);
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
    process.exit(0);
})
process.on('SIGTERM', () =>
{
    process.exit(0);
})

start();
