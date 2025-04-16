
import { WebSocketServer, WebSocket } from 'ws';

export function initWebSocket(fastify: any)
{
    var wss = new WebSocketServer({ server: fastify.server, path: '/wss/chat' });

    wss.on("connection", (ws: WebSocket) =>
    {
        // console.log("new client");

        ws.on("message", function (data, isBinary: boolean)
        {
            const message = isBinary ? data : data.toString();
            // console.log(`message recieved: ${message}`);
            // this.send(message, {binary: isBinary});
            wss.clients.forEach(socket => {
                socket.send(message, {binary: isBinary});
            });
        });

        ws.on("close", function (code, reason)
        {
            // console.log("connection closed");
        })
    });
}
