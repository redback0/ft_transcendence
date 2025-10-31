import { newPage } from "../index.js";
import {t} from '../translation.js';

export function SignUpPostLoad(page: HTMLElement)
{
    const SignUpButton = document.getElementById('signup-button');

    SignUpButton?.addEventListener("click", (event) =>
    {
        event.preventDefault();
        const userInput = document.getElementById("username-input");
        const passInput = document.getElementById("password-input");
        const repPassInput = document.getElementById("password-repeat-input");
        const errorText = document.getElementById("signup-error");
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
        if (!(repPassInput instanceof HTMLInputElement))
        {
            if (errorText) errorText.textContent = t('errRepeatPwTextbox');
            return;
        }

        const user = userInput.value;
        const pass = passInput.value;
        const repPass = repPassInput.value;

        if (user === "")
        {
            if (errorText) errorText.textContent = t('errNoUsername');
            return;
        }

        if (!/^[a-zA-Z0-9]+$/.test(user))
        {
            if (errorText) errorText.textContent = t('errAlphaNum');
            return;
        }

		if (pass === "")
        {
            if (errorText) errorText.textContent = t('errNoPw');
            return;
        }
        if ( pass !== repPass)
        {
            if (errorText) errorText.textContent = t('errPwMatch');
            return;
        }

        fetch("/api/user", {
            method: "POST",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
              username: user,
              password: pass
            })
        }).then((response) => {
            // change page to play if successful
            if (!response.ok)
            {
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

            history.pushState({}, "", "/");
            newPage();
        });
    });
}