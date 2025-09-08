//Authored by Bethany Milford 18/07/2025
import { formatDiagnostic } from "typescript";

export function LoginPostLoad(page: HTMLElement)
{
    const LoginButton = document.getElementById('loginButton');
    LoginButton?.addEventListener("click", async (event) =>
    {
        event.preventDefault();
        const username = (document.getElementById('user') as HTMLInputElement).value;
        const password = (document.getElementById('pass') as HTMLInputElement).value;
        LoginButtonClick(username, password);
    });
    const SignUpButton = document.getElementById('signupButton');
    SignUpButton?.addEventListener("click", async (event) => 
    {
        event.preventDefault();
        const username = (document.getElementById('new_user') as HTMLInputElement).value;
        const password = (document.getElementById('new_pass') as HTMLInputElement).value;
        const repeat_password = (document.getElementById('new_pass2') as HTMLInputElement).value;
        if ( password !== repeat_password)
        {
            SignUpButton.innerHTML = `<p> Password is not the same! </p>`;
            return;
        }
        SignUpButton.innerHTML = `<p> SUCCESS </p>`;
        await fetch("/api/user", {
            method: "POST",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
              username: username,
              password: password
            })
        });
    });
}

export function LoginButtonClick (user: string, pass: string)
{
    fetch("/api/user/session", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: user,
            password: pass
        })
    }).then((value) => {

    });
}

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
