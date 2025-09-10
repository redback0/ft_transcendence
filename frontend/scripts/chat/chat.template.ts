
let ws: WebSocket | undefined;

export class ChatPage extends HTMLElement
{
    constructor()
    {
        super();
        this.innerHTML =
        `
            <p> This be the chat page, speak!! :)) </p>
            <div class="tab">
                <button class="tablinks" id="default">General</button>
                <button class="tablinks" id="direct">Direct Message</button>
            </div>

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
                <div class="tabcontent" id="General">
                    <div class="chat-body">
                        <div class="inbox" id="general-inbox">
                        </div>
                    </div>
                </div>
                <div class="tabcontent" id="DirectMessage">
                    <div class="tab2" id="tab2">
                        <button class="tablinks2" id="testdm">Test</button>
                    </div>
                    <div class="tabcontent2" id="test">
                        <div class="chat-body">
                            <div class="inbox" id="test-inbox">
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
                    <div class="input-group" id="dmrequest">
                        <input type="text" class="form-control" id="dmreciever" placeholder="Username" required>
                        <input type="text" class="form-control" id="dmmessage" placeholder="Write message..." required>
                        <button type="button" id="dmreqbutton">Send</button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('chat-page', ChatPage);
