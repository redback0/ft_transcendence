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
						<input class="settings-input" type="password" name="username" placeholder="ENTER CURRENT PASSWORD" autocomplete="off" style="margin-bottom: 1vh; color:#DED19C;" required>
						<p style="font-size:2vh; color:#520404; font-weight:bold">NEW PASSWORD</p>
						<input class="settings-input" type="password" name="username" placeholder="ENTER NEW PASSWORD" autocomplete="off" style="margin-bottom: 1vh; color:#DED19C;" required>
						<p style="font-size:2vh; color:#520404; font-weight:bold">REPEAT NEW PASSWORD</p>
						<input class="settings-input" type="password" name="password" placeholder="ENTER NEW PASSWORD AGAIN" autocomplete="off" style="color:#DED19C;" required>
						<p style="font-weight:bold; font-size:1.25vh; color:red; margin: 0;">
							INVALID USERNAME/PASSWORD INPUT<br><br>
						</p>
						<div>
							<button type="button" id="changePwButton">CHANGE PASSWORD -></button>
						</div>
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
            `
    }
}

customElements.define('settings-page', SettingsPage)