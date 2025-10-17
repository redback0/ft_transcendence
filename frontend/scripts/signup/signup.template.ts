
export class SignUpPage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
            <form id="signup-form">
                <h1 style="font-weight:bold; font-size:10vh; text-align:center !important; background-color:#520404; color:#DED19C; margin-bottom: 3vh">SIGN UP</h1>

                <p style="font-size:2vh; color:#520404; margin-top:3vh; font-weight:bold">USERNAME</p>
                <input id="username-input" class="signup-input" type="text" name="username" placeholder="ENTER USERNAME" autocomplete="off" style="margin-bottom: 2vh; color:#DED19C;" required>

                <p style="font-size:2vh; color:#520404; margin-top: 2vh; font-weight:bold">PASSWORD</p>
                <input id="password-input" class="signup-input" type="password" name="username" placeholder="ENTER PASSWORD" autocomplete="off" style="margin-bottom: 2vh; color:#DED19C;" required>

                <p style="font-size:2vh; color:#520404; margin-top: 2vh; font-weight:bold">REPEAT PASSWORD</p>
                <input id="password-repeat-input" class="signup-input" type="password" name="password" placeholder="ENTER PASSWORD AGAIN" autocomplete="off" style="color:#DED19C;" required>

                <p id="signup-error" style="font-weight:bold; font-size:1.25vh; color:red; margin: 0;"></p>
                <h1 id="signup-button" class="signin-redHover" style="font-weight:bold; font-size:10vh; color:#520404">PLAY -></h1>
            </form>
            `
    }
}

customElements.define('signup-page', SignUpPage)
