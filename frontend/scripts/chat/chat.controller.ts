//Authored by Bethany Milford 29/07/25
import { onPageChange } from "../index.js";

let ws:  WebSocket | undefined;
let friends: string[] = [];
const Channels: Map<string, HTMLElement> = new Map();
let is_active: string;

export function ChatPostLoad(page: HTMLElement)
{ 
    const chatButton = document.getElementById('chat-toggle');
    chatButton?.addEventListener('click', async (event) => 
    {
        const widget = document.getElementById('chatWidget')
        widget?.classList.toggle('hidden'); 
    });
    onPageChange(() =>
    {
        ws?.close();
        ws = undefined;
    });

    if (Channels.has('Alice') === false)
    {
        const generalInbox = document.getElementById('alice-inbox');
        if (generalInbox)
        {
            Channels.set('Alice', generalInbox);
        }
        else
        {
            throw Error("Uh oh stinky");
        }
    }
    if( Channels.has('#general') === false)
    {
        const generalInbox = document.getElementById('general-inbox');
        if (generalInbox)
        {
            Channels.set('#general', generalInbox);
        }
        else
        {
            throw Error("Uh oh stinky");
        }
    }
    document.getElementById('default')?.click();
    const MessageInput = (document.getElementById('messageInput') as HTMLInputElement);
    if (MessageInput)
    {
        MessageInput.onkeydown = (event) =>
        {
            if (is_active === 'General' && event.key === "Enter")
            {
                const client = Channels.get('#general');
                if (client)
                    wssMessageSender("message", MessageInput.value, "#general");
            }
            else 
            {
                const active = Channels.get(is_active);
                if (active && event.key === "Enter")
                {
                    wssMessageSender("message", MessageInput.value, is_active); 
                }
                else
                    console.log("is_active value is invalid");
            }
        };
    }
    const defaultButton = document.getElementById('default');
    defaultButton?.addEventListener("click", async (event) =>
    { 
        openChat("General", event);  
    });
    // const dmButton = document.getElementById('direct');
    // dmButton?.addEventListener("click", async (event)=>
    // {
    //     openChat("DirectMessage", event);
    // });
    const aliceButton = document.getElementById('aliceButton');
    aliceButton?.addEventListener("click", async (event) => 
    {
        openChat("Alice", event);
    })

    //document.getElementById('default')?.click();
    // Sending text button
    const SendButton = document.getElementById('sendButton');
    SendButton?.addEventListener("click", async (event) =>
    {
        const messageInput = (document.getElementById('messageInput') as HTMLInputElement);
        const message = messageInput.value;
        if ( is_active === "General")
        {
            wssMessageSender("message", message, "#general");
            SendButton.innerHTML = `<p> General</p>`;
        }
        else if (is_active === "Alice")
        {
            wssMessageSender("message", message, "Alice")
        }
       else 
       {
            if (Channels.has(is_active) === true)
            {
                    wssMessageSender("message", message, is_active);
            }
            else 
            {
                console.log("reciever doesnt exist");
            }
            SendButton.innerHTML = `<p> DM </p>`;
        }
       messageInput.value = "";
       //SendButton.innerHTML = `<p> Failed </p>`;
    });

    window.addEventListener("popstate", function disconnectChat(e)
    {
        ws?.close();
        this.removeEventListener("popstate", disconnectChat);
    });

    const DmReqButton = document.getElementById('dmreqbutton');
    DmReqButton?.addEventListener("click", async (event) =>
    {
        const target = (document.getElementById('dmreciever')as HTMLInputElement);
        const reciever = target.value;
        const targetclient = friends.indexOf(reciever);
        if (targetclient === -1 && reciever !== "")
        {
            newDM("New Message Request", reciever, "outgoing");
            friends.push(reciever);
        }
        else
        {
            console.log("Inbox already exists.");
            console.log(friends);
        }
        target.value = "";
    });

    function connectWS()
    {
        ws = new WebSocket("/wss/chat");
        ws.onopen = function ()
        {
            const client = Channels.get('#general');
            if (client)
            {
                messageReciever("connected to chat", "Server", client, "info");
                wssMessageSender("message", "New Client Connected", '#general');
            }
        }
        ws.onmessage = function (ev: MessageEvent)
        {
            try {
                const parsedMessage = JSON.parse(ev.data);
                console.log(parsedMessage.sender, parsedMessage.payload, parsedMessage.type);
                //if (parsedMessage.username)
                //    setUsername(parsedMessage.username);
                if (parsedMessage.channel)
                {
                    const client = Channels.get('#general');
                    if (client)
                        messageReciever(parsedMessage.payload, parsedMessage.sender, client)
                }
                else if (Channels.has(parsedMessage.sender) === true)
                {
                    const client = Channels.get(parsedMessage.sender)
                    if (client)
                        messageReciever(parsedMessage.payload, parsedMessage.sender, client);
                }
                else
                {
                    newDM(parsedMessage.payload, parsedMessage.sender, "incoming");
                }
                console.log(friends);
            }
            catch (e)
            {
                console.log("unable to read message");
            }
        }
        ws.onclose = function (ev)
        {
            try
            {
                //messageReciever("disconnected, attempting to reconnect", "Server", g, "info");
                setTimeout(connectWS, 1000)
            }
            catch{}
        }   
    }
    connectWS();

}

const messageReciever = (msg: string, sender: string, inbox: HTMLElement, type: "normal" | "info" = "normal") =>
{
    let bubble = document.createElement("div");
    bubble.classList.add('received-chats');
    let header = document.createElement("div");
    header.classList.add('received-chats-sender');
    let head = document.createElement("p");
    head.innerText = sender;
    let message = document.createElement("div");
    message.classList.add('received-msg');
    let send = document.createElement("p");
    send.innerText = msg;

    if (type === "info")
    {
        send.style.fontStyle = "italic";
        send.style.color = "var(--color-gray-500)";
    }
    inbox.appendChild(bubble);
    bubble.appendChild(header);
    header.appendChild(head);
    bubble.appendChild(message);
    message.appendChild(send);
}
const outgoingMessage = (msg: string, inbox: string, type: "normal" | "info" = "normal") =>
{   
    if (Channels.has(inbox) === true)
    {
        const client = Channels.get(inbox);
        if (client)
        {
            const bubble = document.createElement("div")
            bubble.classList.add('received-chats');
            const message = document.createElement("div");
            message.classList.add('outgoing-msg');
            const send = document.createElement("p");
            send.innerText = msg;
            if (type == "info")
            {
                send.style.fontStyle = "italic";
                send.style.color = "var(color-pink-500)";
            }
            client.appendChild(bubble);
            bubble.appendChild(message);
            message.appendChild(send);
        }
    }
    else
        console.log("Inbox doesnt exist from outgoing message");

}

const wssMessageSender = (type: string, message: string, reciever: string) =>
{
    if (!ws || ws.readyState === ws.CLOSED)
        return;
    if (!message.length)
        return;
    if (message.length > 0)
    {
        ws?.send(JSON.stringify({
            type: type,
            payload: message,
            reciever: reciever
        }));
    }
   outgoingMessage(message, reciever);
   console.log(type, message, reciever);
}

const openChat = (chatName: string, event: any) =>
{
    var index, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for(index = 0; index < tabcontent.length; index++) {
        (tabcontent[index] as HTMLElement).style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for(index = 0; index < tablinks.length; index++) {
        tablinks[index].className = tablinks[index].className.replace(" active", "");
    }
    const tab = (document.getElementById(chatName) as HTMLElement);
    tab.style.display = "block";
    (event.currentTarget as HTMLElement).className += " active";
    is_active = chatName;
    const title = (document.getElementById("title") as HTMLElement);
    title.innerText = chatName;
}

// const openDM = (dmName: string, event: any) =>
// {
//     var index, tabcontent, tablinks;

//     tabcontent = document.getElementsByClassName("tabcontent2");
//     for(index = 0; index < tabcontent.length; index++) {
//         (tabcontent[index] as HTMLElement).style.display = "none";
//     }
//     tablinks = document.getElementsByClassName("tablinks2");
//     for(index = 0; index < tablinks.length; index++) {
//         tablinks[index].className = tablinks[index].className.replace(" active2", "");
//     }
//     const tab = (document.getElementById(dmName) as HTMLElement);
//     tab.style.display = "block";
//     (event.currentTarget as HTMLElement).className += " active2";
//     is_active = dmName;
// }

const newDM = (message: string, sender: string, type: string) =>
{
    if (sender)
    {
        const tab = document.getElementById('inboxs');
        let dmButton = document.createElement("button");
        dmButton.textContent = sender;
        dmButton.classList.add('tablinks', 'dm-button');
        dmButton.id = sender + "Button";
        dmButton.addEventListener("click", async (event) =>
        {
            event.preventDefault();
            openChat(sender, event);
        });

        const div = document.getElementById('pages');
        let tabcont = document.createElement("div");
        tabcont.classList.add('tabcontent');
        tabcont.id = sender;
        let chat = document.createElement("div");
        chat.classList.add('chat-body');
        const inbox = document.createElement("div");
        inbox.classList.add('inbox');
        inbox.id = sender + "-inbox";

        if(tab && div)
        {
            tab.appendChild(dmButton);
            div.appendChild(tabcont);
            tabcont.appendChild(chat);
            chat.appendChild(inbox);
            const setChannel = document.getElementById(inbox.id);
            if (setChannel)
            {
                Channels.set(sender, setChannel);
                if (type === "incoming")
                {
                    messageReciever(message, sender, setChannel);
                }
                else {
                    wssMessageSender("message", message, sender);
                    openChat(sender, event);
                }
            }
        }
    }
}

const setUsername = (username: string) =>
{
    const user = document.getElementById('user');
    const content = document.createElement("p");
    content.innerText = username;
    if (user)
    {
        user.appendChild(content);
    }
}

