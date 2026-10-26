import { useEffect, useState, type SubmitEvent } from "react"
import { FloppyDiskIcon, FolderOpenIcon, TrashIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useTeam } from "@/contexts/teamContext"
import { eliminarEquipo, guardarEquipo, obtenerEquipos, type SavedTeam } from "@/lib/indexedDB"
import { TEAM_SIZE } from "@/const/team"
import { toast } from "sonner"

const getCharacterKey = (name: string) => name.trim().toLocaleLowerCase()

export default function TeamManagement() {
    const { savedCharacters, currentTeamCharacterIds, setCurrentTeamCharacterIds } = useTeam()
    const [teams, setTeams] = useState<SavedTeam[]>([])
    const [teamName, setTeamName] = useState("")
    const [teamToDelete, setTeamToDelete] = useState<SavedTeam | null>(null)
    const [isSaveOpen, setIsSaveOpen] = useState(false)
    const [isLoadOpen, setIsLoadOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const selectedCharacterIds = currentTeamCharacterIds.filter((id): id is number =>
        id !== null && savedCharacters.some((character) => character.id === id)
    )

    const refreshTeams = async () => {
        const savedTeams = await obtenerEquipos()
        setTeams(savedTeams)
    }

    useEffect(() => {

        obtenerEquipos()
            .then((savedTeams) => {
                setTeams(savedTeams)
            })
            .catch((loadError: unknown) => {
                console.error("Error al obtener equipos guardados:", loadError)
                toast.error("No se pudieron cargar los equipos guardados.")
            })

    }, [])

    const handleSave = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        const name = teamName.trim()
        if (!name) {
            toast.error("Escribe un nombre para el equipo.")
            return
        }
        if (selectedCharacterIds.length === 0) {
            toast.error("Selecciona al menos un personaje antes de guardar el equipo.")
            return
        }

        setIsSaving(true)
        try {
            await guardarEquipo({ name, characters: selectedCharacterIds })
            await refreshTeams()
            setTeamName("")
            setIsSaveOpen(false)
            toast.success(`El equipo "${name}" se guardó correctamente.`)
        } catch (saveError) {
            console.error("Error al guardar el equipo:", saveError)
            toast.error("No se pudo guardar el equipo. Inténtalo de nuevo.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleLoad = (team: SavedTeam) => {
        const availableById = new Map(
            savedCharacters.flatMap((character) =>
                typeof character.id === "number" ? [[character.id, character] as const] : []
            )
        )
        const usedNames = new Set<string>()
        const validIds = team.characters.flatMap((id) => {
            const character = availableById.get(id)
            if (!character) return []
            const name = getCharacterKey(character.character?.name || character.name)
            if (usedNames.has(name)) return []
            usedNames.add(name)
            return [id]
        }).slice(0, TEAM_SIZE)

        setCurrentTeamCharacterIds(Array.from({ length: TEAM_SIZE }, (_, index) => validIds[index] ?? null))
        setIsLoadOpen(false)
        toast.success(
            validIds.length === team.characters.length
                ? `El equipo "${team.name}" se cargó correctamente.`
                : `El equipo "${team.name}" se cargó; se omitieron personajes eliminados o repetidos.`
        )
    }

    const handleDelete = async () => {
        if (typeof teamToDelete?.id !== "number") return
        try {
            await eliminarEquipo(teamToDelete.id)
            setTeams((currentTeams) => currentTeams.filter((team) => team.id !== teamToDelete.id))
            toast.success(`El equipo "${teamToDelete.name}" se eliminó correctamente.`)
            setTeamToDelete(null)
        } catch (deleteError) {
            console.error("Error al eliminar el equipo:", deleteError)
            toast.error("No se pudo eliminar el equipo. Inténtalo de nuevo.")
        }
    }

    return (
        <>
            <div className="flex flex-wrap justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setIsLoadOpen(true) }}
                >
                    <FolderOpenIcon size={18} />
                    Cargar equipo
                    {teams.length > 0 && (
                        <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs text-primary dark:bg-cyan-950">
                            {teams.length}
                        </span>
                    )}
                </Button>
                <Button
                    type="button"
                    onClick={() => { setIsSaveOpen(true) }}
                    disabled={selectedCharacterIds.length === 0}
                >
                    <FloppyDiskIcon size={18} />
                    Guardar equipo
                </Button>
            </div>

            {/* Modal para guardar un equipo */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Guardar equipo</DialogTitle>
                        <DialogDescription>
                            Asigna un nombre para guardar los personajes seleccionados.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                        <Input
                            name="team_name"
                            aria-label="Nombre del equipo"
                            autoComplete="off"
                            autoFocus
                            value={teamName}
                            onChange={(event) => setTeamName(event.target.value)}
                            placeholder="Nombre del equipo"
                            maxLength={80}
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsSaveOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para cargar un equipo */}
            <Dialog open={isLoadOpen} onOpenChange={setIsLoadOpen}>
                <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Equipos guardados</DialogTitle>
                        <DialogDescription>
                            Carga un equipo para reemplazar la selección actual o elimina un equipo guardado.
                        </DialogDescription>
                    </DialogHeader>
                    {teams.length === 0 ? (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Todavía no hay equipos guardados.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {teams.map((team) => (
                                <div key={team.id} className="flex items-center gap-2 rounded-xl border p-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{team.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {team.characters.length} personajes
                                        </p>
                                    </div>
                                    <Button type="button" size="sm" onClick={() => handleLoad(team)}>
                                        Cargar
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setTeamToDelete(team)}
                                        aria-label={`Eliminar equipo ${team.name}`}
                                        title="Eliminar equipo"
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <TrashIcon size={17} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal para eliminar un equipo */}
            <Dialog
                open={teamToDelete !== null}
                onOpenChange={(open) => { if (!open) setTeamToDelete(null) }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar equipo guardado?</DialogTitle>
                        <DialogDescription>
                            El equipo “{teamToDelete?.name}” se eliminará permanentemente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setTeamToDelete(null)}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDelete}>
                            Eliminar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
