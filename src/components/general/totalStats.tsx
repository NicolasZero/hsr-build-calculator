import StatsChart from "@/components/general/statsChart"
import type { TotalStatsValues } from "@/utils/calculateTotalStats"
import type { Character } from "@/schema/character"
import TooltipComponent from "@/components/general/tooltips"

interface StatItemConfig {
    buff: keyof TotalStatsValues
    label: string
    tooltip: string
    hasBaseKey?: 'hp' | 'atq' | 'def' | 'vel'
}

const STATS_ITEMS: StatItemConfig[] = [
    { buff: 'hp', hasBaseKey: 'hp', label: 'HP', tooltip: 'Vida' },
    { buff: 'atq', hasBaseKey: 'atq', label: 'ATQ', tooltip: 'Ataque' },
    { buff: 'def', hasBaseKey: 'def', label: 'DEF', tooltip: 'Defensa' },
    { buff: 'vel', hasBaseKey: 'vel', label: 'VEL', tooltip: 'Velocidad' },
    { buff: 'dmgCrit', label: 'D.CRIT', tooltip: 'Daño Crítico' },
    { buff: 'propCrit', label: 'P.CRIT', tooltip: 'Probabilidad Crítica' },
    { buff: 'dmg', label: 'DAÑO', tooltip: 'Aumento de Daño' },
    { buff: 'breakDamage', label: 'DAÑO. RUP', tooltip: 'Daño de Ruptura' },
    { buff: 'superBreakDamage', label: 'DAÑO. ULTRARUP', tooltip: 'Daño de UltraRuptura' },
    { buff: 'breakEffect', label: 'EFECTO. RUP', tooltip: 'Efecto de Ruptura' },
    { buff: 'elation', label: 'Exultación', tooltip: 'Aumento de Exultación' },
    { buff: 'penRes', label: 'PEN RES', tooltip: 'Penetración de Resistencia' },
    { buff: 'redDef', label: 'RED DEF', tooltip: 'Ignorar Defensa' },
    { buff: 'vul', label: 'VUL', tooltip: 'Aumento de Vulnerabilidad' },
]

export interface TotalStatsProps {
    total: TotalStatsValues
    character?: Character | null
    className?: string
}

export default function TotalStats({ total, character, className = "" }: TotalStatsProps) {

    const chartData = [
        { buff: "HP", valor: total.hp },
        { buff: "ATQ", valor: total.atq },
        { buff: "DEF", valor: total.def },
        { buff: "VEL", valor: total.vel },
        { buff: "P.CRIT", valor: total.propCrit },
        { buff: "D.CRIT", valor: total.dmgCrit },
        { buff: "DAÑO", valor: total.dmg },
        { buff: "DAÑO RUP", valor: total.breakDamage },
        { buff: "DAÑO ULTRARUP", valor: total.superBreakDamage },
        { buff: "EFECTO RUP", valor: total.breakEffect },
        { buff: "EXULTACION", valor: total.elation },
        { buff: "IGN DEF", valor: total.redDef },
        { buff: "VUL", valor: total.vul },
        { buff: "PEN RES", valor: total.penRes }
    ]

    return (
        <section className={`flex flex-col md:flex-row gap-4 ${className}`.trim()}>
            <ul className="flex flex-col justify-around gap-3 rounded-lg bg-muted/50 p-4 text-nowrap md:w-fit">
                {STATS_ITEMS.map((item) => {
                    const bonusVal = total[item.buff] ?? 0

                    if (item.hasBaseKey && character !== undefined && character) {
                        const baseVal = Number(character[item.hasBaseKey]) || 0
                        const calculatedFinal = (baseVal * (1 + bonusVal / 100)).toFixed(0)

                        return (
                            <TooltipComponent key={item.buff} content={item.tooltip}>
                                <li>
                                    {item.label}: {calculatedFinal}{" "}
                                    <span className="text-xs text-primary">
                                        ({bonusVal.toFixed(1)}%)
                                    </span>
                                </li>
                            </TooltipComponent>
                        )
                    }

                    return (
                        <TooltipComponent key={item.buff} content={item.tooltip}>
                            <li><span className="hidden sm:inline">{item.label}</span><span className="sm:hidden">{item.tooltip}</span>: {bonusVal}%</li>
                        </TooltipComponent>
                    )
                })}
            </ul>

            <div className="w-full max-w-[90vw] rounded-md border md:w-full">
                <StatsChart data={chartData} />
            </div>
        </section>
    )
}