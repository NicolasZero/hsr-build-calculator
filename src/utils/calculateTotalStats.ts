import { valueByMainStat } from "@/const/relicStats"
import type { BuffData } from "@/schema/buffData"
import type { Character } from "@/schema/character"
import type { RelicData } from "@/schema/relicData"

interface Stats {
    atqFlat: number
    defFlat: number
    hpFlat: number
    velFlat: number
    propCrit: number
    dmgCrit: number
    atqPercent: number
    defPercent: number
    hpPercent: number
    velPercent: number
    dmg: number
    redDef: number
    vul: number
    penRes: number
}

const statsMap: Partial<Record<string, keyof Stats>> = {
    "ATQ %": "atqPercent",
    "DEF %": "defPercent",
    "HP %": "hpPercent",
    "VEL %": "velPercent",
    ATQ: "atqFlat",
    DEF: "defFlat",
    HP: "hpFlat",
    VEL: "velFlat",
    "P.CRIT": "propCrit",
    "D.CRIT": "dmgCrit",
    DAÑO: "dmg",
    "RED DEF": "redDef",
    VUL: "vul",
    "PEN RES": "penRes",
}

const emptyStats = (): Stats => ({
    atqPercent: 0,
    defPercent: 0,
    hpPercent: 0,
    velPercent: 0,
    atqFlat: 0,
    defFlat: 0,
    hpFlat: 0,
    velFlat: 0,
    propCrit: 0,
    dmgCrit: 0,
    dmg: 0,
    redDef: 0,
    vul: 0,
    penRes: 0,
})

export interface TotalStatsValues {
    atq: number
    hp: number
    def: number
    vel: number
    dmgCrit: number
    propCrit: number
    dmg: number
    redDef: number
    vul: number
    penRes: number
}

export interface StatsChartData {
    buff: string
    valor: number
}

export function calculateTotalStats(
    character: Character,
    buffs: BuffData[],
    relics: RelicData,
    otherBuffs?: BuffData[]
): { total: TotalStatsValues; data: StatsChartData[] } {
    const base = {
        atq: Number(character.atq) || 0,
        def: Number(character.def) || 0,
        vel: Number(character.vel) || 0,
        hp: Number(character.hp) || 0,
    }

    const relicMainStats = emptyStats()
    for (const relic of relics.relics) {
        const key = relic.mainStat ? statsMap[relic.mainStat] : undefined
        if (key) {
            relicMainStats[key] += valueByMainStat[relic.mainStat]
        }
    }

    const relicSubStats = emptyStats()
    for (const subStat of relics.subStats) {
        const key = statsMap[subStat.stat]
        if (key) {
            relicSubStats[key] += Number(subStat.value)
        }
    }

    const buffStats = emptyStats()
    for (const buff of buffs) {
        const appliesToCharacter = buff.objetivo !== "Todos excepto este personaje"
        const key = buff.status && appliesToCharacter ? statsMap[buff.buff] : undefined
        if (key) {
            buffStats[key] += Number(buff.valor)
        }
    }

    if (otherBuffs) {
        for (const buff of otherBuffs) {
            const appliesToCharacter = buff.objetivo !== "Este personaje"
            const key = buff.status && appliesToCharacter ? statsMap[buff.buff] : undefined
            if (key) {
                buffStats[key] += Number(buff.valor)
            }
        }
    }

    const flatAsPercent = (flat: number, baseStat: number) =>
        baseStat ? flat / baseStat * 100 : 0

    const total: TotalStatsValues = {
        atq: flatAsPercent(
            relicMainStats.atqFlat + relicSubStats.atqFlat + buffStats.atqFlat,
            base.atq
        ) + relicMainStats.atqPercent + relicSubStats.atqPercent + buffStats.atqPercent,
        def: flatAsPercent(
            relicMainStats.defFlat + relicSubStats.defFlat + buffStats.defFlat,
            base.def
        ) + relicMainStats.defPercent + relicSubStats.defPercent + buffStats.defPercent,
        vel: flatAsPercent(
            relicMainStats.velFlat + relicSubStats.velFlat + buffStats.velFlat,
            base.vel
        ) + relicMainStats.velPercent + relicSubStats.velPercent + buffStats.velPercent,
        hp: flatAsPercent(
            relicMainStats.hpFlat + relicSubStats.hpFlat + buffStats.hpFlat,
            base.hp
        ) + relicMainStats.hpPercent + relicSubStats.hpPercent + buffStats.hpPercent,
        propCrit: 5 + relicSubStats.propCrit + relicMainStats.propCrit + buffStats.propCrit,
        dmgCrit: 50 + relicSubStats.dmgCrit + relicMainStats.dmgCrit + buffStats.dmgCrit,
        dmg: relicMainStats.dmg + buffStats.dmg,
        redDef: relicMainStats.redDef + buffStats.redDef,
        vul: relicMainStats.vul + buffStats.vul,
        penRes: relicMainStats.penRes + buffStats.penRes,
    }

    const data = [
        { buff: "ATQ", valor: total.atq },
        { buff: "HP", valor: total.hp },
        { buff: "DEF", valor: total.def },
        { buff: "VEL", valor: total.vel },
        { buff: "D.CRIT", valor: total.dmgCrit },
        { buff: "P.CRIT", valor: total.propCrit },
        { buff: "DAÑO", valor: total.dmg },
        { buff: "RED DEF", valor: total.redDef },
        { buff: "VUL", valor: total.vul },
        { buff: "PEN RES", valor: total.penRes },
    ]

    return { total, data }
}
