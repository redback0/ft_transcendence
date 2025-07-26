//Authored by Bethany Milford 18/07/2025

// import { genSaltSync, hashSync} from "bcrypt-ts";

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