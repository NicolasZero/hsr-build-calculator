import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className='flex justify-center items-center'>
            <p className='text-center my-4'>{t("footer.created_by")} <span className='font-bold text-blue-600 dark:text-blue-400 cursor-pointer' onClick={() => window.open("https://github.com/NicolasZero", "_blank")}>Nico</span> - 30 de abril 2026</p>
        </footer>
    )
}