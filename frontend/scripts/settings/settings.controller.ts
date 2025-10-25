
// import "../password_action.js"

export function SettingsPagePostLoad(page: HTMLElement)
{
    // Change password
    const changePWButton = document.getElementById("change-pw-button");

    // Change avatar
    const avatarInput = document.getElementById("avatar-input");
    if (avatarInput)
        avatarInput.onchange = changeAvatar;
    const avatarButton = document.getElementById("change-avatar-button");
    if (avatarButton)
        avatarButton.onclick = uploadAvatar;

    // Delete profile
    const deleteButton = document.getElementById("delete-profile-button");

}

// Change password function


// Change avatar function
async function changeAvatar(event: Event)
{
    // validate file (is png)
}

async function uploadAvatar(event: PointerEvent)
{
    // upload file (send to server and confirm change was made)
}

// Delete profile function