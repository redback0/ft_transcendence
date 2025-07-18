//Authored by Bethany Milford 18/07/2025

const Loginform = document
    .getElementById('LoginForm') as HTMLFormElement;
const Loginerror = document
    .getElementById('error') as HTMLParagraphElement;

Loginform
    .addEventListener('submit', (event) => {
        event
            .preventDefault();
        const user = (document
            .getElementById('user') as HTMLInputElement)
            .value;
        const pass = (document
            .getElementById('pass') as HTMLInputElement)
            .value;

    });
