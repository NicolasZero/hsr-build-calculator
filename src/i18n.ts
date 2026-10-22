import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';


i18n
    .use(Backend) // Usar el backend HTTP para cargar los JSONs
    .use(LanguageDetector) // Detecta el idioma del navegador automáticamente
    .use(initReactI18next) // Pasa la instancia a react-i18next
    .init({
        backend: {
            // Ruta donde buscará los archivos JSON de forma dinámica
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        // Configuración opcional para namespaces
        ns: ['common', 'builder'], // Tus archivos JSON principales
        defaultNS: 'common',
        fallbackLng: 'es', // Idioma por defecto si el detectado no está disponible
        interpolation: {
            escapeValue: false // React ya nos protege de ataques XSS por defecto
        }
    });

export default i18n;