import { CalendarBlankIcon, EyeIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react"
import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CharacterImage from "@/components/characters/characterImage"

interface CharacterCardProps {
    character: SavedCharacterBuild
    isCurrent: boolean
    formatRegistrationDate: (timestamp?: number) => string
    onView: (character: SavedCharacterBuild) => void
    onEdit: (character: SavedCharacterBuild) => void
    onDelete: (character: SavedCharacterBuild) => void
}

export default function CharacterCard({
    character,
    isCurrent,
    formatRegistrationDate,
    onView,
    onEdit,
    onDelete,
}: CharacterCardProps) {
    return (
        <Card>
            <CharacterImage
                image={character.character?.image}
                name={character.name}
                className="aspect-4/3 w-full object-cover"
            />
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                    <span className="truncate">{character.name}</span>
                    {isCurrent && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-cyan-500/15 dark:text-cyan-400">
                            En edición
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarBlankIcon size={16} />
                    <span>Registrado: {formatRegistrationDate(character.createdAt)}</span>
                </p>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onView(character)}
                >
                    <EyeIcon />
                    Ver
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(character)}
                    disabled={character.id === undefined}
                >
                    <PencilSimpleIcon />
                    Editar
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(character)}
                    disabled={character.id === undefined}
                >
                    <TrashIcon />
                    Eliminar
                </Button>
            </CardFooter>
        </Card>
    )
}