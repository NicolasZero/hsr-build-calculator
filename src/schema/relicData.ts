import type { statsType } from "@/schema/stats"

// Ahora excluimos las que no apliquen
export type SubStatsType = Exclude<
    statsType,
    "dmg" |
    "energyRegeneration" |
    "breakDamage" |
    "superBreakDamage" |
    "elation" |
    "redDef" |
    "vul" |
    "penRes" |
    "redRes" |
    "originalDmg" |
    "merrymake"
>

export type MainStatsType = Exclude<
    statsType,
    "defFlat" |
    "spdPercent" |
    "breakDamage" |
    "superBreakDamage" |
    "elation" |
    "redDef" |
    "vul" |
    "penRes" |
    "redRes" |
    "originalDmg" |
    "merrymake"
>

export type PieceName =
    "head" |
    "hand" |
    "body" |
    "feet" |
    "Sphere" |
    "rope"

export interface SubStat {
    stat: SubStatsType
    value: string
}

export interface MainStat {
    piece: PieceName
    mainStat: MainStatsType
}

export interface RelicData {
    setName: string | undefined
    relics: MainStat[]
    subStats: SubStat[]
}