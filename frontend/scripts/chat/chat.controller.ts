//Authored by Bethany Milford 29/07/25
import { newPage, onPageChange } from "../index.js";
import { fetchBlockedFriends, fetchBlockedStatus, getUserIdFromUsername } from "../friends/friends.controller.js";
import { ChatClientSendMessage, ChatClientMessage, ChatServerMessage } from '../chat.schema.js';

let ws:  WebSocket | undefined;
let friends: string[] = [];
const Channels: Map<string, HTMLElement> = new Map();
let is_active: string;

export function closeChat()
{
    const widget = document.getElementById('chat-widget');
    widget?.classList.add('hidden');
}

export function ChatPostLoad(page: HTMLElement)
{ 
    const chatButton = document.getElementById('chat-icon');
    chatButton?.addEventListener('click', async (event) => 
    {
        const widget = document.getElementById('chat-widget')
        widget?.classList.toggle('hidden');
    });
    onPageChange(() =>
    {
        ws?.close();
        ws = undefined;
    });

    // if (Channels.has('Alice') === false)
    // {
    //     const generalInbox = document.getElementById('alice-inbox');
    //     if (generalInbox)
    //     {
    //         Channels.set('Alice', generalInbox);
    //     }
    //     else
    //     {
    //         throw Error("Uh oh stinky");
    //     }
    // }
    if( Channels.has('#general') === false && Channels.has('#tournament') === false)
    {
        const generalInbox = document.getElementById('general-inbox');
        const tourInbox = document.getElementById('tournament-inbox');
        if (generalInbox)
            Channels.set('#general', generalInbox);
        else
            throw Error("Uh oh stinky");
        if (tourInbox)
            Channels.set('#tournament', tourInbox);
        else
            throw Error("Uh oh stinky");
    }
    const MessageInput = (document.getElementById('messageInput') as HTMLInputElement);
    if (MessageInput)
    {
        MessageInput.onkeydown = (event) =>
        {
            if (event.key === "Enter")
            {
                event.preventDefault();
                const active = Channels.get(is_active);
                if (active)
                {
                    wssMessageSender({ type: "send_message", data: { payload: MessageInput.value, reciever: is_active, is_invite: false }});
                }
                else
                    console.log("is_active value is invalid", is_active);
                MessageInput.value = "";
            }
        };
    }
    const defaultButton = document.getElementById('#generalButton');
    defaultButton?.addEventListener("click", async (event) =>
    { 
        openChat("#general", event);  
    });
    const tourButton = document.getElementById('#tournamentButton');
    tourButton?.addEventListener("click", async (event) =>
    { 
        openChat("#tournament", event);  
    });
    // const dmButton = document.getElementById('direct');
    // dmButton?.addEventListener("click", async (event)=>
    // {
    //     openChat("DirectMessage", event);
    // });
    // const aliceButton = document.getElementById('aliceButton');
    // aliceButton?.addEventListener("click", async (event) => 
    // {
    //     openChat("Alice", event);
    // })

    defaultButton?.click();
    // Sending text button
    const SendButton = document.getElementById('sendButton');
    SendButton?.addEventListener("click", async (event) =>
    {
        const messageInput = (document.getElementById('messageInput') as HTMLInputElement);
        const message = messageInput.value;
        if ( is_active === "#general")
        {
            wssMessageSender({ type: "send_message", data: { payload: message, reciever: "#general", is_invite: false }});
        }
        // else if (is_active === "Alice")
        // {
        //     wssMessageSender("message", message, "Alice")
        // }
       else 
       {
            if (Channels.has(is_active) === true && is_active != undefined)
            {
                    wssMessageSender({ type: "send_message", data: { payload: message, reciever: is_active, is_invite: false }});
            }
            else 
            {
                console.log("reciever doesnt exist");
            }
        }
       messageInput.value = '';
       //SendButton.innerHTML = `<p> Failed </p>`;
    });

    const InviteButton = document.getElementById('inviteButton');
    InviteButton?.addEventListener("click", async (event) =>
    {
        // TODO: make this send only important info (game/id)
        const url = document.location.href;
        if (url.includes("/game/online")|| url.includes("/tournaments/")) {
            wssMessageSender({
                type: "send_message",
                data: {
                    reciever: is_active,
                    payload: url,
                    is_invite: true,
                }
            });
        }
        else 
            console.log("Not on an applciable url");
        console.log(url);
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
        if (targetclient === -1 && reciever !== "" && targetclient != undefined)
        {
            newDM("New Message Request", reciever, "outgoing");
            friends.push(reciever);
        }
        else
        {
            console.log("Inbox already exists.");
            console.log(friends);
        }
        target.value = '';
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
                wssMessageSender({type: "send_message", data: { payload: "New Client Connected", reciever: "#general", is_invite: false }});
            }
        }
        ws.onmessage = async function (ev: MessageEvent)
        {
            try {
                const parsedMessage: ChatServerMessage = JSON.parse(ev.data);
                //console.log(parsedMessage.data.sender, parsedMessage.payload, parsedMessage.type, parsedMessage.channel);
                //if (parsedMessage.username)
                //    setUsername(parsedMessage.username);
                if (parsedMessage.type === "recieve_channel_message" || parsedMessage.type === "recieve_direct_message")
                {
                    const is_blocked = await checkIfBlocked(parsedMessage.data.sender);
                    if (is_blocked === true 
                        || (!parsedMessage.data.sender.startsWith('#') && is_blocked === null))
                    {
                        console.log("User is blocked or has blocked them or unable to fetch info");
                        return ;
                    }
                    if (parsedMessage.type === "recieve_channel_message")
                    {
                        console.log(`new chan msg from '${parsedMessage.data.sender}': ${parsedMessage.data.payload}`);
                        const client = Channels.get(parsedMessage.data.channel);
                        if (client)
                            messageReciever(parsedMessage.data.payload, parsedMessage.data.sender, client, parsedMessage.data.is_invite ? "invite" : "message");
                    }
                    else if (parsedMessage.type === "recieve_direct_message")
                    {
                        console.log(`new dm from '${parsedMessage.data.sender}': ${parsedMessage.data.payload}`);
                        const client = Channels.get(parsedMessage.data.sender);
                        if (client)
                            messageReciever(parsedMessage.data.payload, parsedMessage.data.sender, client, parsedMessage.data.is_invite ? "invite" : "message");
                        else if (parsedMessage.data.sender !== undefined)
                        {
                            newDM(parsedMessage.data.payload, parsedMessage.data.sender, "incoming");
                            friends.push(parsedMessage.data.sender);
                        }
                    }
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
                setTimeout(connectWS, 1000);
            }
            catch{}
        }   
    }
    connectWS();

}

const messageReciever = (msg: string, sender: string, inbox: HTMLElement, type: "message" | "info" | "invite" = "message") =>
{
    let bubble = document.createElement("div");
    bubble.classList.add('received-chats', 'mb-2');
    let header = document.createElement("div");
    header.classList.add('received-chats-sender', 'text-(--color2)');

    let userlink = document.createElement("a");
    userlink.href = '/users?id=' + sender;
    userlink.onclick = (e) =>
    {
        e.preventDefault();
        
        if (!(e.target instanceof HTMLAnchorElement))
            return;

        const newURL = e.target.href;

        history.pushState({}, "", newURL);

        newPage();
    }
    console.log(userlink.href);
    userlink.innerText = sender;

    let message = document.createElement("div");
    message.classList.add('received-msg');

    const send = document.createElement("p");
    if (type === "invite")
    {
        const a = document.createElement("a");
        a.href = msg;
        send.innerText = "You've been invited to play a game"
        a.appendChild(send);
        message.appendChild(a);
    }
    else
    {
        send.innerText = msg;
        if (type === "info")
        {
            send.classList.add('italic', 'var(--color-gray-500)');
            userlink.href = "";
        }
        message.appendChild(send);
    }
    inbox.insertBefore(bubble, inbox.children[0])
    bubble.appendChild(header);
    header.appendChild(userlink);
    bubble.appendChild(message);
}
const outgoingMessage = (msg: string, inbox: string, type: "normal" | "info" = "normal") =>
{   
    if (Channels.has(inbox) === true)
    {
        const client = Channels.get(inbox);
        if (client)
        {
            const bubble = document.createElement("div")
            bubble.classList.add('received-chats', 'mb-2');
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
            client.insertBefore(bubble, client.children[0])
            bubble.appendChild(message);
            message.appendChild(send);
        }
    }
    else
        console.log("Inbox doesnt exist from outgoing message");

}

const wssMessageSender = (msg: ChatClientSendMessage) =>
{
    if (!ws || ws.readyState === ws.CLOSED)
        return;
    if (!msg.data.payload.length)
        return;
    if (msg.data.payload.length > 0)
    {
        ws?.send(JSON.stringify(msg));
    }
   outgoingMessage(msg.data.payload, msg.data.reciever);
   console.log(msg.type, msg.data.payload, msg.data.reciever);
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
        tablinks[index].classList.remove('active', 'bg-white/10');
    }
    const tab = (document.getElementById(chatName) as HTMLElement);
    tab.style.display = "block";
    const tabButton = (document.getElementById(chatName + "Button") as HTMLElement);
    tabButton.classList.add('active', 'bg-white/10');
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
        dmButton.classList.add('tablinks', 'dm-button');
        dmButton.id = sender + "Button";
        // const img = document.createElement("img") as HTMLImageElement;
        // img.classList.add('w-7', 'h-7', 'rounded-full');
        // img.src = getAvatar(sender);
        // dmButton.appendChild(img);
        dmButton.textContent += sender;
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
        inbox.classList.add('inbox', 'h-[calc(95vh-200px)]', 'overflow-y-scroll', 'flex', 'flex-col-reverse');
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
                else if (type === "invite")
                {
                    messageReciever(message, sender, setChannel, "invite");
                }
                else {
                    wssMessageSender({ type: "send_message", data: { payload: message, reciever: sender, is_invite: false }});
                    openChat(sender, event);
                }
            }
            // else if (setChannel)
            //     messageReciever(message, sender, setChannel);
        }
    }
}

// const setUsername = (username: string) =>
// {
//     const user = document.getElementById('user');
//     const content = document.createElement("p");
//     content.innerText = username;
//     if (user)
//     {
//         user.appendChild(content);
//     }
// }

// const getAvatar = (sender: string) =>
// {
//     return "path";
// }


// const sendToPlayer = (player: string, message: string, type: string) =>
// {
//     const inbox = document.getElementById('tournament-inbox');
//     if (inbox)
//         messageReciever(message, "Tournament", inbox, "info");
// }

async function checkIfBlocked(username: string)
{
    const user_id = await getUserIdFromUsername(username);
    if (user_id)
    {
        const ifblocked = await fetchBlockedStatus(user_id);
        if (ifblocked.friendIBlocked === true || ifblocked.friendWhomBlockedMe === true)
            return true;
        return false;
    }
    return null;
}