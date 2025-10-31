//Authored by Nicole Lehmeyer

import { Language, translations } from './language.translations.js';
import { setLocal, getLocal, removeLocal } from './localcookie.js';

export let currentLanguage: Language = 'English';
export const language: Language[] = Object.keys(translations) as Language[];
export let currentLanguageIndex: number = 0;

const LANGUAGE_LOCAL_DEFAULT: Language = language[0] ?? 'English';
const LANGUAGE_LOCAL_KEY = 'lang';

// Nicole's notes:
// This is self-executing function - it doesn't need to be called elsewhere.
// The function creates its own scope (encapsulation), which helps avoid polluting the global
//          namespace with var and functions defined inside it
// The function is encapsulated to make it an expression, then called by () at the end.
(function initLanguageFromLocal() {
  try {
    const stored = getLocal(LANGUAGE_LOCAL_KEY);
    if (stored && Object.prototype.hasOwnProperty.call(translations, stored)) {
      currentLanguage = stored as Language;
    } else {
      currentLanguage = (stored ? LANGUAGE_LOCAL_DEFAULT : currentLanguage) as Language;
    }
  } catch (err) {
    console.error('ERROR: Failed to read language from local store')
  }
  const index = language.indexOf(currentLanguage);
  currentLanguageIndex = index >= 0 ? index : 0;
})();

export const setLanguage = (newLanguage: Language): void => {
  currentLanguage = newLanguage;
  try {
    setLocal(LANGUAGE_LOCAL_KEY, newLanguage);
  } catch (err) {
    console.error('ERROR: Failed to write langauge to local store')
  }
  const index = language.indexOf(newLanguage);
  currentLanguageIndex = index >= 0 ? index : 0;
};

export const getLanguage = (): Language => {
  return currentLanguage;
};

export const clearLocalLanguage = (): void => {
  try {
    removeLocal(LANGUAGE_LOCAL_KEY);
  } catch (err) {
    console.error('ERROR: Failed to clear locally stored language.')
  }
};

export function t(key:string, language: Language = currentLanguage): string {
  if (!translations[language])
    return key;
  return translations[language][key] || key;
}