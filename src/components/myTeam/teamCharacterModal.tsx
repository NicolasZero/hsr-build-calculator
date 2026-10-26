import { useEffect, useState } from "react"
import { MagnifyingGlassIcon, SparkleIcon, UserCircleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { SavedCharacterBuild } from "@/lib/indexedDB"

interface TeamCharacterModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    characters: SavedCharacterBuild[]
    onSelect: (character: SavedCharacterBuild) => void
}

const getCharacterName = (build: SavedCharacterBuild) =>
    build.character?.name?.trim() || build.name.trim()

function CharacterAvatar({ character }: { character: SavedCharacterBuild }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    useEffect(() => {
        const image = character.character?.image
        if (!image) return

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") setImageUrl(reader.result)
        }
        reader.onerror = () => console.error("Error al cargar la imagen del personaje:", reader.error)
        reader.readAsDataURL(image)
        return () => {
            if (reader.readyState === FileReader.LOADING) reader.abort()
        }
    }, [character.character?.image])

    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
            {imageUrl && character.character?.image ? (
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
                <UserCircleIcon size={24} className="text-muted-foreground" />
            )}
        </div>
    )
}

export default function TeamCharacterModal({
    open,
    onOpenChange,
    characters,
    onSelect,
}: TeamCharacterModalProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const filteredCharacters = characters.filter((character) =>
        getCharacterName(character).toLocaleLowerCase().includes(searchTerm.trim().toLocaleLowerCase())
    )

    const handleSelect = (character: SavedCharacterBuild) => {
        onSelect(character)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden p-6">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <SparkleIcon size={22} className="text-primary dark:text-cyan-500" />
                        <DialogTitle className="text-lg font-bold">Seleccionar personaje</DialogTitle>
                    </div>
                    <DialogDescription>
                        Elige una build guardada para agregarla a tu equipo.
                    </DialogDescription>
                </DialogHeader>

                {characters.length > 0 && (
                    <div className="relative my-2">
                        <MagnifyingGlassIcon
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            name="search"
                            placeholder="Buscar por nombre..."
                            aria-label="Buscar personajes por nombre"
                            autoComplete="off"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="pl-9"
                        />
                    </div>
                )}

                <div className="flex-1 space-y-2 overflow-y-auto py-1">
                    {characters.length === 0 ? (
                        <div className="rounded-xl border border-dashed px-4 py-10 text-center">
                            <p className="font-medium">No hay personajes disponibles</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Guarda más personajes o quita uno del equipo para cambiarlo.
                            </p>
                        </div>
                    ) : filteredCharacters.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No se encontraron personajes que coincidan con “{searchTerm}”.
                        </p>
                    ) : (
                        filteredCharacters.map((character) => (
                            <Button
                                key={character.id}
                                type="button"
                                variant="outline"
                                onClick={() => handleSelect(character)}
                                className="h-auto w-full justify-start gap-3 whitespace-normal p-3 text-left"
                            >
                                <CharacterAvatar key={character.id} character={character} />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-semibold">
                                        {getCharacterName(character)}
                                    </span>
                                    <span className="mt-1 block text-xs text-muted-foreground">
                                        HP {character.character.hp || "—"}
                                        {" · "}ATQ {character.character.atq || "—"}
                                        {" · "}VEL {character.character.vel || "—"}
                                    </span>
                                </span>
                            </Button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
