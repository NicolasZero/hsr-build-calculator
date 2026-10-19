import { Button } from "../ui/button"
import { TrashIcon, ClockIcon } from "@phosphor-icons/react"
import type { SavedCharacterBuild } from "@/lib/indexedDB"

interface CharacterCardProps {
    character: SavedCharacterBuild;
    isCurrent: boolean;
    handleSelectCharacter: (id?: number, name?: string) => void;
    setCharacterToDelete: (character: SavedCharacterBuild) => void;
    imageUrl: string | null;
    formatDate: (date: number) => string;
}

export default function CharacterCard({ character, isCurrent, handleSelectCharacter, setCharacterToDelete, imageUrl, formatDate }: CharacterCardProps) {
    return (
        <div
            className={`group relative flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 hover:border-primary/50 dark:hover:border-cyan-500/50 hover:bg-muted/40 
                ${isCurrent
                    ? "border-primary/80 bg-primary/5 dark:bg-cyan-500/5 dark:border-cyan-500/60"
                    : "border-border"
                }`}
        >
            <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar o imagen */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 border">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={character.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="font-bold text-lg text-muted-foreground uppercase">
                            {character.name.charAt(0) || "?"}
                        </span>
                    )}
                </div>

                {/* Detalles */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base truncate">
                            {character.name}
                        </h4>
                        {isCurrent && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary dark:bg-cyan-500/20 dark:text-cyan-500 font-medium shrink-0">
                                Activo
                            </span>
                        )}
                    </div>

                    {character.updatedAt && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/75 mt-1">
                            <ClockIcon size={12} />
                            <span>{formatDate(character.updatedAt)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 ml-3 shrink-0">
                <Button
                    size="sm"
                    onClick={() => handleSelectCharacter(character.id, character.name)}
                    className={`px-3 ${isCurrent ? "hidden" : ""}`}
                >
                    Cargar
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8"
                    title="Eliminar registro"
                    onClick={() => setCharacterToDelete(character)}
                >
                    <TrashIcon size={16} />
                </Button>
            </div>
        </div>

    )
}