import { Language, translations } from './language.translations.js';

let currentLanguage: Language = 'English';

export const setLanguage = (language: Language): void => {
  currentLanguage = language;
};

export const getLanguage = (): Language => {
  return currentLanguage;
};

export function t(key:string, language: Language = 'English'): string {
  return translations[language][key] || key;
}