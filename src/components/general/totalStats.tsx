import StatsChart from "@/components/general/statsChart"
import type { Character } from "@/schema/character"
import type { BuffType, TotalStatsValues } from "@/schema/buffData"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Button } from "../ui/button"

interface StatItemConfig {
    buff: BuffType
    hasBaseKey?: 'hp' | 'atk' | 'def' | 'spd'
}

const STATS_ITEMS: StatItemConfig[] = [
    { buff: 'hpPercent', hasBaseKey: 'hp' },
    { buff: 'atkPercent', hasBaseKey: 'atk' },
    { buff: 'defPercent', hasBaseKey: 'def' },
    { buff: 'spdPercent', hasBaseKey: 'spd' },
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

interface TotalStatsProps {
    total: TotalStatsValues
    character?: Character | null
}

export default function TotalStats({ total, character }: TotalStatsProps) {
    const [visibleStats, setVisibleStats] = useState(true)
    const { t } = useTranslation("stats")

    const chartData: { buff: BuffType; valor: number }[] = [
        { buff: "hpPercent", valor: total.hpPercent },
        { buff: "atkPercent", valor: total.atkPercent },
        { buff: "defPercent", valor: total.defPercent },
        { buff: "spdPercent", valor: total.spdPercent },
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
        <>
            <Button onClick={() => setVisibleStats(!visibleStats)}>
                {visibleStats ? "Ocultar estadisticas" : "Mostrar estadisticas"}
            </Button>
            <section className={`flex flex-col md:flex-row gap-4`}>

                <ul className={`flex flex-col justify-around gap-3 rounded-lg bg-muted/50 p-4 text-nowrap md:w-fit ${visibleStats ? "" : "hidden"}`}>
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
        </>
    )
}