//Authored by Bethany Milford 19/07/2025
//Authored by Nicole Lehmeyer 24/07/2025

//import { hashPassword } from "../login/signup_action";

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
            ChangePassworderror.innerHTML =   `<p> New password must be different to current password. </p>`;
			return;
        }
        if (new_password !== repeat_password)
        {
            ChangePassworderror.innerHTML = `<p> Passwords do not match. </p>`;
			return;
        }

		//PW SYNTAX CHECK:
		const passwordChecker = new ILoginChecks('', new_password);
		if (passwordChecker.pwCheck()) {
			console.log('Password validation successful');
			//export async function routeCheckUserSession(request: FastifyRequest, reply: FastifyReply);
		


		fetch('/api/cookieProfile', {
			method: 'GET',
			credentials: 'include'
		})
		.then(response => response.json())
		.then(data => {
			console.log('Profile data:', data);

			fetch('/api/changepw', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ user_id: data.user_id, old_password, new_password })
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
					ChangePassworderror.innerHTML = '<p> class="success">Password changed successfully.</p>';
					//I believe this function takes the user back to a page.. but I'm not sure about the page or specifically how this works - Nicole
					setTimeout(() => {
						window.location.href = '/profile.html';
					}, 1500);
				}
			})
			.catch(error => { console.error('Password change error: ', error); });
		})
		.catch(error => {
			// Will catch 401 errors if not logged in
			console.error('Error:', error);
		});

			

			//BACKEND CHECK & 'POST' NEW PASSWORD TO DB
			// - Check old pw matches the user's pw in db (cookie business)
			// - Ensure new pw not the same as previous 4 passwords
			// - Hash and post new pw for user in db
			//TAKE USER TO NEXT PAGE - PASSWORD CHANGED SUCCESSFULLY




		}
		else {
			//BETH: Could you pls add something in the HTML to display the following error msgs xx Nicole :) 
			let errorMessage = '<p>Password requires: </p><ul>';
			if (!(passwordChecker.pwHasMinTwelveChar))
				errorMessage += '<li>Minium 12 characters.</li>';
			if (!(passwordChecker.pwHasNoWhite))
				errorMessage += '<li>No Whitespace.</li>';
			if (!(passwordChecker.pwHasLower))
				errorMessage += '<li>At least 1 lowercase character.</li>';
			if (!(passwordChecker.pwHasUpper))
				errorMessage += '<li>At least 1 uppercase character.</li>';
			if (!(passwordChecker.pwHasNb))
				errorMessage += '<li>At least 1 number.</li>';
			if (!(passwordChecker.pwHasSymbol))
				errorMessage += '<li>At least 1 special character: !"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~ </li>';
			errorMessage += '</ul>';
			return;
		}
		}
		
)

//SYNTAX CHECK FUNCTIONS:
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
	hashedPw:	string; //Probs don't need this - Nicole
	salt:		string; //Probs don't need this - Nicole
	saltRounds: number;

	constructor(enteredUser: string, enteredPw: string, saltRounds: number = 10)
	{
		this.enteredUser = enteredUser;
		this.enteredPw = enteredPw;
		this.hashedPw = '';
		this.salt = '';
		this.saltRounds = saltRounds;
	}
	
	userHasNoWhite(): boolean {return (!/\s/.test(this.enteredUser));}

	pwCheck(): boolean {
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
	pwHasNb(): boolean {return /[0-9]/.test(this.enteredPw);}
	pwHasSymbol(): boolean {return /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(this.enteredPw);}

}