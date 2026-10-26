import { useState } from "react"
import TeamCharacterSelector from "@/components/myTeam/teamCharacterSelector"
import TeamManagement from "@/components/myTeam/teamManagement"
import TeamCharacterStats from "@/components/myTeam/teamCharacterStats"
import { PencilIcon } from "@phosphor-icons/react"
import type { SavedTeam } from "@/lib/indexedDB"

export default function TeamPage() {
    const [editingTeam, setEditingTeam] = useState<SavedTeam | null>(null)

    return (
        <main className="flex flex-col  gap-4 p-4 md:px-8 max-w-7xl mx-auto w-full">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border">
                <div>
                    <div className="flex items-center gap-2 mb-1 text-2xl">
                        <PencilIcon className="text-primary" />
                        <h2 className=" font-semibold">Editor de equipo (Teams)</h2>
                    </div>
                    <p className="text-md text-muted-foreground mt-1">
                        Elige hasta cuatro personajes que hayas guardado.
                    </p>
                </div>
                <TeamManagement editingTeam={editingTeam} setEditingTeam={setEditingTeam} />
            </header>
            <TeamCharacterSelector isEditingTeam={editingTeam !== null} />
            <TeamCharacterStats />
        </main>
    )
}
