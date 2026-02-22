import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import esMX from "./locales/es-MX.json";
import en from "./locales/en.json";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: esMX },
    en: { translation: en }
  },
  lng: "es", // idioma por defecto
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;