
import { WebSocketServer, WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
// declare const fastify: FastifyInstance;

class HBWebSocket extends WebSocket
{
    isAlive: boolean = true;
}

export function initChat(fastify: FastifyInstance)
{
    const wss = new WebSocketServer({
        WebSocket: HBWebSocket,
        server: fastify.server,
        path: '/wss/chat'
    });

    wss.on("connection", function (ws: HBWebSocket)
    {
        // console.log("new client");

        ws.on("message", function (data, isBinary: boolean)
        {
            const message = isBinary ? data : data.toString();
            // console.log(`message recieved: ${message}`);
            // this.send(message, {binary: isBinary});
            wss.clients.forEach(ws => {
                ws.send(message, {binary: isBinary});
            });
        });

        ws.on("close", function (code, reason)
        {
            // console.log("connection closed");
        });

        ws.on("pong", function (buffer)
        {
            ws.isAlive = true;
        });
    });

    const interval = setInterval(() =>
    {
        wss.clients.forEach(ws => {
            if ((<any>ws).isAlive === false)
            {
                // console.debug("client failed to ping");
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        })
    }, 30000)
}

