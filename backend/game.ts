
import { WebSocketServer, WebSocket } from "ws";
import { FastifyInstance, RegisterOptions } from "fastify";

import * as GameSchema from "./game.schema";
import { GameArea, GameWinFunc } from "./game.logic";
import { db } from "./database";

let testGameWinner: "Player 1" | "Player 2" | "No winner yet";

type UserID = string;

class GameWebSocket extends WebSocket
{
    isAlive: boolean = true;
    uid: UserID | undefined
}

function NewID(length: number)
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
    // TODO: change the game creating gets to ?posts
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

    // TODO: remove this
    fastify.get('/api/game/create/test', function (request, reply)
    {
        let id = NewID(5);
        while (id in gameWebSocketServers.keys)
        {
            id = NewID(5);
        }
        AddNewGame(id, (winner, p1Score, p2Score, game) =>
        {
            if (winner === "player1")
                testGameWinner = "Player 1";
            else
                testGameWinner = "Player 2";
            // db.saveGame.run({
            //     id: game.id,
            //     leftId: game.p1.userId,
            //     rightId: game.p2.userId,
            //     tournId: null,
            //     leftScore: game.p1Score,
            //     rightScore: game.p2Score
            // });
        }, "1234", "4321");

        reply.send({ success: true, id: id });
    });

    fastify.get('/api/game/test/winner', function (request, reply)
    {
        reply.send({ winner: testGameWinner });
    })

    done();
}

export const gameWebSocketServers = new Map<string, Game>;

export function AddNewGame(id: string, gameComplete?: GameWinFunc, uid1?: UserID, uid2?: UserID)
{
    gameWebSocketServers.set(id, new Game(id, gameComplete, uid1, uid2))

    // gameWebSocketServers.set(id, new Game(id, (winner: "player1" | "player2" | undefined, p1Score: number, p2Score: number) =>
    // {
    //     // if there was a gameComplete function, call it, otherwise save to the
    //     // database if both players were registered users.

    //     // NOTE: gameComplete function will be responsible for writing to the
    //     // database if set
    //     if (gameComplete)
    //         gameComplete(winner, p1Score, p2Score);
    //     else if ()
    //     gameWebSocketServers.delete(id);
    // }));
}

class Game extends GameArea
{
    timeout: NodeJS.Timeout | undefined;

    constructor(id: string, winFunction?: GameWinFunc, uid1?: UserID, uid2?: UserID)
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
                const parsed : GameSchema.GameInterface = JSON.parse(data.toString());

                if (parsed.type === "identify")
                {
                    const identify = parsed as GameSchema.GameIdentify;

                    if (identify.uid && identify.sessionToken)
                    {
                        // TODO: check that the user is not lying
                        if (true)
                        {
                            ws.uid = identify.uid;
                        }
                        else
                        {
                            this.close(); // user lied, fuck them
                        }
                    }
                    const canRegister: GameSchema.GameCanRegister = {
                        type: "canRegister",
                        player1: game.p1.canJoin(ws.uid),
                        player2: game.p2.canJoin(ws.uid)
                    }
                    this.send(JSON.stringify(canRegister), { binary: false});
                }
                else if (parsed.type === "register")
                {
                    const response: GameSchema.GameRegisterResponse = {
                        type: "registerSuccess",
                        success: false,
                        position: undefined
                    }

                    // NOTE: if p1 is unregestered and p2 is registered, if
                    // both disconnect, then p2 attempts to rejoin then both
                    // players will technically be the same user.
                    // I will ignore this problem
                    if (game.p1.canJoin(ws.uid))
                    {
                        game.p1.ws = this;
                        game.p1.uid = ws.uid;

                        this.removeListener('message', onMessage)
                        this.on("message", function (data, isBinary)
                                { game.p1.wsMessage(this, data, isBinary) });
                        this.on("close", function (code, reason)
                                { game.p1.wsClose(game, code, reason) });
                        response.success = true;
                        response.position = "player1";

                        if (game.p1.ws && game.p2.ws)
                            game.start();
                    }
                    else if (game.p2.canJoin(ws.uid))
                    {
                        game.p2.ws = this;
                        game.p2.uid = ws.uid;

                        this.removeListener('message', onMessage)
                        this.on("message", function (data, isBinary)
                                { game.p2.wsMessage(this, data, isBinary) });
                        this.on("close", function (code, reason)
                                { game.p2.wsClose(game, code, reason) });
                        response.success = true;
                        response.position = "player2";

                        if (game.p1.ws && game.p2.ws)
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
                // the game should only get deleted when it never started in
                // in the first place, so normally, even if both players leave,
                // the winFunction will be called, making the player that stayed
                // longer win
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


            // if game slots available, ask the client to identify
            if (!game.p1.ws || !game.p2.ws)
            {
                const identifyRequest: GameSchema.GameIdentifyRequest = {
                    type: "identifyRequest"
                };
                ws.send(JSON.stringify(identifyRequest), { binary: false});
            }
            else
            {
                const canRegister: GameSchema.GameCanRegister = {
                    type: "canRegister",
                    player1: false,
                    player2: false
                }
            }
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
