
import { WebSocketServer, WebSocket } from "ws";
import { FastifyInstance } from "fastify";

import * as GameSchema from "./game.schema";
import { GameArea } from "./game.logic";

class GameWebSocket extends WebSocket
{
    isAlive: boolean = true;
}

export const gameWebSocketServer = new WebSocketServer({
    WebSocket: GameWebSocket,
    noServer: true,
});

export function initGame(fastify: FastifyInstance)
{
    const game: GameArea = new GameArea(gameWebSocketServer);

    gameWebSocketServer.on("connection", function (ws: GameWebSocket)
    {
        console.log("new client");

        ws.on("message", function onMessage(data, isBinary)
        {
            if (isBinary) {console.error("Unknown message"); return};

            let parsed : GameSchema.GameInterface = JSON.parse(data.toString());

            if (parsed.type === "register")
            {
                let response: GameSchema.GameRegisterResponse = {
                    type: "registerSuccess",
                    success: false,
                    position: undefined
                }

                if (!game.p1Taken)
                {
                    game.p1Taken = true;
                    
                    this.removeListener('message', onMessage)
                    this.on("message", function (data, isBinary)
                            { game.p1.wsMessage(this, data, isBinary) });
                    response.success = true;
                    response.position = "player1";
                }
                else if (!game.p2Taken)
                {
                    game.p2Taken = true;

                    this.removeListener('message', onMessage)
                    this.on("message", function (data, isBinary)
                            { game.p2.wsMessage(this, data, isBinary) });
                    response.success = true;
                    response.position = "player2";

                    game.start();
                }
                this.send(JSON.stringify(response), { binary: false });
            }
            else
            {
                console.error("Unknown message");
                return;
            }
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
        gameWebSocketServer.clients.forEach(ws => {
            if ((<any>ws).isAlive === false)
            {
                console.debug("client failed to ping (game)");
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        })
    }, 1000)
}
