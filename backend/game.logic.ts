
import * as GameSchema from "./game.schema"
import { WebSocketServer, WebSocket, RawData } from "ws";

export class GameArea
{
    h: number;
    w: number;
    p1: Player;
    p2: Player;
    p1Taken: boolean = false;
    p2Taken: boolean = false;
    ball: Ball;
    p1Score: number = 0;
    p2Score: number = 0;
    winScore: number = 11;
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

    constructor(wss: WebSocketServer, h = 100, w = 200)
    {
        this.wss = wss;
        this.h = h;
        this.w = w;
        this.p1 = new Player(0, h / 2);
        this.p2 = new Player(w, h / 2);
        this.ball = new Ball(w / 2, h / 2);
    }

    sendInfo = () =>
    {
        let info: GameSchema.GameInfo = {
            type: "info",
            gameWidth: this.w,
            gameHeight: this.h,
            framerate: this.framerate,
            batHeight: this.p1.h,
            batSpeed: this.p1.moveSpeed,
            p1Color: "#000",
            p2Color: "#000",
            ballRadius: this.ball.r,
            ballSpeed: this.ball.moveSpeed,
            ballAcel: this.ball.moveAcel
        }

        // send info to everyone
    }

    start = () =>
    {
        // probably add a countdown here
        this.ball.start(this);
        this.interval = setInterval(this.update, 1000 / this.framerate)
    }

    update = () =>
    {
        this.p1.update(this);
        this.p2.update(this);
        this.ball.update(this);

        this.frame.ballX = this.ball.x;
        this.frame.ballY = this.ball.y;
        this.frame.player1Y = this.p1.y;
        this.frame.player2Y = this.p2.y;

        // send over all sockets

        this.frame.frameCount++;
    }

    score = (scorer: Player) =>
    {
        let player: "player1" | "player2";

        // disable update, start

        if (scorer === this.p1)
        {
            this.p1Score++;
            player = "player1";
        }
        else
        {
            this.p2Score++;
            player = "player2";
        }

        let scoreData: GameSchema.GameScoreData = {
            type: "score",
            scorer: player,
            p1Score: this.p1Score,
            p2Score: this.p2Score
        }

        // send over all sockets
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

    constructor(x: number, y: number, h = 10)
    {
        this.x = x;
        this.y = y;
        this.h = h;
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

    constructor(x: number, y: number, r = 2)
    {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    start(game: GameArea)
    {
        if ((game.p1Score + game.p2Score) % 2)
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
