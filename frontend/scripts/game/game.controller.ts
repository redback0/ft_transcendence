
export class GameArea
{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    player1: Player;
    player2: Player;
    framerate: number;
    interval: number | null = null;
    started: boolean = false;

    constructor(canvas: HTMLCanvasElement)
    {
        let temp = canvas.getContext("2d");
        if (temp) this.context = temp; else throw new Error("Failed to get context from canvas");
        this.canvas = canvas;
        this.player1 = new Player(20, canvas.height / 2 - 50, canvas);
        this.player2 = new Player(canvas.width - 50, canvas.height / 2 - 50, canvas);
        this.framerate = 60;
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
            this.interval = setInterval(this.update, 30)
        }
    }

    update = () =>
    {
        this.clear()
        this.player1.update(this)
        this.player2.update(this)
    }
}

class Component
{
    x: number;
    y: number;
    h: number;
    w: number;
    color: string;

    constructor(x: number, y: number, h: number, w: number, color: string = "black")
    {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.color = color
    }

    update(game: GameArea)
    {
        let ctx = game.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

class Player extends Component
{
    xvel: number = 0;
    yvel: number = 0;
    speed: number;
    constructor(x : number, y : number,
                canvas : HTMLCanvasElement,
                h : number = 100 , w : number = 30,
                speed : number = 10)
    {
        super(x, y, h, w)
        this.speed = speed;
        document.body.addEventListener("keydown", this.keyDown, false)
        document.body.addEventListener("keyup", this.keyUp, false)
    }

    keyDown = (event: KeyboardEvent) =>
    {
        if (event.key == "w")
            this.yvel = -this.speed;
        else if (event.key == "s")
            this.yvel = this.speed;
    }

    keyUp = (event: KeyboardEvent) =>
    {
        if (event.key == "w" || event.key == "s")
            this.yvel = 0;
    }

    update(game: GameArea)
    {
        this.x += this.xvel;
        this.y += this.yvel;
        if (this.y < 0)
            this.y = 0;
        else if (this.y + this.h > game.canvas.height)
            this.y = game.canvas.height - this.h;
        super.update(game);
    }
}
