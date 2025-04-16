
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { initWebSocket } from './game.js';

const fastify: FastifyInstance = Fastify({});
// all the requests to the backend should go through /api
fastify.get('/api/buttonpressed', function handler (request, reply)
{
    reply.send({ text: "server response!!" });
})

// Run the fastify!
const start = async () =>
{
    try
    {
        initWebSocket(fastify);
        fastify.log.info("now listening...");
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    }
    catch (err)
    {
        fastify.log.error(err);
        process.exit(1);
    }
}

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
