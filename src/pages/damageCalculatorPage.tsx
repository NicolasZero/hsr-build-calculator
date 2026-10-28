import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { Link } from "react-router"
import { CalculatorIcon, CrosshairIcon, ImageIcon, ShieldIcon, SwordIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeam } from "@/contexts/teamContext"
import { enemyDefault } from "@/const/enemyTemplate"
import type { EnemyData } from "@/schema/enemyData"
import type { Element } from "@/schema/statsData"
import { useBlobUrl } from "@/hooks/useBlobUrl"
import {
    calculateDamage,
    getStatValue,
    type DamageCalculationResult,
    type DamageType
} from "@/utils/calculateDamage"
import { ELEMENTS } from "@/const/element"

type AttackStat = "atq" | "hp" | "def"

const STAT_LABELS: Record<AttackStat, string> = {
    atq: "ATQ",
    hp: "HP",
    def: "DEF",
}

const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
    general: "Daño General",
    elation: "Daño de Exultación",
    superBreak: "Daño de Super Break",
}

const numberValue = (value: string): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

const displayNumber = (value: number): string =>
    new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(Math.round(value))

function Field({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span>{label}</span>
            {children}
        </label>
    )
}

export default function DamageCalculatorPage() {
    const { teams, teamMembers, teamStats, loadTeam, isLoading } = useTeam()
    const [selectedTeamId, setSelectedTeamId] = useState("")
    const [selectedMemberId, setSelectedMemberId] = useState("")
    const [attackElement, setAttackElement] = useState<Element>("FISICO")
    const [attackStat, setAttackStat] = useState<AttackStat>("atq")
    const [skillMultiplier, setSkillMultiplier] = useState("100")
    const [damageType, setDamageType] = useState<DamageType>("general")
    const [enemy, setEnemy] = useState<EnemyData>(() => ({
        ...enemyDefault,
        weaknesses: [...(enemyDefault.weaknesses ?? [enemyDefault.weakness])],
        elementalResistance: { ...enemyDefault.elementalResistance },
    }))
    const [hasAttacked, setHasAttacked] = useState(false)

    // Elation-specific inputs
    const [punchline, setPunchline] = useState("0")
    const [certifiedBanger, setCertifiedBanger] = useState("0")
    const [hasCertifiedBanger, setHasCertifiedBanger] = useState(false)

    // Super Break-specific inputs
    const [toughnessReduction, setToughnessReduction] = useState("30")

    const chosenMember =
        teamMembers.find((member) => String(member.id) === selectedMemberId) ?? null
    const memberStats = chosenMember ? teamStats[chosenMember.id]?.total : null
    const enemyImageUrl = useBlobUrl(enemy.image)

    const result = useMemo<DamageCalculationResult | null>(() => {
        if (!hasAttacked || !chosenMember || !memberStats) return null
        const character = chosenMember.build.character
        const multiplier = numberValue(skillMultiplier)
        const effectiveResistance = enemy.elementalResistance[attackElement] ?? 0
        const enemyWeaknesses = enemy.weaknesses ?? [enemy.weakness]
        const hasWeakness = enemyWeaknesses.includes(attackElement)

        return calculateDamage({
            damageType,
            baseStat: getStatValue(attackStat, character, memberStats),
            skillMultiplier: multiplier,
            damageBonus: memberStats.dmg,
            originalDmg: memberStats.originalDmg,
            critRate: memberStats.propCrit,
            critDamage: memberStats.dmgCrit,
            attackerLevel: Number(character.lvl) || 80,
            enemyLevel: enemy.lvl,
            enemyResistance: effectiveResistance,
            resistancePenetration: memberStats.penRes + (hasWeakness ? 20 : 0),
            defenseReduction: (enemy.defenseReduction ?? 0) + memberStats.redDef,
            defenseIgnore: enemy.defenseIgnore ?? 0,
            vulnerability: (enemy.vulnerability ?? 0) + memberStats.vul,
            mitigation: enemy.mitigation ?? 0,
            toughnessBroken: enemy.toughnessBroken ?? false,

            // Elation
            elation: memberStats.elation,
            merrymake: memberStats.merrymake,
            punchline: numberValue(punchline),
            certifiedBanger: numberValue(certifiedBanger),
            hasCertifiedBanger,

            // Super Break
            toughnessReduction: numberValue(toughnessReduction),
            breakEffect: memberStats.breakEffect,
            breakDamage: memberStats.breakDamage,
            superBreakDamage: memberStats.superBreakDamage,
        })
    }, [
        hasAttacked, chosenMember, memberStats, skillMultiplier, enemy,
        attackElement, attackStat, damageType, punchline, certifiedBanger,
        hasCertifiedBanger, toughnessReduction,
    ])

    const updateEnemy = <K extends keyof EnemyData>(key: K, value: EnemyData[K]) => {
        setEnemy((current) => ({ ...current, [key]: value }))
    }

    const handleTeamChange = (teamId: string) => {
        setSelectedTeamId(teamId)
        setSelectedMemberId("")
        setHasAttacked(false)
        const selectedTeam = teams.find((team) => String(team.id) === teamId)
        if (selectedTeam) loadTeam(selectedTeam)
    }

    const handleEnemyImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file?.type.startsWith("image/")) updateEnemy("image", file)
        event.target.value = ""
    }

    const handleAttack = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!chosenMember || !memberStats) return
        setHasAttacked(true)
    }

    const toggleWeakness = (element: Element) => {
        const weaknesses = enemy.weaknesses ?? [enemy.weakness]
        const nextWeaknesses = weaknesses.includes(element)
            ? weaknesses.filter((weakness) => weakness !== element)
            : [...weaknesses, element]
        setEnemy((current) => ({
            ...current,
            weakness: nextWeaknesses[0] ?? "FISICO",
            weaknesses: nextWeaknesses,
        }))
    }

    const canCrit = damageType !== "superBreak"

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:px-8">
            <header className="rounded-2xl border bg-muted/40 p-5 md:p-6">
                <div className="flex items-center gap-3">
                    <CalculatorIcon size={28} className="text-primary" />
                    <div>
                        <h1 className="text-2xl font-semibold">Calculadora de daño</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Simula el daño de una habilidad con las estadísticas y buffs de tu equipo.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleAttack} className="flex flex-col gap-5">
                <section className="rounded-2xl border bg-muted/40 p-4 md:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <CrosshairIcon size={22} className="text-primary" />
                        <h2 className="text-lg font-semibold">Equipo y ataque</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Equipo guardado">
                            <Select value={selectedTeamId} onValueChange={handleTeamChange} disabled={isLoading || teams.length === 0}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={isLoading ? "Cargando equipos..." : "Selecciona un equipo"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Personaje que ataca">
                            <Select
                                value={selectedMemberId}
                                onValueChange={setSelectedMemberId}
                                disabled={teamMembers.length === 0}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Elige un integrante" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.id} value={String(member.id)}>
                                            {member.slot}. {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Tipo de daño">
                            <Select value={damageType} onValueChange={(value) => setDamageType(value as DamageType)}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(Object.entries(DAMAGE_TYPE_LABELS) as [DamageType, string][]).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Elemento del ataque">
                            <Select value={attackElement} onValueChange={(value) => setAttackElement(value as Element)}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ELEMENTS.map((element) => (
                                        <SelectItem key={element} value={element}>{element}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        {damageType === "general" && (
                            <Field label="Stat base">
                                <Select value={attackStat} onValueChange={(value) => setAttackStat(value as AttackStat)}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {(["atq", "hp", "def"] as AttackStat[]).map((stat) => (
                                            <SelectItem key={stat} value={stat}>{STAT_LABELS[stat]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                        <Field label="Multiplicador de habilidad (%)">
                            <Input
                                type="number"
                                min="0"
                                step="any"
                                value={skillMultiplier}
                                onChange={(event) => setSkillMultiplier(event.target.value)}
                                required
                            />
                        </Field>
                    </div>

                    {/* Campos específicos de Exultación */}
                    {damageType === "elation" && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <label className="flex items-center gap-2 self-end rounded-lg border px-3 py-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={hasCertifiedBanger}
                                    onChange={(event) => setHasCertifiedBanger(event.target.checked)}
                                />
                                Tiene Certified Banger
                            </label>
                            {hasCertifiedBanger ? (
                                <Field label="Certified Banger (stacks)">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={certifiedBanger}
                                        onChange={(event) => setCertifiedBanger(event.target.value)}
                                    />
                                </Field>
                            ) : (
                                <Field label="Punchline (stacks)">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={punchline}
                                        onChange={(event) => setPunchline(event.target.value)}
                                    />
                                </Field>
                            )}
                        </div>
                    )}

                    {/* Campos específicos de Super Break */}
                    {damageType === "superBreak" && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Field label="Reducción de firmeza del ataque">
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={toughnessReduction}
                                    onChange={(event) => setToughnessReduction(event.target.value)}
                                />
                            </Field>
                        </div>
                    )}

                    {teamMembers.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {teamMembers.map((member) => (
                                <TeamMemberBadge
                                    key={member.id}
                                    member={member}
                                    selected={chosenMember?.id === member.id}
                                />
                            ))}
                        </div>
                    )}
                    {teams.length === 0 && !isLoading && (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Aún no tienes equipos guardados.{" "}
                            <Link className="text-primary underline underline-offset-4" to="/teams">Crea uno en la página de equipos</Link>.
                        </p>
                    )}
                </section>

                <section className="rounded-2xl border bg-muted/40 p-4 md:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <ShieldIcon size={22} className="text-primary" />
                        <h2 className="text-lg font-semibold">Enemigo</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="grid content-start gap-4 sm:grid-cols-2">
                            <Field label="Nombre">
                                <Input value={enemy.name} onChange={(event) => updateEnemy("name", event.target.value)} />
                            </Field>
                            <Field label="Nivel">
                                <Input type="number" min="1" value={enemy.lvl} onChange={(event) => updateEnemy("lvl", Math.max(1, numberValue(event.target.value)))} />
                            </Field>
                            <div className="sm:col-span-2">
                                <span className="text-sm font-medium">Debilidades elementales</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {ELEMENTS.map((element) => {
                                        const selected = (enemy.weaknesses ?? [enemy.weakness]).includes(element)
                                        return (
                                            <label key={element} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${selected ? "border-primary bg-primary/10" : "bg-background/50"}`}>
                                                <input type="checkbox" checked={selected} onChange={() => toggleWeakness(element)} />
                                                {element}
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed bg-background/40 p-3 text-center text-sm text-muted-foreground">
                            {enemyImageUrl ? (
                                <img src={enemyImageUrl} alt={`Imagen de ${enemy.name || "enemigo"}`} className="h-40 w-full rounded-lg object-cover" />
                            ) : (
                                <>
                                    <ImageIcon size={28} className="mb-2" />
                                    Añadir imagen del enemigo
                                </>
                            )}
                            <input className="sr-only" type="file" accept="image/*" onChange={handleEnemyImage} />
                        </label>
                    </div>

                    <details className="mt-5 rounded-xl border bg-background/40 p-4">
                        <summary className="cursor-pointer font-medium">Opciones avanzadas del enemigo</summary>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {ELEMENTS.map((element) => (
                                <Field key={element} label={`RES ${element} (%)`}>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={enemy.elementalResistance[element]}
                                        onChange={(event) => setEnemy((current) => ({
                                            ...current,
                                            elementalResistance: {
                                                ...current.elementalResistance,
                                                [element]: numberValue(event.target.value),
                                            },
                                        }))}
                                    />
                                </Field>
                            ))}
                            <Field label="Reducción de DEF (%)">
                                <Input type="number" min="0" max="100" step="any" value={enemy.defenseReduction ?? 0} onChange={(event) => updateEnemy("defenseReduction", numberValue(event.target.value))} />
                            </Field>
                            <Field label="Vulnerabilidad (%)">
                                <Input type="number" min="0" step="any" value={enemy.vulnerability ?? 0} onChange={(event) => updateEnemy("vulnerability", numberValue(event.target.value))} />
                            </Field>
                            <Field label="Mitigación de daño (%)">
                                <Input type="number" min="0" max="100" step="any" value={enemy.mitigation ?? 0} onChange={(event) => updateEnemy("mitigation", numberValue(event.target.value))} />
                            </Field>
                            <label className="flex items-center gap-2 self-end rounded-lg border px-3 py-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={enemy.toughnessBroken ?? false}
                                    onChange={(event) => updateEnemy("toughnessBroken", event.target.checked)}
                                />
                                Firmeza rota
                            </label>
                        </div>
                    </details>
                </section>

                <Button type="submit" size="lg" className="h-11 self-start px-6" disabled={!chosenMember || !memberStats}>
                    <SwordIcon size={19} />
                    Atacar y calcular daño
                </Button>
            </form>

            {result && chosenMember && memberStats && (
                <section aria-live="polite" className="rounded-2xl border border-primary/30 bg-primary/5 p-4 md:p-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-semibold">Resultado del ataque</h2>
                            <p className="text-sm text-muted-foreground">
                                {chosenMember.name} · {DAMAGE_TYPE_LABELS[damageType]} · {[attackElement]} · {enemy.name || "Enemigo"}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">Daño estimado por impacto</p>
                    </div>
                    <div className={`grid gap-3 ${canCrit ? "sm:grid-cols-3" : "sm:grid-cols-1 max-w-sm"}`}>
                        <DamageResult label="Sin crítico" value={result.nonCritical} />
                        {canCrit && (
                            <>
                                <DamageResult label="Crítico" value={result.critical} />
                                <DamageResult label="Daño esperado" value={result.expected} highlighted />
                            </>
                        )}
                    </div>
                    <details className="mt-4 text-sm">
                        <summary className="cursor-pointer font-medium">Ver desglose del cálculo</summary>
                        <ul className="mt-3 grid gap-2 text-muted-foreground sm:grid-cols-2">
                            {damageType === "general" && (
                                <li>Stat usada: {displayNumber(getStatValue(attackStat, chosenMember.build.character, memberStats))}</li>
                            )}
                            <li>Daño base: {displayNumber(result.baseDamage)}</li>
                            <li>Original DMG Mult: x{result.originalDmgMultiplier.toFixed(3)}</li>
                            <li>Multiplicador DEF: {(result.defenseMultiplier * 100).toFixed(1)}%</li>
                            <li>RES efectiva: {result.effectiveResistance.toFixed(1)}% (x{result.resistanceMultiplier.toFixed(3)})</li>
                            <li>Multiplicador de vulnerabilidad: x{result.vulnerabilityMultiplier.toFixed(3)}</li>
                            <li>Mitigación restante: {(result.mitigationMultiplier * 100).toFixed(1)}%</li>
                            <li>Broken Mult: x{result.brokenMultiplier.toFixed(1)}</li>
                            {damageType === "elation" && (
                                <>
                                    <li>Exultación Mult: x{result.elationMultiplier?.toFixed(3)}</li>
                                    <li>Punchline Mult: x{result.punchlineMultiplier?.toFixed(3)}</li>
                                    <li>Merrymake Mult: x{result.merrymakeMultiplier?.toFixed(3)}</li>
                                </>
                            )}
                            {damageType === "superBreak" && (
                                <>
                                    <li>Efecto de ruptura Mult: x{result.breakEffectMultiplier?.toFixed(3)}</li>
                                    <li>Daño de ruptura Mult: x{result.breakDmgMultiplier?.toFixed(3)}</li>
                                    <li>Super Break DMG Mult: x{result.superBreakDmgMultiplier?.toFixed(3)}</li>
                                </>
                            )}
                        </ul>
                    </details>
                    <p className="mt-4 text-xs text-muted-foreground">
                        Fórmula de daño basada en las mecánicas de HSR: incluye DEF, RES, vulnerabilidad, mitigación, multiplicador de firmeza rota y crítico.{" "}
                        <a className="underline underline-offset-4" href="https://www.prydwen.gg/star-rail/guides/damage-formula" target="_blank" rel="noreferrer">Referencia de fórmula</a>.
                    </p>
                </section>
            )}
        </main>
    )
}

function DamageResult({
    label,
    value,
    highlighted = false,
}: {
    label: string
    value: number
    highlighted?: boolean
}) {
    return (
        <div className={`rounded-xl border p-4 ${highlighted ? "border-primary bg-primary/10" : "bg-background/60"}`}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${highlighted ? "text-primary" : ""}`}>
                {displayNumber(value)}
            </p>
        </div>
    )
}

function TeamMemberBadge({
    member,
    selected,
}: {
    member: ReturnType<typeof useTeam>["teamMembers"][number]
    selected: boolean
}) {
    const imageUrl = useBlobUrl(member.build.character.image)

    return (
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${selected ? "border-primary bg-primary/10" : "bg-background/50"}`}>
            {imageUrl ? (
                <img src={imageUrl} alt="" className="size-8 rounded-full object-cover" />
            ) : (
                <span className="flex size-8 items-center justify-center rounded-full bg-muted font-semibold">
                    {member.name.slice(0, 1).toUpperCase()}
                </span>
            )}
            <span><span className="text-muted-foreground">{member.slot}.</span> {member.name}</span>
        </div>
    )
}
