import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "@phosphor-icons/react"
import CharacterPortrait from "@/components/general/characterPortrait"

interface Props {
    selectedBuild: SavedCharacterBuild | null
    characterName: string
    isEditing: boolean
    id: number
    openCharacterModal: (id: number) => void
    removeCharacter: (id: number) => void
}

export default function TeamCharacterCard({
    selectedBuild,
    characterName,
    isEditing,
    id,
    openCharacterModal,
    removeCharacter,
}: Props) {

    return (
        <article className="flex items-center gap-3 rounded-xl border bg-background p-3">
            <CharacterPortrait className="w-[35%] h-37.5" build={selectedBuild} onClick={() => openCharacterModal(id)} />

            <section className="flex-1 h-full flex flex-col justify-between">
                {isEditing && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary w-fit">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        En edición
                    </span>
                )}
                <div className="mb-2 flex items-center gap-2">
                    <p className="truncate text-xl font-medium">
                        {characterName ? `${characterName.length > 15 ? characterName.slice(0, 15) + "..." : characterName}` : "Personaje"}
                    </p>
                </div>
                {selectedBuild && (
                    <>
                        <p className="font-medium text-sm text-muted-foreground">Stats Bases:</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <p>HP: {selectedBuild.character.hp || "—"}</p>
                            <p>ATQ: {selectedBuild.character.atk || "—"}</p>
                            <p>DEF: {selectedBuild.character.def || "—"}</p>
                            <p>VEL: {selectedBuild.character.spd || "—"}</p>
                        </div>
                    </>
                )}

                <div className="flex gap-2 mt-1">
                    <Button type="button" onClick={() => openCharacterModal(id)}>
                        {selectedBuild ? "Cambiar" : "Agregar"}
                    </Button>

                    {selectedBuild && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCharacter(id)}
                            aria-label={`Quitar personaje ${id}`}
                            title="Quitar personaje"
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <TrashIcon />
                        </Button>
                    )}
                </div>
            </section>
        </article>
    )
}