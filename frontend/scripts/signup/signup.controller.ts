import { newPage } from "../index.js";

export function SignUpPostLoad(page: HTMLElement)
{
    const SignUpButton = document.getElementById('signup-button');

    SignUpButton?.addEventListener("click", (event) =>
    {
        event.preventDefault();
        const userInput = document.getElementById("username-input");
        const passInput = document.getElementById("password-input");
        const repPassInput = document.getElementById("password-repeat-input");
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
        if (!(repPassInput instanceof HTMLInputElement))
        {
            if (errorText) errorText.textContent = "NO REPEAT PASSWORD TEXTBOX FOUND";
            return;
        }

        const user = userInput.value;
        const pass = passInput.value;
        const repPass = repPassInput.value;

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
        if ( pass !== repPass)
        {
            if (errorText) errorText.textContent = "PASSWORDS DO NOT MATCH";
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
                    if (errorText) errorText.textContent = "UNKNOWN ERROR";
                }
                return;
            }

            history.pushState({}, "", "/");
            newPage();
        });
    });
}