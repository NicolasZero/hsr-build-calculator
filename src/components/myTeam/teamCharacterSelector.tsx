import { useState } from "react"
import { useNavigate } from "react-router"
import { PlusIcon, UsersThreeIcon } from "@phosphor-icons/react"
import { useTeam } from "@/contexts/teamContext"
import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { TEAM_SIZE } from "@/const/team"
import { Button } from "@/components/ui/button"
import TeamCharacterModal from "@/components/myTeam/teamCharacterModal"
import TeamCharacterCard from "@/components/myTeam/teamCharacterCard"

const getCharacterName = (build: SavedCharacterBuild) =>
    build.character?.name?.trim() || build.name.trim()

const getCharacterKey = (build: SavedCharacterBuild) =>
    getCharacterName(build).toLocaleLowerCase()

export default function TeamCharacterSelector({ isEditingTeam }: { isEditingTeam: boolean }) {
    const { savedCharacters, currentTeamCharacterIds, setCurrentTeamCharacterIds } = useTeam()
    const navigate = useNavigate()
    const [activeSlot, setActiveSlot] = useState<number | null>(null)

    const buildsById = new Map(
        savedCharacters.flatMap((build) =>
            typeof build.id === "number" ? [[build.id, build] as const] : []
        )
    )
    const slots = Array.from({ length: TEAM_SIZE }, (_, index) => currentTeamCharacterIds[index] ?? null)
    const availableCharacters = savedCharacters.filter((build, index, builds) =>
        typeof build.id === "number" &&
        builds.findIndex((candidate) => getCharacterKey(candidate) === getCharacterKey(build)) === index
    )
    const selectedBuilds = slots.map((id) => id === null ? undefined : buildsById.get(id))
    const openCharacterModal = (slotIndex: number) => setActiveSlot(slotIndex)

    const selectCharacter = (build: SavedCharacterBuild) => {
        const selectedId = build.id
        if (activeSlot === null || selectedId === undefined) return

        const selectedKey = getCharacterKey(build)
        const alreadySelected = slots.some((selectedId, index) => {
            if (index === activeSlot || selectedId === null) return false
            const selectedBuild = buildsById.get(selectedId)
            return selectedBuild ? getCharacterKey(selectedBuild) === selectedKey : false
        })
        if (alreadySelected) return

        setCurrentTeamCharacterIds(
            slots.map((id, index) => index === activeSlot ? selectedId : id)
        )
        setActiveSlot(null)
    }

    const removeCharacter = (slotIndex: number) => {
        setCurrentTeamCharacterIds(
            slots.map((id, index) => index === slotIndex ? null : id)
        )
    }

    const selectedKeys = new Set(slots.flatMap((id, index) => {
        if (id === null || index === activeSlot) return []
        const build = buildsById.get(id)
        return build ? [getCharacterKey(build)] : []
    }))
    const modalCharacters = availableCharacters.filter((build) =>
        !selectedKeys.has(getCharacterKey(build))
    )

    return (
        <section className="rounded-2xl border bg-muted/40 p-3 md:p-6">
            <div className="mb-5 flex flex-wrap flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <UsersThreeIcon size={22} className="text-primary dark:text-cyan-500" />
                    <h2 className="text-lg font-semibold">Integrantes del equipo</h2>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2"
                >
                    <PlusIcon size={17} />
                    Registrar Nuevo personaje
                </Button>
            </div>

            {savedCharacters.length === 0 ? (
                <div className="rounded-xl border border-dashed px-4 py-10 text-center">
                    <p className="font-medium">No hay personajes guardados</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Guarda personajes desde el Constructor de Personaje para agregarlos a tu equipo.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {slots.map((_, index) => {
                        return (
                            <TeamCharacterCard
                                key={index}
                                selectedBuild={selectedBuilds[index] ?? null}
                                characterName={selectedBuilds[index] ? getCharacterName(selectedBuilds[index]) : ""}
                                isEditing={isEditingTeam && selectedBuilds[index] !== undefined}
                                id={index}
                                openCharacterModal={openCharacterModal}
                                removeCharacter={removeCharacter}
                            />
                        )
                    })}
                </div>
            )}

            <TeamCharacterModal
                open={activeSlot !== null}
                onOpenChange={(open) => !open && setActiveSlot(null)}
                characters={modalCharacters}
                onSelect={selectCharacter}
            />
        </section>
    )
}
