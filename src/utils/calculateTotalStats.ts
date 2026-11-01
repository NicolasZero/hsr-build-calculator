import { valueByMainStat } from "@/const/relicStats"
import type { BuffData } from "@/schema/buffData"
import type { Character } from "@/schema/character"
import type { RelicData } from "@/schema/relicData"

// Define todas las estadísticas que el sistema puede calcular.
// Las estadísticas "Flat" son valores fijos, mientras que las que
// terminan en "Percent" representan porcentajes.
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
    breakEffect: number
    breakDamage: number
    superBreakDamage: number
    elation: number
    redDef: number
    vul: number
    penRes: number
    originalDmg: number
    merrymake: number
}

// Relaciona los nombres de las estadísticas que vienen de los datos
// (por ejemplo, "ATQ %") con las propiedades que usa TypeScript.
//
// Partial permite que no todos los strings tengan una equivalencia.
// Record<string, keyof Stats> indica que cada valor válido debe ser
// una clave definida dentro de la interfaz Stats.
const statsMap: Partial<Record<string, keyof Stats>> = {
    atqPercent: "atqPercent",
    defPercent: "defPercent",
    hpPercent: "hpPercent",
    velPercent: "velPercent",
    atqFlat: "atqFlat",
    defFlat: "defFlat",
    hpFlat: "hpFlat",
    velFlat: "velFlat",
    propCrit: "propCrit",
    dmgCrit: "dmgCrit",
    dmg: "dmg",
    breakEffect: "breakEffect",
    breakDamage: "breakDamage",
    superBreakDamage: "superBreakDamage",
    elation: "elation",
    redDef: "redDef",
    vul: "vul",
    penRes: "penRes",
    originalDmg: "originalDmg",
    merrymake: "merrymake"
}

// Define la estructura de las estadísticas finales.
// Todas las propiedades contienen números.
export interface TotalStatsValues {
    atqPercent: number
    hpPercent: number
    defPercent: number
    velPercent: number
    dmgCrit: number
    propCrit: number
    dmg: number
    breakEffect: number
    breakDamage: number
    superBreakDamage: number
    elation: number
    redDef: number
    vul: number
    penRes: number
    originalDmg: number
    merrymake: number
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
    breakEffect: 0,
    breakDamage: 0,
    superBreakDamage: 0,
    elation: 0,
    redDef: 0,
    vul: 0,
    penRes: 0,
    originalDmg: 0,
    merrymake: 0,
})

const addDirectBuffStats = (stats: Stats, buffs: BuffData[]) => {
    for (const buff of buffs) {
        if (buff.targetStat) continue
        const key = statsMap[buff.buff]
        if (key) stats[key] += Number(buff.valor) || 0
    }
}

// Convierte estadisticas flat a porcentajes
const flatAsPercent = (flat: number, baseStat: number) =>
    baseStat ? (flat / baseStat) * 100 : 0

const getOwnActiveBuffs = (buffs: BuffData[], targetSlot?: number) =>
    buffs.filter(
        (buff) =>
            buff.status &&
            buff.objetivo !== "allAlliesExcludingThis" &&
            (buff.objetivo !== "targetCharacter" || buff.targetSlot === targetSlot)
    )

const getOtherActiveBuffs = (buffs: BuffData[], targetSlot?: number) =>
    buffs.filter(
        (buff) =>
            buff.status &&
            buff.objetivo !== "thisCharacter" &&
            (buff.objetivo !== "targetCharacter" || buff.targetSlot === targetSlot)
    )

const calculateFase1StatsFromActiveBuffs = (
    relics: RelicData,
    ownActiveBuffs: BuffData[],
    otherActiveBuffs: BuffData[],
    base: { atq: number; def: number; vel: number; hp: number }
): {
    fase1Stats: TotalStatsValues
    base: { atq: number; def: number; vel: number; hp: number }
} => {
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

    // Suma los buffs planos/directos que NO escalan con otra stat
    const fase1BuffStats = emptyStats()
    addDirectBuffStats(fase1BuffStats, ownActiveBuffs)
    addDirectBuffStats(fase1BuffStats, otherActiveBuffs)

    // Suma las estadisticas totales
    const fase1Stats: TotalStatsValues = {
        atqPercent: flatAsPercent(
            relicMainStats.atqFlat + relicSubStats.atqFlat + fase1BuffStats.atqFlat,
            base.atq
        ) + relicMainStats.atqPercent + relicSubStats.atqPercent + fase1BuffStats.atqPercent,
        defPercent: flatAsPercent(
            relicMainStats.defFlat + relicSubStats.defFlat + fase1BuffStats.defFlat,
            base.def
        ) + relicMainStats.defPercent + relicSubStats.defPercent + fase1BuffStats.defPercent,
        velPercent: flatAsPercent(
            relicMainStats.velFlat + relicSubStats.velFlat + fase1BuffStats.velFlat,
            base.vel
        ) + relicMainStats.velPercent + relicSubStats.velPercent + fase1BuffStats.velPercent,
        hpPercent: flatAsPercent(
            relicMainStats.hpFlat + relicSubStats.hpFlat + fase1BuffStats.hpFlat,
            base.hp
        ) + relicMainStats.hpPercent + relicSubStats.hpPercent + fase1BuffStats.hpPercent,
        propCrit: 5 + relicSubStats.propCrit + relicMainStats.propCrit + fase1BuffStats.propCrit,
        dmgCrit: 50 + relicSubStats.dmgCrit + relicMainStats.dmgCrit + fase1BuffStats.dmgCrit,
        dmg: relicMainStats.dmg + fase1BuffStats.dmg,
        breakEffect: relicMainStats.breakEffect + relicSubStats.breakEffect + fase1BuffStats.breakEffect,
        breakDamage: fase1BuffStats.breakDamage,
        superBreakDamage: fase1BuffStats.superBreakDamage,
        elation: fase1BuffStats.elation,
        redDef: relicMainStats.redDef + fase1BuffStats.redDef,
        vul: relicMainStats.vul + fase1BuffStats.vul,
        penRes: relicMainStats.penRes + fase1BuffStats.penRes,
        originalDmg: fase1BuffStats.originalDmg,
        merrymake: fase1BuffStats.merrymake,
    }

    return { fase1Stats, base }
}

// Fase 1: Calcula las estadísticas totales de un personaje sumando solo los buffs que NO escalan con otras estadisticas.
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

    return calculateFase1StatsFromActiveBuffs(
        relics,
        getOwnActiveBuffs(buffs, targetSlot),
        getOtherActiveBuffs(otherBuffs ?? [], targetSlot),
        base
    )
}

export interface TeamSnapshot {
    stats: TotalStatsValues
    base: { atq: number; def: number; vel: number; hp: number }
}

// Fase 2: Calcula las estadisticas totales incluyendo los buffs que escalan con otras estadisticas y la pasiva
export function calculateTotalStats(
    character: Character,
    buffs: BuffData[],
    relics: RelicData,
    otherBuffs?: BuffData[],
    targetSlot?: number,
    teamSnapshots?: Record<string | number, TeamSnapshot>
): { total: TotalStatsValues } {
    const ownActiveBuffs = getOwnActiveBuffs(buffs, targetSlot)
    const otherActiveBuffs = getOtherActiveBuffs(otherBuffs ?? [], targetSlot)
    const base = {
        atq: Number(character.atq) || 0,
        def: Number(character.def) || 0,
        vel: Number(character.vel) || 0,
        hp: Number(character.hp) || 0,
    }
    // Reutiliza los buffs filtrados para evitar recorrer las listas otra vez en la fase uno.
    const { fase1Stats } = calculateFase1StatsFromActiveBuffs(
        relics,
        ownActiveBuffs,
        otherActiveBuffs,
        base
    )

    // FASE 2: Calcular buffos escalables dinámicos usando el snapshot de Fase 1 del emisor
    // para evitar bucles infinitos de retroalimentación
    const getStatFromFase1 = (
        stats: TotalStatsValues,
        targetStat: string,
        baseStats: { atq: number; def: number; vel: number; hp: number }
    ): number => {
        if (targetStat === "ATQ de este personaje") {
            return baseStats.atq * (1 + stats.atqPercent * 0.01)
        }
        if (targetStat === "DEF de este personaje") {
            return baseStats.def * (1 + stats.defPercent * 0.01)
        }
        if (targetStat === "HP de este personaje") {
            return baseStats.hp * (1 + stats.hpPercent * 0.01)
        }
        if (targetStat === "VEL de este personaje") {
            return baseStats.vel * (1 + stats.velPercent * 0.01)
        }
        if (targetStat === "D.CRIT de este personaje") {
            return stats.dmgCrit
        }
        if (targetStat === "P.CRIT de este personaje") {
            return stats.propCrit
        }
        if (targetStat === "Energía del aliado") {
            return Number(character.maxEnergy) || 0
        }
        return 0
    }

    // Calcula el valor real de un buff escalable
    //buff = buff que se aplica al personaje (ej: "ATQ %" )
    //statValue = valor de la estadistica objetivo (ej: "ATQ")
    //umbralStat = estadistica base necesaria para que el buff se aplique (ej: si es "ATQ %" y "DEF" con umbral 1337, el buff solo se aplicara si el personaje tiene al menos 1337 de DEF)
    //valorMaximo = tope para el valor calculado de un buff escalable
    const calculateBuffValue = (buff: BuffData, statValue: number) => {
        const scaledStatValue = Math.max(0, statValue - (buff.umbralStat ?? 0))
        const value = (Number(buff.valor) / 100) * scaledStatValue
        return buff.valorMaximo === undefined ? value : Math.min(value, buff.valorMaximo)
    }

    const fase2BuffStats = emptyStats()

    // 1. Buffs escalables propios (el emisor es este mismo personaje)
    for (const buff of ownActiveBuffs) {
        if (!buff.targetStat) continue
        const statValue = getStatFromFase1(fase1Stats, buff.targetStat, base)

        const transferValue = calculateBuffValue(buff, statValue)
        const key = statsMap[buff.buff]
        if (key) {
            fase2BuffStats[key] += transferValue
        }
    }

    // 2. Buffs escalables provenientes de otros personajes del equipo
    for (const buff of otherActiveBuffs) {
        if (!buff.targetStat) continue

        // Se obtienen las stats del emisor desde el mapa de snapshots del equipo usando emisorId
        const emitterSnapshot =
            (buff.emisorId && teamSnapshots?.[buff.emisorId]) ||
            { stats: fase1Stats, base }

        const statValue = getStatFromFase1(
            emitterSnapshot.stats,
            buff.targetStat,
            emitterSnapshot.base
        )

        const transferValue = calculateBuffValue(buff, statValue)
        const key = statsMap[buff.buff]
        if (key) {
            fase2BuffStats[key] += transferValue
        }
    }

    // Total final combinando Fase 1 y Fase 2
    const total: TotalStatsValues = {
        atqPercent: fase1Stats.atqPercent + flatAsPercent(fase2BuffStats.atqFlat, base.atq) + fase2BuffStats.atqPercent,
        defPercent: fase1Stats.defPercent + flatAsPercent(fase2BuffStats.defFlat, base.def) + fase2BuffStats.defPercent,
        velPercent: fase1Stats.velPercent + flatAsPercent(fase2BuffStats.velFlat, base.vel) + fase2BuffStats.velPercent,
        hpPercent: fase1Stats.hpPercent + flatAsPercent(fase2BuffStats.hpFlat, base.hp) + fase2BuffStats.hpPercent,
        propCrit: fase1Stats.propCrit + fase2BuffStats.propCrit,
        dmgCrit: fase1Stats.dmgCrit + fase2BuffStats.dmgCrit,
        dmg: fase1Stats.dmg + fase2BuffStats.dmg,
        breakEffect: fase1Stats.breakEffect + fase2BuffStats.breakEffect,
        breakDamage: fase1Stats.breakDamage + fase2BuffStats.breakDamage,
        superBreakDamage: fase1Stats.superBreakDamage + fase2BuffStats.superBreakDamage,
        elation: fase1Stats.elation + fase2BuffStats.elation,
        redDef: fase1Stats.redDef + fase2BuffStats.redDef,
        vul: fase1Stats.vul + fase2BuffStats.vul,
        penRes: fase1Stats.penRes + fase2BuffStats.penRes,
        originalDmg: fase1Stats.originalDmg + fase2BuffStats.originalDmg,
        merrymake: fase1Stats.merrymake + fase2BuffStats.merrymake,
    }

    return { total }
}
