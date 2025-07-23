//Authored by Bethany Milford 19/07/2025

import { hashPassword } from "../login/signup_action";

const ChangePasswordform = document
    .getElementById('ChangePasswordForm') as HTMLFormElement;
const ChangePassworderror = document
    .getElementById('error') as HTMLParagraphElement;

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
            ChangePassworderror.innerHTML =   `<p> Error: New password cannot be the same as current password. </p>`;
        }
        if (new_password !== repeat_password)
        {
            ChangePassworderror.innerHTML = `<p> Error: Password is not the same. </p> `;
        }
        hashPassword(old_password).then(oldhashpass =>
            {
                console.log('Hashed Old password: ', oldhashpass )
            }).catch(error => {
                ChangePassworderror.innerHTML = ` <p> Invalid password. Please try again. </p>`;
            });
    })




// NICOLE'S NEW USER SYNTAX CHECK FUNCTIONS:

interface LoginChecks {
	enteredUser:string;
	enteredPw:	string;
	hashedPw:	string;
	salt:		string;
	saltRounds:	number;

	userHasNoWhite():	boolean;

	pwCheck():			boolean;

	pwHasNoWhite():		boolean;
	pwHasMinTwelveChar():		boolean;
	pwHasUpper():		boolean;
	pwHasLower():		boolean;
	pwHasNb():			boolean;
	pwHasSymbol():		boolean;

	//change pw()
	//change/set avatar()
	//create user()
	//delete user(), zero everything except for uid

};

class ILoginChecks implements LoginChecks {
	enteredUser:string;
	enteredPw:	string;
	hashedPw:	string;
	salt:		string;
	saltRounds: number;

	constructor(enteredUser: string, enteredPw: string, saltRounds: number = 10)
	{
		this.enteredUser = enteredUser;
		this.enteredPw = enteredPw;
		this.hashedPw = '';
		this.salt = '';
		this.saltRounds = saltRounds;
	}
	
	userHasNoWhite(): boolean
	{
		return (!/\s/.test(this.enteredUser))
	}

	pwCheck(): boolean {
		return (this.pwHasMinTwelveChar()
			&& this.pwHasNoWhite()
			&& this.pwHasUpper()
			&& this.pwHasLower()
			&& this.pwHasNb()
			&& this.pwHasSymbol()
		);
	}

	pwHasMinTwelveChar(): boolean
	{
		return (this.enteredPw.length >= 12);
	}

	pwHasNoWhite(): boolean {
		return (!/\s/.test(this.enteredUser));
	}

	pwHasUpper(): boolean
	{
		return /[A-Z]/.test(this.enteredPw);
	}

	pwHasLower(): boolean
	{
		return /[a-z]/.test(this.enteredPw);
	}

	pwHasNb(): boolean
	{
		return /[0-9]/.test(this.enteredPw);
	}

	pwHasSymbol(): boolean
	{
		return /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(this.enteredPw);
	}

}