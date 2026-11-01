import StatsChart from "@/components/general/statsChart"
import type { TotalStatsValues } from "@/utils/calculateTotalStats"
import type { Character } from "@/schema/character"
import type { BuffType } from "@/schema/buffData"
import { useTranslation } from "react-i18next"

interface StatItemConfig {
    buff: BuffType
    hasBaseKey?: 'hp' | 'atq' | 'def' | 'vel'
}

const STATS_ITEMS: StatItemConfig[] = [
    { buff: 'hpPercent', hasBaseKey: 'hp' },
    { buff: 'atqPercent', hasBaseKey: 'atq' },
    { buff: 'defPercent', hasBaseKey: 'def' },
    { buff: 'velPercent', hasBaseKey: 'vel' },
    { buff: 'dmgCrit' },
    { buff: 'propCrit' },
    { buff: 'dmg' },
    { buff: 'penRes' },
    { buff: 'redDef' },
    { buff: 'vul' },
    { buff: 'breakDamage' },
    { buff: 'superBreakDamage' },
    { buff: 'breakEffect' },
    { buff: 'elation' },
]

export interface TotalStatsProps {
    total: TotalStatsValues
    character?: Character | null
    className?: string
}

export default function TotalStats({ total, character, className = "" }: TotalStatsProps) {
    const { t } = useTranslation("stats")

    const chartData: { buff: BuffType; valor: number }[] = [
        { buff: "hpPercent", valor: total.hpPercent },
        { buff: "atqPercent", valor: total.atqPercent },
        { buff: "defPercent", valor: total.defPercent },
        { buff: "velPercent", valor: total.velPercent },
        { buff: "propCrit", valor: total.propCrit },
        { buff: "dmgCrit", valor: total.dmgCrit },
        { buff: "dmg", valor: total.dmg },
        { buff: "redDef", valor: total.redDef },
        { buff: "vul", valor: total.vul },
        { buff: "penRes", valor: total.penRes },
        { buff: "breakDamage", valor: total.breakDamage },
        { buff: "superBreakDamage", valor: total.superBreakDamage },
        { buff: "breakEffect", valor: total.breakEffect },
        { buff: "elation", valor: total.elation }
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
                            // <TooltipComponent key={item.buff} content={item.tooltip}>
                            <li key={item.buff}>
                                {t(`buffs.types.${item.buff}`)}: {calculatedFinal}{" "}
                                <span className="text-xs text-primary">
                                    ({bonusVal.toFixed(1)}%)
                                </span>
                            </li>
                            // </TooltipComponent>
                        )
                    }

                    return (
                        // <TooltipComponent key={item.buff} content={item.tooltip}>
                        <li key={item.buff}>{t(`buffs.types.${item.buff}`)}: {bonusVal}%</li>
                        // </TooltipComponent>
                    )
                })}
            </ul>

            <div className="w-full max-w-[90vw] rounded-md border md:w-full">
                <StatsChart data={chartData} />
            </div>
        </section>
    )
}