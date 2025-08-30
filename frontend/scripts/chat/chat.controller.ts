//Authored by Bethany Milford 29/07/25

import { isPartOfTypeOnlyImportOrExportDeclaration } from "typescript";

let ws:  WebSocket | undefined;
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
    //document.getElementById('default')?.click();
    /*function openChat(event: any, chatName: string) 
    {
        var index, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName("tabcontent");
        for(index = 0; index < tabcontent.length; index++) {
            tabcontent[index].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for(index = 0; index < tablinks.length; index++) {
            tablinks[index].className = tablinks[index].className.replace(" active", "");
        }
        //document.getElementById(chatName)?.style.display = "block";
        event.currentTarget.className += " active";
    } */
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
        /*if (document.getElementById("General")?.hasAttribute(" active"))
        {
            wssMessageSender("sendMessage", message, "general");
        }*/
       wssMessageSender("sendMessage", message, "general");
       outgoingMessage(message);
       // else 
       // {
            //   wssMessageSender("directMessage", message, client);
       // }
       messageInput.value = "";
       SendButton.innerHTML = `<p> Success </p>`;
    });

    window.addEventListener("popstate", function disconnectChat(e)
    {
        ws?.close();
        this.removeEventListener("popstate", disconnectChat);
    });

    function connectWS()
    {
        ws = new WebSocket("/wss/chat");
        ws.onopen = function ()
        {
            messageReciever("connected to chat", "info");
            wssMessageSender("sendMessage", "New Client Connected", "general");
        }
        ws.onmessage = function (ev: MessageEvent)
        {
            if (typeof ev.data === "string")
            {
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
            catch{}
        }   
    }
    connectWS();

}

const messageReciever = (msg: string, type: "normal" | "info" = "normal") =>
{
    const div = document.getElementById('recieved-msg');
    let para = document.createElement("p");
    para.innerText = msg;
    if (type === "info")
    {
        para.style.fontStyle = "italic";
        para.style.color = "var(--color-gray-500)";
    }
    if (div)
    {
        div.appendChild(para);
    }
}

const outgoingMessage = (msg: string, type: "normal" | "info" = "normal") =>
{
    const div = document.getElementById('outgoing-msg');
    let para = document.createElement("p");
    para.innerText = msg;
    if (type == "info")
    {
        para.style.fontStyle = "italic";
        para.style.color = "var(color-pink-500)";
    }
    if (div)
    {
        div.appendChild(para);
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
   // outgoingMessage(message);
}

