
var DEFAULT_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-black");
var BALL_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-blue-800");
var PLAYER_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-red-700");
var TEXT_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-black");
var BUTTON_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-gray-500");
var BUTTON_BORDER_COLOR = window.getComputedStyle(document.body).getPropertyValue("--color-gray-600")

export class GameArea
{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    player1: Player;
    player2: Player;
    p1_score: number = 0;
    p2_score: number = 0;
    win_score: number = 11;
    ball: Ball;
    framerate: number = 60;
    interval: number | undefined;
    started: boolean = false;

    constructor(canvas: HTMLCanvasElement)
    {
        let temp = canvas.getContext("2d");
        if (temp) this.context = temp;
        else throw new Error("Failed to get context from canvas");
        this.canvas = canvas;
        this.player1 = new Player(this.context, 50, canvas.height / 2);
        this.player2 = new Player(this.context, canvas.width - 50, canvas.height / 2);
        this.ball = new Ball(this.context, canvas.width / 2, canvas.height / 2);
        this.player1.draw();
        this.player2.draw();
        this.ball.draw();
    }

    clear = () =>
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    win(winner: Player)
    {
        let ctx = this.context;

        ctx.font = "48px serif";
        ctx.textAlign = "center";
        ctx.fillStyle = TEXT_COLOR;
        if (winner == this.player1)
            ctx.fillText("Left player wins!", this.canvas.width / 2, this.canvas.height / 2);
        else
            ctx.fillText("Right player wins!", this.canvas.width / 2, this.canvas.height / 2);
    }

    update = () =>
    {
        this.clear();
        this.player1.update();
        this.player2.update();
        this.ball.update();
        this.drawScore();
    }

    drawScore()
    {
        let ctx = this.context;

        ctx.font = "24px serif";
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = "right";
        ctx.fillText(this.p1_score.toString(), (this.canvas.width / 2) - 50, 80);
        ctx.textAlign = "left";
        ctx.fillText(this.p2_score.toString(), (this.canvas.width / 2) + 50, 80);
    }
}

class Button
{
    x: number;
    y: number;
    w: number;
    h: number;
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
        this.event = event;
        this.text = text;
        this.font = font;
        this.baseColor = baseColor;
        this.borderColor = borderColor;
        this.textColor = textColor;

        element.addEventListener("click", this.onClickHandler)
    }

    draw(ctx: CanvasRenderingContext2D)
    {
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(this.x - (this.w / 2), this.y - (this.h / 2), this.w, this.h);
        ctx.strokeStyle = this.borderColor;
        ctx.strokeRect(this.x - (this.w / 2), this.y - (this.h / 2), this.w, this.h);
        ctx.fillStyle = this.textColor;
        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.x, this.y, this.w);
    }

    onClickHandler = (e: MouseEvent) =>
    {
        if (this.enabled &&
            e.offsetX > this.x - (this.w / 2) &&
            e.offsetX < this.x + (this.w / 2) &&
            e.offsetY > this.y - (this.h / 2) &&
            e.offsetY < this.y + (this.h / 2))
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
    ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, w: number,
        color: string = DEFAULT_COLOR)
    {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.color = color
    }

    draw()
    {
        let ctx = this.ctx;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

class Player extends Component
{
    upvel: number = 0;
    downvel: number = 0;
    speed: number;

    constructor(ctx: CanvasRenderingContext2D,
                x : number, y : number,
                h : number = 100 , w : number = 20,
                speed : number = 10)
    {
        super(ctx, x - (w / 2), y - (h / 2), h, w,
            PLAYER_COLOR)
        this.speed = speed;
    }

    update()
    {
        super.draw();
    }
}

class Ball extends Component
{
    r: number;
    xvel: number = 0;
    yvel: number = 0;
    hspeed: number = 10;

    constructor(ctx: CanvasRenderingContext2D, x: number, y: number, r: number = 8, color: string = BALL_COLOR)
    {
        super(ctx, x, y, 0, 0, color);
        this.r = r;
    }

    draw = () =>
    {
        let ctx = this.ctx;

        

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }

    update()
    {
        this.draw();
    }
}
