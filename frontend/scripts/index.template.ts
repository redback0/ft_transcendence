import { NavOnClick } from "./index.js";

export class IndexPage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
            <form id="login-form">
                <h1 style="font-weight:bold; font-size:10vh; text-align:center !important; background-color:#520404; color:#DED19C; margin-bottom: 3vh">LOGIN</h1>

                <p style="font-size:2vh; color:#520404; margin-top:3vh; font-weight:bold">USERNAME</p>
                <input id="username-input" class="loginhome-input" type="text" name="username" placeholder="ENTER USERNAME" autocomplete="off" style="margin-bottom: 2vh; color:#DED19C;" required>

                <p style="font-size:2vh; color:#520404; margin-top: 2vh; font-weight:bold">PASSWORD</p>
                <input id="password-input" class="loginhome-input" type="password" name="password" placeholder="ENTER PASSWORD" autocomplete="off" style="color:#DED19C;" required>

                <div style="display: flex; justify-content:space-between; align-items:center; width: 100%;">
                    <p id="login-error" style="font-weight:bold; font-size:1.5vh; color:red; margin: 0;"></p>
                    <div>
                        <p style="font-size:1.75vh; color:#520404; margin:0; display:inline;">No account?</p>
                        <p style="font-weight:bold; font-size:1.75vh; color:#520404; margin:0; display:inline;"><a id="signup-nav-button" href="/signup">SIGN UP -></a></p>
                    </div>
                </div>
                <h1 id="login-button" class="loginhome-redHover" style="font-weight:bold; font-size:10vh; color:#520404">PLAY -></h1>
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
            if (errorText) errorText.textContent = "NO USERNAME TEXTBOX FOUND";
            return;
        }
        if (!(passInput instanceof HTMLInputElement))
        {
            if (errorText) errorText.textContent = "NO PASSWORD TEXTBOX FOUND";
            return;
        }

        const user = userInput.value;
        const pass = userInput.value;

        if (user === "")
        {
            if (errorText) errorText.textContent = "NO USERNAME GIVEN";
            return;
        }
        if (pass === "")
        {
            if (errorText) errorText.textContent = "NO PASSWORD GIVEN";
            return;
        }

        fetch("/api/user/session", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: user,
                password: pass
            })
        }).then((value) => {
            // change page to play if successful
        });
    })
}

customElements.define('index-page', IndexPage)
