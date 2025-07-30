import { WebSocketServer, WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';

class HBWebSocket extends WebSocket
{
    isAlive: boolean = true;
}

export const chatWebSocketServer = new WebSocketServer({
    WebSocket: HBWebSocket,
    noServer: true,
    path: '/wss/chat'
});

export function initChat()
{

    chatWebSocketServer.on("connection", function (ws: HBWebSocket)
    {
        console.log("new client");

        ws.on("message", function (data, isBinary: boolean)
        {
            const message = isBinary ? data : data.toString();
            console.log(`message recieved: ${message}, ${isBinary}`);
            // this.send(message, {binary: isBinary});
            chatWebSocketServer.clients.forEach(ws => {
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
        chatWebSocketServer.clients.forEach(ws => {
            if ((<any>ws).isAlive === false)
            {
                console.debug("client failed to ping (chat)");
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        })
    }, 30000)
}