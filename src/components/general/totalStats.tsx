import StatsChart from "@/components/general/statsChart"
import type { TotalStatsValues, StatsChartData } from "@/utils/calculateTotalStats"
import type { Character } from "@/schema/character"

interface StatItemConfig {
    key: keyof TotalStatsValues
    baseKey?: keyof Pick<Character, 'atq' | 'hp' | 'def' | 'vel'>
    label: string
    title: string
    isPercentOnly?: boolean
    decimals?: number
}

const STATS_ITEMS: StatItemConfig[] = [
    { key: 'atq', baseKey: 'atq', label: 'ATQ', title: 'ATQ' },
    { key: 'hp', baseKey: 'hp', label: 'HP', title: 'HP' },
    { key: 'def', baseKey: 'def', label: 'DEF', title: 'DEF' },
    { key: 'vel', baseKey: 'vel', label: 'VEL', title: 'Velocidad' },
    { key: 'dmgCrit', label: 'D.CRIT', title: 'Daño Crítico', isPercentOnly: true, decimals: 1 },
    { key: 'propCrit', label: 'P.CRIT', title: 'Probabilidad Crítica', isPercentOnly: true, decimals: 1 },
    { key: 'dmg', label: 'DAÑO', title: 'Aumento de Daño', isPercentOnly: true },
    { key: 'penRes', label: 'PEN RES', title: 'Penetración de Resistencia', isPercentOnly: true },
    { key: 'redDef', label: 'RED DEF', title: 'Reducción o Ignorar Defensa', isPercentOnly: true },
    { key: 'vul', label: 'VUL', title: 'Aumento de Vulnerabilidad', isPercentOnly: true },
]

export interface TotalStatsProps {
    total: TotalStatsValues
    data: StatsChartData[]
    character?: Character | null
    className?: string
}

export default function TotalStats({ total, data, character, className = "" }: TotalStatsProps) {
    return (
        <section className={`flex flex-col md:flex-row gap-4 ${className}`.trim()}>
            <ul className="flex flex-col justify-around gap-3 rounded-lg bg-muted/50 p-4 text-nowrap md:w-fit">
                {STATS_ITEMS.map((item) => {
                    const bonusVal = total[item.key] ?? 0
                    const hasBase = !item.isPercentOnly && item.baseKey && character && character[item.baseKey] !== undefined

                    if (hasBase) {
                        const baseVal = Number(character[item.baseKey!]) || 0
                        const calculatedFinal = (baseVal * (1 + bonusVal / 100)).toFixed(0)

                        return (
                            <li key={item.key} title={item.title}>
                                {item.label}: {calculatedFinal}{" "}
                                <span className="text-xs text-primary dark:text-cyan-500">
                                    ({bonusVal.toFixed(1)}%)
                                </span>
                            </li>
                        )
                    }

                    const formattedVal = item.decimals !== undefined ? bonusVal.toFixed(item.decimals) : bonusVal

                    return (
                        <li key={item.key} title={item.title}>
                            {item.label}: {formattedVal}%
                        </li>
                    )
                })}
            </ul>

            <div className="w-full max-w-[90vw] rounded-md border md:w-full">
                <StatsChart data={data} />
            </div>
        </section>
    )
}