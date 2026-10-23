import { useMemo } from "react"
import { useTeam } from "@/contexts/teamContext"
import TotalStats from "@/components/general/totalStats"
import { calculateTotalStats } from "@/utils/calculateTotalStats"
import { ChartBarIcon } from "@phosphor-icons/react"

export default function CharacterStats() {
    const { character, buffs, relics } = useTeam()

    const { total, data } = useMemo(
        () => calculateTotalStats(character, buffs, relics),
        [character, buffs, relics]
    )

    return (
        <>
            <div className="flex items-center gap-2 mb-4">
                <ChartBarIcon size={22} className="text-primary dark:text-cyan-500" />
                <h2 className="text-lg font-semibold">Estadísticas del personaje</h2>
            </div>
            <TotalStats total={total} data={data} character={character} />
        </>
    )
}