export class SettingsPage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
			<h1 style="font-weight:bold; font-size:10vh; text-align:center !important; background-color:#520404; color:#DED19C; margin-bottom: 8vh">SETTINGS</h1>
			<div class="flex w-full">
				<div class="w-1/3 flex flex-col justify-center items-left">
					<h1 style="font-weight:bold; font-size:5vh; color:#520404">CHANGE PASSWORD</h1>
					<p style="font-weight:bold; font-size:1.25vh; color:#520404; margin: 0;">
						Minimum password requirements:<br>
						- 12 characters, 1 lowercase, 1 uppercase, 1 symbol<br>
						- Passwords must match
					</p>
				</div>
				<div class="w-2/3 flex flex-col items-center justify-center">
					<form id="changePwForm" class="w-3/4 max-w-md">
						<p style="font-size:2vh; color:#520404; font-weight:bold">CURRENT PASSWORD</p>
						<input id="currentPassword" class="settings-input" type="password" name="username" placeholder="ENTER CURRENT PASSWORD" autocomplete="off" style="margin-bottom: 1vh; color:#DED19C;" required>
						<p id="currentPasswordNotCorrect" style="font-weight:bold; font-size:1.25vh; color:red; margin: 0; display:none">
							CURRENT PASSWORD IS NOT CORRECT, TRY AGAIN<br><br>
						</p>
						<p style="font-size:2vh; color:#520404; font-weight:bold">NEW PASSWORD</p>
						<input id="newPassword1" class="settings-input" type="password" name="password" placeholder="ENTER NEW PASSWORD" autocomplete="off" style="margin-bottom: 1vh; color:#DED19C;" required>
						<p id="passwordReqNotMet" style="font-weight:bold; font-size:1.25vh; color:red; margin: 0; display:none">
						PASSWORD REQUIREMENTS NOT MET<br><br>
						</p>
						<p style="font-size:2vh; color:#520404; font-weight:bold">REPEAT NEW PASSWORD</p>
						<input id="newPassword2" class="settings-input" type="password" name="password" placeholder="ENTER NEW PASSWORD AGAIN" autocomplete="off" style="margin-bottom: 1vh; color:#DED19C;" required>
						<p id="passwordNotMatch" style="font-weight:bold; font-size:1.25vh; color:red; margin: 0; display:none">
							NEW PASSWORDS DO NOT MATCH<br><br>
						</p>
						<div>
						<button type="button" id="changePwButton">CHANGE PASSWORD -></button>
						</div>
						<p id="passwordSuccess" style="font-weight:bold; font-size:1.25vh; color:red; margin: 0; display:none">
							PASSWORD CHANGED<br><br>
						</p>
					</form>
				</div>
			</div>

			<div class="flex w-full" style="margin-top: 10vh">
				<div class="w-1/3 flex flex-col justify-center items-left">
					<h1 style="font-weight:bold; font-size:5vh; color:#520404">CHANGE AVATAR</h1>
					<p style="font-weight:bold; font-size:1.25vh; color:#520404; margin: 0;">
						File requirements:<br>
						- Size: 128 x 128 px<br>
						- File Type: PNG/JPG<br>
					</p>
				</div>
				<div class="w-2/3 flex flex-col items-center justify-center">
					<form id="changePwForm" class="w-3/4 max-w-md">
						<p style="font-size:2vh; color:#520404; font-weight:bold">UPLOAD IMAGE:</p>
						<input id="avatar" class="settings-input" type="file" accept="image/png, image/jpeg" name="avatar" placeholder="ENTER CURRENT PASSWORD" autocomplete="off" style="margin-bottom:1vh; color:#DED19C;" required>
						<p style="font-weight:bold; font-size:1.25vh; color:red; margin: 0;">
							INVALID UPLOAD FILE<br><br>
						</p>
						<div>
							<button type="button" id="changeAvatarButton">UPDATE AVATAR -></button>
						</div>
					</form>
				</div>
			</div>

			<div class="flex w-full" style="margin-top: 10vh;">
				<div class="w-1/3 flex flex-col justify-center items-left">
					<h1 style="font-weight:bold; font-size:5vh; color:#520404">DELETE PROFILE</h1>
				</div>
				<div class="w-2/3 flex flex-col items-center justify-center">
					<form id="changePwForm" class="w-3/4 max-w-md">
						<div>
							<button type="button" onclick="openWarning()" id="deleteProfileButton">DELETE PROFILE -></button>
						</div>
					</form>
				</div>
			</div>
			<div id="warning" class="warning">
				<div id="warning-exit" onclick="closeWarning()">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none"
						xmlns="http://www.w3.org/2000/svg">
							<path
								d="M47.562 38.562L33 24L47.562 9.438C47.841 9.15555 47.9974 8.77453 47.9974 8.3775C47.9974 7.98048 47.841 7.59945 47.562 7.317L40.683 0.438001C40.4017 0.156794 40.0202 -0.00117874 39.6225 -0.00117874C39.2247 -0.00117874 38.8433 0.156794 38.562 0.438001L24 15L9.43796 0.438001C9.15667 0.156794 8.7752 -0.00117874 8.37746 -0.00117874C7.97971 -0.00117874 7.59825 0.156794 7.31696 0.438001L0.437959 7.317C0.156752 7.59829 -0.0012207 7.97975 -0.0012207 8.3775C-0.0012207 8.77525 0.156752 9.15671 0.437959 9.438L15 24L0.437959 38.562C0.156752 38.8433 -0.0012207 39.2248 -0.0012207 39.6225C-0.0012207 40.0202 0.156752 40.4017 0.437959 40.683L7.31696 47.562C7.59825 47.8432 7.97971 48.0012 8.37746 48.0012C8.7752 48.0012 9.15667 47.8432 9.43796 47.562L24 33L38.562 47.562C38.8433 47.8432 39.2247 48.0012 39.6225 48.0012C40.0202 48.0012 40.4017 47.8432 40.683 47.562L47.562 40.683C47.8432 40.4017 48.0011 40.0202 48.0011 39.6225C48.0011 39.2248 47.8432 38.8433 47.562 38.562Z"
								fill="#DED19C" />
					</svg>
				</div>
				<div id="warning-content">
					<h1 style="font-weight:bold; font-size:10vh; text-align:center !important; color:#DED19C; margin-bottom: 3vh">ARE YOU SURE?</h1>
					<p style="font-size:2vh; margin-left:30vw; color:#DED19C; font-weight:bold">ENTER PASSWORD TO CONFIRM:</p>
					<input id="deletePassword" class="deleteProfile-input" type="password" name="password" placeholder="ENTER PASSWORD" autocomplete="off" style="color:#520404; margin-left:30vw" required>
						<p style="font-weight:bold; margin-left:30vw; font-size:1.25vh; color:red">
							INVALID USERNAME/PASSWORD INPUT<br><br>
						</p>
						<div>
							<button type="button" style="margin-left:30vw" id="confirmDeleteButton">PERMANENTLY DELETE PROFILE -></button>
						</div>
				</div>
			</div>			
        `
    }
}

customElements.define('settings-page', SettingsPage)