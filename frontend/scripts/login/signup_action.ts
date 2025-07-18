//Authored by Bethany Milford 18/07/2025

const SignUpform = document
    .getElementById('SignInForm') as HTMLFormElement;
const SignUperror = document
    .getElementById('error') as HTMLParagraphElement;

SignUpform
    .addEventListener('submit', (event) => 
    {
        event
            .preventDefault();
        const username = (document
            .getElementById('new_user') as HTMLInputElement)
            .value;
        const password = (document
            .getElementById('new_pass') as HTMLInputElement)
            .value;
        const repeat_password = (document
            .getElementById('new_pass2') as HTMLInputElement)
            .value;
        if ( password !== repeat_password)
        {
            SignUperror.innerHTML = 'Password is not the same!';
        }

    });