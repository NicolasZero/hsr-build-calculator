import { useState } from "react"
import { ChartBarIcon } from "@phosphor-icons/react"
import TotalStats from "@/components/general/totalStats"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeam } from "@/contexts/teamContext"

export default function TeamCharacterStats() {
    const { teamMembers, teamStats } = useTeam()
    const [selectedId, setSelectedId] = useState("")

    const selectedMember = teamMembers.find((member) => String(member.id) === selectedId) ?? teamMembers[0]

    // Obtenemos los stats precalculados y cacheados directamente del contexto
    const stats = selectedMember ? teamStats[selectedMember.id] : null

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
                        disabled={teamMembers.length === 0}
                    >
                        <SelectTrigger id="team-stats-character" className="w-full sm:w-64">
                            <SelectValue placeholder="Selecciona un personaje" />
                        </SelectTrigger>
                        <SelectContent>
                            {teamMembers.map((member) => (
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
                <TotalStats
                    total={stats.total}
                    data={stats.data}
                    character={selectedMember.build?.character}
                />
            )}
        </section>
    )
}