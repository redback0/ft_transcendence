
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
    }
}

const messageReciever = (msg: string, type: "normal" | "info" = "normal") =>
{
    let div = document.getElementById("message-area");
    if (!div)
        throw new Error("no place for messages");
    let para = document.createElement("p");
    para.innerText = msg;
    if (type === "info")
    {
        para.style.fontStyle = "italic";
        para.style.color = "var(--color-gray-500)";
    }
    div.appendChild(para);
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
