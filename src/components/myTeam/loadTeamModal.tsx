import { useState } from "react"
import { FolderOpenIcon, TrashIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
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

interface LoadTeamModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onTeamSelect?: (team: StoredTeam) => void
    allowDelete?: boolean
}

export function LoadTeamModal({
    open,
    onOpenChange,
    onTeamSelect,
    allowDelete = true,
}: LoadTeamModalProps) {
    const { teams, loadTeam, deleteTeam, isLoading } = useTeam()
    const [teamToDelete, setTeamToDelete] = useState<StoredTeam | null>(null)

    const handleSelect = (team: StoredTeam) => {
        const { loaded, omitted } = loadTeam(team)
        if (loaded === 0) {
            toast.error("El equipo no tiene personajes disponibles.")
            return
        }

        toast.success(
            omitted === 0
                ? `El equipo "${team.name}" se cargó correctamente.`
                : `El equipo "${team.name}" se cargó; se omitieron ${omitted} personaje(s) eliminado(s) o repetido(s).`
        )

        onOpenChange(false)
        onTeamSelect?.(team)
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
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Equipos guardados</DialogTitle>
                        <DialogDescription>
                            Selecciona un equipo para cargarlo en el espacio de trabajo.
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
                                            {team.characters.length} personaje(s)
                                        </p>
                                    </div>
                                    <Button type="button" size="sm" onClick={() => handleSelect(team)}>
                                        <FolderOpenIcon size={16} />
                                        Cargar
                                    </Button>
                                    {allowDelete && (
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
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmación para eliminar */}
            {allowDelete && (
                <Dialog
                    open={teamToDelete !== null}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) setTeamToDelete(null)
                    }}
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
            )}
        </>
    )
}

