import { CalendarBlankIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react"
import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CharacterImage from "@/components/characters/characterImage"

interface CharacterCardProps {
    character: SavedCharacterBuild
    isCurrent: boolean
    viewMode: "large" | "medium" | "small" | "list"
    formatRegistrationDate: (timestamp?: number) => string
    // onView: (character: SavedCharacterBuild) => void
    onEdit: (character: SavedCharacterBuild) => void
    onDelete: (character: SavedCharacterBuild) => void
}

export default function CharacterCard({
    character,
    isCurrent,
    viewMode,
    formatRegistrationDate,
    // onView,
    onEdit,
    onDelete,
}: CharacterCardProps) {
    const isList = viewMode === "list"

    if (isList) {
        return (
            <article className="flex justify-between items-center p-1 border">
                <div>
                    <span className="truncate me-2">{character.name}</span>
                    {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary w-fit">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            En edición
                        </span>
                    )}
                </div>


                <p className="text-xs hidden md:block">Nv: {character.character?.lvl} - {character.character?.element}</p>

                <div className="space-x-3">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(character)}
                        aria-label="Editar personaje"
                        disabled={character.id === undefined}
                    >
                        <PencilSimpleIcon />
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(character)}
                        aria-label="Eliminar personaje"
                        disabled={character.id === undefined}
                    >
                        <TrashIcon />
                    </Button>
                </div>
            </article>
        )
    }

    return (
        <Card className={viewMode === "small" ? "p-0 gap-0 h-fit" : " h-fit"}>
            <CharacterImage
                image={character.character?.image}
                name={character.name}
                className={`w-full object-cover ${viewMode === "large" ? "aspect-4/3" : "aspect-square"}`}
            />

            {(viewMode == "large" || viewMode == "medium") && (
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                        <span className="truncate">{character.name}</span>
                        {isCurrent && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary w-fit">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                En edición
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
            )}
            {viewMode == "large" && (
                <CardContent>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarBlankIcon size={20} />
                        <span className="hidden ms:inline">Registrado:</span>{formatRegistrationDate(character.createdAt)}
                    </p>
                </CardContent>
            )}
            <CardFooter className="flex flex-wrap justify-end gap-2 p-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(character)}
                    aria-label="Editar personaje"
                    disabled={character.id === undefined}
                >
                    <PencilSimpleIcon />
                    {viewMode == "large" && (

                        "Editar"
                    )}

                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(character)}
                    aria-label="Eliminar personaje"
                    disabled={character.id === undefined}
                >
                    <TrashIcon />
                    {viewMode == "large" && (

                        "Eliminar"
                    )}

                </Button>
            </CardFooter>
        </Card>
    )
}