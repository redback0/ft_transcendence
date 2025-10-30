
export class UserPage extends HTMLElement 
{
    constructor() {
        super()
        let searchParams = new URLSearchParams(window.location.search);
        let username = searchParams.get("id");
        if (!username)
        {
            return;
        }
        this.innerHTML = 
            ` 
              <section class="flex flex-col items-center text-center">
                    <img alt="User Avatar" id="avatar"
                        class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#520404] object-cover">
                    <h2 class="mt-4 text-2xl sm:text-3xl font-extrabold" id="user">${username}</h2>
                </section>

                <section class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                    <div>
                        <p class="text-3xl font-extrabold" id="wins_tally"></p>
                        <p class="font-semibold">Wins</p>
                    </div>
                    <div>
                        <p class="text-3xl font-extrabold" id="loss_tally"></p>
                        <p class="font-semibold">Losses</p>
                    </div>
                </section>

                <div id="match-main-content">

                    <div style="margin-top: 3vh;">
                        <h1 style="text-align:center; font-weight:bold; font-size:5vh; color:#520404">MATCH HISTORY:</h1>
                        <div id="table-matches"><p style="text-align:center; color:#520404; opacity:0.7;">Loading matches...</p></div>
                    </div>

                </div>

            `;
    }
}
customElements.define('user-page', UserPage);