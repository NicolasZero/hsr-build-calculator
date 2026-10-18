import { useState } from "react"
import TeamCharacterSelector from "@/components/myTeam/teamCharacterSelector"
import TeamManagement from "@/components/myTeam/teamManagement"
import TeamCharacterStats from "@/components/myTeam/teamCharacterStats"

export default function TeamPage() {
    const [characterIds, setCharacterIds] = useState<Array<number | null>>(
        () => Array(4).fill(null)
    )

    return (
        <main className="flex flex-col  gap-4 p-4 md:px-8 max-w-7xl mx-auto w-full">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border">
                <div>
                    <h1 className="text-primary text-2xl font-bold dark:text-cyan-500">Editor de equipo (Teams)</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Elige hasta cuatro personajes que hayas guardado.
                    </p>
                </div>
                <TeamManagement
                    characterIds={characterIds}
                    onLoadTeam={setCharacterIds}
                />
            </header>
            <TeamCharacterSelector
                characterIds={characterIds}
                onCharacterIdsChange={setCharacterIds}
            />
            <TeamCharacterStats characterIds={characterIds} />
        </main>
    )
}
