import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface ChartDatum {
    buff: string
    valor: number
}

const chartData = [
    { buff: "HP", valor: 0 },
    { buff: "ATQ", valor: 0 },
    { buff: "DEF", valor: 0 },
    { buff: "VEL", valor: 0 },
    { buff: "P.CRIT", valor: 5 },
    { buff: "D.CRIT", valor: 50 },
    { buff: "DAÑO", valor: 0 },
    { buff: "DAÑO. RUP", valor: 0 },
    { buff: "DAÑO. ULTRARUP", valor: 0 },
    { buff: "EFECTO. RUP", valor: 0 },
    { buff: "Exultación", valor: 0 },
    { buff: "RED DEF", valor: 0 },
    { buff: "VUL", valor: 0 },
    { buff: "PEN RES", valor: 0 }
]

const chartConfig = {
    valor: {
        label: "Bono %",
    }
} satisfies ChartConfig

function StatsChart({ data = chartData }: { data?: ChartDatum[] }) {
    const [visibleStats, setVisibleStats] = useState(() => data.map(({ buff }) => buff))
    const visibleData = data.filter(({ buff }) => visibleStats.includes(buff))

    const toggleStat = (stat: string) => {
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
                            className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                                isVisible
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input bg-background text-muted-foreground"
                            }`}
                        >
                            {buff}
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
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="valor" fill="var(--color-primary)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    )
}

export default StatsChart