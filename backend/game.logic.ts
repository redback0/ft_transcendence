
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
    winScore: number = 3;
    started: boolean = false;
    finished: boolean = false;
    framerate: number = 60;
	rally: number = 0;
    interval: NodeJS.Timeout | undefined;
    wss: WebSocketServer;
    frame: GameSchema.GameFrameData = {
        type: "frame",
        frameCount: 0,
        frameTime: 0,
        ballX: 0,
        ballXVel: 0,
        ballY: 0,
        ballYVel: 0,
        player1Y: 0,
        player1MoveDir: 0,
        player2Y: 0,
        player2MoveDir: 0
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
		console.log(`if (winFunction now)`);
        if (winFunction)
		{
            this.winFunction = winFunction;
		}
		else // will not run when causal mode is removed. 
		{
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
		console.log("end super");
	}

    getInfo = (): string =>
    {
        let info: GameSchema.GameInfo = {
            type: "info",
            started: this.started,
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

        this.ball.start(this);

        this.frame.ballX = this.ball.x;
        this.frame.ballXVel = this.ball.xVel;
        this.frame.ballY = this.ball.y;
        this.frame.ballYVel = this.ball.yVel;
        this.frame.frameCount = 0;
        this.frame.frameTime = Date.now();
        this.frame.player1Y = this.p1.y;
        this.frame.player1MoveDir =
            ((this.p1.moveUp ? -1 : 0) + (this.p1.moveDown ? 1 : 0)) as -1 | 0 | 1
        this.frame.player2Y = this.p2.y;
        this.frame.player2MoveDir =
            ((this.p2.moveUp ? -1 : 0) + (this.p2.moveDown ? 1 : 0)) as -1 | 0 | 1
        const message = JSON.stringify(this.frame);
        this.wss.clients.forEach(function(ws)
        {
            ws.send(message, { binary: false });
        });

        const game = this;
        setTimeout(function()
        {
            if (game.started)
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
        this.frame.ballXVel = this.ball.xVel;
        this.frame.ballY = this.ball.y;
        this.frame.ballYVel = this.ball.yVel;
        this.frame.frameCount++;
        this.frame.frameTime = Date.now();
        this.frame.player1Y = this.p1.y;
        this.frame.player2Y = this.p2.y;

        let message = JSON.stringify(this.frame);
        this.wss.clients.forEach(function(ws)
        {
            ws.send(message, { binary: false });
        });
    }

	// JC
    score = (scorer: Player) =>
    {
        let player: "player1" | "player2";

        clearInterval(this.interval);
		this.rally = 0;
        if (scorer === this.p1)
        {
            this.p1.score++;
			db.prepare(
				`UPDATE game SET left_score = ? WHERE game_id = ?`
			).run(this.p1.score, this.id);
			console.log(`Player 1 scored ${this.p1.score} in game ID: ${this.id}`)

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
			db.prepare(
				`UPDATE game SET right_score = ? WHERE game_id = ?`
			).run(this.p2.score, this.id);
			console.log(`Player 2 scored ${this.p2.score} in game ID: ${this.id}`)
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

        const game = this;
        setTimeout(() => {if (game.started) game.restart()}, 2000);
    }

    win = (winner: Player | undefined) =>
    {
        this.finished = true;
        this.started = false;
        let player: "player1" | "player2" | undefined = undefined;
		console.log(`p1 uid: ${this.p1.uid}`);
		console.log(`p2 uid: ${this.p2.uid}`);
        if (winner === this.p1)
		{
            player = "player1";
			db.prepare(
				`UPDATE users SET num_of_win = num_of_win + 1 WHERE user_id = ?`
				).run(this.p1.uid);
			db.prepare(
				`UPDATE users SET num_of_loss = num_of_loss + 1 WHERE user_id = ?`
				).run(this.p2.uid);
		}
		else if (winner === this.p2)
		{
            player = "player2";
			db.prepare(
				`UPDATE users SET num_of_win = num_of_win + 1 WHERE user_id = ?`
				).run(this.p2.uid);
			db.prepare(
				`UPDATE users SET num_of_loss = num_of_loss + 1 WHERE user_id = ?`
				).run(this.p1.uid);
		}
		console.log(`Player ${player} wins`);

		const temp1 = db.prepare(`SELECT longest_rally FROM users WHERE user_id = ?`).get(this.p1.uid) as { longest_rally: number } | undefined;
		const p1ExistingRally = temp1 ? temp1.longest_rally : 0;
		console.log(`p1 Existing rally: ${p1ExistingRally}`);

		if (this.rally > p1ExistingRally) {
		db.prepare(
			`UPDATE users SET longest_rally = ? WHERE user_id = ?`
			).run(this.rally, this.p1.uid);
		}

		const temp2 = db.prepare(`SELECT longest_rally FROM users WHERE user_id = ?`).get(this.p2.uid) as { longest_rally: number } | undefined;
		const p2ExistingRally = temp2 ? temp2.longest_rally : 0;
		console.log(`p2 Existing rally: ${p2ExistingRally}`);

		if (this.rally > p2ExistingRally) {
		db.prepare(
			`UPDATE users SET longest_rally = ? WHERE user_id = ?`
			).run(this.rally, this.p2.uid);
		}

		console.log(`This rally: ${this.rally}`);
        this.winFunction(player, this.p1.score, this.p2.score, this);

        let win: GameSchema.GameWinData = {
            type: "win",
            winner: player,
            p1Score: this.p1.score,
            p2Score: this.p2.score,
            ballX: this.ball.x,
            ballY: this.ball.y,
            player1Y: this.p1.y,
            player2Y: this.p2.y,
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

	// JC leftover player wins by default. 
    playerDisconnected = (player: Player) =>
    {
        // this will do 1 of a few things in the future, for now, it just makes
        // the remaining player win after 10 seconds
		console.log("PLAYER DISCONNECTD");
        const game = this;
        const other = player === this.p1 ? this.p2 : this.p1;

        player.ws = undefined;
        if (game.started) player.dcTimeout = setTimeout(() =>
        {
            player.dcTimeout = undefined;
            clearInterval(game.interval);
            if (other.dcTimeout)
            {
                clearTimeout(other.dcTimeout);
                other.dcTimeout = undefined;
            }
            game.win(other);
        }, 10000);
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
    uid: UserID | undefined;
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
					console.log(`HIT`);
					game.rally++;
                    this.x = -passDist + this.r;
                    this.xVel = -this.xVel + this.moveAcel;
                    if (game.p1.moveDown)
                        this.yVel += game.p1.moveSpeed / 8;
                    if (game.p1.moveUp)
                        this.yVel -= game.p1.moveSpeed / 8;
                }
                else
                {
					// JC
					console.log(`P2 SCORED`);
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
					console.log(`HIT`);
					game.rally++;
                    this.x = game.w - passDist - this.r;
                    this.xVel = -this.xVel - this.moveAcel;
                    if (game.p1.moveDown)
                        this.yVel += game.p1.moveSpeed / 8;
                    if (game.p1.moveUp)
                        this.yVel -= game.p1.moveSpeed / 8;
                }
                else
                {
					// JC
					console.log(`P1 SCORED`);
                    game.score(game.p1);
                }
            }
        }
    }
}
