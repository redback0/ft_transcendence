
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
                <div class="msg-top">
                    <div class="head-cont">
                        <img src="avatar" class="avatar">
                        <div class="active">
                            <p>UserName</p>
                        </div>
                    </div>
                </div>
                <div class="chat-body">
                    <div class="inbox">
                        <div class="msg-page">
                            <div class="received-chats-img">
                                <img src="avatar">
                            </div>
                                <div class="received-msg-inbox">
                                    <p> Hello besties!!! </p>
                                    <span class="time">Date</span>
                                </div>
                        </div>
                    <div class="msg-bottom">
                        <input type="text" class="form-control" placeholder="Write message...">
                        <div class="input-group-append ">
                            <span class="input-group-text send-icon "><i class="bi bi-send "></i>
                            </span>
                        </div>
                    </div>
                <div class="received-chats">
                    <div class="received-chats-img">
                        <img src="avatar">
                    </div>
                    <div class="received-msg">
                        <div class="received-msg-inbox">
                            <p class="single-msg"></p>
                            <span class="time">Date</span>
                        </div>
                    </div> 
                </div>
                <div class="outgoing-chats">
                    <div class="outgoing-chats-img">
                        <img src="avatar">
                    </div>
                    <div class="outgoing-msg">
                        <div class="outgoing-chats-msg">
                            <p class="multi-msg">Hi bestie boo!!! </p>
                            <p class="multi-msg"> Teehee </p>
                        <span class="time">Date</span>
                    </div>
                </div>
            </div>
        `
    }
}

customElements.define('chat-page', ChatPage);
