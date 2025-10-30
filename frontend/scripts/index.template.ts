import { initialiseHeartbeat } from "./heartbeat.js";
import { NavOnClick, newPage } from "./index.js";
import { t } from './translation.js';

export class IndexPage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
            <form id="login-form">
                <h1 style="font-weight:bold; font-size:10vh; text-align:center !important; background-color:#520404; color:#DED19C; margin-bottom: 3vh">
                    ${t('loginTitle')}
                </h1>

                <p style="font-size:2vh; color:#520404; margin-top:3vh; font-weight:bold">
                    ${t('username')}
                </p>
                <input id="username-input" class="loginhome-input" type="text" name="username" placeholder="${t('enterUsername')}" autocomplete="off" style="margin-bottom: 2vh; color:#DED19C;" required>

                <p style="font-size:2vh; color:#520404; margin-top: 2vh; font-weight:bold">
                    ${t('password')}
                </p>
                <input id="password-input" class="loginhome-input" type="password" name="password" placeholder="${t('enterPassword')}" autocomplete="off" style="color:#DED19C;" required>

                <div style="display: flex; justify-content:space-between; align-items:center; width: 100%;">
                    <p id="login-error" style="font-weight:bold; font-size:1.5vh; color:red; margin: 0;"></p>
                    <div>
                        <p style="font-size:1.75vh; color:#520404; margin:0; display:inline;">
                            ${t('noAccountQuestion')}
                        </p>
                        <p style="font-weight:bold; font-size:1.75vh; color:#520404; margin:0; display:inline;"><a id="signup-nav-button" href="/signup">
                            ${t('signUpButton')}
                        </a></p>
                    </div>
                </div>
                <h1 id="login-button" class="loginhome-redHover" style="font-weight:bold; font-size:10vh; color:#520404">
                    ${t('playButton')}
                </h1>
            </form>
            `
    }
}

export function IndexPostLoad(page: HTMLElement)
{
    const SignUpNavButton = document.getElementById("signup-nav-button");
    if (SignUpNavButton) SignUpNavButton.onclick = NavOnClick;

    const LoginButton = document.getElementById("login-button");

    LoginButton?.addEventListener("click", (event) =>
    {
        event.preventDefault();
        const userInput = document.getElementById("username-input");
        const passInput = document.getElementById("password-input");
        const errorText = document.getElementById("login-error");
        if (!(userInput instanceof HTMLInputElement))
        {
            if (errorText) errorText.textContent = t('errUserTextbox');
            return;
        }
        if (!(passInput instanceof HTMLInputElement))
        {
            if (errorText) errorText.textContent = t('errPwTextbox');
            return;
        }

        const user = userInput.value;
        const pass = passInput.value;

        if (user === "")
        {
            if (errorText) errorText.textContent = t('errNoUsername');
            return;
        }
        if (pass === "")
        {
            if (errorText) errorText.textContent = t('errNoPw');
            return;
        }

        fetch("/api/user/session", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: user,
                password: pass
            })
        }).then(async (response) => {
            // change page to play if successful
            if (!response.ok)
            {
				console.log(`Post Login: response is not okay: ${response.status} ${response.statusText}`);
                if (response.status >= 400 && response.status < 500)
                {
                    response.json().then((obj) =>
                    {
                        const error: string = obj.error;
                        console.log(error);
                        if (errorText) errorText.textContent = error.toUpperCase();
                    });
                }
                else
                {
                    console.log("Unknown error");
                    if (errorText) errorText.textContent = t('errUnknown');
                }
                return;
            }

            const sessionInfo = await fetch("/api/user/session");
            if (sessionInfo.ok)
            {
                const userInfo = await sessionInfo.json();
                const usernameElement = document.getElementById("username");
                const avatarElement = document.getElementById("avatar");
                if (usernameElement instanceof HTMLParagraphElement)
                    usernameElement.innerText = user;
                if (avatarElement instanceof HTMLImageElement)
                {
                    avatarElement.src = "/api/user/" + userInfo?.user_id + "/avatar";
                    avatarElement.classList.remove('hidden');
                }
            }

            initialiseHeartbeat();
            history.pushState({}, "", "/game");
            newPage()
        });
    })
}

customElements.define('index-page', IndexPage)
