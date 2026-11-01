import { useCallback, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import type { TeamMember } from "@/contexts/teamContext"
import type { TotalStatsValues } from "@/utils/calculateTotalStats"
import { useTranslation } from "react-i18next"
import type { BuffType } from "@/schema/buffData"
import { visibleBuff } from "@/const/buffType"


interface TeamStatsChartProps {
    teamMembers: TeamMember[]
    contributions: Record<number, TotalStatsValues>
}

const STATS: BuffType[] = [
    "hpPercent",
    "atqPercent",
    "defPercent",
    "velPercent",
    "propCrit",
    "dmgCrit",
    "dmg",
    "redDef",
    "vul",
    "penRes",
    "breakDamage",
    "superBreakDamage",
    "breakEffect",
    "elation",
]

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

const memberKey = (id: number) => `member_${id}`

export default function TeamStatsChart({ teamMembers, contributions }: TeamStatsChartProps) {
    const { t } = useTranslation("stats")


    const [hiddenMembers, setHiddenMembers] = useState<Set<number>>(() => new Set())
    const visibleMembers = useMemo(
        () => teamMembers.filter((member) => !hiddenMembers.has(member.id)),
        [teamMembers, hiddenMembers]
    )

    // Ocultar un integrante no necesita reconstruir las etiquetas ni los datos de la gráfica.
    const chartConfig = useMemo<ChartConfig>(
        () =>
            Object.fromEntries(
                teamMembers.map((member, index) => [
                    memberKey(member.id),
                    {
                        label: `${member.slot}. ${member.name}`,
                        color: CHART_COLORS[index],
                    },
                ])
            ),
        [teamMembers]
    )

    const chartData = useMemo(
        () =>
            STATS.map((key) => ({
                buff: key,
                ...Object.fromEntries(
                    teamMembers.map((member) => [
                        memberKey(member.id),
                        contributions[member.id]?.[key] ?? 0,
                    ])
                ),
            })),
        [teamMembers, contributions]
    )

    const toggleMember = useCallback((memberId: number) => {
        setHiddenMembers((current) => {
            const next = new Set(current)
            if (next.has(memberId)) {
                next.delete(memberId)
            } else {
                next.add(memberId)
            }
            return next
        })
    }, [])

    const [visibleStats, setVisibleStats] = useState(() => visibleBuff.map((buff) => buff))
    const visibleData = chartData.filter(({ buff }) => visibleStats.includes(buff))

    const toggleStat = (stat: BuffType) => {
        setVisibleStats((current) =>
            current.includes(stat)
                ? current.filter((visibleStat) => visibleStat !== stat)
                : [...current, stat]
        )
    }

    return (
        <div className="overflow-auto">
            <div
                role="group"
                aria-label="Filtrar estadísticas de la gráfica"
                className="flex flex-wrap gap-2 p-3"
            >
                {chartData.map(({ buff }) => {
                    const isVisible = visibleStats.includes(buff)
                    return (
                        <button
                            key={buff}
                            type="button"
                            aria-pressed={isVisible}
                            onClick={() => toggleStat(buff)}
                            className={`border px-2 py-1 text-xs transition-colors ${isVisible
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background text-muted-foreground"
                                }`}
                        >
                            {t(`buffs.types.${buff}`, { ns: "stats" })}
                        </button>
                    )
                })}
            </div>
            <div
                role="group"
                aria-label="Filtrar integrantes de la gráfica"
                className="flex flex-wrap gap-2 p-3"
            >
                {teamMembers.map((member, index) => {
                    const isVisible = !hiddenMembers.has(member.id)
                    return (
                        <button
                            key={member.id}
                            type="button"
                            aria-pressed={isVisible}
                            onClick={() => toggleMember(member.id)}
                            className={`rounded-md border px-2 py-1 text-xs transition-colors ${isVisible
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background text-muted-foreground"
                                }`}
                        >
                            <span
                                aria-hidden="true"
                                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: CHART_COLORS[index] }}
                            />
                            {member.slot}. {member.name}
                        </button>
                    )
                })}
            </div>
            <ChartContainer config={chartConfig} className="min-h-75 min-w-125 w-full">
                <BarChart accessibilityLayer data={visibleData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="buff"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent
                        labelFormatter={(value) => t(`buffs.types.${value}`) as BuffType}
                    />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {visibleMembers.map((member) => {
                        const index = teamMembers.findIndex(({ id }) => id === member.id)
                        return (
                            <Bar
                                key={member.id}
                                dataKey={memberKey(member.id)}
                                stackId="team"
                                fill={CHART_COLORS[index]}
                                radius={member.id === visibleMembers.at(-1)?.id ? [4, 4, 0, 0] : 0}
                            />
                        )
                    })}
                </BarChart>
            </ChartContainer>
        </div>
    )
}
