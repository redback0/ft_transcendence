
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
    h: number;
    w: number;
    ratio: number; // ratio between canvas height and game height, used for correct rendering
    sidePadding: number;
    p1: Player;
    p2: Player;
    ball: Ball;
    p1Score: number = 0;
    p2Score: number = 0;
    winScore: number = 11;
    framerate: number;
    interval: number | undefined;
    started: boolean = false;
    startButton: Button;

    constructor(canvas: HTMLCanvasElement, h = 100, w = 200)
    {
        let temp = canvas.getContext("2d");
        if (temp) this.context = temp;
        else throw new Error("Failed to get context from canvas");
        this.canvas = canvas;
        this.h = h;
        this.w = w;
        this.ratio = canvas.height / this.h;
        this.sidePadding = (canvas.width - (this.w * this.ratio)) / 2;
        this.p1 = new Player(0, h / 2, 'w', 's', canvas);
        this.p2 = new Player(w, h / 2, 'ArrowUp', 'ArrowDown', canvas);
        this.ball = new Ball(w / 2, h / 2);
        this.framerate = 60;
        this.startButton = new Button(w / 2, h * 3 / 4, w / 3.5, h / 12,
            this.start, canvas, this, "Click here to start!");

        this.drawBackground();
        this.p1.draw(this);
        this.p2.draw(this);
        this.ball.draw(this);

        this.startButton.draw(this);
    }

    clear = () =>
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    start = () =>
    {
        if (!this.started)
        {
            this.started = true;
            this.startButton.enabled = false;
            this.ball.start(this);
            this.interval = setInterval(this.update, 1000 / this.framerate);
        }
    }

    restart = () =>
    {
        this.ball.x = this.w / 2;
        this.ball.y = this.h / 2;
        this.p1.y = this.h / 2;
        this.p2.y = this.h / 2;
        this.ball.start(this);
        this.interval = setInterval(this.update, 1000 / this.framerate);
    }

    score(scorer: Player)
    {
        let ctx = this.context;

        clearInterval(this.interval);
        ctx.font = "36px serif";
        ctx.textAlign = "center";
        ctx.fillStyle = TEXT_COLOR;
        if (scorer == this.p1)
        {
            this.p1Score++;
            if (this.p1Score >= this.winScore)
            {
                this.win(this.p1);
                return;
            }
            ctx.fillText("Left player scored!", this.canvas.width / 2, 200);
        }
        else
        {
            this.p2Score++;
            if (this.p2Score >= this.winScore)
            {
                this.win(this.p2);
                return;
            }
            ctx.fillText("Right player scored!", this.canvas.width / 2, 200);
        }
        setTimeout(this.restart, 2000);
    }

    win(winner: Player)
    {
        let ctx = this.context;

        ctx.font = "48px serif";
        ctx.textAlign = "center";
        ctx.fillStyle = TEXT_COLOR;
        if (winner == this.p1)
            ctx.fillText("Left player wins!", this.canvas.width / 2, this.canvas.height / 2);
        else
            ctx.fillText("Right player wins!", this.canvas.width / 2, this.canvas.height / 2);
    }

    update = () =>
    {
        this.clear();
        this.drawBackground();
        this.p1.update(this);
        this.p2.update(this);
        this.ball.update(this);
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

class Player extends Component
{
    upvel: number = 0;
    downvel: number = 0;
    speed: number;
    upKey: string;
    downKey: string;
    canvas: HTMLCanvasElement;

    constructor(x : number, y : number,
                upKey: string, downKey: string,
                canvas: HTMLCanvasElement,
                h : number = 12, w : number = 2,
                speed : number = 1)
    {
        if (x == 0)
            w = -w;
        super(x, y, h, w, PLAYER_COLOR)
        this.speed = speed;
        this.upKey = upKey;
        this.downKey = downKey;
        this.canvas = canvas;
        canvas.addEventListener("keydown", this.keyDown, false);
        canvas.addEventListener("keyup", this.keyUp, false);
        canvas.addEventListener("touchstart", this.touchHandler);
        canvas.addEventListener("touchmove", this.touchHandler);
        canvas.addEventListener("touchend", this.stopMovement);
    }

    keyDown = (event: KeyboardEvent) =>
    {
        if (event.key == this.upKey)
            this.upvel = this.speed;
        else if (event.key == this.downKey)
            this.downvel = this.speed;
    }

    keyUp = (event: KeyboardEvent) =>
    {
        if (event.key == this.upKey)
            this.upvel = 0;
        else if (event.key == this.downKey)
            this.downvel = 0;
    }

    stopMovement = () =>
    {
        this.upvel = 0;
        this.downvel = 0;
    }

    touchHandler = (e: TouchEvent) =>
    {
        this.upvel = 0;
        this.downvel = 0;

        if (e.changedTouches.length < 1)
            return ;
        const bx = this.canvas.getBoundingClientRect();
        const t = e.changedTouches;

        for (let i = 0; i < t.length; i++)
            if (this.x === 0
                    && t[i].clientX - bx.left < this.canvas.width / 2)
            {
                if (t[i].clientY - bx.top < this.canvas.height / 2)
                    this.upvel = this.speed;
                else
                    this.downvel = this.speed;
            }
            else if (this.x !== 0
                    && t[i].clientX - bx.left > this.canvas.width / 2)
            {
                if (t[i].clientY - bx.top < this.canvas.height / 2)
                    this.upvel = this.speed;
                else
                    this.downvel = this.speed;
            }
    }

    update(game: GameArea)
    {
        this.y += this.downvel - this.upvel;
        if (this.y - this.h / 2 < 0)
            this.y = 0 + this.h / 2;
        else if (this.y + this.h / 2 > game.h)
            this.y = game.h - this.h / 2;
        super.draw(game);
    }
}

class Ball extends Component
{
    r: number;
    xVel: number = 0;
    yVel: number = 0;
    moveSpeed: number = 1;
    moveAcel: number = 0.1;

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

    start(game: GameArea)
    {
        if ((game.p1Score + game.p2Score) % 2 == 1)
            this.xVel = this.moveSpeed;
        else
            this.xVel = -this.moveSpeed;

        this.yVel = (Math.random() * (this.moveSpeed / 2)) + (this.moveSpeed / 2)
        if (Math.random() > 0.5)
            this.yVel = -this.yVel;
    }

    update(game: GameArea)
    {
        this.x += this.xVel;
        this.y += this.yVel;

        // bounce off top wall
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

        // check if ball hit bat
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
                    this.yVel += (game.p1.downvel - game.p1.upvel) / 8;
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
                    this.yVel += (game.p2.downvel - game.p2.upvel) / 8;
                }
                else
                {
                    game.score(game.p1);
                }
            }
        }
        this.draw(game);
    }
}
