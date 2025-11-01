import { onPageChange } from "../index.js";
import { fetchUserInfo } from "../user/user.service";

export function validatePasswordRequirements(password: string): boolean {

	const hasMinTwelveChar = password.length >= 12;
	const hasNoWhite = !/\s/.test(password);
	const hasUpper = /[A-Z]/.test(password);
	const hasLower = /[a-z]/.test(password);
	const hasNumber = /[0-9]/.test(password);
	const hasSymbol = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(password);
	
	return (hasMinTwelveChar && hasNoWhite && hasUpper && hasLower && hasNumber && hasSymbol);
}

async function verifyPassword(password: string): Promise<boolean>
{
	try
	{
		const response = await fetch('/api/user/verifyPassword', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password: password }),
			credentials: 'include'
		});
		return response.ok;
	}
	catch (error)
	{
		console.error('Error verifying password:', error);
		return false;
	}
}

// End point on server is probally located in file user.ts

const _url = window.URL || window.webkitURL;

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
		const passwordSameLast = document.getElementById('passwordSameAsLast') as HTMLInputElement;
		const errorNewPassword1 = document.getElementById('passwordReqNotMet') as HTMLInputElement;
		const errorNewPassword2 = document.getElementById('passwordNotMatch') as HTMLInputElement;
		const successPassword = document.getElementById('passwordSuccess') as HTMLInputElement;

		if (errorOldPassword) errorOldPassword.style.display = 'none';
		if (errorNewPassword1) errorNewPassword1.style.display = 'none';
		if (errorNewPassword2) errorNewPassword2.style.display = 'none';
		if (successPassword) successPassword.style.display = 'none';
		if (passwordSameLast) passwordSameLast.style.display = 'none';

		if (oldPassword === "")
		{
			if (errorOldPassword) errorOldPassword.style.display = 'block';
			console.log(`Old password is empty.`);
			return ;
		}
		const passwordVerified = await verifyPassword(oldPassword);
		if (!passwordVerified)
		{
			if (errorOldPassword) errorOldPassword.style.display = 'block';
			console.log(`Old password verification failed.`);
			return ;
		}
		if (newPassword1 === "")
		{
			if (errorNewPassword1) errorNewPassword1.style.display = 'block';
			console.log(`New password 1 is empty.`);
			return ;
		}
		if (!validatePasswordRequirements(newPassword1))
		{
			if (errorNewPassword1) errorNewPassword1.style.display = 'block';
			console.log(`New password does not meet requirements.`);
			return ;
		}
		if (newPassword2 !== newPassword1)
		{
			if (errorNewPassword2) errorNewPassword2.style.display = 'block';
			console.log(`Passwords do not match.`);
			return ;
		}

		const response = await fetch('/api/user/changePassword', {
			method: "POST", 
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				oldPassword: oldPassword,
				newPassword: newPassword1
			}),
			credentials: 'include' // Include cookies for session
		});

		if (!response.ok)
		{
			if (response.status === 422) {
				const errorData = await response.json();
				const errorMessage = errorData.error;
				
				if (errorMessage && errorMessage.includes('Cannot reuse any of the last 4 passwords'))
				{
					if (passwordSameLast) passwordSameLast.style.display = 'block';
					console.log(`Cannot use last 4 passwords`);
					return ;
				}
			}
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
	const deleteUserError = document.getElementById('deleteUserError');
	if (deleteUserError) deleteUserError.style.display = 'none';

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

	
		const passwordVerified = await verifyPassword(password);
		if (!passwordVerified)
		{
			console.error(`Password verification failed for user: ${username}`);
			const deleteUserError = document.getElementById('deleteUserError');
			if (deleteUserError) deleteUserError.style.display = 'block';
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
			const deleteUserError = document.getElementById('deleteUserError');
			if (deleteUserError) deleteUserError.style.display = 'block';
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
    const formData = new FormData();
    const sucPara = document.getElementById('avatar-upload-success');
    const failPara = document.getElementById('avatar-upload-fail');
    const imageEle = document.getElementById('avatar-input') as HTMLInputElement;
    const file = imageEle?.files?.[0];
    if (!file)
        return;

    const image = new Image();

    image.onload = async function()
    {
        if (image.width > 128 || image.height > 128)
        {
            sucPara!.hidden = true;
            failPara!.hidden = false;
            return;
        }

        formData.append("image", file);

        const resp = await fetch("/api/user/avatar", {
            method: "POST",
            body: formData
        })
    
        if (resp.ok)
        {
            sucPara!.hidden = false;
            failPara!.hidden = true;
        }
        else
        {
            sucPara!.hidden = true;
            failPara!.hidden = false;
        }
    };

    image.src = _url.createObjectURL(file);
}

function onChangeAvatar(e: Event)
{
    const image = (e.target as HTMLInputElement)?.files?.[0];
    if (!image) return;

    const changeAvatarButton = document.getElementById('changeAvatarButton');
    (changeAvatarButton as HTMLButtonElement)!.disabled = false;
}