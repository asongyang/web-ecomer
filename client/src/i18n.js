import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationTH from './locales/th/translation.json';
import translationLO from './locales/lo/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  th: {
    translation: translationTH
  },
  lo: {
    translation: translationLO
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
