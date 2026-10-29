// import type { Element } from "@/schema/element"
import { exultationLevelMultiplier, superBreakLevelMultiplier } from "@/const/levelMultiplier"
import type { TotalStatsValues } from "@/utils/calculateTotalStats"

export type DamageType = "general" | "elation" | "superBreak"

export interface DamageCalculationInput {
    damageType: DamageType
    baseStat: number
    skillMultiplier: number
    damageBonus: number
    originalDmg: number
    critRate: number
    critDamage: number
    attackerLevel: number
    enemyLevel: number
    enemyResistance: number
    resistancePenetration: number
    defenseReduction: number
    defenseIgnore: number
    vulnerability: number
    mitigation: number
    toughnessBroken: boolean

    // Elation-specific
    elation: number
    merrymake: number
    punchline: number
    certifiedBanger: number
    hasCertifiedBanger: boolean

    // Super Break-specific
    toughnessReduction: number
    toughnessEfficiency: number
    breakEffect: number
    breakDamage: number
    superBreakDamage: number
}

export interface DamageCalculationResult {
    baseDamage: number
    defenseMultiplier: number
    resistanceMultiplier: number
    vulnerabilityMultiplier: number
    mitigationMultiplier: number
    brokenMultiplier: number
    originalDmgMultiplier: number
    nonCritical: number
    critical: number
    expected: number
    effectiveResistance: number

    // Elation-specific
    elationMultiplier?: number
    punchlineMultiplier?: number
    merrymakeMultiplier?: number

    // Super Break-specific
    effectiveToughnessReduction?: number
    breakEffectMultiplier?: number
    breakDmgMultiplier?: number
    superBreakDmgMultiplier?: number
}

/**
 * Multiplicadores compartidos entre todos los tipos de daño:
 * DEF, RES, Vulnerabilidad, Mitigación y Broken.
 */
function sharedMultipliers(input: DamageCalculationInput) {
    const attackerLevel = Math.max(1, input.attackerLevel)
    const enemyLevel = Math.max(1, input.enemyLevel)
    // DEF Multiplier: (attackerLvl + 20) / ((enemyLvl + 20) * (1 - defReduction - defIgnore) + attackerLvl + 20)
    const defReduction = Math.min(100, Math.max(-100, input.defenseReduction)) * 0.01
    const defIgnore = Math.min(100, Math.max(0, input.defenseIgnore)) * 0.01
    const attackerDefense = attackerLevel + 20
    const enemyDefense =
        (enemyLevel + 20) * Math.max(0, 1 - defReduction - defIgnore)
    const defenseMultiplier =
        attackerDefense / (attackerDefense + enemyDefense)

    // RES Multiplier: 1 - (RES - RES PEN), clamped [0.1, 2.0]
    // RES efectiva en rango [-100%, 90%], resultado en rango [10%, 200%]
    const effectiveResistance = input.enemyResistance - input.resistancePenetration
    const resistanceMultiplier = Math.min(2.0, Math.max(0.1, 1 - effectiveResistance * 0.01))

    // Vulnerability Multiplier: (1 + Vulnerability)
    const vulnerabilityMultiplier = Math.max(0, 1 + input.vulnerability * 0.01)

    // DMG Mitigation Multiplier: 1 - DMG Mitigation
    const mitigationMultiplier = Math.max(0, 1 - input.mitigation * 0.01)

    // Broken Multiplier: 1 si está roto, 0.9 si no
    const brokenMultiplier = input.toughnessBroken ? 1 : 0.9

    return {
        defenseMultiplier,
        resistanceMultiplier,
        effectiveResistance,
        vulnerabilityMultiplier,
        mitigationMultiplier,
        brokenMultiplier,
    }
}

// Calcula el daño general (General DMG)
function calculateGeneralDamage(input: DamageCalculationInput): DamageCalculationResult {
    const shared = sharedMultipliers(input)

    // Base DMG = Stat * Ability Multiplier
    const baseDamage = input.baseStat * (input.skillMultiplier * 0.01)

    // Original DMG Multiplier = (1 + Original DMG)
    const originalDmgMultiplier = 1 + input.originalDmg * 0.01

    // DMG Boost Multiplier = (1 + DMG Boost)
    const dmgBoostMultiplier = 1 + input.damageBonus * 0.01

    const nonCritical =
        baseDamage *
        originalDmgMultiplier *
        dmgBoostMultiplier *
        shared.defenseMultiplier *
        shared.resistanceMultiplier *
        shared.vulnerabilityMultiplier *
        shared.mitigationMultiplier *
        shared.brokenMultiplier

    const critRate = Math.min(100, Math.max(0, input.critRate)) * 0.01
    const critical = nonCritical * (1 + input.critDamage * 0.01)

    return {
        baseDamage,
        originalDmgMultiplier,
        ...shared,
        nonCritical,
        critical,
        expected: nonCritical * (1 + critRate * (input.critDamage * 0.01)),
    }
}

/**
 * Calcula el daño de Exultación (Elation DMG).
 *
 * Base DMG = Level Multiplier × Ability Multiplier
 * NO aplica DMG Boost.
 * Aplica: Original Elation DMG × CRIT × Elation × Punchline × Merrymake × DEF × RES × Vuln × Mit × Broken
 */
function calculateElationDamage(input: DamageCalculationInput): DamageCalculationResult {
    const shared = sharedMultipliers(input)

    const level = Math.max(1, Math.min(80, Math.round(input.attackerLevel)))
    const levelMult = exultationLevelMultiplier[level] ?? exultationLevelMultiplier[80]

    // Base DMG = Level Multiplier * Ability Multiplier
    const baseDamage = levelMult * (input.skillMultiplier * 0.01)

    // Original Elation DMG Multiplier = (1 + Original DMG)
    const originalDmgMultiplier = 1 + input.originalDmg * 0.01

    // Elation Multiplier = (1 + Elation Stat)
    const elationMultiplier = 1 + input.elation * 0.01

    // Punchline Multiplier
    let punchlineMultiplier: number
    if (input.hasCertifiedBanger) {
        // 1 + ((Certified Banger * 5) / (Certified Banger + 240))
        punchlineMultiplier = 1 + ((input.certifiedBanger * 5) / (input.certifiedBanger + 240))
    } else {
        // 1 + ((Punchline * 5) / (Punchline + 240))
        punchlineMultiplier = 1 + ((input.punchline * 5) / (input.punchline + 240))
    }

    // Merrymake Multiplier = (1 + Merrymake)
    const merrymakeMultiplier = 1 + input.merrymake * 0.01

    const nonCritical =
        baseDamage *
        originalDmgMultiplier *
        elationMultiplier *
        punchlineMultiplier *
        merrymakeMultiplier *
        shared.defenseMultiplier *
        shared.resistanceMultiplier *
        shared.vulnerabilityMultiplier *
        shared.mitigationMultiplier *
        shared.brokenMultiplier

    const critRate = Math.min(100, Math.max(0, input.critRate)) * 0.01
    const critical = nonCritical * (1 + input.critDamage * 0.01)

    return {
        baseDamage,
        originalDmgMultiplier,
        elationMultiplier,
        punchlineMultiplier,
        merrymakeMultiplier,
        ...shared,
        nonCritical,
        critical,
        expected: nonCritical * (1 + critRate * (input.critDamage * 0.01)),
    }
}

/**
 * Calcula el daño de Super Break (Super Break DMG).
 *
 * Super Break DMG = (Effective Toughness Reduction / 10) × Ability Multiplier
 *   × (1 + Break Effect) × (1 + Break DMG Increase) × (1 + Super Break DMG Increase)
 *   × DEF × RES × Vuln × Mit × Broken
 *
 * NO puede criticar y NO es afectado por DMG Boost.
 */
function calculateSuperBreakDamage(input: DamageCalculationInput): DamageCalculationResult {
    const shared = sharedMultipliers(input)

    const level = Math.max(1, Math.min(80, Math.round(input.attackerLevel)))
    const levelMult = superBreakLevelMultiplier[level] ?? superBreakLevelMultiplier[80]

    const effectiveToughnessReduction =
        input.toughnessReduction * (1 + input.toughnessEfficiency * 0.01)

    // Base DMG = (Effective Toughness Reduction / 10) * Level Multiplier * Ability Multiplier
    const baseDamage =
        (effectiveToughnessReduction / 10) * levelMult * (input.skillMultiplier * 0.01)

    const breakEffectMultiplier = 1 + input.breakEffect * 0.01
    const breakDmgMultiplier = 1 + input.breakDamage * 0.01
    const superBreakDmgMultiplier = 1 + input.superBreakDamage * 0.01

    const nonCritical =
        baseDamage *
        breakEffectMultiplier *
        breakDmgMultiplier *
        superBreakDmgMultiplier *
        shared.defenseMultiplier *
        shared.resistanceMultiplier *
        shared.vulnerabilityMultiplier *
        shared.mitigationMultiplier *
        shared.brokenMultiplier

    // Super Break no puede criticar
    return {
        baseDamage,
        originalDmgMultiplier: 1,
        effectiveToughnessReduction,
        breakEffectMultiplier,
        breakDmgMultiplier,
        superBreakDmgMultiplier,
        ...shared,
        nonCritical,
        critical: nonCritical,
        expected: nonCritical,
    }
}

export function calculateDamage(input: DamageCalculationInput): DamageCalculationResult {
    switch (input.damageType) {
        case "elation":
            return calculateElationDamage(input)
        case "superBreak":
            return calculateSuperBreakDamage(input)
        case "general":
        default:
            return calculateGeneralDamage(input)
    }
}

export function getStatValue(
    stat: "atq" | "hp" | "def",
    character: { atq: number | string; hp: number | string; def: number | string },
    total: TotalStatsValues
): number {
    return (Number(character[stat]) || 0) * (1 + (total[stat] || 0) * 0.01)
}
