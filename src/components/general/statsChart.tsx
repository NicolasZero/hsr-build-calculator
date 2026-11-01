import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { visibleBuff, chartData } from "@/const/buffType"
import type { BuffType, ChartData } from "@/schema/buffData"

function StatsChart({ data = chartData }: { data?: ChartData[] }) {
    const { t } = useTranslation("stats")

    const chartConfig = {
        valor: {
            label: t("buffs.chart.bonus"),
        }
    } satisfies ChartConfig

    const [visibleStats, setVisibleStats] = useState(() => visibleBuff.map((buff) => buff))
    const visibleData = data.filter(({ buff }) => visibleStats.includes(buff))

    const toggleStat = (stat: BuffType) => {
        setVisibleStats((current) =>
            current.includes(stat)
                ? current.filter((visibleStat) => visibleStat !== stat)
                : [...current, stat]
        )
    }

    return (
        <div className='overflow-auto'>
            <div
                role="group"
                aria-label="Filtrar estadísticas de la gráfica"
                className="flex flex-wrap gap-2 p-3"
            >
                {data.map(({ buff }) => {
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
                            {t(`buffs.types.${buff}`)}
                        </button>
                    )
                })}
            </div>
            <ChartContainer config={chartConfig} className="min-h-75 min-w-125 w-full">
                <BarChart accessibilityLayer data={visibleData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="buff"
                        tickFormatter={(value: string) => t(`buffs.types.${value as BuffType}`)}
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent
                        labelFormatter={(value) => t(`buffs.types.${value}`) as BuffType}
                    />} />
                    <Bar dataKey="valor" fill="var(--color-primary)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    )
}

export default StatsChart