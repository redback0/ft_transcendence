//Authored by Bethany Milford 19/07/2025

import { hashPassword } from "../login/signup_action";

const ChangePasswordform = document
    .getElementById('ChangePasswordForm') as HTMLFormElement;
const ChangePassworderror = document
    .getElementById('error') as HTMLParagraphElement;

const bcrypt = require('bcrypt');
const saltRounds = 10;

ChangePasswordform
    .addEventListener('submit', (event) => {
        event
            .preventDefault();
        const old_password = (document
            .getElementById('old_password') as HTMLInputElement)
            .value;
        const new_password = (document
            .getElementById('new_password') as HTMLInputElement)
            .value;
        const repeat_password = (document
            .getElementById('repeat_password') as HTMLInputElement)
            .value;
        if (old_password === new_password)
        {
            ChangePassworderror.innerHTML =   `<p> Error: New Password cannot be the same as the Old one! </p>`;
        }
        if (new_password !== repeat_password)
        {
            ChangePassworderror.innerHTML = `<p> Error: Password is not the same!! </p> `;
        }
        hashPassword(old_password).then(oldhashpass =>
            {
                console.log('Hashed Old password: ', oldhashpass )
            }).catch(error => {
                ChangePassworderror.innerHTML = ` <p> Password is not valid, please try again </p>`;
            });
    })