//Authored by Nicole Lehmeyer

import { t, setLanguage, getLanguage, currentLanguageIndex, language } from './translation.js';
import { Language } from './language.translations';
import { newPage } from './index.js';
const mainMenu = document.getElementById("main-menu");
const warning = document.getElementById("warning");
const navBar = document.getElementById("nav-bar");
const body = document.body;

function openMenu() {
    if (mainMenu) {
        mainMenu.style.height = "100vh";
        body.style.overflow = "";
    }
    else
        console.error("ERROR: mainMenu element not found.");
}

export function closeMenu() {
    if (mainMenu) {
        mainMenu.style.height = "0";
        body.style.overflow = "auto";
    }
    else
        console.error("ERROR: mainMenu element not found.");
}

(window as any).openMenu = openMenu;
(window as any).closeMenu = closeMenu;


function openWarning() {

	const warning = document.getElementById("warning");
	if (warning) {
    warning.classList.add("active");
    body.style.overflow = "";
  } else {
    console.error("ERROR: warning element not found.");
  }
}

function closeWarning() {
	const warning = document.getElementById("warning");
  if (warning) {
    warning.classList.remove("active");
    body.style.overflow = "auto";
  } else {
    console.error("ERROR: warning element not found.");
  }
}

(window as any).openWarning = openWarning;
(window as any).closeWarning = closeWarning;





const languages: Language[] = ['English', 'Español', '中文'];
const currentLanguage = getLanguage();

const languageButton = document.getElementById('language-button');

function getNextLanguage(index: number): Language {
  return language[(index + 1) % language.length];
}

if (languageButton) {
  languageButton.textContent = getNextLanguage(currentLanguageIndex).toUpperCase();
  languageButton.addEventListener('click', () => {
    updateLanguage(languageButton, updateTranslations);
    languageButton.textContent = getNextLanguage(currentLanguageIndex).toUpperCase();
  });
}

export function updateLanguage(languageButton?: HTMLElement | null, updateTranslations?: (lang: Language) => void) {
  const newIndex = (currentLanguageIndex + 1) % language.length;
  const newLanguage: Language = language[newIndex];

  setLanguage(newLanguage);

  if (typeof updateTranslations === 'function') {
    updateTranslations(newLanguage);
  }
}




function updateTranslations(language: Language) {
  document.querySelector('#play-button')!.textContent = t('playButton', language);
  document.querySelector('#friends-button')!.textContent = t('friendsTitle', language);
  document.querySelector('#settings-button')!.textContent = t('settingsTitle', language);
  document.querySelector('#logout-button')!.textContent = t('logOut', language);
  document.querySelector('#chat')!.textContent = t('chat', language);
  document.querySelector('#channels')!.textContent = t('channels', language);
  document.querySelector('#hash-general')!.textContent = t('hashGeneral', language);
  document.querySelector('#title')!.textContent = t('hashGeneral', language);
  document.querySelector('#hash-tournament')!.textContent = t('hashTournament', language);
  document.querySelector('#direct-messages')!.textContent = t('directMessages', language);
  document.querySelector('#dm-request')!.textContent = t('dmRequest', language);
  document.querySelector('#dmreqbutton')!.textContent = t('dmRequestButton', language);
  document.querySelector('#sendButton')!.textContent = t('sendButton', language);
  document.querySelector('#inviteButton')!.textContent = t('inviteButton', language);

  const dmReceiver = document.getElementById('dmreciever');
  if (dmReceiver) {
    dmReceiver.setAttribute('placeholder', t('usernameInput'));
  }
  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.setAttribute('placeholder', t('messageInput'));
  }
  newPage();
}

updateTranslations(languages[currentLanguageIndex]);