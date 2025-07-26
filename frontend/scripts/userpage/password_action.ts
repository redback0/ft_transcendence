//Authored by Bethany Milford 19/07/2025
//Authored by Nicole Lehmeyer 24/07/2025

//import { hashPassword } from "../login/signup_action";   <- Beth's input 19/7

const ChangePasswordform = document.getElementById('ChangePasswordForm') as HTMLFormElement;
const ChangePassworderror = document.getElementById('error') as HTMLParagraphElement;

ChangePasswordform.addEventListener('submit', (event) =>
	{
        event.preventDefault();
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
            ChangePassworderror.innerHTML =   `<p> New password must be different to current password. </p>`;
			return;
        }
        if (new_password !== repeat_password)
        {
            ChangePassworderror.innerHTML = `<p> Passwords do not match. </p>`;
			return;
        }

		const passwordChecker = new IFrontendLoginChecks('', new_password);
		if (passwordChecker.pwCheck(new_password))
		{
			console.log('Password validation successful');
			//export async function routeCheckUserSession(request: FastifyRequest, reply: FastifyReply);

			// We need to send the session ID, not just the username. Use cookie functions - Nicole. 
			// TODO: Nicole: Done? See line user.ts:109. 
			fetch('/api/changepw', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include', 
				body: JSON.stringify({ old_password, new_password })
			})
			.then(response => response.json())
			.then(result => {
				console.log('Password change result: ', result);
				if (result.error)
				{
					ChangePassworderror.innerHTML = `<p> ${result.error}</p>`;
				}
				else
				{
					ChangePassworderror.innerHTML = '<p class="success">Password changed successfully.</p>';
					//I believe this function takes the user back to a page.. but I'm not sure about the page or specifically how this works - Nicole
					// TODO: Nate help regarding the comment above. 
					setTimeout(() => {
						window.location.href = '/profile.html';
					}, 1500);
				}
			})
			.catch( error => { console.error('Password change error: ', error);
					ChangePassworderror.innerHTML = '<p class="error">Error: Cannot change password.</p>'; // TODO: Nicole is this correct? I put it here but dont know if it will work. What css class should it be?, where should it return to?  - Jack
			});
		}
		else
		{
			//TODO: BETH: Could you pls add something in the HTML to display the following error msgs xx Nicole :) 
			let errorMessage = '<p>Password requires: </p><ul>';
			if (!(passwordChecker.pwHasMinTwelveChar()))
				errorMessage += '<li>Minium 12 characters.</li>';
			if (!(passwordChecker.pwHasNoWhite()))
				errorMessage += '<li>No Whitespace.</li>';
			if (!(passwordChecker.pwHasLower()))
				errorMessage += '<li>At least 1 lowercase character.</li>';
			if (!(passwordChecker.pwHasUpper()))
				errorMessage += '<li>At least 1 uppercase character.</li>';
			if (!(passwordChecker.pwHasNb()))
				errorMessage += '<li>At least 1 number.</li>';
			if (!(passwordChecker.pwHasSymbol()))
				errorMessage += '<li>At least 1 special character: !"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~ </li>';
			errorMessage += '</ul>';
			ChangePassworderror.innerHTML = errorMessage;
			return;
		}
	}
)

interface FrontendLoginChecks {
enteredUser:string;
enteredPw:	string;
saltRounds:	number;

userHasNoWhite():	boolean;

pwCheck(enteredPw: string):			boolean;

pwHasNoWhite():		boolean;
pwHasMinTwelveChar():		boolean;
pwHasUpper():		boolean;
pwHasLower():		boolean;
pwHasNb():			boolean;
pwHasSymbol():		boolean;

};

class IFrontendLoginChecks implements FrontendLoginChecks {
	enteredUser:string;
	enteredPw:	string;
	saltRounds: number;

	constructor(enteredUser: string, enteredPw: string, saltRounds: number = 10)
	{
		this.enteredUser = enteredUser;
		this.enteredPw = enteredPw;
		this.saltRounds = saltRounds;
	}
	
	userHasNoWhite(): boolean {return (!/\s/.test(this.enteredUser))}

	pwCheck(enteredPw: string): boolean {
		return (this.pwHasMinTwelveChar()
			&& this.pwHasNoWhite()
			&& this.pwHasUpper()
			&& this.pwHasLower()
			&& this.pwHasNb()
			&& this.pwHasSymbol()
		);
	}

	pwHasMinTwelveChar(): boolean {return (this.enteredPw.length >= 12);}
	pwHasNoWhite(): boolean {return (!/\s/.test(this.enteredPw));}
	pwHasUpper(): boolean {return /[A-Z]/.test(this.enteredPw);}
	pwHasLower(): boolean {return /[a-z]/.test(this.enteredPw);}
	pwHasNb(): boolean {return /[0-9]/.test(this.enteredPw)}
	pwHasSymbol(): boolean {return /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(this.enteredPw);}
}