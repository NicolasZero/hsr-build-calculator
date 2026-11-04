import { useCharacter } from "@/contexts/teamContext"
import TotalStats from "@/components/general/totalStats"
import { ChartBarIcon } from "@phosphor-icons/react"
import { useTranslation } from 'react-i18next';


export default function CharacterStats({ className }: { className?: string }) {
    const { character, characterStats } = useCharacter()
    const { t } = useTranslation('builder')

    return (
        <div className={className}>
            <div className="flex items-center gap-2">
                <ChartBarIcon size={22} className="text-primary" />
                <h2 className="text-lg font-semibold">{t("stats.title")}</h2>
            </div>
            <TotalStats total={characterStats} character={character} />
        </div>
    )
}