import {t} from '../translation';

export class SignUpPage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
            <form id="signup-form">
                <h1 style="font-weight:bold; font-size:10vh; text-align:center !important; background-color:#520404; color:#DED19C; margin-bottom: 3vh">
                    ${t('signUp')}
                </h1>

                <p style="font-size:2vh; color:#520404; margin-top:3vh; font-weight:bold">${t('username')}</p>
                <input id="username-input" class="signup-input" type="text" name="username" placeholder="${t('enterUsername')}" autocomplete="off" style="margin-bottom: 2vh; color:#DED19C;" required>

                <p style="font-size:2vh; color:#520404; margin-top: 2vh; font-weight:bold">
                    ${t('password')}</p>
                <input id="password-input" class="signup-input" type="password" name="password" placeholder="${t('enterPassword')}" autocomplete="off" style="margin-bottom: 2vh; color:#DED19C;" required>

                <p style="font-size:2vh; color:#520404; margin-top: 2vh; font-weight:bold">
                     ${t('repeatPassword')}   
                </p>
                <input id="password-repeat-input" class="signup-input" type="password" name="password" placeholder="${t('enterPasswordAgain')}" autocomplete="off" style="color:#DED19C;" required>

                <p id="signup-error" style="font-weight:bold; font-size:1.25vh; color:red; margin: 0;">
                    ${t('enterPasswordAgain')}
                </p>
                <h1 id="signup-button" class="signin-redHover" style="font-weight:bold; font-size:10vh; color:#520404">
                    ${t('playButton')}
                </h1>
            </form>
            `
    }
}

customElements.define('signup-page', SignUpPage)
