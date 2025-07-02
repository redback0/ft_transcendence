
import { WebSocketServer, WebSocket } from "ws";
import { FastifyInstance, RegisterOptions } from "fastify";

import * as GameSchema from "./game.schema";
import { GameArea, GameWinFunc } from "./game.logic";

let testGameWinner: "Player 1" | "Player 2" | "No winner yet";

type UserID = string;

class GameWebSocket extends WebSocket
{
    isAlive: boolean = true;
}

export function NewID(length: number)
{
    let result = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    for (let i = 0; i < length; i++)
    {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (result);
}

export function gameInit(fastify: FastifyInstance, opts: RegisterOptions, done: Function)
{
    fastify.get('/api/game/create/casual', function (request, reply)
    {
        let id = NewID(5);
        while (id in gameWebSocketServers.keys)
        {
            id = NewID(5);
        }
        AddNewGame(id);

        reply.send({ success: true, id: id });
    });

    fastify.get('/api/game/create/test', function (request, reply)
    {
        let id = NewID(5);
        while (id in gameWebSocketServers.keys)
        {
            id = NewID(5);
        }
        AddNewGame(id, (winner) =>
        {
            if (winner === "player1")
                testGameWinner = "Player 1";
            else
                testGameWinner = "Player 2";
        });

        reply.send({ success: true, id: id });
    });

    fastify.get('/api/game/test/winner', function (request, reply)
    {
        reply.send({ winner: testGameWinner });
    })

    done();
}

export const gameWebSocketServers = new Map<string, Game>;

export function AddNewGame(id: string, gameComplete: GameWinFunc | undefined = undefined, uid1?: UserID, uid2?: UserID)
{
    gameWebSocketServers.set(id, new Game(id, (winner: "player1" | "player2", p1Score: number, p2Score: number) =>
    {
        if (gameComplete)
            gameComplete(winner, p1Score, p2Score);
        gameWebSocketServers.delete(id);
    }));AddNewGame
}

class Game extends GameArea
{
    timeout: NodeJS.Timeout | undefined;

    constructor(id: string, winFunction: GameWinFunc, uid1?: UserID, uid2?: UserID)
    {
        const wss = new WebSocketServer({
            WebSocket: GameWebSocket,
            noServer: true,
        });

        super(wss, winFunction, 100, 200, uid1, uid2);
        this.id = id;

        const game = this;

        wss.on("connection", function (ws: GameWebSocket)
        {
            console.log("new client");

            if (game.timeout)
            {
                clearTimeout(game.timeout);
                game.timeout = undefined;
            }

            ws.on("message", function onMessage(data, isBinary)
            {
                let parsed : GameSchema.GameInterface = JSON.parse(data.toString());

                if (parsed.type === "register")
                {
                    let response: GameSchema.GameRegisterResponse = {
                        type: "registerSuccess",
                        success: false,
                        position: undefined
                    }

                    if (!game.p1WebSocket)
                    {
                        game.p1WebSocket = this;
                        
                        this.removeListener('message', onMessage)
                        this.on("message", function (data, isBinary)
                                { game.p1.wsMessage(this, data, isBinary) });
                        this.on("close", function (code, reason)
                                { game.p1.wsClose(game, code, reason) });
                        response.success = true;
                        response.position = "player1";

                        if (game.p1WebSocket && game.p2WebSocket)
                            game.start();
                    }
                    else if (!game.p2WebSocket)
                    {
                        game.p2WebSocket = this;

                        this.removeListener('message', onMessage)
                        this.on("message", function (data, isBinary)
                                { game.p2.wsMessage(this, data, isBinary) });
                        this.on("close", function (code, reason)
                                { game.p2.wsClose(game, code, reason) });
                        response.success = true;
                        response.position = "player2";

                        if (game.p1WebSocket && game.p2WebSocket)
                            game.start();
                    }
                    this.send(JSON.stringify(response), { binary: false });
                }
                else if (parsed.type === "infoRequest")
                {
                    this.send(game.getInfo(), { binary: false });
                }
                else
                {
                    return;
                }
            });

            ws.on("close", function (code, reason)
            {
                // if there are no sockets connected, and there's no winFunction
                // just kill this game
                if (wss.clients.size === 0)
                {
                    console.log(`Game (${game.id}) empty, remove in 10 seconds`);
                    game.timeout = setTimeout(() =>
                    {
                        gameWebSocketServers.delete(game.id);
                        console.log(`Game deleted (${game.id})`);
                    }, 10000)
                }
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
                    console.debug("client failed to ping (game)");
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping();
            })
        }, 1000)
    }
}
