import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import {
    CalendarBlankIcon,
    EyeIcon,
    PencilSimpleIcon,
    TrashIcon,
    UserCircleIcon,
    WarningCircleIcon,
    XIcon,
} from "@phosphor-icons/react"
import { useTeam } from "@/contexts/teamContext"
import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

function CharacterImage({
    image,
    name,
    className,
}: {
    image: Blob | null | undefined
    name: string
    className: string
}) {
    const [imageSource, setImageSource] = useState<{ image: Blob; url: string } | null>(null)

    useEffect(() => {
        if (!image) return

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setImageSource({ image, url: reader.result })
            }
        }
        reader.onerror = () => console.error("Error al cargar la imagen del personaje:", reader.error)
        reader.readAsDataURL(image)

        return () => {
            if (reader.readyState === FileReader.LOADING) reader.abort()
        }
    }, [image])

    const imageUrl = image && imageSource?.image === image ? imageSource.url : null

    return imageUrl ? (
        <img src={imageUrl} alt={name} className={className} />
    ) : (
        <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
            <UserCircleIcon size={56} />
        </div>
    )
}

function formatRegistrationDate(timestamp?: number) {
    if (timestamp === undefined) return "Fecha no disponible"
    return new Date(timestamp).toLocaleString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export default function SavedCharactersPage() {
    const { savedCharacters, loadCharacter, deleteCharacter, characterId } = useTeam()
    const navigate = useNavigate()
    const [characterToView, setCharacterToView] = useState<SavedCharacterBuild | null>(null)
    const [characterToDelete, setCharacterToDelete] = useState<SavedCharacterBuild | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState("")

    const handleEdit = async (character: SavedCharacterBuild) => {
        if (character.id === undefined) return

        const loaded = await loadCharacter(character.id)
        if (loaded) {
            navigate("/")
        } else {
            setError(`No se pudo cargar "${character.name}" para editarlo.`)
        }
    }

    const handleDelete = async () => {
        if (characterToDelete?.id === undefined) return

        setIsDeleting(true)
        const deleted = await deleteCharacter(characterToDelete.id)
        setIsDeleting(false)

        if (deleted) {
            setCharacterToDelete(null)
        } else {
            setError(`No se pudo eliminar "${characterToDelete.name}". Inténtalo de nuevo.`)
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:px-8">
            <header className="rounded-2xl border bg-muted/40 p-4">
                <h1 className="text-2xl font-bold text-primary dark:text-cyan-500">
                    Personajes registrados
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Consulta, edita o elimina tus personajes guardados.
                </p>
            </header>

            {error && (
                <Alert variant="destructive">
                    <WarningCircleIcon />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <AlertAction>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setError("")}
                            aria-label="Cerrar mensaje de error"
                        >
                            <XIcon />
                        </Button>
                    </AlertAction>
                </Alert>
            )}

            {savedCharacters.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-10 text-center">
                    <UserCircleIcon size={44} className="mx-auto mb-3 text-muted-foreground" />
                    <h2 className="font-semibold">Todavía no hay personajes guardados</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Crea un personaje en el constructor para verlo aquí.
                    </p>
                    <Button type="button" className="mt-4" onClick={() => navigate("/")}>
                        Ir al constructor
                    </Button>
                </div>
            ) : (
                <section
                    aria-label="Personajes guardados"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {savedCharacters.map((character) => (
                        <Card key={character.id ?? character.name}>
                            <CharacterImage
                                image={character.character?.image}
                                name={character.name}
                                className="aspect-4/3 w-full object-cover"
                            />
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    <span className="truncate">{character.name}</span>
                                    {character.id === characterId && (
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
                                    onClick={() => setCharacterToView(character)}
                                >
                                    <EyeIcon />
                                    Ver
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void handleEdit(character)}
                                    disabled={character.id === undefined}
                                >
                                    <PencilSimpleIcon />
                                    Editar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setCharacterToDelete(character)}
                                    disabled={character.id === undefined}
                                >
                                    <TrashIcon />
                                    Eliminar
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </section>
            )}

            <Dialog
                open={characterToView !== null}
                onOpenChange={(open) => { if (!open) setCharacterToView(null) }}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    {characterToView && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{characterToView.name}</DialogTitle>
                                <DialogDescription>
                                    Registrado: {formatRegistrationDate(characterToView.createdAt)}
                                </DialogDescription>
                            </DialogHeader>
                            <CharacterImage
                                image={characterToView.character?.image}
                                name={characterToView.name}
                                className="max-h-64 w-full rounded-xl border object-contain"
                            />
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <dt className="text-muted-foreground">Nivel</dt>
                                <dd>{characterToView.character?.lvl || "—"}</dd>
                                <dt className="text-muted-foreground">HP</dt>
                                <dd>{characterToView.character?.hp || "—"}</dd>
                                <dt className="text-muted-foreground">ATQ</dt>
                                <dd>{characterToView.character?.atq || "—"}</dd>
                                <dt className="text-muted-foreground">DEF</dt>
                                <dd>{characterToView.character?.def || "—"}</dd>
                                <dt className="text-muted-foreground">VEL</dt>
                                <dd>{characterToView.character?.vel || "—"}</dd>
                                <dt className="text-muted-foreground">Estadística ofensiva</dt>
                                <dd>{characterToView.character?.offensiveStat || "—"}</dd>
                                <dt className="text-muted-foreground">Set de reliquias</dt>
                                <dd>{characterToView.relics?.setName || "—"}</dd>
                                <dt className="text-muted-foreground">Mejoras registradas</dt>
                                <dd>{characterToView.buffs?.length ?? 0}</dd>
                            </dl>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const selected = characterToView
                                        setCharacterToView(null)
                                        void handleEdit(selected)
                                    }}
                                    disabled={characterToView.id === undefined}
                                >
                                    <PencilSimpleIcon />
                                    Editar personaje
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={characterToDelete !== null}
                onOpenChange={(open) => { if (!open && !isDeleting) setCharacterToDelete(null) }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar personaje?</DialogTitle>
                        <DialogDescription>
                            Se eliminará permanentemente a{" "}
                            <span className="font-semibold text-foreground">{characterToDelete?.name}</span>.
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCharacterToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => void handleDelete()}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    )
}
