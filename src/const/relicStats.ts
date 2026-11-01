import type { RelicData, MainStatsType, SubStatsType, PieceName } from "@/schema/relicData";

export const subStats: SubStatsType[] = [
    "hpFlat",
    "atqFlat",
    "defFlat",
    "velFlat",
    "hpPercent",
    "atqPercent",
    "defPercent",
    "velPercent",
    "propCrit",
    "dmgCrit",
    "breakEffect"
]

export const mainStats: MainStatsType[] = [
    "hpFlat",
    "atqFlat",
    "velFlat",
    "hpPercent",
    "atqPercent",
    "defPercent",
    "propCrit",
    "dmgCrit",
    "dmg",
    "energyRegeneration",
    "breakEffect"
] as const

export const mainStatsByType: Record<PieceName, MainStatsType[]> = {
    "head": ["hpFlat"],
    "hand": ["atqFlat"],
    "body": ["hpPercent", "atqPercent", "defPercent", "dmgCrit", "propCrit"],
    "feet": ["velFlat", "hpPercent", "atqPercent", "defPercent"],
    "Sphere": ["dmg", "hpPercent", "atqPercent", "defPercent"],
    "rope": ["energyRegeneration", "hpPercent", "atqPercent", "defPercent", "breakEffect"]
} as const

export const valueByMainStat: Record<MainStatsType, number> = {
    "hpFlat": 705,
    "atqFlat": 352,
    "hpPercent": 43.2,
    "atqPercent": 43.2,
    "defPercent": 54,
    "velFlat": 25,
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
