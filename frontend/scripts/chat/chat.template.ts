
var ws: WebSocket;

export class ChatPage extends HTMLElement
{
    constructor()
    {
        super()
        let para = document.createElement("p");
        para.id = "last-message";
        this.appendChild(para);

        let messageTB = document.createElement("input")
        messageTB.type = "text";
        messageTB.id = "message-tb";
        this.appendChild(messageTB);

        let senderButton = document.createElement("button");
        senderButton.textContent = "send message";
        senderButton.addEventListener("click", wssMessageSender);
        this.appendChild(senderButton);

        ws = new WebSocket("/api/wss");
        ws.onopen =  function ()
        {
            let para = document.getElementById("last-message");
            if (para)
                para.innerText = "Connection opened";
        }
        ws.onmessage = function (ev: MessageEvent)
        {
            let para = document.getElementById("last-message");
            if (!para)
                throw new Error("no place to put message");
            if (typeof ev.data === "string")
            {
                console.log(`message recieved: ${ev.data as string}`)
                para.innerText = ev.data as string;
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
        throw new Error("Text box not a text box?")
    if (messageTB.value.length > 0)
        ws.send(messageTB.value);
}

customElements.define('chat-page', ChatPage);
