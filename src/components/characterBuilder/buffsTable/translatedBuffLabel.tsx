import { useTranslation } from "react-i18next"

interface TranslatedBuffLabelProps {
    translationKey: string
    slot?: number
}

export default function TranslatedBuffLabel({ translationKey, slot }: TranslatedBuffLabelProps) {
    const { t } = useTranslation("stats")
    return slot === undefined
        ? t(translationKey)
        : t("buffs.targets.targetCharacterWithSlot", { slot })
}
