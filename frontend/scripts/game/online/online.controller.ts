
var DEFAULT_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-black");
var BALL_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-blue-800");
var PLAYER_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-red-700");
var TEXT_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-black");
var BUTTON_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-gray-500");
var BUTTON_BORDER_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-gray-600")

import * as GameSchema from "./../../game.schema"

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
    winScore: number = 11;
    framerate: number;
    lastRecFrame: number = -1;
    frameNo: number = 0;
    interval: number | undefined;
    registerButton: Button;

    constructor(gameID: string, canvas: HTMLCanvasElement, h = 100, w = 200)
    {
        let temp = canvas.getContext("2d");
        if (temp) this.context = temp;
        else throw new Error("Failed to get context from canvas");
        this.ws = new WebSocket("/wss/game/" + gameID);
        let ws = this.ws;
        window.addEventListener("popstate", function disconnectGame(e)
        {
            ws.close();
            this.removeEventListener("popstate", disconnectGame);
        });
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
            this.register, canvas, this, "Click here to register!");
        this.registerButton.enabled = false;

        this.drawBackground();
        this.p1.draw(this);
        this.p2.draw(this);
        this.ball.draw(this);

    }

    wsConnect = () =>
    {
        console.log("Game WebSocket connected");
        this.registerButton.enabled = true;
        this.registerButton.draw(this);
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
        case "registerSuccess":
        {
            const info = (data as GameSchema.GameRegisterResponse);
            if (info.success)
                this.player = info.position;
            break;
        }
        case "info":
        {
            const info = (data as GameSchema.GameInfo);
            if (info.started)
                this.start();
            this.w = info.gameWidth;
            this.h = info.gameHeight;
            this.framerate = info.framerate;
            this.p1.h = info.batHeight;
            this.p2.h = info.batHeight;
            //bat speed
            if (info.p1Color)
                this.p1.color = info.p1Color;
            if (info.p2Color)
                this.p2.color = info.p2Color;
            this.ball.r = info.ballRadius;
            //ball speed
            //ball acel
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
            this.ball.x = info.ballX;
            this.ball.y = info.ballY;
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
        ctx.font = "36px serif";
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
        ctx.font = "48px serif";
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
        if (this.player)
        {
            this.ws.send(JSON.stringify({
                type: "input",
                frameCount: this.frameNo++,
                moveUp: this.pController.moveUp,
                moveDown: this.pController.moveDown
            } as GameSchema.GameUserInput));
        }

        this.p1.update(this);
        this.p2.update(this);
        this.ball.update(this);
        this.draw();
    }

    draw()
    {
        this.clear();
        this.drawBackground();
        this.p1.draw(this);
        this.p2.draw(this);
        this.ball.draw(this);
        this.drawScore();
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

        ctx.font = "24px serif";
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = "right";
        ctx.fillText(this.p1Score.toString(), (this.canvas.width / 2) - 50, 80)
        ctx.textAlign = "left";
        ctx.fillText(this.p2Score.toString(), (this.canvas.width / 2) + 50, 80)
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

    constructor(x: number,
        y: number,
        w: number,
        h: number,
        event: Function,
        element: HTMLElement,
        game: GameArea,
        text: string = "button",
        font: string = "36px serif",
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

        element.addEventListener("click", this.onClickHandler)
    }

    draw(game: GameArea)
    {
        let ctx = game.context;
        ctx.fillStyle = this.baseColor;
        let rectX = ((this.x - (this.w / 2)) * game.ratio) + this.sidePadding;
        let rectY = (this.y - (this.h / 2)) * game.ratio;
        ctx.fillRect(rectX, rectY, this.w * game.ratio, this.h * game.ratio);
        ctx.strokeStyle = this.borderColor;
        ctx.strokeRect(rectX, rectY, this.w * game.ratio, this.h * game.ratio);
        ctx.fillStyle = this.textColor;
        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, (this.x * game.ratio) + this.sidePadding, this.y * game.ratio, this.w * game.ratio);
    }

    onClickHandler = (e: MouseEvent) =>
    {
        if (this.enabled &&
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
    y: number;
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

    draw(game: GameArea)
    {
        let ctx = game.context;
        ctx.fillStyle = this.color;
        ctx.fillRect((this.x * game.ratio) + game.sidePadding,
            (this.y - this.h / 2) * game.ratio,
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
        this.moveUp = false;
        this.moveDown = false;

        if (e.changedTouches.length < 1)
            return ;
        const bx = this.canvas.getBoundingClientRect();
        const t = e.changedTouches[0];

        if (t.clientY - bx.top < this.canvas.height / 2)
            this.moveUp = true;
        else
            this.moveDown = true;

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
    constructor(x : number, y : number,
                h : number = 12, w : number = 2)
    {
        if (x == 0)
            w = -w;
        super(x, y, h, w, PLAYER_COLOR)
    }

    update(game: GameArea)
    {
    }
}

class Ball extends Component
{
    r: number;

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

    update(game: GameArea)
    {
    }
}
