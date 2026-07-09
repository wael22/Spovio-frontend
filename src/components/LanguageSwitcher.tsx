import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const currentLang = i18n.resolvedLanguage || i18n.language?.split('-')[0] || 'fr';

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'fr' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="font-mono"
        >
            {currentLang === 'en' ? 'EN' : 'FR'}
        </Button>
    );
}
