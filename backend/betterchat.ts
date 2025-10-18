import { WebSocketServer, WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import { UserID } from './lobby.schema';
import { getFriendsFromDatabase } from './friend.logic';


export class HBWebSocket extends WebSocket
{
    isAlive: boolean = true;
    uid: UserID | undefined;
    username: string | undefined;
}

export const chatWebSocketServer = new WebSocketServer({
    WebSocket: HBWebSocket,
    noServer: true,
    path: '/wss/chat'
});

const clients: Map<string, HBWebSocket> = new Map();

export function initChat()
{

    chatWebSocketServer.on("connection", function (ws: HBWebSocket)
    {
        ws.send(JSON.stringify({ username: ws.username}));
        console.log('New Client Connected');
        if (ws.username)
            clients.set(ws.username, ws);
        ws.on("message", (message: string) => {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage.type);
            if (parsedMessage.type === 'message' && parsedMessage.reciever && parsedMessage.payload)
            {
                console.log( parsedMessage.type, parsedMessage.reciever, parsedMessage.payload);
                if (parsedMessage.reciever[0] === '#')
                {
                    clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN)
                        {
                            client.send(JSON.stringify({
                                type: "message",
                                channel: "general",
                                sender: ws.username,
                                payload: parsedMessage.payload
                            }));
                        }
                    });
                }
                else if (clients.has(parsedMessage.reciever) === true)
                {
                   const client = clients.get(parsedMessage.reciever);
                   if (client && client.readyState === WebSocket.OPEN)
                   {
                    client.send(JSON.stringify({
                        type: "message",
                        sender: ws.username,
                        payload: parsedMessage.payload
                    }));
                   }
                }
                else
                {
                    console.log(`User ${parsedMessage.reciever} not found.`);
                }

            // }
            // else if (parsedMessage.type === 'directMessage' && parsedMessage.reciever && parsedMessage.payload)
            // {
            //    const targetClient = clients.get(parsedMessage.reciever);
            //     if (targetClient && targetClient.ws.readyState === WebSocket.OPEN)
            //     {
            //         targetClient.ws.send(JSON.stringify({
            //             type: "directmessage",
            //             sender: ws.uid,
            //             payload: parsedMessage.payload
            //         }));
            //         console.log("DM sent successfully");
            //     }
            // else
            // {
            //     console.log("Message has no parseable type", parsedMessage.type);
            // }
            /*const message = isBinary ? data : data.toString();
            console.log(`message recieved: ${message}, ${isBinary}`);
            // this.send(message, {binary: isBinary});
            chatWebSocketServer.clients.forEach(ws => {
                ws.send(message, {binary: isBinary});
            });*/
        }});

        ws.on('close', () => {
            if (ws.username) {
                clients.delete(ws.username); }
            console.log(`Client ${ws.username} has disconnected.`)
        });

        ws.on("pong", function (buffer)
        {
            ws.isAlive = true;
        });

        ws.onerror = function(error) {
            console.log('WebSocket Error: ', error);
        };

    })

    setInterval(() =>
    {
        chatWebSocketServer.clients.forEach(ws => {
            if ((<any>ws).isAlive === false)
            {
                console.debug("client failed to ping (chat)");
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        })
    }, 30000);
};

