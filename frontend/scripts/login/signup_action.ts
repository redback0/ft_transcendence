//Authored by Bethany Milford 18/07/2025

import { genSaltSync, hashSync} from "bcrypt-ts";

const SignUpform = document
    .getElementById('SignInForm') as HTMLFormElement;
const SignUperror = document
    .getElementById('error') as HTMLParagraphElement;

const saltRounds = 10;

export async function hashPassword(password: string) {
    try {
        const salt = await genSaltSync(saltRounds);
        const hash = await hashSync(password, salt);
        return hash;
    }
    catch (error) {
        console.error('Error hashing passwords: ', error);
        throw error;
    }
}

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
            SignUperror.innerHTML = `<p> Password is not the same! </p>`;
        }
        hashPassword(password)
            .then(hashedPassword => {
                console.log('Hashed password:', hashedPassword)
            })
            .catch(error => {
                SignUperror.innerHTML = `<p> Password is not valid, please try again </p>`;
            });
    });