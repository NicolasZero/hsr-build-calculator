import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { MagnifyingGlassIcon, PencilSimpleIcon, UserCircleIcon } from "@phosphor-icons/react"
import { useTeam } from "@/contexts/teamContext"
import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { Button } from "@/components/ui/button"
import StatusAlerts from "@/components/general/statusAlerts"
import CharacterCard from "@/components/characters/characterCard"
import CharacterImage from "@/components/characters/characterImage"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const PAGE_SIZE = 24

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
    const [searchTerm, setSearchTerm] = useState("")
    const [pagination, setPagination] = useState({ searchTerm: "", visibleCount: PAGE_SIZE })
    const [characterToView, setCharacterToView] = useState<SavedCharacterBuild | null>(null)
    const [characterToDelete, setCharacterToDelete] = useState<SavedCharacterBuild | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState("")
    const loadMoreRef = useRef<HTMLDivElement>(null)

    const filteredCharacters = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLocaleLowerCase()
        if (!normalizedSearch) return savedCharacters

        return savedCharacters.filter((character) =>
            character.name.toLocaleLowerCase().includes(normalizedSearch)
        )
    }, [savedCharacters, searchTerm])
    const visibleCount = pagination.searchTerm === searchTerm ? pagination.visibleCount : PAGE_SIZE
    const visibleCharacters = filteredCharacters.slice(0, visibleCount)
    const hasMoreCharacters = visibleCharacters.length < filteredCharacters.length

    useEffect(() => {
        const target = loadMoreRef.current
        if (!target || !hasMoreCharacters) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setPagination((current) => ({
                        searchTerm,
                        visibleCount: Math.min(
                            (current.searchTerm === searchTerm ? current.visibleCount : PAGE_SIZE) + PAGE_SIZE,
                            filteredCharacters.length
                        ),
                    }))
                }
            },
            { rootMargin: "200px" }
        )
        observer.observe(target)

        return () => observer.disconnect()
    }, [filteredCharacters.length, hasMoreCharacters, searchTerm, visibleCount])

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
            <StatusAlerts error={error} onDismissError={() => setError("")} />
            <header className="rounded-2xl border bg-muted/40 p-4">
                <h1 className="text-2xl font-bold text-primary dark:text-cyan-500">
                    Personajes registrados
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Consulta, edita o elimina tus personajes guardados.
                </p>
            </header>

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
                <>
                    <div className="relative">
                        <MagnifyingGlassIcon
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            type="search"
                            placeholder="Buscar por nombre..."
                            aria-label="Buscar personajes por nombre"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {filteredCharacters.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-10 text-center">
                            <UserCircleIcon size={44} className="mx-auto mb-3 text-muted-foreground" />
                            <h2 className="font-semibold">No se encontraron personajes</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                No hay personajes que coincidan con "{searchTerm.trim()}".
                            </p>
                        </div>
                    ) : (
                        <>
                            <section
                                aria-label="Personajes guardados"
                                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                            >
                                {visibleCharacters.map((character) => (
                                    <CharacterCard
                                        key={character.id ?? character.name}
                                        character={character}
                                        isCurrent={character.id === characterId}
                                        formatRegistrationDate={formatRegistrationDate}
                                        onView={setCharacterToView}
                                        onEdit={(selected) => void handleEdit(selected)}
                                        onDelete={setCharacterToDelete}
                                    />
                                ))}
                            </section>
                            <div ref={loadMoreRef} className="py-2 text-center text-sm text-muted-foreground" aria-live="polite">
                                {hasMoreCharacters
                                    ? `Mostrando ${visibleCharacters.length} de ${filteredCharacters.length} personajes`
                                    : `Se muestran ${filteredCharacters.length} personajes`}
                            </div>
                        </>
                    )}
                </>
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
