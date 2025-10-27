import { onPageChange } from "../index.js";
import { fetchUserInfo } from "../user/user.service";

export async function SettingsPostLoad(page: HTMLElement)
{
	const deleteButton = document.getElementById('confirmDeleteButton');
	deleteButton?.addEventListener('click', async () => {
		await routeDeleteProfile();
	});
}

// End point on server is located in file user.ts
async function routeDeleteProfile()
{

	var username = "";
	try
	{
		const sessionInfo = await fetch("/api/user/session");
		username = "user";
		if (sessionInfo.ok)
		{
			const userInfo = await sessionInfo.json();
			username = userInfo?.username || "user";
		}
	}
	catch (error)
	{
		console.log(`Unable to get username, is the user logged in?`);
		return ;
	}

	try
	{
		const warning = document.getElementById('warning');
		const passwordInput = warning?.querySelector('input[type="password"]') as HTMLInputElement;
		const password = passwordInput.value;
        if (password === "")
        {
            //if (errorText) errorText.textContent = "NO PASSWORD GIVEN";
            console.log(`No password given`);
			return;
        }

	
		const response = await fetch('/api/user/delete', { // taking this from index.template.ts:69-75. 
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ 
				password: password }), 
			credentials: 'include' // Cookies
		});

		if (!response.ok)
		{
			console.error(`Cannot delete user: ${username}`); // Would be good to add username here. 
			return ;
		}

		console.log(`User ${username} deleted`);
		window.location.href = '/';
	}
	catch (error)
	{
		console.error('Cannot delete user: ${username}', error);
	}
}