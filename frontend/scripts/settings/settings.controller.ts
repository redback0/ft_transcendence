import { onPageChange } from "../index.js";
import { fetchUserInfo } from "../user/user.service";

// End point on server is probally located in file user.ts

export async function SettingsPostLoad(page: HTMLElement)
{
	const deleteButton = document.getElementById('confirmDeleteButton');
	deleteButton?.addEventListener('click', async () => {
		await routeDeleteProfile();
	});

	const changePasswordButton = document.getElementById('changePwButton');
	changePasswordButton?.addEventListener('click', async () => {
		await routeChangePassword();
	});

    const changeAvatarButton = document.getElementById('changeAvatarButton');
    changeAvatarButton!.onclick = onUpdateAvatarButton;

    const avatarInput = document.getElementById('avatar-input');
    avatarInput!.onchange = onChangeAvatar;
}

async function routeChangePassword()
{
	var username = "";
	try
	{
		const sessionInfo = await fetch("/api/user/session");
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
		const currentPassword = document.getElementById('currentPassword') as HTMLInputElement;
		const newPassword1Input = document.getElementById('newPassword1') as HTMLInputElement;
		const newPassword2Input = document.getElementById('newPassword2') as HTMLInputElement;
		const oldPassword = currentPassword.value;
		const newPassword1 = newPassword1Input.value;
		const newPassword2 = newPassword2Input.value;

		const errorOldPassword = document.getElementById('currentPasswordNotCorrect') as HTMLInputElement;
		const errorNewPassword1 = document.getElementById('passwordReqNotMet') as HTMLInputElement;
		const errorNewPassword2 = document.getElementById('passwordNotMatch') as HTMLInputElement;
		const successPassword = document.getElementById('passwordSuccess') as HTMLInputElement;

		if (errorOldPassword) errorOldPassword.style.display = 'none';
		if (errorNewPassword1) errorNewPassword1.style.display = 'none';
		if (errorNewPassword2) errorNewPassword2.style.display = 'none';
		if (successPassword) successPassword.style.display = 'none';

		if (oldPassword === "")
		{
			if (errorOldPassword) errorOldPassword.style.display = '';
			console.log(`Old password is empty.`);
			return ;
		}
		if (newPassword1 === "")
		{
			if (errorNewPassword1) errorNewPassword1.style.display = '';
			console.log(`New password 1 is empty.`);
			return ;
		}
		if (newPassword2 !== newPassword1)
		{
			if (errorNewPassword2) errorNewPassword2.style.display = '';
			console.log(`Passwords do not match.`);
			return ;
		}

		const response = await fetch('/api/user/changePassword', {
			method: "POST", 
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				oldPassword: oldPassword,
				newPassword: newPassword1
			})
		});

		if (!response.ok)
		{
			console.error(`Cannot change password`);
			return ;
		}
		console.log(`Password changed`);
		if (successPassword) successPassword.style.display = '';
		return ;
	}
	catch (error)
	{
		console.error(`Cannot change password: ${error}`);
		return ;
	}
}

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
		const passwordInput = document.getElementById('deletePassword') as HTMLInputElement;
		const password = passwordInput.value;
        if (password === "")
        {
            //if (errorText) errorText.textContent = "NO PASSWORD GIVEN";
            console.log(`No password given`);
			return ;
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
			console.error(`Cannot delete user: ${username}`);
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

async function onUpdateAvatarButton(e: Event)
{
    const changeAvatarForm = document.getElementById('change-avatar-form') as HTMLFormElement;

    const formData = new FormData();
    const imageEle = document.getElementById('avatar-input') as HTMLInputElement;
    const image = imageEle?.files?.[0];
    if (!image)
        return;

    formData.append("image", image);

    await fetch("/api/user/avatar", {
        method: "POST",
        body: formData
    });
}

function onChangeAvatar(e: Event)
{
    const image = (e.target as HTMLInputElement)?.files?.[0];
    if (!image) return;

    const changeAvatarButton = document.getElementById('changeAvatarButton');
    (changeAvatarButton as HTMLButtonElement)!.disabled = false;
}