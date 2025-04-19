
import { WebSocketServer, WebSocket } from "ws";
import { FastifyInstance } from "fastify";

class GameWebSocket extends WebSocket
{
    isAlive: boolean = true;
}

export function initGame(fastify: FastifyInstance)
{
    const wss = new WebSocketServer({
        WebSocket: GameWebSocket,
        server: fastify.server,
        path: "/wss/game"
    });
    
    wss.on("connection", function (ws: GameWebSocket)
    {

        ws.on("message", function (data, isBinary)
        {
            const message = isBinary ? data : data.toString();

            // process ?json
        });

        ws.on("close", function (code, reason)
        {
            // nothing to do atm
        });

        ws.on("pong", function ()
        {
            ws.isAlive = true;
        });
    });


    // simple ping as a heartbeat for the connection
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
    }, 1000)
}
