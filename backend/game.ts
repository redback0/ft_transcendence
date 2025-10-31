
import { WebSocketServer, WebSocket } from "ws";
import { FastifyInstance, RegisterOptions } from "fastify";

import * as GameSchema from "./game.schema";
import { TournamentID } from './tournament.schema';
import { GameArea, GameWinFunc } from "./game.logic";
import { db } from "./database";

let testGameWinner: "Player 1" | "Player 2" | "No winner yet";

type UserID = string;

export class GameWebSocket extends WebSocket
{
    isAlive: boolean = true;
    uid: UserID | undefined
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
        let id = NewID(10);
        AddNewGame(id);

        reply.send({ success: true, id: id });
    });

    done();
}

export const gameWebSocketServers = new Map<string, Game>;

export function AddNewGame(id: string, gameComplete?: GameWinFunc, uid1?: UserID, uid2?: UserID, tourneyID?: TournamentID)
{
	console.log(`AddNewGame: uid1: ${uid1}, uid2: ${uid2}`);
    gameWebSocketServers.set(id  , new Game(id, gameComplete, uid1, uid2, tourneyID))

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


const printWinFunction: GameWinFunc = (winner, p1Score, p2Score, game) => {
    console.log('winner:', winner);
    console.log('p1Score:', p1Score);
    console.log('p2Score:', p2Score);
    console.log('game:', game);
};

class Game extends GameArea
{
    timeout: NodeJS.Timeout | undefined;

    constructor(id: string, winFunction?: GameWinFunc, uid1?: UserID, uid2?: UserID, tourneyID?: TournamentID)
    {
		const wss = new WebSocketServer({
			WebSocket: GameWebSocket,
            noServer: true,
        });
		super(wss, winFunction, 100, 200, uid1, uid2, tourneyID);
        this.id = id;
		const initalScore = 0;
		
        // we only want to save game after it's finished
		// try {
		// 	db.prepare('BEGIN TRANSACTION').run();
		// 	const statement = db.prepare(
		// 		`INSERT INTO game (game_id, left_id, right_id, game_tour_id, left_score, right_score, game_tour_id)
		// 		VALUES (?, ?, ?, ?, ?, ?, ?)`
		// 	);
		// 	statement.run(id, uid1, uid2, tourneyID, initalScore, initalScore, tourneyID);
		// 	db.prepare(`COMMIT`).run();
		// } catch (error) {
		// 	db.prepare(`ROLLBACK`).run();
		// 	console.error(`Cannot make game entry`);
		// }

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

                switch (parsed.type)
                {
                case ("identify"):
                {
                    // DEPRICATED
                    // const identify = parsed as GameSchema.GameIdentify;

                    // if (identify.uid && identify.sessionToken)
                    // {
                    //     if (true)
                    //     {
                    //         ws.uid = identify.uid;
                    //     }
                    //     else
                    //     {
                    //         this.close(); // user lied, fuck them
                    //     }
                    // }
                    // const canRegister: GameSchema.GameCanRegister = {
                    //     type: "canRegister",
                    //     player1: game.p1.canJoin(ws.uid),
                    //     player2: game.p2.canJoin(ws.uid)
                    // }
                    // this.send(JSON.stringify(canRegister), { binary: false});
                    break;
                }
                case "register":
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

                    const player = game.p1.canJoin(ws.uid) ? game.p1 :
                                    game.p2.canJoin(ws.uid) ? game.p2 : undefined;

                    if (player)
                    {
                        player.ws = this;
                        player.uid = ws.uid;

                        this.removeListener('message', onMessage)
                        this.on("message", function (data, isBinary)
                                { player.wsMessage(this, data, isBinary) });
                        this.on("close", function (code, reason)
                                { player.wsClose(game, code, reason) });
                        response.success = true;
                        response.position = player === game.p1 ? "player1" : "player2";

                        if (game.p1.ws && game.p2.ws && !game.started && !game.finished)
                        {
                            game.started = true;
                            game.start();
                            const canRegister: GameSchema.GameCanRegister = {
                                type: "canRegister",
                                player1: false,
                                player2: false
                            }
                            game.wss.clients.forEach(ws =>
                            {
                                if (ws !== player.ws)
                                {
                                    ws.send(JSON.stringify(canRegister), { binary: false})
                                }
                            });
                        }
                        else if (player.dcTimeout)
                            clearTimeout(player.dcTimeout);

                    }
                    this.send(JSON.stringify(response), { binary: false });
					console.log(`Registered user: ${game.p1.uid} and ${game.p2.uid} for Game ID: ${game.id}`);

					break;
                }
                case "infoRequest":
                {
                    this.send(game.getInfo(), { binary: false });
                    break;
                }
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

            const canRegister: GameSchema.GameCanRegister = {
                type: "canRegister",
                player1: game.p1.canJoin(ws.uid),
                player2: game.p2.canJoin(ws.uid)
            }
            ws.send(JSON.stringify(canRegister), { binary: false })
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

