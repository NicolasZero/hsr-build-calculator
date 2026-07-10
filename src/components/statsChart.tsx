import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

const chartData = [
    { buff: "ATQ", valor: 186 },
    { buff: "VEL", valor: 200 },
    { buff: "D.CRIT", valor: 237 },
    { buff: "P.CRIT", valor: 73 },
    { buff: "DAÑO", valor: 209 },
    { buff: "RED DEF", valor: 214 },
    { buff: "VUL", valor: 214 },
    { buff: "PEN RES", valor: 214 }
]

const chartConfig = {
    valor: {
        label: "Ataque",
        color: "#2563eb",
    }
} satisfies ChartConfig

function StatsChart({ data = chartData }) {
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="buff"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                // tickFormatter={(value) => value.slice(0, 5)}
                />
                <Bar dataKey="valor" fill="var(--color-valor)" radius={4} />
                {/* <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} /> */}
            </BarChart>
        </ChartContainer>
    )
}

export default StatsChart