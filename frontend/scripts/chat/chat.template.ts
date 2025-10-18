
// DEPRECATED

let ws: WebSocket | undefined;

export class ChatPage extends HTMLElement
{
    constructor()
    {
        super();
        this.innerHTML =
        `
            <div id="chat-widget"
                class="hidden fixed bottom-28 right-6 w-[40vw] h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40">
                
                <div class="flex flex-1">
                    <aside class="w-60 bg-gray-800 text-white flex flex-col p-4">
                        <h2 class="text-lg font-bold mb-4">Workspace</h2>

                        <!-- Channels -->
                        <div class="mb-4">
                            <h4 class="text-xs uppercase tracking-wide opacity-60 mb-2">Channels</h4>
                            <button class="flex items-center gap-2 w-full px-2 py-1 rounded-lg text-left bg-white/10 hover:bg-white/20 transition tablinks" id="default">
                                <span class="text-black-600">#general</span>
                        </div>

                        <!-- Direct Messages -->
                        <div id="tab">
                            <h4 class="text-xs uppercase tracking-wide opacity-60 mb-2">Direct Messages</h4>
                            <div id="inboxs">
                               <!-- <button class="dm-button tablinks" id="aliceButton">
                                    <img class="w-7 h-7 rounded-full" src="https://i.pravatar.cc/28?u=alice" alt="Alice">
                                    Alice
                                </button>
                                <button class="dm-button tablinks" id="bobButton">
                                    <img class="w-7 h-7 rounded-full" src="https://i.pravatar.cc/28?u=bob" alt="Bob">
                                    Bob
                                </button> -->
                            </div>
                        </div>
                            <!-- DM Request Button -->
                        <div>
                         <h4 class="text-xs uppercase tracking-wide opacity-60 mb-2">DM Request</h4>
                            <div>
                                <input type="text" class="form-control" id="dmreciever" placeholder="Username" required>
                                <button
                                    class="mt-2 w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-sm transition" id="dmreqbutton">
                                    + Send DM Request
                                </button>
                            </div>
                        </div>
                    </aside>

                    <section class="flex-1 flex flex-col">
                        <div class="p-3 border-b font-semibold bg-gray-50"id="title">#general</div>
                    <!-- Header-->
                        <div id="pages" class="relative">
                            <div id="#general" class="tabcontent">
                                <div class="chat-body">
                                    <div class="inbox" id="general-inbox">
                                    </div>
                                </div>
                            </div>
                            <div id="Alice" class="tabcontent">
                                <div class="chat-body">
                                    <div class="inbox" id="alice-inbox">
                                    </div>
                                </div>
                            </div>
                        </div>


                        <!-- Bottom Section-->
                        <div class="composer border-t p-2 flex gap-2 relative">
                            <textarea rows="1" placeholder="Type a message…" maxlength="250"
                                class="flex-1 resize-none p-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring focus:ring-indigo-300" id="messageInput" required></textarea>
                                <p id="charCount" class="text-xs text-gray-500 mt-1 text-right">0/250</p>
                            <button
                                class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition" id="sendButton">
                                Send
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
}

customElements.define('chat-page', ChatPage);
