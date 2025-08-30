import { WebSocketServer, WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';


class HBWebSocket extends WebSocket
{
    isAlive: boolean = true;
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
    nickname: string;
    ws: WebSocket;
}

const clients: Map<string, Client> = new Map();
const channels: Map<string, Channel> = new Map();

export function initChat()
{

    chatWebSocketServer.on("connection", function (ws: HBWebSocket)
    {
        console.log('New Client Connected');
        //const clientId = getClientNickname();
        const clientId = "1";
        clients.set(clientId, {nickname: clientId, ws});
        if (!channels.has('general'))
        {
            channels.set('general', { name: 'general', clients: new Set() });
        }
        channels.get('general')?.clients.add(ws);
        ws.on("message", (message: string) => {
            const parsedMessage = JSON.parse(message);
            const {type, payload, reciever } = parsedMessage; 

            if (parsedMessage.type === 'joinChannel' && parsedMessage.reciever) 
            {
                const channelName = parsedMessage.reciever;
                if (!channels.has(reciever) && !clients.has(reciever))
                {
                    channels.set(reciever, {name: reciever, clients: new Set()});
                }
                channels.forEach(channel => channel.clients.delete(ws));
                channels.get(reciever)?.clients.add(ws);
                console.log(`${clientId} has joined channel: ${reciever}`);
            }
            else if (parsedMessage.type === 'sendMessage' && parsedMessage.reciever && parsedMessage.payload)
            {
                const targetChannel = channels.get(parsedMessage.reciever);
                if (targetChannel)
                {
                    targetChannel.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN){
                            client.send(JSON.stringify(parsedMessage.payload));
                        }
                    });
                }
            }
            /*else if (parsedMessage.type === 'directMessage' && parsedMessage.reciever && parsedMessage.payload)
            {
                const targetClient = this.clients.get(parsedMessage.reciever);
                if (targetClient && targetClient.readyState === WebSocket.OPEN)
                {
                    targetClient.send(JSON.stringify({
                        from: clientId,
                        payload: parsedMessage.payload
                    }));
                }
                else
                {
                    console.log(`User ${parsedMessage.reciever} not found.`);
                }
            }*/
            /*const message = isBinary ? data : data.toString();
            console.log(`message recieved: ${message}, ${isBinary}`);
            // this.send(message, {binary: isBinary});
            chatWebSocketServer.clients.forEach(ws => {
                ws.send(message, {binary: isBinary});
            });*/
        });

        ws.on('close', () => {
            const client = clients.get(clientId);
            if (client)
            {
                channels.forEach(channel => channel.clients.delete(ws));
                clients.delete(clientId);
                console.log(`Client ${clientId} has disconnected.`)
            }
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