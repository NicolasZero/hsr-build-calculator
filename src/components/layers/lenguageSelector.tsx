import { GlobeIcon } from "@phosphor-icons/react";
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LanguageSelector() {
    const { i18n } = useTranslation();

    const handleChange = (value: string) => {
        i18n.changeLanguage(value);
    };

    return (
        <div className="flex items-center gap-2 mx-1">
            <GlobeIcon size={24} className="text-muted-foreground" />
            <Select name="language" defaultValue={i18n.language.split('-')[0]} onValueChange={handleChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}