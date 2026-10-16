import { useState } from "react"
import { useTeam } from "@/contexts/teamContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderOpenIcon, TrashIcon, SparkleIcon, PlusIcon, ClockIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import type { SavedCharacterBuild } from "@/lib/indexedDB"

interface LoadCharacterModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onLoaded?: (characterName: string) => void
}

export default function LoadCharacterModal({ open, onOpenChange, onLoaded }: LoadCharacterModalProps) {
    const { savedCharacters, loadCharacter, deleteCharacter, resetCharacter, characterId } = useTeam()
    const [searchTerm, setSearchTerm] = useState("")
    const [characterToDelete, setCharacterToDelete] = useState<SavedCharacterBuild | null>(null)

    const filteredCharacters = savedCharacters.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )

    const handleSelectCharacter = async (id?: number, name?: string) => {
        if (id === undefined) return
        const success = await loadCharacter(id)
        if (success) {
            onOpenChange(false)

            onLoaded?.(`Personaje "${name || "Personaje"}" cargado exitosamente.`)
        }
    }

    const handleCreateNew = () => {
        resetCharacter()
        onOpenChange(false)
        onLoaded?.("Formulario reiniciado para un nuevo personaje.")
    }

    const handleDeleteConfirm = async () => {
        if (characterToDelete?.id !== undefined) {
            await deleteCharacter(characterToDelete.id)
            setCharacterToDelete(null)
        }
    }

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return ""
        const date = new Date(timestamp)
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-6">
                            <div className="flex items-center gap-2">
                                <FolderOpenIcon size={24} className="text-primary dark:text-fuchsia-500" />
                                <DialogTitle className="text-xl font-bold">Personajes Guardados</DialogTitle>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCreateNew}
                                className="flex items-center gap-1.5 border-dashed"
                            >
                                <PlusIcon size={16} />
                                <span className="hidden sm:block">Nuevo Personaje</span>
                            </Button>
                        </div>
                        <DialogDescription>
                            Selecciona una build guardada para cargarla en el editor.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Barra de búsqueda */}
                    {savedCharacters.length > 0 && (
                        <div className="relative my-2">
                            <MagnifyingGlassIcon
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}

                    {/* Lista de personajes */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
                        {savedCharacters.length === 0 ? (
                            <div className="text-center py-12 px-4 border border-dashed rounded-xl my-4">
                                <SparkleIcon size={40} className="mx-auto text-muted-foreground/60 mb-3" />
                                <h3 className="font-medium text-base mb-1">No hay personajes guardados</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                                    Crea y guarda tu primera build usando el botón "Guardar Personaje" en el formulario.
                                </p>
                                <Button onClick={handleCreateNew} size="sm">
                                    Comenzar nueva build
                                </Button>
                            </div>
                        ) : filteredCharacters.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No se encontraron personajes que coincidan con "{searchTerm}".
                            </div>
                        ) : (
                            filteredCharacters.map((item) => {
                                const isCurrent = characterId === item.id
                                const imageUrl = item.character?.image
                                    ? URL.createObjectURL(item.character.image)
                                    : null

                                return (
                                    <div
                                        key={item.id}
                                        className={`group relative flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 ${isCurrent
                                            ? "border-primary/80 bg-primary/5 dark:bg-fuchsia-950/20"
                                            : "border-border"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            {/* Avatar o imagen */}
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 border">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-lg text-muted-foreground uppercase">
                                                        {item.name.charAt(0) || "?"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Detalles */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-base truncate">
                                                        {item.name}
                                                    </h4>
                                                    {isCurrent && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary dark:text-fuchsia-400 font-medium shrink-0">
                                                            Activo
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    {item.character?.lvl && (
                                                        <span>Nv. {item.character.lvl}</span>
                                                    )}
                                                    {item.character?.offensiveStat && (
                                                        <span>• {item.character.offensiveStat}</span>
                                                    )}
                                                    {item.relics?.setName && (
                                                        <span>• Set: {item.relics.setName}</span>
                                                    )}
                                                    <span>• {item.buffs?.length || 0} Buffs</span>
                                                </div>

                                                {item.updatedAt && (
                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground/75 mt-1">
                                                        <ClockIcon size={12} />
                                                        <span>{formatDate(item.updatedAt)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex items-center gap-2 ml-3 shrink-0">
                                            <Button
                                                size="sm"
                                                variant={isCurrent ? "secondary" : "default"}
                                                onClick={() => handleSelectCharacter(item.id, item.name)}
                                                className="px-3"
                                            >
                                                {isCurrent ? "Cargado" : "Cargar"}
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8"
                                                title="Eliminar registro"
                                                onClick={() => setCharacterToDelete(item)}
                                            >
                                                <TrashIcon size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmación para eliminar */}
            <Dialog
                open={!!characterToDelete}
                onOpenChange={(isOpen) => !isOpen && setCharacterToDelete(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">
                            ¿Eliminar personaje guardado?
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar permanentemente a{" "}
                            <span className="font-semibold text-foreground">
                                {characterToDelete?.name}
                            </span>{" "}
                            de IndexedDB? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setCharacterToDelete(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                        >
                            Eliminar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
