import { TrashIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export interface DamageHistoryEntry {
    id: string
    characterName: string
    damageType: string
    element: string
    enemyName: string
    damageLabel: string
    damage: number
    registeredAt: number
}

interface DamageHistoryProps {
    entries: DamageHistoryEntry[]
    onRemove: (id: string) => void
    onClear: () => void
}

const displayNumber = (value: number): string =>
    new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(Math.round(value))

export function DamageHistory({ entries, onRemove, onClear }: DamageHistoryProps) {
    const totalDamage = entries.reduce((total, entry) => total + entry.damage, 0)

    return (
        <section aria-label="Historial de daño" className="rounded-2xl border bg-muted/40 p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Historial de daño</h2>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClear}
                    disabled={entries.length === 0}
                >
                    <TrashIcon size={16} />
                    Limpiar historial
                </Button>
            </div>

            {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Registra un resultado de daño para verlo aquí.
                </p>
            ) : (
                <>
                    {entries.length >= 2 && (
                        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                            <p className="text-sm text-muted-foreground">Suma de los registros</p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">
                                {displayNumber(totalDamage)}
                            </p>
                        </div>
                    )}
                    <ul className="flex flex-col gap-2">
                        {[...entries].reverse().map((entry) => (
                            <li
                                key={entry.id}
                                className="flex items-center justify-between gap-3 rounded-xl border bg-background/60 p-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        {entry.characterName} · {entry.damageType} · {entry.element}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {entry.damageLabel} · {entry.enemyName} ·{" "}
                                        {new Date(entry.registeredAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className="font-semibold tabular-nums">
                                        {displayNumber(entry.damage)}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Quitar registro de daño de ${entry.characterName}`}
                                        onClick={() => onRemove(entry.id)}
                                    >
                                        <TrashIcon size={16} />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    )
}
