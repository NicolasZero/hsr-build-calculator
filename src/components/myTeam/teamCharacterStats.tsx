import { useState } from "react"
import { ChartBarIcon } from "@phosphor-icons/react"
import StatsChart from "@/components/characterBuilder/statsChart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeam } from "@/contexts/teamContext"
import { calculateTotalStats } from "@/utils/calculateTotalStats"

interface TeamCharacterStatsProps {
    characterIds: Array<number | null>
}

export default function TeamCharacterStats({ characterIds }: TeamCharacterStatsProps) {
    const { savedCharacters } = useTeam()
    const [selectedId, setSelectedId] = useState("")

    const members = characterIds.flatMap((id, index) => {
        if (id === null) return []
        const build = savedCharacters.find((character) => character.id === id)
        if (!build || build.id === undefined) return []
        return [{
            id: build.id,
            name: build.character?.name?.trim() || build.name.trim(),
            slot: index + 1,
            build,
        }]
    })

    // console.log("characters: ", members)
    // console.log("character Ids: ", characterIds)

    const selectedMember = members.find((member) => String(member.id) === selectedId) ?? members[0]

    const otherMembersBuffs = members
        .filter((member) => member.id !== selectedMember?.id)
        .flatMap((member) => member.build.buffs)

    const stats = selectedMember
        ? calculateTotalStats(
            selectedMember.build.character,
            selectedMember.build.buffs,
            selectedMember.build.relics,
            otherMembersBuffs
        )
        : null

    return (
        <section className="rounded-2xl border bg-muted/40 p-3 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <ChartBarIcon size={22} className="text-primary dark:text-cyan-500" />
                    <h2 className="text-lg font-semibold">Estadísticas del equipo</h2>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <label htmlFor="team-stats-character" className="text-sm text-muted-foreground">
                        Personaje
                    </label>
                    <Select
                        value={selectedMember ? String(selectedMember.id) : ""}
                        onValueChange={setSelectedId}
                        disabled={members.length === 0}
                    >
                        <SelectTrigger id="team-stats-character" className="w-full sm:w-64">
                            <SelectValue placeholder="Selecciona un personaje" />
                        </SelectTrigger>
                        <SelectContent>
                            {members.map((member) => (
                                <SelectItem key={member.id} value={String(member.id)}>
                                    {member.slot}. {member.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!selectedMember || !stats ? (
                <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    Agrega un personaje al equipo para ver sus estadísticas.
                </p>
            ) : (
                <section className="flex flex-col gap-4 md:flex-row">
                    <ul className="flex flex-col justify-around gap-3 rounded-lg bg-muted/50 p-4 text-nowrap md:w-fit">
                        <li>ATQ: {stats.total.atq.toFixed(1)}%</li>
                        <li>HP: {stats.total.hp.toFixed(1)}%</li>
                        <li>DEF: {stats.total.def.toFixed(1)}%</li>
                        <li>VEL: {stats.total.vel.toFixed(1)}%</li>
                        <li>D.CRIT: {stats.total.dmgCrit.toFixed(1)}%</li>
                        <li>P.CRIT: {stats.total.propCrit.toFixed(1)}%</li>
                        <li>DAÑO: {stats.total.dmg}%</li>
                        <li>PEN RES: {stats.total.penRes}%</li>
                        <li>RED DEF: {stats.total.redDef}%</li>
                        <li>VUL: {stats.total.vul}%</li>
                    </ul>
                    <div className="w-full max-w-[90vw] rounded-md border md:w-full">
                        <StatsChart data={stats.data} />
                    </div>
                </section>
            )}
        </section>
    )
}
