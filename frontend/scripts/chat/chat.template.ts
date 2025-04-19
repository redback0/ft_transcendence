
let ws: WebSocket | undefined;

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

        function connectWS()
        {
            ws = new WebSocket("/wss/chat");
            ws.onopen =  function ()
            {
                let div = document.getElementById("message-area");
                if (!div)
                    throw new Error("no place for messages");
                let para = document.createElement("p");
                para.style.fontStyle = "italic";
                para.style.color = "var(--color-gray-500)";
                para.innerText = "connected to chat";
                div.appendChild(para);
            }
            ws.onmessage = function (ev: MessageEvent)
            {
                let div = document.getElementById("message-area");
                if (!div)
                    throw new Error("no place for message");
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
            
            ws.onclose = function (ev)
            {
                let div = document.getElementById("message-area");
                if (!div)
                    throw new Error("no place for messages");
                let para = document.createElement("p");
                para.style.fontStyle = "italic";
                para.style.color = "var(--color-gray-500)";
                para.innerText = "disconnected, attempting to reconnect";
                div.appendChild(para);

                // console.log("Socket disconnected, attempting to reconnect after 1 second...");
                setTimeout(connectWS, 1000)
            }
        }
        connectWS();
    }
}

const wssMessageSender = (event: Event) =>
{
    if (!ws || ws.readyState === ws.CLOSED)
        return;
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
