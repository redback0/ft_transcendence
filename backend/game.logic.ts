
import * as GameSchema from "./game.schema"
import { WebSocketServer, WebSocket, RawData } from "ws";
import { gameWebSocketServers } from "./game";
import { db } from "./database"

type UserID = string;

// TODO: remove unnecessary p1/p2Score parameters
export type GameWinFunc = (winner: "player1" | "player2" | undefined, p1Score: number, p2Score: number, game: GameArea) => void;

export class GameArea
{
    h: number;
    w: number;
    p1: Player;
    p2: Player;
    ball: Ball;
    winScore: number = 11;
    running: boolean = false;
    framerate: number = 60;
    interval: NodeJS.Timeout | undefined;
    wss: WebSocketServer;
    frame: GameSchema.GameFrameData = {
        type: "frame",
        frameCount: 0,
        ballX: 0,
        ballY: 0,
        player1Y: 0,
        player2Y: 0
    };
    winFunction: GameWinFunc
    id: string = "";

    constructor(wss: WebSocketServer, winFunction: GameWinFunc | undefined, h = 100, w = 200, uid1?: UserID, uid2?: UserID)
    {
        this.wss = wss;
        this.h = h;
        this.w = w;
        this.p1 = new Player(0, h / 2, 10, uid1);
        this.p2 = new Player(w, h / 2, 10, uid2);
        this.ball = new Ball(w / 2, h / 2);
        const game = this;
        if (winFunction)
            this.winFunction = winFunction;
        else
            this.winFunction = (winner, p1Score, p2Score) =>
            {
                // TODO: game.id IS NOT GARANTEED TO BE UNIQUE CURRENTLY
                if (game.p1.uid && game.p2.uid)
                {
                    db.saveGame.run({
                        id: game.id,
                        leftId: game.p1.uid,
                        rightId: game.p2.uid,
                        tournId: null,
                        leftScore: game.p1.score,
                        rightScore: game.p2.score
                    });
                }
            };
    }

    getInfo = (): string =>
    {
        let started = false
        if (this.interval)
            started = true;
        let info: GameSchema.GameInfo = {
            type: "info",
            started: started,
            gameWidth: this.w,
            gameHeight: this.h,
            framerate: this.framerate,
            batHeight: this.p1.h,
            batSpeed: this.p1.moveSpeed,
            p1Color: undefined,
            p2Color: undefined,
            ballRadius: this.ball.r,
            ballSpeed: this.ball.moveSpeed,
            ballAcel: this.ball.moveAcel
        }

        let message = JSON.stringify(info);
        return message;
    }

    start = () =>
    {
        this.wss.clients.forEach(function(ws)
        {
            ws.send(JSON.stringify({type: "start"} as GameSchema.GameStart), { binary: false });
        });
        this.running = true;

        this.ball.start(this);

        this.frame.ballX = this.ball.x;
        this.frame.ballY = this.ball.y;
        this.frame.frameCount = 0;
        this.frame.player1Y = this.p1.y;
        this.frame.player2Y = this.p2.y;

        const message = JSON.stringify(this.frame);
        this.wss.clients.forEach(function(ws)
        {
            ws.send(message, { binary: false });
        });

        const game = this;
        setTimeout(function()
        {
            game.interval = setInterval(game.update, 1000 / game.framerate);
        }, 1000);
    }

    restart = () =>
    {
        this.ball.x = this.w / 2;
        this.ball.y = this.h / 2;
        this.p1.y = this.h / 2;
        this.p2.y = this.h / 2;
        this.start();
    }

    fullReset = () =>
    {
        this.ball.x = this.w / 2;
        this.ball.y = this.h / 2;
        this.p1.y = this.h / 2;
        this.p1.y = this.h / 2;
        this.p1.score = 0;
        this.p2.score = 0;

        // probably send sockets a message saying the game has reset (temporary)
        this.p1.ws?.removeListener("message", this.p1.wsMessage);
        this.p1.ws = undefined;
        this.p2.ws?.removeListener("message", this.p2.wsMessage);
        this.p2.ws = undefined;
    }

    update = () =>
    {
        this.p1.update(this);
        this.p2.update(this);
        this.ball.update(this);

        this.frame.ballX = this.ball.x;
        this.frame.ballY = this.ball.y;
        this.frame.frameCount++;
        this.frame.player1Y = this.p1.y;
        this.frame.player2Y = this.p2.y;

        let message = JSON.stringify(this.frame);
        this.wss.clients.forEach(function(ws)
        {
            ws.send(message, { binary: false });
        });
    }

    score = (scorer: Player) =>
    {
        let player: "player1" | "player2";

        clearInterval(this.interval);
        if (scorer === this.p1)
        {
            this.p1.score++;
            if (this.p1.score >= this.winScore)
            {
                this.win(this.p1);
                return;
            }
            player = "player1";
        }
        else
        {
            this.p2.score++;
            if (this.p2.score >= this.winScore)
            {
                this.win(this.p2);
                return;
            }
            player = "player2";
        }

        let scoreData: GameSchema.GameScoreData = {
            type: "score",
            scorer: player,
            p1Score: this.p1.score,
            p2Score: this.p2.score,
            ballX: this.ball.x,
            ballY: this.ball.y,
            player1Y: this.p1.y,
            player2Y: this.p2.y
        }

        let message = JSON.stringify(scoreData);
        this.wss.clients.forEach(function(ws)
        {
            ws.send(message, { binary: false });
        });

        setTimeout(this.restart, 2000);
    }

    win = (winner: Player | undefined) =>
    {
        this.running = false;
        let player: "player1" | "player2" | undefined = undefined;
        if (winner === this.p1)
            player = "player1";
        else if (winner === this.p2)
            player = "player2";

        this.winFunction(player, this.p1.score, this.p2.score, this);

        let win: GameSchema.GameWinData = {
            type: "win",
            winner: player,
            p1Score: this.p1.score,
            p2Score: this.p2.score,
            ballX: this.ball.x,
            ballY: this.ball.y,
            player1Y: this.p1.y,
            player2Y: this.p2.y
        }

        let message = JSON.stringify(win);
        this.wss.clients.forEach(function(ws)
        {
            ws.send(message, { binary: false });
        });
    }

    // not used currently
    kill = () =>
    {
        gameWebSocketServers.delete(this.id);
    }

    playerDisconnected = (player: Player) =>
    {
        // this will do 1 of a few things in the future, for now, it just makes
        // the remaining player win after 10 seconds

        const game = this;

        if (player === this.p1)
        {
            this.p1.ws = undefined;
            this.p1.dcTimeout = setTimeout(function ()
            {
                game.p1.dcTimeout = undefined;
                clearInterval(game.interval);
                if (game.p2.dcTimeout)
                {
                    clearTimeout(game.p2.dcTimeout);
                    game.p2.dcTimeout = undefined;
                }
                game.win(game.p2);
            }, 10000);
        }
        else
        {
            this.p2.ws = undefined
            this.p2.dcTimeout = setTimeout(function ()
            {
                game.p2.dcTimeout = undefined;
                clearInterval(game.interval);
                if (game.p1.dcTimeout)
                {
                    clearTimeout(game.p1.dcTimeout);
                    game.p1.dcTimeout = undefined;
                }
                game.win(game.p1);
            }, 10000);
        }
    }
}


export class Player
{
    x: number;
    y: number;
    h: number;
    moveUp: boolean = false;
    moveDown: boolean = false;
    moveSpeed: number = 1;
    score: number = 0;
    dcTimeout: NodeJS.Timeout | undefined;
    ws: WebSocket | undefined;
    uid: UserID | undefined; // undefined is either unset or unregestered.
                             // currently unregistered users can have anyone
                             // rejoin for them
    constructor(x: number, y: number, h = 10, uid?: UserID)
    {
        this.x = x;
        this.y = y;
        this.h = h;
        this.uid = uid;
    }

    canJoin(uid: UserID | undefined)
    {
        if (this.ws)
            return false;
        else if (this.uid)
            return this.uid === uid;
        else
            return true;
    }

    wsMessage = (ws: WebSocket, data: RawData, isBinary: boolean) =>
    {
        if (isBinary) throw new Error("data unknown");

        let message = JSON.parse(data.toString()) as GameSchema.GameInterface;

        if (message.type === "input")
        {
            let input = message as GameSchema.GameUserInput;

            this.moveDown = input.moveDown;
            this.moveUp = input.moveUp;
        }
    }

    wsClose = (game: GameArea, code: number, reason: Buffer) =>
    {
        console.log("Player disconnected");

        if (game.running)
            game.playerDisconnected(this);
    }

    update(game: GameArea)
    {
        // vertical movement
        if (this.moveUp)
            this.y -= this.moveSpeed;
        if (this.moveDown)
            this.y += this.moveSpeed;

        // vertical caps
        if (this.y + (this.h / 2) > game.h)
            this.y = game.h - (this.h / 2);
        else if (this.y - (this.h / 2) < 0)
            this.y = (this.h / 2);
    }
}

export class Ball
{
    x: number;
    y: number;
    r: number;
    xVel: number = 0;
    yVel: number = 0;
    moveSpeed: number = 1;
    moveAcel: number = 0.1;

    constructor(x: number, y: number, r = 1)
    {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    start(game: GameArea)
    {
        if ((game.p1.score + game.p2.score) % 2)
            this.xVel = -this.moveSpeed;
        else
            this.xVel = this.moveSpeed;

        this.yVel = this.moveSpeed * (0.5 + Math.random());
        if (Math.random() > 0.5)
            this.yVel = -this.yVel;
    }

    update(game: GameArea)
    {
        this.x += this.xVel;
        this.y += this.yVel;

        if (this.y - this.r < 0)
        {
            this.y = -(this.y - this.r * 2);
            this.yVel = -this.yVel;
        }
        else if (this.y + this.r > game.h)
        {
            this.y = game.h - ((this.y + this.r * 2) - game.h);
            this.yVel = -this.yVel;
        }

        if (this.xVel < 0) // moving towards p1
        {
            if (this.x - this.r <= 0)
            {
                let passDist = this.x - this.r;
                let hitPoint = this.y + ((passDist / this.xVel) * this.yVel);

                if (hitPoint < game.p1.y + (game.p1.h / 2) + this.r
                    && hitPoint > game.p1.y - (game.p1.h / 2) - this.r)
                {
                    this.x = -passDist + this.r;
                    this.xVel = -this.xVel + this.moveAcel;
                    if (game.p1.moveDown)
                        this.yVel += game.p1.moveSpeed / 8;
                    if (game.p1.moveUp)
                        this.yVel -= game.p1.moveSpeed / 8;
                }
                else
                {
                    game.score(game.p2);
                }
            }
        }
        else // not moving or moving towards p2
        {
            if (this.x + this.r >= game.w)
            {
                let passDist = (this.x + this.r) - game.w;
                let hitPoint = this.y + ((passDist / this.xVel) * this.yVel);

                if (hitPoint < game.p2.y + (game.p2.h / 2) + this.r
                    && hitPoint > game.p2.y - (game.p2.h / 2) - this.r)
                {
                    this.x = game.w - passDist - this.r;
                    this.xVel = -this.xVel - this.moveAcel;
                    if (game.p1.moveDown)
                        this.yVel += game.p1.moveSpeed / 8;
                    if (game.p1.moveUp)
                        this.yVel -= game.p1.moveSpeed / 8;
                }
                else
                {
                    game.score(game.p1);
                }
            }
        }
    }
}
