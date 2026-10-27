import { useMemo, useState, type SubmitEvent } from "react"
import {
    ArrowsClockwiseIcon,
    BroomIcon,
    FloppyDiskIcon,
    FolderOpenIcon,
    TrashIcon,
} from "@phosphor-icons/react"
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
import type { StoredTeam } from "@/lib/indexedDB"
import { toast } from "sonner"

export default function TeamManagement() {
    const {
        savedCharacters,
        currentTeamCharacterIds,
        teams,
        activeTeam,
        saveTeam,
        deleteTeam,
        loadTeam,
        clearTeam,
        isLoading,
    } = useTeam()
    const [teamName, setTeamName] = useState("")
    const [teamToDelete, setTeamToDelete] = useState<StoredTeam | null>(null)
    const [isSaveOpen, setIsSaveOpen] = useState(false)
    const [isLoadOpen, setIsLoadOpen] = useState(false)
    const [isClearOpen, setIsClearOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const selectedCharacterIds = useMemo(
        () => currentTeamCharacterIds.filter((id): id is number =>
            id !== null && savedCharacters.some((character) => character.id === id)
        ),
        [currentTeamCharacterIds, savedCharacters]
    )

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
            const result = await saveTeam(name, selectedCharacterIds)
            if (!result.success) {
                toast.error(result.error ?? "No se pudo guardar el equipo.")
                return
            }
            setTeamName("")
            setIsSaveOpen(false)
            toast.success(
                result.updated
                    ? `El equipo "${name}" se actualizó correctamente.`
                    : `El equipo "${name}" se guardó correctamente.`
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdate = async () => {
        if (!activeTeam) return
        setIsSaving(true)
        try {
            const result = await saveTeam(activeTeam.name, selectedCharacterIds, activeTeam.id)
            if (!result.success) {
                toast.error(result.error ?? "No se pudo actualizar el equipo.")
                return
            }
            toast.success(`El equipo "${activeTeam.name}" se actualizó correctamente.`)
        } finally {
            setIsSaving(false)
        }
    }

    const handleClear = () => {
        clearTeam()
        setIsClearOpen(false)
        toast.success("Se limpió el equipo.")
    }

    const handleLoad = (team: StoredTeam) => {
        const { loaded, omitted } = loadTeam(team)
        if (loaded === 0) {
            toast.error("El equipo no tiene personajes disponibles.")
            return
        }
        setIsLoadOpen(false)
        toast.success(
            omitted === 0
                ? `El equipo "${team.name}" se cargó correctamente.`
                : `El equipo "${team.name}" se cargó; se omitieron ${omitted} personaje(s) eliminado(s) o repetido(s).`
        )
    }

    const handleDelete = async () => {
        if (typeof teamToDelete?.id !== "number") return
        const team = teamToDelete

        const deleted = await deleteTeam(team.id)
        if (!deleted) {
            toast.error("No se pudo eliminar el equipo. Inténtalo de nuevo.")
            return
        }
        setTeamToDelete(null)
        toast.success(`El equipo "${team.name}" se eliminó correctamente.`)
    }

    return (
        <>
            <div className="flex flex-wrap items-center justify-end gap-2">
                {activeTeam && (
                    <span className="mr-auto text-xs text-muted-foreground sm:mr-2">
                        Editando: <span className="font-medium text-foreground">{activeTeam.name}</span>
                    </span>
                )}
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
                    variant="outline"
                    onClick={() => { setIsClearOpen(true) }}
                    disabled={selectedCharacterIds.length === 0 && !activeTeam}
                >
                    <BroomIcon size={18} />
                    Limpiar equipo
                </Button>
                {activeTeam ? (
                    <Button
                        type="button"
                        onClick={handleUpdate}
                        disabled={selectedCharacterIds.length === 0 || isSaving}
                    >
                        <ArrowsClockwiseIcon size={18} />
                        {isSaving ? "Actualizando..." : "Actualizar equipo"}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={() => { setIsSaveOpen(true) }}
                        disabled={selectedCharacterIds.length === 0}
                    >
                        <FloppyDiskIcon size={18} />
                        Guardar equipo
                    </Button>
                )}
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
                    {isLoading ? (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Cargando equipos...
                        </p>
                    ) : teams.length === 0 ? (
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

            {/* Modal para limpiar el equipo actual */}
            <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Limpiar el equipo?</DialogTitle>
                        <DialogDescription>
                            Se quitarán todos los personajes seleccionados. Los equipos guardados no se
                            modifican.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsClearOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleClear}>
                            Limpiar
                        </Button>
                    </div>
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
