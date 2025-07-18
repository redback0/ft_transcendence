
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

export function initChat()
{

    chatWebSocketServer.on("connection", function (ws: HBWebSocket)
    {
        console.log("new client");

        ws.on("message", function (data, isBinary: boolean)
        {
            const message = isBinary ? data : data.toString();
            console.log(`message recieved: ${message}, ${isBinary}`);
            // this.send(message, {binary: isBinary});
            chatWebSocketServer.clients.forEach(ws => {
                ws.send(message, {binary: isBinary});
            });
        });

        ws.on("close", function (code, reason)
        {
            // console.log("connection closed");
        });

        ws.on("pong", function (buffer)
        {
            ws.isAlive = true;
        });
    });

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

// Server tingz!!
class Server
{// user connects as soon as they sign in!
    private _client: string[] = [];

    pollsockets(): void
    {

    }
    start(): void
    {

    }
    commandPrivmsg(message: Message, client: Client): void
    {
        if (message.ParamsSize < 1)
            client.queueaddline(client.username + " : no recipient given PRIVMSG");
        else if (message.ParamsSize < 2)
            client.queueaddline(client.username + " : no text to send");
        let recipients: string[] = split_space(message.parameter(0), ",");
        let index: number = 0;
        while (index < recipients.length)
        {
            if (this._client.indexOf(recipients[index]) != -1)
            {
                const clients = this._client.get(recipients[index]);
                clients.queueaddline(
                    ":" + client.username
                    + " PRIVMSG"
                    + " " + recipients[index]
                    + " :" + message.parameter(1)                
                );
            }
            else
            {
                client.queueaddline(
                    client.username
                    + " "
                    + recipients[index]
                    + " :no such user"
                );
            }
        }
        index++;
    }
}
function isspace(c: string): boolean
{
    return /\.s/.test(c);
}
export function split_space(string: string, delim: string): string[]
{
    let split: string[] = [];
    let start: number = 0;
    let end: number = 0;

    while ((end = string.indexOf(delim, start)) != -1)
    {
        split.push(string.slice(start, end - start));
        start = end + delim.length;
    }
    split.push(string.slice(start, end));
    return split;
}
// Message Things
class Message
{
    private _prefix: string = "";
    private _command: string = "";
    private _parameters: string[] = [];

    constructor(){}

// getters
    get prefix(): string 
    {
        return this._prefix;
    }
    get command(): string
    {
        return this._command;
    }
    get parameters(): string[]
    {
        return this._parameters;
    }
    get parameter(index: number): string
    {
        if (index > this._parameters.length)
            throw new Error("that arguement doesnt exist")
        return this._parameters[index];
    }
    get ParamsSize(): number
    {
        return this._parameters.length;
    }
// setters
    set prefix(prefix: string): void
    {
        this._prefix = prefix;
    }
    set command(command: string): void
    {
        this._command = command;
    }
    set parameters(parameters: string[]): void
    {
        this._parameters = [...parameters];
    }
// the real functions -> ive kept all the naming and overall structure of the ft_irc
    splitRaw(raw: string): any
    {
        const delim: string = " :";
        let multiword: string = ""
        let splitted: string[] = [];
        const result: number = raw.indexOf(delim);

        if (result !== -1)
        {
            multiword = raw.slice(result + delim.length);
            raw = raw.slice(0, raw.length - (multiword.length + 2));
        }
        const tokens = raw.split(/\s+/);
        for (const token of tokens)
        {
            splitted.push(token);
        }
        if (result != -1)
            splitted.push(multiword);
        return splitted;   
    }
    assignVars(splitted: string[]): void
    {
        if (splitted[0][0] == ':')
        {
            this.prefix = splitted[0];
            splitted.splice(1,0);
        }
        //this.command = 2 -> i need to figure out how to assign the command..
        splitted.splice(1,0);
        this.parameters = splitted;
    }
    trimWhite(string: string): string
    {
        let index: number = 0;
        while (index < string.length && isspace(string[index]) != true)
            index++;
        const newstring = string.slice(0,index);
        return newstring;
    }
}
// Client Things
class Client //extends Nicole's Users
{
    private _username: string = '';
    private _buffer: string = '';
    private _queue: string = '';

    get username(): string
    {
        return this._username;
    }
    get queue(): string
    {
        return this._queue;
    }
    
    welcome(): void
    {
        this.queueaddline(
            this.username
            + " :Welcome to the chat room! "
            + this.username
        );
    }
    queuewaiting(): boolean
    {
        return (!this._queue);
    }
    queueadd(appendmsg: string): void
    {
        this._queue.concat(appendmsg);
    }
    queueaddline(appendmsg: string): void
    {
        this._queue.concat(appendmsg + "\r\n");
    }
    queueflush(): void
    {
        if (this.queuewaiting() == true)
        {
            //let written_bytes: number = send() -> this probs doesnt need to exist for ts!
        }
    }

}

// Channel things
class Channel
{
    private flags = 
    {
       // isInviteOnly: false -> if we add any flags, its a format - Beth
    }

    private clientLimit: number = 0;
    private clients: ClientInfo[] = [];
    //private inviteList: string[]; -> for if we add more channel - Beth
    private channelName: string = '';

    private getClientInfo(nickename: string): ClientInfo // in ft_irc it returns a pointer -> Beth
    {

    }
	private sendToClient(nickname: string, message: string): void // to be declared as readonly in user class -> beth
    {

    }

    interface ClientFlags {
        recievesServerNotices = false;
        recievesWallops = false;
        isInvisible = false;
    }
    interface ClientInfo {
        nickname: string;
        flags: ClientFlags;
    }
    type ClientMap = Map<string, Client>;

    constructor(channelname: string, clientmap: ClientMap, creator: Client)
    {
        this.channelName = channelname;
        this.ClientMap = clientmap;
    }

    function sendToAll(msg: string): void
    {
        for(start: number = )
    }
    function recvPrivMessage(sender: Client, message: string): void
    {

    }
    function addClient(nickname: Client, key: string): void
    {

    }
    //void addToInviteList(Client& fromNick, const std::string& toNick);
    function removeClient(nickname: string): void
    {

    }
    type getAllClientInfo(ClientInfo[] = [])
}



