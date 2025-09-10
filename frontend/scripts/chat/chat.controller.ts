//Authored by Bethany Milford 29/07/25

import { isPartOfTypeOnlyImportOrExportDeclaration, parseBuildCommand } from "typescript";


let ws:  WebSocket | undefined;
let friends: string[] = [];
/*export function ChatPostLoad(page: HTMLElement)
{
    let para = document.createElement("div");
    para.id = "message-area";
    page.appendChild(para);

    let messageTB = document.createElement("input")
    messageTB.type = "text";
    messageTB.id = "message-tb"; 
    messageTB.onkeydown = (event) =>
    {
        if (event.key === "Enter")
            wssMessageSender(event);
    };
    this.appendChild(messageTB);

    let senderButton = document.createElement("button");
    senderButton.textContent = "send";
    
    const senderButton.addEventListener("click", wssMessageSender);
    this.appendChild(senderButton);

    window.addEventListener("popstate", function disconnectChat(e)
    {
        ws?.close();
        this.removeEventListener("popstate", disconnectChat);
    });

    function connectWS()
    {
        ws = new WebSocket("/wss/chat");
        ws.onopen =  function ()
        {
            messageReciever("connected to chat", "info");
        }

        ws.onmessage = function (ev: MessageEvent)
        {
            if (typeof ev.data === "string")
            {
                // console.log(`message recieved: ${ev.data as string}`)
                messageReciever(ev.data);
            }
            else
            {
            console.log("unable to read message");
            }
        }

        ws.onclose = function (ev)
        {
            try
            {
                messageReciever("disconnected, attempting to reconnect", "info");
                setTimeout(connectWS, 1000)
            }
            catch {}
            // console.log("Socket disconnected, attempting to reconnect after 1 second...");
        }
    }
    connectWS();
}*/

export function ChatPostLoad(page: HTMLElement)
{
   const MessageInput = (document.getElementById('messageInput') as HTMLInputElement);
    if (MessageInput)
    {
        MessageInput.onkeydown = (event) =>
        {
            if (event.key === "Enter")
                wssMessageSender("sendMessage", MessageInput.value,"general");
        };
    }
    const defaultButton = document.getElementById('default');
    defaultButton?.addEventListener("click", async (event) =>
    { 
        event.preventDefault();
        openChat("General", event);    
    });
    const dmButton = document.getElementById('direct');
    dmButton?.addEventListener("click", async (event)=>
    {
        event.preventDefault();
        openChat("DirectMessage", event);
    });

    document.getElementById('default')?.click();
   /* function usernameSetter()
    {
        const headCont = document.getElementById('head-cont');
        const div = document.getElementById('user');
        let username = document.createElement("p");
        let user = fetchUserInfo()
        if (user)
        {
            username.innerText = user;
            div?.appendChild(username);
        }

    }*/
    const SendButton = document.getElementById('sendButton');
    SendButton?.addEventListener("click", async (event) =>
    {
        event.preventDefault();
        const messageInput = (document.getElementById('messageInput') as HTMLInputElement);
        const message = messageInput.value;
        if (document.getElementById("General")?.hasAttribute(" active"))
        {
            wssMessageSender("sendMessage", message, "general");
        }
       //wssMessageSender("sendMessage", message, "general");
       //outgoingMessage(message);
       else 
       {
            const div = document.querySelector('div.active2');
            if (div)
            {
                const reciever = div.id;
                wssMessageSender("directMessage", message, reciever);
            }
            else 
            {
                console.log("reciever doesnt exist");
            }
       }
       messageInput.value = "";
       SendButton.innerHTML = `<p> Success </p>`;
    });

    window.addEventListener("popstate", function disconnectChat(e)
    {
        ws?.close();
        this.removeEventListener("popstate", disconnectChat);
    });

    const DmReqButton = document.getElementById('dmreqbutton');
    DmReqButton?.addEventListener("click", async (event) =>
    {
        event.preventDefault();
        const reciever = (document.getElementById('dmreciever')as HTMLInputElement).value;
        const message = (document.getElementById('dmmessage')as HTMLInputElement).value;
        const targetclient = friends.indexOf(reciever);
        if (targetclient === -1)
        {
            wssMessageSender("directMessage", message, reciever);
            newDM(message, reciever, "outgoing");
            friends.push(reciever);
        }
        else
        {
            console.log("Inbox already exists.");
            console.log(friends);
        }
    });

    function connectWS()
    {
        ws = new WebSocket("/wss/chat");
        ws.onopen = function ()
        {
            messageReciever("connected to chat", "Server", "general-inbox", "info");
            wssMessageSender("sendMessage", "New Client Connected", "general");
        }
        ws.onmessage = function (ev: MessageEvent)
        {
            try {
                const parsedMessage = JSON.parse(ev.data);
                console.log(parsedMessage.sender, parsedMessage.payload, parsedMessage.type);
                if (parsedMessage.type === 'directmessage')
                {
                    const targetClient = friends.indexOf(parsedMessage.sender);
                    if (targetClient > -1)
                    {
                        messageReciever(parsedMessage.payload, parsedMessage.sender, parsedMessage.sender + "-inbox")
                        
                    }
                    else
                    {
                        friends.push(parsedMessage.sender);
                        newDM(parsedMessage.payload, parsedMessage.sender, "incoming");
                    }
                    console.log(friends);
                }
                else if (parsedMessage.type === 'general')
                {
                    messageReciever(parsedMessage.payload, parsedMessage.sender, "general-inbox");
                }
                else {
                    console.log("Unable to send message");
                    console.log(parsedMessage.type);
                }
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
                messageReciever("disconnected, attempting to reconnect", "Server", "general-inbox", "info");
                setTimeout(connectWS, 1000)
            }
            catch{}
        }   
    }
    connectWS();

}

const messageReciever = (msg: string, sender: string, inbox: string, type: "normal" | "info" = "normal") =>
{
    const div = document.getElementById(inbox);
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
    if (div)
    {
        div.appendChild(bubble);
        bubble.appendChild(header);
        header.appendChild(head);
        bubble.appendChild(message);
        message.appendChild(send);
    }
    else{
        console.log(`${inbox} doesnt exist`);
    }
}

const outgoingMessage = (msg: string, inbox: string, type: "normal" | "info" = "normal") =>
{
    const div = document.getElementById(inbox);
    let bubble = document.createElement("div")
    bubble.classList.add('received-chats');
    let message = document.createElement("div");
    message.classList.add('outgoing-msg');
    let send = document.createElement("p");
    send.innerText = msg;
    if (type == "info")
    {
        send.style.fontStyle = "italic";
        send.style.color = "var(color-pink-500)";
    }
    if (div)
    {
        div.appendChild(bubble);
        bubble.appendChild(message);
        message.appendChild(send);
    }
}

const wssMessageSender = (type:string, message: string, reciever: string) =>
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
   outgoingMessage(message, reciever + "-inbox");
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
}

const openDM = (dmName: string, event: any) =>
{
    var index, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent2");
    for(index = 0; index < tabcontent.length; index++) {
        (tabcontent[index] as HTMLElement).style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks2");
    for(index = 0; index < tablinks.length; index++) {
        tablinks[index].className = tablinks[index].className.replace(" active2", "");
    }
    const tab = (document.getElementById(dmName) as HTMLElement);
    tab.style.display = "block";
    (event.currentTarget as HTMLElement).className += " active2";
}

const newDM = (message: string, sender: string, type: string) =>
{
    const tab = document.getElementById('tab2');
    let dmButton = document.createElement("button");
    dmButton.textContent = sender;
    dmButton.classList.add('tablinks');
    dmButton.id = sender + "Button";
    dmButton.addEventListener("click", async (event) =>
    {
        event.preventDefault();
        openDM(sender, event)
    });

    const div = document.getElementById('DirectMessage');
    let tabcont = document.createElement("div");
    tabcont.classList.add('tabcontent2');
    tabcont.id = sender;
    let chat = document.createElement("div");
    chat.classList.add('chat-body');
    let inbox = document.createElement("div");
    inbox.classList.add('inbox');
    inbox.id = sender + "-inbox";

    if(tab && div)
    {
        tab.appendChild(dmButton);
        div.appendChild(tabcont);
        tabcont.appendChild(chat);
        chat.appendChild(inbox);
    }
    if (type === "incoming")
    {
        messageReciever(message, sender, inbox.id);
    }
    else {
        wssMessageSender("directMessage", message, sender);
    }
    openChat("DirectMessage", event);
    openDM(sender, event);
}

