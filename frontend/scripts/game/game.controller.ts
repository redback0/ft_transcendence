
var defaultColor = window.getComputedStyle(document.body).getPropertyValue("--color-black");
var ballColor = window.getComputedStyle(document.body).getPropertyValue("--color-black");
var playerColor = window.getComputedStyle(document.body).getPropertyValue("--color-red-600");
var textColor = window.getComputedStyle(document.body).getPropertyValue("--color-black");

export class GameArea
{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    player1: Player;
    player2: Player;
    ball: Ball;
    framerate: number;
    interval: number | undefined;
    started: boolean = false;

    constructor(canvas: HTMLCanvasElement)
    {
        let temp = canvas.getContext("2d");
        if (temp) this.context = temp;
        else throw new Error("Failed to get context from canvas");
        this.canvas = canvas;
        this.player1 = new Player(50, canvas.height / 2, 'w', 's');
        this.player2 = new Player(canvas.width - 50, canvas.height / 2, 'ArrowUp', 'ArrowDown');
        this.ball = new Ball(canvas.width / 2, canvas.height / 2);
        this.framerate = 60;
        this.player1.draw(this);
        this.player2.draw(this);
        this.ball.draw(this);
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
            let startButton = document.getElementById("game-start-button");
            if (startButton instanceof HTMLButtonElement)
                startButton.disabled = true;
            this.ball.start(this);
            this.interval = setInterval(this.update, 30);
        }
    }

    stop(winner: Player)
    {
        clearInterval(this.interval);
        this.context.font = "48px serif";
        this.context.fillStyle = textColor;
        if (winner == this.player1)
            this.context.fillText("Left player wins!", 100, this.canvas.height / 2);
        else
            this.context.fillText("Right player wins!", 100, this.canvas.height / 2);
    }

    update = () =>
    {
        this.clear();
        this.player1.update(this);
        this.player2.update(this);
        this.ball.update(this);
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
        color: string = defaultColor)
    {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.color = color
    }

    draw = (game: GameArea) =>
    {
        let ctx = game.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    update(game: GameArea)
    {
        this.draw(game);
    }
}

class Player extends Component
{
    upvel: number = 0;
    downvel: number = 0;
    speed: number;
    upKey: string;
    downKey: string;

    constructor(x : number, y : number,
                upKey: string, downKey: string,
                h : number = 100 , w : number = 20,
                speed : number = 10)
    {
        super(x - (w / 2), y - (h / 2), h, w,
            playerColor)
        this.speed = speed;
        this.upKey = upKey;
        this.downKey = downKey;
        // these should be on the canvas, not on the body, investigate why that doesn't work
        document.body.addEventListener("keydown", this.keyDown, false)
        document.body.addEventListener("keyup", this.keyUp, false)
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

    update(game: GameArea)
    {
        this.y += this.downvel - this.upvel;
        if (this.y < 0)
            this.y = 0;
        else if (this.y + this.h > game.canvas.height)
            this.y = game.canvas.height - this.h;
        super.update(game);
    }
}

class Ball extends Component
{
    r: number;
    xvel: number = 0;
    yvel: number = 0;
    hspeed: number = 10;

    constructor(x: number, y: number, r: number = 8)
    {
        super(x, y, 0, 0);
        this.r = r;
    }

    draw = (game: GameArea) =>
    {
        let ctx = game.context;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }

    start(game: GameArea)
    {
        if (Math.random() > 0.5)
            this.xvel = this.hspeed;
        else
            this.xvel = -this.hspeed;

        this.yvel = (Math.random() * (this.hspeed / 2)) + (this.hspeed / 2)
        if (Math.random() > 0.5)
            this.yvel = -this.yvel;
    }

    collide(player: Player): boolean
    {
        return (this.x + this.r > player.x &&
            this.x - this.r < player.x + player.w &&
            this.y + this.r > player.y &&
            this.y - this.r < player.y + player.h
        );
    }

    update(game: GameArea)
    {
        this.x += this.xvel;
        this.y += this.yvel;
        if (this.x - this.r < 0)
        {
            this.x = this.r;
            game.stop(game.player2);
        }
        else if (this.x + this.r > game.canvas.width)
        {
            this.x = game.canvas.width - this.r;
            game.stop(game.player1);
        }
        if (this.y - this.r < 0)
        {
            this.y = this.r;
            this.yvel = -this.yvel;
        }
        if (this.y + this.r > game.canvas.height)
        {
            this.y = game.canvas.height - this.r;
            this.yvel = -this.yvel;
        }

        if (this.xvel > 0)
        {
            if (this.collide(game.player2))
            {
                this.hspeed++;
                this.xvel = -this.hspeed;
                this.yvel += (game.player2.downvel - game.player2.upvel) / 4;
            }
        }
        else
        {
            if (this.collide(game.player1))
            {
                this.hspeed++;
                this.xvel = this.hspeed;
                this.yvel += (game.player1.downvel - game.player1.upvel) / 4;
            }
        }

        super.update(game);
    }


}
