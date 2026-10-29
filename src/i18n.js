import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './locales/ru.json';
import en from './locales/en.json';
import tr from './locales/tr.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import hi from './locales/hi.json';

// Список для переключателя языков (подписи на родном языке)
export const LANGUAGES = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'hi', label: 'हिन्दी' },
    { code: 'ar', label: 'العَرَبِيَّة' }
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      tr: { translation: tr },
      zh: { translation: zh },
      es: { translation: es },
      hi: { translation: hi },
    },
    supportedLngs: LANGUAGES.map((l) => l.code),
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
    detection: {
      // 1) выбор гостя из прошлого визита, 2) язык браузера
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
      convertDetectedLanguage: (lng) => lng.split('-')[0], // en-US -> en
    },
  });

export default i18n;
