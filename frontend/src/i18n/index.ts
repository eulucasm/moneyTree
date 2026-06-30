import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    lng: 'pt', // Default to Portuguese
    fallbackLng: 'pt',
    compatibilityJSON: 'v3' as any, // Required for React Native compatibility
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
