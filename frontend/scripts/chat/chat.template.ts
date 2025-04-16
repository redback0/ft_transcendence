
var ws: WebSocket;

export class ChatPage extends HTMLElement
{
    constructor()
    {
        super()
        let para = document.createElement("div");
        para.id = "message-area";
        this.appendChild(para);

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
        senderButton.addEventListener("click", wssMessageSender);
        this.appendChild(senderButton);

        ws = new WebSocket("/wss/chat");
        ws.onopen =  function ()
        {
            let para = document.getElementById("last-message");
            if (para)
                para.innerText = "Connection opened";
        }
        ws.onmessage = function (ev: MessageEvent)
        {
            let div = document.getElementById("message-area");
            if (!div)
                throw new Error("no place to put message");
            let para = document.createElement("p");
            if (typeof ev.data === "string")
            {
                // console.log(`message recieved: ${ev.data as string}`)
                para.innerText = ev.data as string;
                div.appendChild(para);
            }
            else
            {
                console.log("unable to read message");
            }
        }
    }
}

const wssMessageSender = (event: Event) =>
{
    let messageTB = document.getElementById("message-tb");
    if (!(messageTB instanceof HTMLInputElement))
        throw new Error("Text box not found");
    if (!messageTB.value.length)
        return;
    if (messageTB.value.length > 0)
        ws.send(messageTB.value);
    messageTB.value = "";
}

customElements.define('chat-page', ChatPage);
