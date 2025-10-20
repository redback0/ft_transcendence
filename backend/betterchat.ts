import { WebSocketServer, WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import { UserID } from './lobby.schema';
import { ChatClientMessage, ChatServerMessage, ChatClientRecieveDirectMessage } from './chat.schema';


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
        console.log('New Client Connected');
        if (ws.username) {
            clients.set(ws.username, ws);
            send(ws, { type: "your_name", data: { ya_name: ws.username }});
            console.log(`name: ${ws.username}`);
        } else {
            console.warn("ws has no username");
        }
        ws.on("message", (message: string) => {
            const parsedMessage: ChatClientMessage = JSON.parse(message);
            console.log(parsedMessage.type);
            if (parsedMessage.type === 'send_message' && parsedMessage.data && parsedMessage.data.reciever && parsedMessage.data.payload)
            {
                console.log( parsedMessage.type, parsedMessage.data.reciever, parsedMessage.data.payload);
                if (parsedMessage.data.reciever[0] === '#')
                {
                    clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN && ws.username)
                        {
                            send(client, {
                                type: "recieve_channel_message",
                                data: {
                                    channel: parsedMessage.data.reciever,
                                    sender: ws.username,
                                    payload: parsedMessage.data.payload,
                                    is_invite: parsedMessage.data.is_invite
                                }
                            })
                        }
                    });
                }
                else if (clients.has(parsedMessage.data.reciever) === true)
                {
                   const client = clients.get(parsedMessage.data.reciever);
                   if (client && client.readyState === WebSocket.OPEN && ws.username)
                   {
                        send(client, {
                            type: "recieve_direct_message",
                            data: {
                                sender: ws.username,
                                payload: parsedMessage.data.payload,
                                is_invite: parsedMessage.data.is_invite
                            }
                        });
                        // client.send(JSON.stringify({
                        //     type: parsedMessage.type,
                        //     sender: ws.username,
                        //     payload: parsedMessage.data.payload
                        // }));
                   }
                }
                else
                {
                    console.log(`User ${parsedMessage.data.reciever} not found.`);
                    if (ws && ws.readyState === WebSocket.OPEN)
                    {
                        send(ws, {
                            type: "recieve_direct_message",
                            data: {
                                sender: parsedMessage.data.reciever,
                                payload: "Error: User does not exist/ is currently not online",
                                is_invite: false
                            }
                        });
                        // ws.send(JSON.stringify({
                        //     type: parsedMessage.type,
                        //     sender: parsedMessage.data.reciever,
                        //     payload: "Error: User does not exist/ is currently not online"
                        // }));
                    }
                }

            // }
            // else if (parsedMessage.type === 'directMessage' && parsedMessage.data.reciever && parsedMessage.data.payload)
            // {
            //    const targetClient = clients.get(parsedMessage.data.reciever);
            //     if (targetClient && targetClient.ws.readyState === WebSocket.OPEN)
            //     {
            //         targetClient.ws.send(JSON.stringify({
            //             type: "directmessage",
            //             sender: ws.uid,
            //             payload: parsedMessage.data.payload
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
            if (ws.isAlive === false)
            {
                console.debug("client failed to ping (chat)");
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        })
    }, 30000);

    function send(ws: HBWebSocket, msg: ChatServerMessage) {
        ws.send(JSON.stringify(msg));
    }
};

