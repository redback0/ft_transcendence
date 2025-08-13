
const WINDOW_STYLE = window.getComputedStyle(document.body)
const DEFAULT_COLOR = WINDOW_STYLE.getPropertyValue("--color-black");
const BALL_COLOR = WINDOW_STYLE.getPropertyValue("--color-blue-800");
const PLAYER_COLOR = WINDOW_STYLE.getPropertyValue("--color-red-700");
const TEXT_COLOR = WINDOW_STYLE.getPropertyValue("--color-black");
const BUTTON_COLOR = WINDOW_STYLE.getPropertyValue("--color-gray-500");
const BUTTON_BORDER_COLOR = WINDOW_STYLE.getPropertyValue("--color-gray-600")

import * as GameSchema from "./../../game.schema.js"
import { onPageChange } from "../../index.js";

export class GameArea
{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    ws: WebSocket;
    h: number;
    w: number;
    ratio: number; // ratio between canvas height and game height, used for correct rendering
    sidePadding: number;
    p1: Player;
    p2: Player;
    pController: PlayerController;
    player: "player1" | "player2" | undefined;
    ball: Ball;
    p1Score: number = 0;
    p2Score: number = 0;
    batSpeed: number = 0;
    framerate: number;
    lastRecFrame: number = -1;
    lastFrameTime: EpochTimeStamp = 0;
    frameNo: number = 0;
    interval: number | undefined;
    registerButton: Button;
    textBoxes: TextBox[] = [];

    constructor(gameID: string, canvas: HTMLCanvasElement, h = 100, w = 200)
    {
        const ctx = canvas.getContext("2d");
        if (ctx) this.context = ctx;
        else throw new Error("Failed to get context from canvas");
        this.ws = new WebSocket("/wss/game/" + gameID);
        const ws = this.ws;
        onPageChange(() => {ws.close()});
        this.ws.onopen = this.wsConnect;
        this.ws.onmessage = this.wsMessage;
        this.canvas = canvas;
        this.h = h;
        this.w = w;
        this.ratio = canvas.height / this.h;
        this.sidePadding = (canvas.width - (this.w * this.ratio)) / 2;
        this.p1 = new Player(0, h / 2);
        this.p2 = new Player(w, h / 2);
        this.pController = new PlayerController(canvas, 'w', 's')
        this.ball = new Ball(w / 2, h / 2);
        this.framerate = 60;
        this.registerButton = new Button(w / 2, h * 3 / 4, w / 3.5, h / 12,
            this.register, canvas, this, "Click to register!");
        this.registerButton.enabled = false;
        this.registerButton.hidden = true;

        this.textBoxes.push(new TextBox("Spectating...", w / 2, h / 6, 
            function (this: TextBox, game)
            {
                if (game.interval)
                    this.enabled = true;
                console.log(game.player);
                return game.player === undefined;
            }));
        this.textBoxes.push(new TextBox("", w / 2 - (w / 16), h / 16,
            function (this: TextBox, game)
            {
                this.text = game.p1Score.toString();
                return true;
            }, {align: "right"}));
        this.textBoxes.push(new TextBox("", w / 2 + (w / 16), h / 16,
            function (this: TextBox, game)
            {
                this.text = game.p2Score.toString();
                return true;
            }, {align: "left"}))

        this.p1.update(this, 0);
        this.p2.update(this, 0);
        this.ball.update(this, 0);
        this.draw();
    }

    wsConnect = () =>
    {
        console.log("Game WebSocket connected");
        // this.registerButton.enabled = true;
        // this.registerButton.draw(this);
        this.ws.send(JSON.stringify({
            type: "infoRequest"
        } as GameSchema.GameInfoRequest));
    }

    wsMessage = (ev: MessageEvent) =>
    {
        if (typeof ev.data !== "string")
        {
            throw new Error("Unknown data recieved on WebSocket");
        }
        const data: GameSchema.GameInterface = JSON.parse(ev.data);

        switch (data.type)
        {
        case "identifyRequest":
        {
            // TODO: make this actually send identity
            const identify: GameSchema.GameIdentify = {
                type: "identify",
                uid: null,
                sessionToken: null
            }

            this.ws.send(JSON.stringify(identify));
            break;
        }
        case "canRegister":
        {
            const info = (data as GameSchema.GameCanRegister);
            if (info.player1 || info.player2)
            {
                this.registerButton.enabled = true;
                this.registerButton.hidden = false;
            }
            else
            {
                this.registerButton.enabled = false;
                this.registerButton.hidden = true;
            }
            this.draw();
            break;
        }
        case "registerSuccess":
        {
            this.registerButton.enabled = false;
            const info = (data as GameSchema.GameRegisterResponse);
            if (info.success)
            {
                this.registerButton.hidden = true;
                this.player = info.position;
            }
            this.draw();
            break;
        }
        case "info":
        {
            const info = (data as GameSchema.GameInfo);
            if (info.started)
            {
                this.start();
            }
            this.w = info.gameWidth;
            this.h = info.gameHeight;
            this.framerate = info.framerate;
            this.p1.h = info.batHeight;
            this.p2.h = info.batHeight;
            this.batSpeed = info.batSpeed;
            if (info.p1Color)
                this.p1.color = info.p1Color;
            if (info.p2Color)
                this.p2.color = info.p2Color;
            this.ball.r = info.ballRadius;
            //ball speed
            //ball acel
            this.draw();
            break;
        }
        case "start":
            this.start();
            break;
        case "frame":
        {
            const info = (data as GameSchema.GameFrameData);
            if (info.frameCount < this.lastRecFrame + 1)
                console.warn("Lost a frame");
            else if (info.frameCount > this.lastRecFrame + 1)
                console.warn("Frame was late");
            this.lastRecFrame = info.frameCount;
            this.lastFrameTime = info.frameTime;
            this.ball.x = info.ballX;
            this.ball.xVel = info.ballXVel;
            this.ball.y = info.ballY;
            this.ball.yVel = info.ballYVel;
            this.p1.y = info.player1Y;
            this.p2.y = info.player2Y;
            break;
        }
        case "score":
        {
            const info = (data as GameSchema.GameScoreData);
            this.p1Score = info.p1Score;
            this.p2Score = info.p2Score;
            this.ball.x = info.ballX;
            this.ball.y = info.ballY;
            this.p1.y = info.player1Y;
            this.p2.y = info.player2Y;
            if (info.scorer === "player1")
                this.score(this.p1);
            else
                this.score(this.p2);
            if (this.p1Score !== info.p1Score)
                console.warn("p1 score has differed");
            if (this.p2Score !== info.p2Score)
                console.warn("p2 score has differed");
            break;
        }
        case "win":
        {
            const info = (data as GameSchema.GameWinData);
            this.p1Score = info.p1Score;
            this.p2Score = info.p2Score;
            this.ball.x = info.ballX;
            this.ball.y = info.ballY;
            this.p1.y = info.player1Y;
            this.p2.y = info.player2Y;
            if (info.winner === "player1")
                this.win(this.p1);
            else
                this.win(this.p2);
            break;
        }
        default:
            throw new Error("Unknown message from WebSocket");
        }
    }

    register = () =>
    {
        this.ws.send(JSON.stringify({type: "register"} as GameSchema.GameRegister));
    }

    clear = () =>
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    start = () =>
    {
        this.interval = setInterval(this.update, 1000 / this.framerate);
    }

    score(scorer: Player)
    {
        let ctx = this.context;

        clearInterval(this.interval);
        this.draw();
        ctx.font = "36px sans";
        ctx.textBaseline = "middle"
        ctx.textAlign = "center";
        ctx.fillStyle = TEXT_COLOR;
        if (scorer == this.p1)
        {
            ctx.fillText("Left player scored!", this.canvas.width / 2, 200);
        }
        else
        {
            ctx.fillText("Right player scored!", this.canvas.width / 2, 200);
        }
    }

    win(winner: Player)
    {
        let ctx = this.context;

        clearInterval(this.interval);
        this.draw();
        ctx.font = "48px sans";
        ctx.textBaseline = "middle"
        ctx.textAlign = "center";
        ctx.fillStyle = TEXT_COLOR;
        if (winner == this.p1)
        {
            ctx.fillText("Left player wins!", this.canvas.width / 2, this.canvas.height / 2);
        }
        else
        {
            ctx.fillText("Right player wins!", this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    update = () =>
    {
        const frameTime = Date.now();
        const frameDiff = (frameTime - this.lastFrameTime) / this.framerate;
        if (this.player)
        {
            this.ws.send(JSON.stringify({
                type: "input",
                frameCount: this.frameNo++,
                frameTime: frameTime,
                moveUp: this.pController.moveUp,
                moveDown: this.pController.moveDown
            } as GameSchema.GameUserInput));
        }

        this.p1.update(this, frameDiff);
        this.p2.update(this, frameDiff);
        this.ball.update(this, frameDiff);
        this.draw();
    }

    draw()
    {
        this.clear();
        this.drawBackground();
        this.p1.draw(this);
        this.p2.draw(this);
        this.ball.draw(this);
        this.registerButton.draw(this);

        const game = this;
        this.textBoxes = this.textBoxes.filter((tb) => tb.update(game));
        this.textBoxes.forEach((tb) => tb.draw(game));
        // this.drawScore();
        // if (!this.player)
        //     this.drawSpectate();
    }

    drawBackground()
    {
        let ctx = this.context

        ctx.fillStyle = "#000"
        ctx.fillRect(
            this.p1.x * this.ratio + this.sidePadding,
            0,
            -1,
            this.canvas.height
        );
        ctx.fillRect(
            this.p2.x * this.ratio + this.sidePadding,
            0,
            1,
            this.canvas.height
        );
    }

    drawScore()
    {
        let ctx = this.context;

        ctx.font = "24px sans";
        ctx.fillStyle = TEXT_COLOR;
        ctx.textBaseline = "middle"
        ctx.textAlign = "right";
        ctx.fillText(this.p1Score.toString(), (this.canvas.width / 2) - 50, 80)
        ctx.textAlign = "left";
        ctx.fillText(this.p2Score.toString(), (this.canvas.width / 2) + 50, 80)
    }

    drawSpectate()
    {
        let ctx = this.context;

        ctx.font = "24px sans";
        ctx.fillStyle = TEXT_COLOR;
        ctx.textBaseline = "middle"
        ctx.textAlign = "center";
        ctx.fillText("Spectating", this.canvas.width / 2, 160);
    }
}

class TextBox
{
    text: string;
    enabled: boolean = true;
    x: number;
    y: number;
    font: string = "24px sans";
    fillStyle: string = TEXT_COLOR;
    baseline: CanvasTextBaseline = "middle";
    align: CanvasTextAlign = "center";

    constructor(
        text: string, x: number, y: number,
        update: (game: GameArea) => boolean,
        params?: {
            font?: string,
            fillStyle?: string,
            baseline?: CanvasTextBaseline,
            align?: CanvasTextAlign,
            enabled?: boolean
        })
    {
        this.text = text;
        this.x = x;
        this.y = y;
        this.update = update;
        if (params?.font) this.font = params.font;
        if (params?.fillStyle) this.fillStyle = params.fillStyle;
        if (params?.baseline) this.baseline = params.baseline;
        if (params?.align) this.align = params.align;
        if (params?.enabled) this.enabled = params.enabled;
    }

    update = (game: GameArea) =>
    {
        return true;
    }

    draw(game: GameArea)
    {
        if (!this.enabled) return;
        const ctx = game.context;

        ctx.font = this.font;
        ctx.fillStyle = this.fillStyle;
        ctx.textBaseline = this.baseline;
        ctx.textAlign = this.align;
        ctx.fillText(this.text, game.sidePadding + (this.x * game.ratio), this.y * game.ratio);
    }
}

class Button
{
    x: number;
    y: number;
    w: number;
    h: number;
    ratio: number;
    sidePadding: number;
    event: Function;
    text: string;
    font: string;
    baseColor: string;
    borderColor: string;
    textColor: string;
    enabled: boolean = true;
    hidden: boolean = false;
    game: GameArea;

    constructor(x: number,
        y: number,
        w: number,
        h: number,
        event: Function,
        element: HTMLElement,
        game: GameArea,
        text: string = "button",
        font: string = "36px sans",
        baseColor: string = BUTTON_COLOR,
        borderColor: string = BUTTON_BORDER_COLOR,
        textColor: string = TEXT_COLOR)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.ratio = game.ratio;
        this.sidePadding = game.sidePadding;
        this.event = event;
        this.text = text;
        this.font = font;
        this.baseColor = baseColor;
        this.borderColor = borderColor;
        this.textColor = textColor;
        this.game = game;

        element.addEventListener("click", this.onClickHandler)
    }

    draw(game: GameArea)
    {
        if (this.hidden)
            return;
        let ctx = game.context;
        // TODO: change color when disabled
        ctx.fillStyle = this.baseColor;
        let rectX = ((this.x - (this.w / 2)) * game.ratio) + this.sidePadding;
        let rectY = (this.y - (this.h / 2)) * game.ratio;
        ctx.fillRect(rectX, rectY, this.w * game.ratio, this.h * game.ratio);
        ctx.strokeStyle = this.borderColor;
        ctx.strokeRect(rectX, rectY, this.w * game.ratio, this.h * game.ratio);
        ctx.fillStyle = this.textColor;
        ctx.font = this.font;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(this.text, (this.x * game.ratio) + this.sidePadding, this.y * game.ratio, this.w * game.ratio);
    }

    onClickHandler = (e: MouseEvent) =>
    {
        if (this.enabled && !this.hidden &&
            e.offsetX > ((this.x * this.ratio) + this.sidePadding) - (this.w / 2 * this.ratio) &&
            e.offsetX < ((this.x * this.ratio) + this.sidePadding) + (this.w / 2 * this.ratio) &&
            e.offsetY > (this.y * this.ratio) - (this.h / 2 * this.ratio) &&
            e.offsetY < (this.y * this.ratio) + (this.h / 2 * this.ratio))
        {
            this.event();
        }

    }
}

class Component
{
    x: number;
    xRend: number = 0;
    y: number;
    yRend: number = 0;
    h: number;
    w: number;
    color: string;

    constructor(x: number, y: number, h: number, w: number,
        color: string = DEFAULT_COLOR)
    {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.color = color
    }

    update(game: GameArea, framesSince: number)
    {
        this.xRend = this.x;
        this.yRend = this.y;
    }

    draw(game: GameArea)
    {
        const ctx = game.context;

        ctx.fillStyle = this.color;
        ctx.fillRect((this.xRend * game.ratio) + game.sidePadding,
            (this.yRend - this.h / 2) * game.ratio,
            this.w * game.ratio,
            this.h * game.ratio);
    }
}

class PlayerController
{
    moveUp: boolean = false;
    moveDown: boolean = false;
    upKey: string;
    downKey: string;
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement, upKey: string, downKey: string)
    {
        this.upKey = upKey;
        this.downKey = downKey;
        this.canvas = canvas;
        canvas.addEventListener("keydown", this.keyDownHandler);
        canvas.addEventListener("keyup", this.keyUpHandler);
        canvas.addEventListener("touchstart", this.touchHandler);
        canvas.addEventListener("touchmove", this.touchHandler);
        canvas.addEventListener("touchend", this.stopMovement);
    }

    keyUpHandler = (e: KeyboardEvent) =>
    {
        if (e.key === this.upKey)
            this.moveUp = false;
        else if (e.key === this.downKey)
            this.moveDown = false;
    }

    keyDownHandler = (e: KeyboardEvent) =>
    {
        if (e.key === this.upKey)
            this.moveUp = true;
        else if (e.key === this.downKey)
            this.moveDown = true;
    }

    stopMovement = () =>
    {
        this.moveUp = false;
        this.moveDown = false;
    }

    touchHandler = (e: TouchEvent) =>
    {
        if (e.changedTouches.length < 1)
            return ;
        const bx = this.canvas.getBoundingClientRect();
        const t = e.changedTouches[0];
        console.log(`new touch Y: ${t.clientY}`);

        if (t.clientY - bx.top < this.canvas.height / 2) {
            this.moveUp = true;
            this.moveDown = false;
        } else {
            this.moveDown = true;
            this.moveUp = false;
        }

        // previously used every changed touch, but actually, that doesn't
        // make sense
        
        // const touches = e.changedTouches;
        // let avg = 0;
        // for (let i = 0; i < touches.length; i++)
        // {
        //     avg += touches[i].pageY;
        // }
        // let height = avg / touches.length;

        // if (height > this.canvas.height / 2)
        //     this.moveDown = true;
        // else
        //     this.moveUp = true;
    }
}

class Player extends Component
{
    moveUp: boolean = false;
    moveDown: boolean = false;

    constructor(x : number, y : number,
                h : number = 12, w : number = 2)
    {
        if (x == 0)
            w = -w;
        super(x, y, h, w, PLAYER_COLOR)
    }

    update(game: GameArea, framesSince: number)
    {
        this.xRend = this.x;
        this.yRend = this.y +
            (((this.moveUp ? -game.batSpeed : 0) +
            (this.moveDown ? game.batSpeed : 0)) * framesSince);
    }
}

class Ball extends Component
{
    r: number;
    xVel: number = 0;
    yVel: number = 0;

    constructor(x: number, y: number, r: number = 1, color: string = BALL_COLOR)
    {
        super(x, y, 0, 0, color);
        this.r = r;
    }

    draw = (game: GameArea) =>
    {
        let ctx = game.context;

        ctx.beginPath();
        ctx.arc((this.x * game.ratio) + game.sidePadding, this.y * game.ratio, this.r * game.ratio, 0, 2 * Math.PI)
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }

    update(game: GameArea, framesSince: number)
    {
        let xMove = this.xVel * framesSince;
        let yMove = this.yVel * framesSince;

        if (this.x + xMove > game.w / 2 - this.r)
        {
            xMove -= game.w / 2 - this.r - this.x + xMove;
        }

        if (this.y + yMove > game.h / 2 - this.r)
        {
            yMove -= game.h / 2 - this.r - this.x + yMove;
        }

        this.xRend = this.x + this.xRend;
        this.yRend = this.y + this.yRend;
    }
}
