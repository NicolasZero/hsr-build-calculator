import { useTeam } from "@/contexts/teamContext"
import TotalStats from "@/components/general/totalStats"
import { ChartBarIcon } from "@phosphor-icons/react"

export default function CharacterStats() {
    const { character, characterStats } = useTeam()

    return (
        <>
            <div className="flex items-center gap-2 mb-4">
                <ChartBarIcon size={22} className="text-primary" />
                <h2 className="text-lg font-semibold">Estadísticas del personaje</h2>
            </div>
            {/* <TotalStats total={total} data={data} character={character} /> */}
            <TotalStats total={characterStats} character={character} />
        </>
    )
}