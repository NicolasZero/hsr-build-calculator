import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { FolderUserIcon, MagnifyingGlassIcon, ImageSquareIcon, GridFourIcon, GridNineIcon, ListBulletsIcon } from "@phosphor-icons/react"
import { useCharacter, useTeam } from "@/contexts/teamContext"
import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { formatDateTime } from "@/lib/characterBuild"
import { Button } from "@/components/ui/button"
import CharacterCard from "@/components/characters/characterCard"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import uhEtoBleh from '@/assets/uh_eto_bleh.webp'

const PAGE_SIZE = 24
type CharacterViewMode = "large" | "medium" | "small" | "list"
const viewModeOptions: CharacterViewMode[] = ["large", "medium", "small", "list"]

export default function SavedCharactersPage() {
    const { savedCharacters } = useTeam()
    const { loadCharacter, deleteCharacter, characterId, isLoading, error } = useCharacter()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<CharacterViewMode>("large")
    const [pagination, setPagination] = useState({ searchTerm: "", visibleCount: PAGE_SIZE })
    // const [characterToView, setCharacterToView] = useState<SavedCharacterBuild | null>(null)
    const [characterToDelete, setCharacterToDelete] = useState<SavedCharacterBuild | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
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
            toast.error(`No se pudo cargar "${character.name}" para editarlo.`)
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
            toast.error(`No se pudo eliminar "${characterToDelete.name}". Inténtalo de nuevo.`)
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:px-8">
            <header className="border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-2xl">
                    <FolderUserIcon className="text-primary" />
                    <h2 className=" font-semibold">Personajes registrados</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Revisa, edita o elimina tus personajes guardados.
                </p>
            </header>

            {error ? (
                <div className="border border-destructive/50 bg-destructive/5 p-6 text-center">
                    <p className="font-medium text-destructive">No se pudieron cargar los personajes</p>
                    <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
            ) : isLoading ? (
                <div className="border border-dashed p-10 text-center">
                    <p className="text-sm text-muted-foreground">Cargando personajes guardados...</p>
                </div>
            ) : savedCharacters.length === 0 ? (
                <section className="border border-dashed p-10 text-center">
                    <img src={uhEtoBleh} alt="uh Eto Bleh" className="mx-auto mb-3 w-52" />
                    <h2 className="font-semibold">Todavía no hay personajes guardados</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Crea un personaje en el constructor para verlo aquí.
                    </p>
                    <Button type="button" className="mt-4" onClick={() => navigate("/")}>
                        Ir al constructor
                    </Button>
                </section>
            ) : (
                <>
                    {/* Barra de busqueda {/*  */}
                    <section className="relative">
                        <MagnifyingGlassIcon
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            type="search"
                            name="search_character"
                            placeholder="Buscar por nombre..."
                            aria-label="Buscar personajes por nombre"
                            autoComplete="off"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="pl-9"
                        />
                    </section>

                    {/* Botones para cambiar la visualizacion */}
                    <section className="flex flex-wrap gap-2" role="group" aria-label="Modo de visualización">
                        {viewModeOptions.map((mode) => (
                            <Button
                                key={mode}
                                type="button"
                                size="icon-lg"
                                variant={viewMode === mode ? "default" : "outline"}
                                aria-pressed={viewMode === mode}
                                onClick={() => setViewMode(mode)}
                            >
                                {mode == "large" ? <ImageSquareIcon /> : mode == "medium" ? <GridFourIcon /> : mode == "small" ? <GridNineIcon /> : <ListBulletsIcon />}
                            </Button>
                        ))}
                    </section>

                    {filteredCharacters.length === 0 ? (
                        <div className="border border-dashed p-10 text-center">
                            {/* <UserCircleIcon size={44} className="mx-auto mb-3 text-muted-foreground" /> */}
                            <img src={uhEtoBleh} alt="uh Eto Bleh" className="mx-auto mb-3 w-52" />
                            <h2 className="font-semibold">No se encontraron personajes</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                No hay personajes que coincidan con "{searchTerm.trim()}".
                            </p>
                        </div>
                    ) : (
                        <>
                            <section
                                aria-label="Personajes guardados"
                                className={
                                    viewMode === "list"
                                        ? "flex flex-col gap-3"
                                        : viewMode === "large"
                                            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                                            : viewMode === "medium"
                                                ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                                                : "grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                                }
                            >
                                {visibleCharacters.map((character) => (
                                    <CharacterCard
                                        key={character.id ?? character.name}
                                        character={character}
                                        isCurrent={character.id === characterId}
                                        viewMode={viewMode}
                                        formatRegistrationDate={formatDateTime}
                                        onEdit={(selected) => void handleEdit(selected)}
                                        onDelete={setCharacterToDelete}
                                    />
                                ))}
                            </section>
                            <div ref={loadMoreRef} className="py-2 text-center text-sm text-muted-foreground" aria-live="polite">
                                {hasMoreCharacters
                                    ? `Mostrando ${visibleCharacters.length} de ${filteredCharacters.length} personajes`
                                    : `Se encontraron ${filteredCharacters.length} personajes`}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Modal para eliminar personaje */}
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
