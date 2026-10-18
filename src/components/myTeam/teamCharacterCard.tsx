import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "@phosphor-icons/react"
import CharacterPortrait from "@/components/general/characterPortrait"

interface Props {
    selectedBuild: SavedCharacterBuild | null
    characterName: string
    id: number
    openCharacterModal: (id: number) => void
    removeCharacter: (id: number) => void
}

export default function TeamCharacterCard({
    selectedBuild,
    characterName,
    id,
    openCharacterModal,
    removeCharacter,
}: Props) {

    return (
        <article className="flex max-h-48 items-center gap-3 rounded-xl border bg-background p-3">
            <CharacterPortrait build={selectedBuild} onClick={() => openCharacterModal(id)} />

            <div className="flex-1 h-full flex flex-col justify-between">
                <p className="mb-2 text-xl font-medium">{characterName ? `${characterName.length > 15 ? characterName.slice(0, 15) + "..." : characterName}` : "Personaje"}</p>
                {selectedBuild && (
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            ATQ: {selectedBuild.character.atq || "—"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            DEF: {selectedBuild.character.def || "—"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            HP: {selectedBuild.character.hp || "—"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            VEL: {selectedBuild.character.vel || "—"}
                        </p>
                    </div>
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
            </div>


        </article>
    )
}