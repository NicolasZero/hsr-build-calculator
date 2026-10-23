import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartData = [
    { buff: "ATQ", valor: 0 },
    { buff: "VEL", valor: 0 },
    { buff: "D.CRIT", valor: 50 },
    { buff: "P.CRIT", valor: 5 },
    { buff: "DAÑO", valor: 0 },
    { buff: "RED DEF", valor: 0 },
    { buff: "VUL", valor: 0 },
    { buff: "PEN RES", valor: 0 }
]

const chartConfig = {
    valor: {
        label: "Bono %",
    }
} satisfies ChartConfig

function StatsChart({ data = chartData }) {
    return (
        <div className='overflow-auto'>
            <ChartContainer config={chartConfig} className="min-h-75 min-w-125 w-full">
                <BarChart accessibilityLayer data={data}>
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