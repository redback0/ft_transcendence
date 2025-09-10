import { WebSocketServer, WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import { UserID } from './lobby.schema';


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

interface Channel {
    name: string;
    clients: Set<HBWebSocket>;
}

interface Client {
    sessionID: string;
    //user: string;
    ws: HBWebSocket;
}

const clients: Map<string, Client> = new Map();
const channels: Map<string, Channel> = new Map();

export function initChat()
{

    chatWebSocketServer.on("connection", function (ws: HBWebSocket)
    {
        console.log('New Client Connected');
        //const clientId = getClientNickname();
        if (ws.uid) {
            clients.set(ws.uid, {sessionID: ws.uid, ws}); }
        if (!channels.has('general'))
        {
            channels.set('general', { name: 'general', clients: new Set() });
        }
        channels.get('general')?.clients.add(ws);
        ws.on("message", (message: string) => {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage.type);
            if (parsedMessage.type === 'joinChannel' && parsedMessage.reciever) 
            {
                const channelName = parsedMessage.reciever;
                if (!channels.has(parsedMessage.reciever) && !clients.has(parsedMessage.reciever))
                {
                    channels.set(parsedMessage.reciever, {name: parsedMessage.reciever, clients: new Set()});
                }
                channels.forEach(channel => channel.clients.delete(ws));
                channels.get(parsedMessage.reciever)?.clients.add(ws);
                console.log(`${ws.username} has joined channel: ${parsedMessage.reciever}`);
            }
            else if (parsedMessage.type === 'sendMessage' && parsedMessage.reciever && parsedMessage.payload)
            {
                const targetChannel = channels.get(parsedMessage.reciever);
                if (targetChannel)
                {
                    targetChannel.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN){
                            client.send(JSON.stringify({
                                type: "general",
                                sender: ws.username,
                                payload: parsedMessage.payload
                            }));
                        }
                    });
                }
            }
            else if (parsedMessage.type === 'directMessage' && parsedMessage.reciever && parsedMessage.payload)
            {
               const targetClient = clients.get(parsedMessage.reciever);
                if (targetClient && targetClient.ws.readyState === WebSocket.OPEN)
                {
                    targetClient.ws.send(JSON.stringify({
                        type: "directmessage",
                        sender: ws.uid,
                        payload: parsedMessage.payload
                    }));
                    console.log("DM sent successfully");
                }
                else
                {
                    console.log(`User ${parsedMessage.reciever} not found.`);
                }
            }
            else
            {
                console.log("Message has no parseable type", parsedMessage.type);
            }
            /*const message = isBinary ? data : data.toString();
            console.log(`message recieved: ${message}, ${isBinary}`);
            // this.send(message, {binary: isBinary});
            chatWebSocketServer.clients.forEach(ws => {
                ws.send(message, {binary: isBinary});
            });*/
        });

        ws.on('close', () => {
            channels.forEach(channel => channel.clients.delete(ws));
            if (ws.uid) {
                clients.delete(ws.uid); }
            console.log(`Client ${ws.username} has disconnected.`)
        });

        ws.on("pong", function (buffer)
        {
            ws.isAlive = true;
        });

        ws.onerror = function(error) {
            console.log('WebSocket Error: ', error);
        };

    const interval = setInterval(() =>
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
    }, 30000)
    }
)};


function getClientNickname()
{
    //something with sql pulling to get nickname from database based on login
}