import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { Link } from "react-router"
import { CalculatorIcon, CrosshairIcon, FolderOpenIcon, ImageIcon, ShieldIcon, SwordIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeam } from "@/contexts/teamContext"
import { attackTarget } from "@/const/battleData"
import { enemyDefault } from "@/const/enemyTemplate"
import type { EnemyData } from "@/schema/enemyData"
import type { AttackTarget, Element } from "@/schema/statsData"
import { useBlobUrl } from "@/hooks/useBlobUrl"
import { LoadTeamModal } from "@/components/myTeam/loadTeamModal"
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

const ATTACK_TARGET_LABELS: Record<AttackTarget, string> = {
    UNICO: "Único",
    RAFAGA: "Ráfaga",
    TODOS: "Todos",
    REBOTE: "Rebote",
}

interface HitGroup {
    id: string
    multiplier: number
    hits: number
    toughnessReduction: number
}

interface DamageSegment extends HitGroup {
    result: DamageCalculationResult
}

interface DamageAttackResult {
    total: DamageCalculationResult
    segments: DamageSegment[]
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
    const { teams, activeTeam, teamMembers, teamStats, isLoading } = useTeam()
    const [isLoadTeamOpen, setIsLoadTeamOpen] = useState(false)
    const [selectedMemberId, setSelectedMemberId] = useState("")
    const [attackElement, setAttackElement] = useState<Element>("FISICO")
    const [attackStat, setAttackStat] = useState<AttackStat>("atq")
    const [skillMultiplier, setSkillMultiplier] = useState("100")
    const [attackTargetType, setAttackTargetType] = useState<AttackTarget>("UNICO")
    const [hitMultiplier, setHitMultiplier] = useState("100")
    const [hitCount, setHitCount] = useState("1")
    const [hitToughnessReduction, setHitToughnessReduction] = useState("30")
    const [hitGroups, setHitGroups] = useState<HitGroup[]>([])
    const [hitGroupError, setHitGroupError] = useState("")
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
    const [toughnessEfficiency, setToughnessEfficiency] = useState("0")

    const chosenMember =
        teamMembers.find((member) => String(member.id) === selectedMemberId) ?? null
    const memberStats = chosenMember ? teamStats[chosenMember.id]?.total : null
    const enemyImageUrl = useBlobUrl(enemy.image)

    const result = useMemo<DamageAttackResult | null>(() => {
        if (!hasAttacked || !chosenMember || !memberStats) return null
        const character = chosenMember.build.character
        const effectiveResistance = enemy.elementalResistance[attackElement] ?? 0

        const sharedInput = {
            damageType,
            baseStat: getStatValue(attackStat, character, memberStats),
            damageBonus: memberStats.dmg,
            originalDmg: memberStats.originalDmg,
            critRate: memberStats.propCrit,
            critDamage: memberStats.dmgCrit,
            attackerLevel: Number(character.lvl) || 80,
            enemyLevel: enemy.lvl,
            enemyResistance: effectiveResistance,
            resistancePenetration: memberStats.penRes,
            defenseReduction: (enemy.defenseReduction ?? 0) + memberStats.redDef,
            // defenseIgnore: enemy.defenseIgnore ?? 0,
            defenseIgnore: memberStats.redDef ?? 0,
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
            toughnessEfficiency: numberValue(toughnessEfficiency),
            breakEffect: memberStats.breakEffect,
            breakDamage: memberStats.breakDamage,
            superBreakDamage: memberStats.superBreakDamage,
        }
        const groups = attackTargetType === "REBOTE"
            ? hitGroups
            : [{
                id: "single-hit",
                multiplier: numberValue(skillMultiplier),
                hits: 1,
                toughnessReduction: numberValue(toughnessReduction),
            }]
        const segments = groups.map((group) => ({
            ...group,
            result: calculateDamage({
                ...sharedInput,
                skillMultiplier: group.multiplier,
                toughnessReduction:
                    damageType === "superBreak" && attackTargetType === "REBOTE"
                        ? group.toughnessReduction
                        : numberValue(toughnessReduction),
            }),
        }))
        const firstResult = segments[0]?.result
        if (!firstResult) return null

        const total = segments.reduce(
            (accumulator, segment) => ({
                ...accumulator,
                baseDamage: accumulator.baseDamage + segment.result.baseDamage * segment.hits,
                nonCritical: accumulator.nonCritical + segment.result.nonCritical * segment.hits,
                critical: accumulator.critical + segment.result.critical * segment.hits,
                expected: accumulator.expected + segment.result.expected * segment.hits,
                ...(accumulator.effectiveToughnessReduction !== undefined &&
                    segment.result.effectiveToughnessReduction !== undefined
                    ? {
                        effectiveToughnessReduction:
                            accumulator.effectiveToughnessReduction +
                            segment.result.effectiveToughnessReduction * segment.hits,
                    }
                    : {}),
            }),
            { ...firstResult, baseDamage: 0, nonCritical: 0, critical: 0, expected: 0 }
        )

        return { total, segments }
    }, [
        hasAttacked, chosenMember, memberStats, skillMultiplier, enemy,
        attackElement, attackStat, damageType, punchline, certifiedBanger,
        hasCertifiedBanger, toughnessReduction, toughnessEfficiency,
        attackTargetType, hitGroups,
    ])

    const updateEnemy = <K extends keyof EnemyData>(key: K, value: EnemyData[K]) => {
        setEnemy((current) => ({ ...current, [key]: value }))
    }

    const handleTeamLoaded = () => {
        setSelectedMemberId("")
        setHasAttacked(false)
    }

    const handleEnemyImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file?.type.startsWith("image/")) updateEnemy("image", file)
        event.target.value = ""
    }

    const handleAttack = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!chosenMember || !memberStats) return
        if (attackTargetType === "REBOTE" && hitGroups.length === 0) {
            setHitGroupError("Agrega al menos un grupo de impactos para calcular el rebote")
            return
        }
        setHitGroupError("")
        setHasAttacked(true)
    }

    const addHitGroup = () => {
        const rawMultiplier = hitMultiplier.trim()
        const rawHits = hitCount.trim()
        const multiplier = Number(hitMultiplier)
        const hits = Number(hitCount)
        if (!rawMultiplier || !Number.isFinite(multiplier) || multiplier < 0) {
            setHitGroupError("Ingresa un multiplicador válido (mayor o igual a 0)")
            return
        }
        if (!rawHits || !Number.isInteger(hits) || hits < 1) {
            setHitGroupError("La cantidad de impactos debe ser un entero mayor o igual a 1")
            return
        }
        const rawToughnessReduction = hitToughnessReduction.trim()
        const groupToughnessReduction = Number(hitToughnessReduction)
        if (
            damageType === "superBreak" &&
            (!rawToughnessReduction ||
                !Number.isFinite(groupToughnessReduction) ||
                groupToughnessReduction < 0)
        ) {
            setHitGroupError("Ingresa una reducción de firmeza válida (mayor o igual a 0)")
            return
        }
        setHitGroups((current) => [
            ...current,
            {
                id: crypto.randomUUID(),
                multiplier,
                hits,
                toughnessReduction: damageType === "superBreak"
                    ? groupToughnessReduction
                    : numberValue(toughnessReduction),
            },
        ])
        setHitGroupError("")
    }

    const toggleWeakness = (element: Element) => {
        const weaknesses = enemy.weaknesses ?? [enemy.weakness]
        const isCurrentlyWeak = weaknesses.includes(element)
        const nextWeaknesses = isCurrentlyWeak
            ? weaknesses.filter((weakness) => weakness !== element)
            : [...weaknesses, element]

        // Si se marca la debilidad -> resistencia elemental pasa a 0.
        // Si se desmarca -> resistencia elemental pasa a 20.
        const nextResistance = isCurrentlyWeak ? 20 : 0

        setEnemy((current) => ({
            ...current,
            weakness: nextWeaknesses[0] ?? "FISICO",
            weaknesses: nextWeaknesses,
            elementalResistance: {
                ...current.elementalResistance,
                [element]: nextResistance,
            },
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
                        <Field label="Equipo seleccionado">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsLoadTeamOpen(true)}
                                disabled={isLoading}
                                className="w-full justify-between font-normal text-foreground"
                            >
                                <span className="truncate">
                                    {activeTeam?.name ?? "Seleccionar equipo..."}
                                </span>
                                <FolderOpenIcon size={18} className="shrink-0 text-muted-foreground" />
                            </Button>
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
                        <Field label="Tipo de ataque">
                            <Select
                                value={attackTargetType}
                                onValueChange={(value) => {
                                    setAttackTargetType(value as AttackTarget)
                                    setHasAttacked(false)
                                    setHitGroupError("")
                                }}
                            >
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {attackTarget.map((target) => (
                                        <SelectItem key={target} value={target}>
                                            {ATTACK_TARGET_LABELS[target]}
                                        </SelectItem>
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
                        {attackTargetType !== "REBOTE" && (
                            <Field label={damageType === "superBreak" ? "Multiplicador de UltraRuptura (%)" : "Multiplicador de habilidad (%)"}>
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={skillMultiplier}
                                    onChange={(event) => setSkillMultiplier(event.target.value)}
                                    required
                                />
                            </Field>
                        )}
                    </div>

                    {attackTargetType === "REBOTE" && (
                        <div className="mt-4 rounded-lg border p-4">
                            <h3 className="font-medium">Grupos de impactos del rebote</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Agrega cada multiplicador y cuántas veces impacta. Por ejemplo: 100% × 1 y 50% × 3.
                            </p>
                            <div className={`mt-3 grid items-end gap-3 ${damageType === "superBreak" ? "sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]" : "sm:grid-cols-[1fr_1fr_auto]"}`}>
                                <Field label={damageType === "superBreak" ? "Multiplicador de UltraRuptura (%)" : "Multiplicador de habilidad (%)"}>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={hitMultiplier}
                                        onChange={(event) => setHitMultiplier(event.target.value)}
                                        required
                                    />
                                </Field>
                                {damageType === "superBreak" && (
                                    <Field label="Reducción de firmeza del grupo">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={hitToughnessReduction}
                                            onChange={(event) => setHitToughnessReduction(event.target.value)}
                                            required
                                        />
                                    </Field>
                                )}
                                <Field label="Cantidad de impactos">
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={hitCount}
                                        onChange={(event) => setHitCount(event.target.value)}
                                        required
                                    />
                                </Field>
                                <Button type="button" onClick={addHitGroup}>Añadir grupo</Button>
                            </div>
                            {hitGroupError && <p role="alert" className="mt-2 text-sm text-destructive">{hitGroupError}</p>}
                            {hitGroups.length > 0 && (
                                <ul className="mt-4 flex flex-col gap-2">
                                    {hitGroups.map((group) => (
                                        <li key={group.id} className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm">
                                            <span>
                                                {group.multiplier}% · {group.hits} {group.hits === 1 ? "impacto" : "impactos"}
                                                {damageType === "superBreak" && ` · Reducción de firmeza: ${group.toughnessReduction}`}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                aria-label={`Eliminar grupo ${group.multiplier}% con ${group.hits} impactos`}
                                                onClick={() => {
                                                    setHitGroups((current) => current.filter((item) => item.id !== group.id))
                                                    setHasAttacked(false)
                                                }}
                                            >
                                                Eliminar
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Campos específicos de Exultación */}
                    {damageType === "elation" && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <label className="flex cursor-pointer items-center gap-2 self-end rounded-lg border px-3 py-2 text-sm">
                                <Checkbox
                                    checked={hasCertifiedBanger}
                                    onCheckedChange={(checked) => setHasCertifiedBanger(checked === true)}
                                />
                                <span>Tiene Certified Banger</span>
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
                            {attackTargetType !== "REBOTE" && (
                                <Field label="Reducción de firmeza del ataque">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={toughnessReduction}
                                        onChange={(event) => setToughnessReduction(event.target.value)}
                                    />
                                </Field>
                            )}
                            <Field label="Eficiencia de ruptura (%)">
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={toughnessEfficiency}
                                    onChange={(event) => setToughnessEfficiency(event.target.value)}
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
                                            <label key={element} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${selected ? "border-primary bg-primary/10" : "bg-background/50"}`}>
                                                <Checkbox
                                                    checked={selected}
                                                    onCheckedChange={() => toggleWeakness(element)}
                                                />
                                                <span>{element}</span>
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
                            <label className="flex cursor-pointer items-center gap-2 self-end rounded-lg border px-3 py-2 text-sm">
                                <Checkbox
                                    checked={enemy.toughnessBroken ?? false}
                                    onCheckedChange={(checked) => updateEnemy("toughnessBroken", checked === true)}
                                />
                                <span>Firmeza rota</span>
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
                        <p className="text-xs text-muted-foreground">
                            {attackTargetType === "REBOTE" ? "Daño total del ataque" : "Daño estimado por impacto"}
                        </p>
                    </div>
                    <div className={`grid gap-3 ${canCrit ? "sm:grid-cols-3" : "sm:grid-cols-1 max-w-sm"}`}>
                        <DamageResult label="Sin crítico" value={result.total.nonCritical} />
                        {canCrit && (
                            <>
                                <DamageResult label="Crítico" value={result.total.critical} />
                                <DamageResult label="Daño esperado" value={result.total.expected} highlighted />
                            </>
                        )}
                    </div>
                    {attackTargetType === "REBOTE" && (
                        <div className="mt-4 rounded-lg border bg-background/60 p-4">
                            <h3 className="font-medium">Desglose de impactos</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {result.segments.reduce((total, segment) => total + segment.hits, 0)} impactos en total
                            </p>
                            <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
                                {result.segments.map((segment) => (
                                    <li key={segment.id}>
                                        {segment.multiplier}% {damageType === "superBreak" ? "de UltraRuptura" : "de habilidad"}
                                        {damageType === "superBreak" && ` · firmeza efectiva: ${segment.result.effectiveToughnessReduction?.toFixed(2)}`}
                                        {" · "}{segment.hits} {segment.hits === 1 ? "impacto" : "impactos"} · {displayNumber(segment.result.expected)} por impacto · subtotal: {displayNumber(segment.result.expected * segment.hits)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <details className="mt-4 text-sm">
                        <summary className="cursor-pointer font-medium">Ver desglose del cálculo</summary>
                        <ul className="mt-3 grid gap-2 text-muted-foreground sm:grid-cols-2">
                            {damageType === "general" && (
                                <li>Stat usada: {displayNumber(getStatValue(attackStat, chosenMember.build.character, memberStats))}</li>
                            )}
                            <li>Daño base: {displayNumber(result.total.baseDamage)}</li>
                            <li>Original DMG Mult: x{result.total.originalDmgMultiplier.toFixed(3)}</li>
                            <li>Multiplicador DEF: {(result.total.defenseMultiplier * 100).toFixed(1)}%</li>
                            <li>RES efectiva: {result.total.effectiveResistance.toFixed(1)}% (x{result.total.resistanceMultiplier.toFixed(3)})</li>
                            <li>Multiplicador de vulnerabilidad: x{result.total.vulnerabilityMultiplier.toFixed(3)}</li>
                            <li>Mitigación restante: {(result.total.mitigationMultiplier * 100).toFixed(1)}%</li>
                            <li>Broken Mult: x{result.total.brokenMultiplier.toFixed(1)}</li>
                            {damageType === "elation" && (
                                <>
                                    <li>Exultación Mult: x{result.total.elationMultiplier?.toFixed(3)}</li>
                                    <li>Punchline Mult: x{result.total.punchlineMultiplier?.toFixed(3)}</li>
                                    <li>Merrymake Mult: x{result.total.merrymakeMultiplier?.toFixed(3)}</li>
                                </>
                            )}
                            {damageType === "superBreak" && (
                                <>
                                    <li>Reducción de firmeza efectiva: {result.total.effectiveToughnessReduction?.toFixed(2)}</li>
                                    <li>Efecto de ruptura Mult: x{result.total.breakEffectMultiplier?.toFixed(3)}</li>
                                    <li>Daño de ruptura Mult: x{result.total.breakDmgMultiplier?.toFixed(3)}</li>
                                    <li>Super Break DMG Mult: x{result.total.superBreakDmgMultiplier?.toFixed(3)}</li>
                                </>
                            )}
                        </ul>
                    </details>
                    <p className="mt-4 text-xs text-muted-foreground">
                        Fórmula de daño basada en las mecánicas de HSR: incluye DEF, RES, vulnerabilidad, mitigación, multiplicador de firmeza rota y crítico.
                    </p>
                </section>
            )}
            {/* Modal para seleccionar equipo */}
            <LoadTeamModal
                open={isLoadTeamOpen}
                onOpenChange={setIsLoadTeamOpen}
                onTeamSelect={handleTeamLoaded}
            />
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
