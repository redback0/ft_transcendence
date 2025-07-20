//Authored by Bethany Milford 18/07/2025
import { hashPassword } from "./signup_action";

const Loginform = document
    .getElementById('LoginForm') as HTMLFormElement;
const Loginerror = document
    .getElementById('error') as HTMLParagraphElement;

const bcrypt = require('bcrypt');
const saltRounds = 10;

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
                hashPassword(pass)
                    .then(hashedPassword => {
                        console.log('Hashed password:', hashedPassword)
                    })
                    .catch(error => {
                        Loginerror.innerHTML = `<p> Password is not valid, please try again </p>`;
                              
                    });

        
    });
