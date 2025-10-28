import {t} from '../translation.js';

export class SettingsPage extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
            `
			<h1 style="font-weight:bold; font-size:10vh; text-align:center !important; background-color:#520404; color:#DED19C; margin-bottom: 8vh; width: fit-content; padding 0 1rem; margin:0 auto;">
				${t('settingsTitle')}
			</h1>
			<div class="flex w-full">
				<div class="w-1/3 flex flex-col justify-center items-left" style="padding-left: 15vw; padding-top: 10vh;">
					<h1 style="font-weight:bold; font-size:5vh; color:#520404">
						${t('changePassword')}
					</h1>
					<p style="font-weight:bold; font-size:1.25vh; color:#520404; margin: 0;">
						${t('passwordRequirements')}<br>
						- ${t('passwordRule1')}<br>
						- ${t('passwordRule2')}
					</p>
				</div>
				<div class="w-2/3 flex flex-col items-center justify-center" style="padding-top: 10vh;">
					<form id="changePwForm" class="w-3/4 max-w-md">
						<p style="font-size:2vh; color:#520404; font-weight:bold">
							${t('currentPassword')}
						</p>
						<input class="settings-input" type="password" name="username" placeholder="${t('enterUsername')}" autocomplete="off" style="margin-bottom: 1vh; color:#DED19C;" required>
						<p style="font-size:2vh; color:#520404; font-weight:bold">
							${t('newPassword')}
						</p>
						<input class="settings-input" type="password" name="username" placeholder="${t('enterNewPassword')}" autocomplete="off" style="margin-bottom: 1vh; color:#DED19C;" required>
						<p style="font-size:2vh; color:#520404; font-weight:bold">
							${t('repeatNewPassword')}
						</p>
						<input class="settings-input" type="password" name="password" placeholder="${t('enterNewPasswordAgain')}" autocomplete="off" style="color:#DED19C;" required>
						<p style="font-weight:bold; font-size:1.25vh; color:red; margin: 0;">
							${t('invalidUserPwInput')}<br><br>
						</p>
						<div>
							<button type="button" id="changePwButton">
							${t('changePwButton')}</button>
						</div>
					</form>
				</div>
			</div>

			<div class="flex w-full" style="margin-top: 10vh">
				<div class="w-1/3 flex flex-col justify-center items-left" style="padding-left: 15vw;">
					<h1 style="font-weight:bold; font-size:5vh; color:#520404">
						${t('changeAvatar')}
					</h1>
					<p style="font-weight:bold; font-size:1.25vh; color:#520404; margin: 0;">
						${t('fileRequirements')}<br>
						- ${t('fileRule1')}<br>
						- ${t('fileRule2')}<br>
					</p>
				</div>
				<div class="w-2/3 flex flex-col items-center justify-center">
					<form id="changePwForm" class="w-3/4 max-w-md">
						<p style="font-size:2vh; color:#520404; font-weight:bold">
							${t('uploadImage')}
						</p>
						<input id="avatar" class="settings-input" type="file" accept="image/png, image/jpeg" name="avatar" autocomplete="off" style="margin-bottom:1vh; color:#DED19C;" required>
						<p style="font-weight:bold; font-size:1.25vh; color:red; margin: 0;">
							${t('invalidUploadFile')}<br><br>
						</p>
						<div>
							<button type="button" id="changeAvatarButton">
								${t('changeAvatarButton')}
							</button>
						</div>
					</form>
				</div>
			</div>

			<div class="flex w-full" style="margin-top: 10vh;">
				<div class="w-1/3 flex flex-col justify-center items-left" style="padding-left: 15vw;">
					<h1 style="font-weight:bold; font-size:5vh; color:#520404">
						${t('deleteProfile')}
					</h1>
				</div>
				<div class="w-2/3 flex flex-col items-center justify-center">
					<form id="changePwForm" class="w-3/4 max-w-md">
						<div>
							<button type="button" onclick="openWarning()" id="deleteProfileButton">
								${t('deleteProfileButton')}
							</button>
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
					<h1 style="font-weight:bold; font-size:10vh; text-align:center !important; color:#DED19C; margin-bottom: 3vh">
						${t('areYouSure')}
					</h1>
					<p style="font-size:2vh; margin-left:30vw; color:#DED19C; font-weight:bold">
						${t('confirmWithPw')}
					</p>
					<input class="deleteProfile-input" type="password" name="password" placeholder="${t('enterPassword')}" autocomplete="off" style="color:#520404; margin-left:30vw" required>
						<p style="font-weight:bold; margin-left:30vw; font-size:1.25vh; color:red">
							${t('invalidUserPwInput')}<br><br>
						</p>
						<div>
							<button type="button" style="margin-left:30vw" id="confirmDeleteButton">
							${t('permanentDelete')}</button>
						</div>
				</div>
			</div>			
        `
    }
}

customElements.define('settings-page', SettingsPage)