import { useMemo, useState, type SubmitEvent } from "react"
import {
    // BroomIcon,
    FloppyDiskIcon,
    FolderOpenIcon,
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
import { toast } from "sonner"
import { LoadTeamModal } from "./loadTeamModal"

export default function TeamManagement() {
    const {
        savedCharacters,
        currentTeamCharacterIds,
        teams,
        activeTeam,
        saveTeam,
        // clearTeam,
    } = useTeam()
    const [teamName, setTeamName] = useState("")
    const [isSaveOpen, setIsSaveOpen] = useState(false)
    const [isLoadOpen, setIsLoadOpen] = useState(false)
    // const [isClearOpen, setIsClearOpen] = useState(false)
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

    // const handleClear = () => {
    //     clearTeam()
    //     setIsClearOpen(false)
    //     toast.success("Se limpió el equipo.")
    // }



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
                {activeTeam ? (
                    <Button
                        type="button"
                        onClick={handleUpdate}
                        disabled={selectedCharacterIds.length === 0 || isSaving}
                    >
                        <FloppyDiskIcon size={18} />
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
            <LoadTeamModal
                open={isLoadOpen}
                onOpenChange={setIsLoadOpen}
            />
        </>
    )
}
