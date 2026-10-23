import { valueByMainStat } from "@/const/relicStats"
import type { BuffData } from "@/schema/buffData"
import type { Character } from "@/schema/character"
import type { RelicData } from "@/schema/relicData"

// Define todas las estadísticas que el sistema puede calcular.
// Las estadísticas "Flat" son valores fijos, mientras que las que
// terminan en "Percent" representan porcentajes.
// Las demás representan bonificaciones específicas de combate.
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

// Relaciona los nombres de las estadísticas que vienen de los datos
// (por ejemplo, "ATQ %") con las propiedades que usa TypeScript.
//
// Partial permite que no todos los strings tengan una equivalencia.
// Record<string, keyof Stats> indica que cada valor válido debe ser
// una clave definida dentro de la interfaz Stats.
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

// Crea un objeto con todas las estadísticas inicializadas en cero.
// Se utiliza una función para generar un objeto nuevo cada vez,
// evitando reutilizar accidentalmente el mismo objeto entre cálculos.
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

// Define la estructura de las estadísticas finales.
// Todas las propiedades contienen números.
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

// Define la estructura de los datos que se pueden utilizar
// para representar las estadísticas en una gráfica.
// "buff" es el nombre de la estadística y "valor" es su cantidad.
export interface StatsChartData {
    buff: string
    valor: number
}

// Calcula las estadísticas totales de un personaje.
//
// Parámetros:
// character: estadísticas base del personaje.
// buffs: bonificaciones que se aplican al personaje.
// relics: reliquias equipadas y sus estadísticas.
// otherBuffs: bonificaciones adicionales opcionales.
//
// Devuelve:
// total: objeto con todas las estadísticas calculadas.
// data: lista de estadísticas preparada para una gráfica.
// Calcula las estadísticas de la Fase 1 (Base + Reliquias + Buffs estáticos/planos)
// Esta "foto congelada" (snapshot) se usa tanto para el cálculo directo como
// para interpolar buffs dinámicos de otros personajes del equipo sin ciclos infinitos.
export function calculateFase1Stats(
    character: Character,
    buffs: BuffData[],
    relics: RelicData,
    otherBuffs?: BuffData[],
    targetSlot?: number
): {
    fase1Stats: TotalStatsValues
    base: { atq: number; def: number; vel: number; hp: number }
} {
    const base = {
        atq: Number(character.atq) || 0,
        def: Number(character.def) || 0,
        vel: Number(character.vel) || 0,
        hp: Number(character.hp) || 0,
    }

    const flatAsPercent = (flat: number, baseStat: number) =>
        baseStat ? (flat / baseStat) * 100 : 0

    // Calcula las estadisticas totales de los artefactos
    const relicMainStats = emptyStats()
    for (const relic of relics.relics) {
        const key = relic.mainStat ? statsMap[relic.mainStat] : undefined
        if (key) {
            relicMainStats[key] += valueByMainStat[relic.mainStat]
        }
    }

    // Calcula las estadisticas totales de los sub stats de los artefactos
    const relicSubStats = emptyStats()
    for (const subStat of relics.subStats) {
        const key = statsMap[subStat.stat]
        if (key) {
            relicSubStats[key] += Number(subStat.value)
        }
    }

    const ownActiveBuffs = buffs.filter(
        (buff) =>
            buff.status &&
            buff.objetivo !== "Todos excepto este personaje" &&
            (buff.objetivo !== "Personaje objetivo" || buff.targetSlot === targetSlot)
    )
    const otherActiveBuffs = (otherBuffs || []).filter(
        (buff) =>
            buff.status &&
            buff.objetivo !== "Este personaje" &&
            (buff.objetivo !== "Personaje objetivo" || buff.targetSlot === targetSlot)
    )

    // FASE 1: Solo sumar buffs planos/directos que NO escalan con otra stat
    const fase1BuffStats = emptyStats()
    for (const buff of [...ownActiveBuffs, ...otherActiveBuffs]) {
        if (buff.targetStat) continue // Se calcula en Fase 2
        const key = statsMap[buff.buff]
        if (key) {
            fase1BuffStats[key] += Number(buff.valor) || 0
        }
    }

    const fase1Stats: TotalStatsValues = {
        atq: flatAsPercent(
            relicMainStats.atqFlat + relicSubStats.atqFlat + fase1BuffStats.atqFlat,
            base.atq
        ) + relicMainStats.atqPercent + relicSubStats.atqPercent + fase1BuffStats.atqPercent,
        def: flatAsPercent(
            relicMainStats.defFlat + relicSubStats.defFlat + fase1BuffStats.defFlat,
            base.def
        ) + relicMainStats.defPercent + relicSubStats.defPercent + fase1BuffStats.defPercent,
        vel: flatAsPercent(
            relicMainStats.velFlat + relicSubStats.velFlat + fase1BuffStats.velFlat,
            base.vel
        ) + relicMainStats.velPercent + relicSubStats.velPercent + fase1BuffStats.velPercent,
        hp: flatAsPercent(
            relicMainStats.hpFlat + relicSubStats.hpFlat + fase1BuffStats.hpFlat,
            base.hp
        ) + relicMainStats.hpPercent + relicSubStats.hpPercent + fase1BuffStats.hpPercent,
        propCrit: 5 + relicSubStats.propCrit + relicMainStats.propCrit + fase1BuffStats.propCrit,
        dmgCrit: 50 + relicSubStats.dmgCrit + relicMainStats.dmgCrit + fase1BuffStats.dmgCrit,
        dmg: relicMainStats.dmg + fase1BuffStats.dmg,
        redDef: relicMainStats.redDef + fase1BuffStats.redDef,
        vul: relicMainStats.vul + fase1BuffStats.vul,
        penRes: relicMainStats.penRes + fase1BuffStats.penRes,
    }

    return { fase1Stats, base }
}

export function calculateTotalStats(
    character: Character,
    buffs: BuffData[],
    relics: RelicData,
    otherBuffs?: BuffData[],
    targetSlot?: number
): { total: TotalStatsValues; data: StatsChartData[] } {
    const { fase1Stats, base } = calculateFase1Stats(character, buffs, relics, otherBuffs, targetSlot)

    const flatAsPercent = (flat: number, baseStat: number) =>
        baseStat ? (flat / baseStat) * 100 : 0

    const ownActiveBuffs = buffs.filter(
        (buff) =>
            buff.status &&
            buff.objetivo !== "Todos excepto este personaje" &&
            (buff.objetivo !== "Personaje objetivo" || buff.targetSlot === targetSlot)
    )
    const otherActiveBuffs = (otherBuffs || []).filter(
        (buff) =>
            buff.status &&
            buff.objetivo !== "Este personaje" &&
            (buff.objetivo !== "Personaje objetivo" || buff.targetSlot === targetSlot)
    )

    // FASE 2: Calcular buffos escalables dinámicos usando el snapshot de Fase 1 del emisor
    // para evitar bucles infinitos de retroalimentación
    const getStatFromFase1 = (stats: TotalStatsValues, targetStat: string, baseStats: { atq: number; def: number; vel: number; hp: number }): number => {
        if (targetStat === "ATQ de este personaje" || targetStat === "ATQ del emisor") {
            return baseStats.atq * (1 + stats.atq / 100)
        }
        if (targetStat === "DEF de este personaje" || targetStat === "DEF del emisor") {
            return baseStats.def * (1 + stats.def / 100)
        }
        if (targetStat === "HP de este personaje" || targetStat === "HP del emisor") {
            return baseStats.hp * (1 + stats.hp / 100)
        }
        if (targetStat === "VEL de este personaje" || targetStat === "VEL del emisor") {
            return baseStats.vel * (1 + stats.vel / 100)
        }
        if (targetStat === "D.CRIT de este personaje" || targetStat === "D.CRIT del emisor") {
            return stats.dmgCrit
        }
        if (targetStat === "P.CRIT de este personaje" || targetStat === "P.CRIT del emisor") {
            return stats.propCrit
        }
        return 0
    }

    const fase2BuffStats = emptyStats()

    // 1. Buffs escalables propios (el emisor es este mismo personaje)
    for (const buff of ownActiveBuffs) {
        if (!buff.targetStat) continue
        const statValue = getStatFromFase1(fase1Stats, buff.targetStat, base)
        const transferValue = (Number(buff.valor) / 100) * statValue
        const key = statsMap[buff.buff]
        if (key) {
            fase2BuffStats[key] += transferValue
        }
    }

    // 2. Buffs escalables provenientes de otros personajes del equipo
    for (const buff of otherActiveBuffs) {
        if (!buff.targetStat) continue

        let statValue = 0
        if (buff.emisorStats) {
            // Emisor calculado en Fase 1 si viene provisto por el contexto de equipo
            statValue = getStatFromFase1(
                buff.emisorStats.stats,
                buff.targetStat,
                buff.emisorStats.base
            )
        } else {
            // Fallback si no se proveyeron stats del emisor
            statValue = getStatFromFase1(fase1Stats, buff.targetStat, base)
        }

        const transferValue = (Number(buff.valor) / 100) * statValue
        const key = statsMap[buff.buff]
        if (key) {
            fase2BuffStats[key] += transferValue
        }
    }

    // Total final combinando Fase 1 y Fase 2
    const total: TotalStatsValues = {
        atq: fase1Stats.atq + flatAsPercent(fase2BuffStats.atqFlat, base.atq) + fase2BuffStats.atqPercent,
        def: fase1Stats.def + flatAsPercent(fase2BuffStats.defFlat, base.def) + fase2BuffStats.defPercent,
        vel: fase1Stats.vel + flatAsPercent(fase2BuffStats.velFlat, base.vel) + fase2BuffStats.velPercent,
        hp: fase1Stats.hp + flatAsPercent(fase2BuffStats.hpFlat, base.hp) + fase2BuffStats.hpPercent,
        propCrit: fase1Stats.propCrit + fase2BuffStats.propCrit,
        dmgCrit: fase1Stats.dmgCrit + fase2BuffStats.dmgCrit,
        dmg: fase1Stats.dmg + fase2BuffStats.dmg,
        redDef: fase1Stats.redDef + fase2BuffStats.redDef,
        vul: fase1Stats.vul + fase2BuffStats.vul,
        penRes: fase1Stats.penRes + fase2BuffStats.penRes,
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
