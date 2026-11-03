import type { RelicData, MainStatsType, SubStatsType, PieceName } from "@/schema/relicData";

export const subStats: SubStatsType[] = [
    "hpFlat",
    "atkFlat",
    "defFlat",
    "spdFlat",
    "hpPercent",
    "atkPercent",
    "defPercent",
    "spdPercent",
    "propCrit",
    "dmgCrit",
    "breakEffect"
]

export const mainStats: MainStatsType[] = [
    "hpFlat",
    "atkFlat",
    "spdFlat",
    "hpPercent",
    "atkPercent",
    "defPercent",
    "propCrit",
    "dmgCrit",
    "dmg",
    "energyRegeneration",
    "breakEffect"
] as const

export const mainStatsByType: Record<PieceName, MainStatsType[]> = {
    "head": ["hpFlat"],
    "hand": ["atkFlat"],
    "body": ["hpPercent", "atkPercent", "defPercent", "dmgCrit", "propCrit"],
    "feet": ["spdFlat", "hpPercent", "atkPercent", "defPercent"],
    "Sphere": ["dmg", "hpPercent", "atkPercent", "defPercent"],
    "rope": ["energyRegeneration", "hpPercent", "atkPercent", "defPercent", "breakEffect"]
} as const

export const valueByMainStat: Record<MainStatsType, number> = {
    "hpFlat": 705,
    "atkFlat": 352,
    "hpPercent": 43.2,
    "atkPercent": 43.2,
    "defPercent": 54,
    "spdFlat": 25,
    "propCrit": 34.8,
    "dmgCrit": 64.8,
    "dmg": 38.8,
    "energyRegeneration": 36,
    "breakEffect": 64.8,
} as const

export const relics: PieceName[] = [
    "head",
    "hand",
    "body",
    "feet",
    "Sphere",
    "rope"
] as const

export const relicDefault: RelicData = {
    setName: undefined,
    relics: [],
    subStats: [],
}

/**
 * Devuelve un objeto nuevo con arrays nuevos. `relicDefault` se comparte por
 * referencia entre módulos, así que mutarlo contaminaría el estado global.
 */
export const createDefaultRelics = (): RelicData => ({
    setName: undefined,
    relics: [],
    subStats: [],
})

// export type Relic = typeof relics[number]
// export type SubStat = typeof subStats[number]
// export type MainStat = typeof mainStats[number]
