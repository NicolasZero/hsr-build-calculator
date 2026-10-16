import { useState } from "react"
import { useTeam } from "@/contexts/teamContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderOpenIcon, SparkleIcon, PlusIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import type { SavedCharacterBuild } from "@/lib/indexedDB"
import CharacterCard from "./characterCard"

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
                                <FolderOpenIcon size={24} className="text-primary dark:text-cyan-500" />
                                <DialogTitle className="text-lg font-bold">Personajes Guardados</DialogTitle>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCreateNew}
                                className="flex items-center gap-1.5 border-dashed"
                            >
                                <PlusIcon size={16} />
                                <span className="hidden sm:block">Nuevo</span>
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
                                    <CharacterCard
                                        key={item.id}
                                        character={item}
                                        isCurrent={isCurrent}
                                        handleSelectCharacter={handleSelectCharacter}
                                        setCharacterToDelete={setCharacterToDelete}
                                        imageUrl={imageUrl}
                                        formatDate={formatDate}
                                    />
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
