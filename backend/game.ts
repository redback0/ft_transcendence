
import { WebSocketServer, WebSocket } from "ws";
import { FastifyInstance } from "fastify";

import * as GameSchema from "./game.schema";

class GameWebSocket extends WebSocket
{
    isAlive: boolean = true;
}

export function initGame(fastify: FastifyInstance)
{
    const wss = new WebSocketServer({
        WebSocket: GameWebSocket,
        server: fastify.server,
        path: "/wss/game"
    });
    
    wss.on("connection", function (ws: GameWebSocket)
    {

        ws.on("message", function (data, isBinary)
        {
            if (isBinary) throw new Error("Unknown message");

            let parsed : GameSchema.GameInterface = JSON.parse(data.toString());

            if (parsed.type === "input")
            {
                parsed = (parsed as GameSchema.GameUserInput);
                // process input // update movement!
            }
            else
            {
                throw new Error("Unknown message");
            }
        });

        ws.on("close", function (code, reason)
        {
            // nothing to do atm
        });

        ws.on("pong", function ()
        {
            ws.isAlive = true;
        });
    });


    // simple ping as a heartbeat for the connection
    const interval = setInterval(() =>
    {
        wss.clients.forEach(ws => {
            if ((<any>ws).isAlive === false)
            {
                // console.debug("client failed to ping");
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        })
    }, 1000)
}



// ***** GAME LOGIC *****

class GameArea
{
    h: number;
    w: number;
    p1: Player;
    p2: Player;
    ball: Ball;
    
    constructor(h = 1920, w = 1080)
    {
        this.h = h;
        this.w = w;
        this.p1 = new Player(100, h / 2);
        this.p2 = new Player(w - 100, h / 2);
        this.ball = new Ball(w / 2, h / 2);
    }

    update = () =>
    {

    }

    start = () =>
    {

    }
}

class Component
{
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(x: number, y: number, w: number, h: number)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Player extends Component
{
    constructor(x: number, y: number, w = 40, h = 200)
    {
        super(x, y, w, h);
    }
}

class Ball extends Component
{
    constructor(x: number, y: number, r = 16)
    {
        super(x, y, 0, 0);
    }

    update()
    {
        
    }
}
