import { useTeam } from "@/contexts/teamContext"
import type { BuffData } from "@/schema/buffData"

export const PersonajeCell = ({ buff }: { buff: BuffData }) => {
    const { team } = useTeam()
    return <>{team[buff.personaje]?.name}</>
}
