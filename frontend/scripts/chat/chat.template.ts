
let ws: WebSocket | undefined;

export class ChatPage extends HTMLElement
{
    constructor()
    {
        super();
        this.innerHTML =
        `
            <p> This be the chat page, speak!! :)) </p>
            <div class="msg-container">
            <!-- Header-->
                <div class="msg-top">
                    <div class="head-cont" id="head-cont">
                        <img src="avatar" class="avatar">
                        <div class="active" id="user">
                            <p>UserName</p>
                        </div>
                    </div>
                </div>
                <!-- Main Message Body-->
                <div class="chat-body">
                    <div class="inbox">
                        <div class="received-chats">
                            <div class="received-chats-img">
                                <img src="avatar">
                            </div>
                            <div class="received-msg" id="recieved-msg">
                                <span class="time">Date</span>
                            </div> 
                        </div>
                        <div class="outgoing-chats">
                            <div class="outgoing-chats-img">
                                <img src="avatar">
                            </div>
                            <div class="outgoing-msg" id="outgoing-msg">
                                <span class="time">Date</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Bottom Section-->
                <div class="msg-bottom">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Write message..." id="messageInput" required>
                        <button type="button" id="sendButton">Send</button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('chat-page', ChatPage);
