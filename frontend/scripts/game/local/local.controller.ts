
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
    framerate: number;
    interval: number | undefined;
    started: boolean = false;
    startButton: Button;

    constructor(canvas: HTMLCanvasElement)
    {
        let temp = canvas.getContext("2d");
        if (temp) this.context = temp;
        else throw new Error("Failed to get context from canvas");
        this.canvas = canvas;
        this.player1 = new Player(50, canvas.height / 2, 'w', 's', canvas);
        this.player2 = new Player(canvas.width - 50, canvas.height / 2, 'ArrowUp', 'ArrowDown', canvas);
        this.ball = new Ball(canvas.width / 2, canvas.height / 2);
        this.framerate = 60;
        this.player1.draw(this);
        this.player2.draw(this);
        this.ball.draw(this);

        this.startButton = new Button(canvas.width / 2, canvas.height * 3 / 4, 340, 50,
            this.start, canvas, "Click here to start!");
        this.startButton.draw(this.context);
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
            this.interval = setInterval(this.update, 30);
        }
    }

    restart = () =>
    {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.hspeed = 10;
        this.player1.y = (this.canvas.height / 2) - (this.player1.h / 2);
        this.player2.y = (this.canvas.height / 2) - (this.player2.h / 2);
        this.ball.start(this);
        this.interval = setInterval(this.update, 30);
    }

    score(scorer: Player)
    {
        let ctx = this.context;

        clearInterval(this.interval);
        ctx.font = "36px serif";
        ctx.textAlign = "center";
        ctx.fillStyle = TEXT_COLOR;
        if (scorer == this.player1)
        {
            this.p1_score++;
            if (this.p1_score >= this.win_score)
            {
                this.win(this.player1);
                return;
            }
            ctx.fillText("Left player scored!", this.canvas.width / 2, 200);
        }
        else
        {
            this.p2_score++;
            if (this.p2_score >= this.win_score)
            {
                this.win(this.player2);
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
        if (winner == this.player1)
            ctx.fillText("Left player wins!", this.canvas.width / 2, this.canvas.height / 2);
        else
            ctx.fillText("Right player wins!", this.canvas.width / 2, this.canvas.height / 2);
    }

    update = () =>
    {
        this.clear();
        this.player1.update(this);
        this.player2.update(this);
        this.ball.update(this);
        this.drawScore()
    }

    drawScore()
    {
        let ctx = this.context;

        ctx.font = "24px serif";
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = "right";
        ctx.fillText(this.p1_score.toString(), (this.canvas.width / 2) - 50, 80)
        ctx.textAlign = "left";
        ctx.fillText(this.p2_score.toString(), (this.canvas.width / 2) + 50, 80)
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
        ctx.fillRect(this.x, this.y, this.w, this.h);
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
                canvas: HTMLCanvasElement,
                h : number = 100 , w : number = 20,
                speed : number = 10)
    {
        super(x - (w / 2), y - (h / 2), h, w,
            PLAYER_COLOR)
        this.speed = speed;
        this.upKey = upKey;
        this.downKey = downKey;
        canvas.addEventListener("keydown", this.keyDown, false)
        canvas.addEventListener("keyup", this.keyUp, false)
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
        super.draw(game);
    }
}

class Ball extends Component
{
    r: number;
    xvel: number = 0;
    yvel: number = 0;
    hspeed: number = 10;

    constructor(x: number, y: number, r: number = 8, color: string = BALL_COLOR)
    {
        super(x, y, 0, 0, color);
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
        if ((game.p1_score + game.p2_score) % 2 == 1)
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
            game.score(game.player2);
        }
        else if (this.x + this.r > game.canvas.width)
        {
            this.x = game.canvas.width - this.r;
            game.score(game.player1);
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

        this.draw(game);
    }


}
