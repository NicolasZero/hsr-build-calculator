import type { BuffType, Origen, Target, StatBuffDependent, ChartData } from "@/schema/buffData"

export const buffType: BuffType[] = [
    "atkFlat",
    "hpFlat",
    "spdFlat",
    "defFlat",
    "atkPercent",
    "hpPercent",
    "spdPercent",
    "defPercent",
    "dmgCrit",
    "propCrit",
    "dmg",
    "vul",
    "penRes",
    "redDef",
    "originalDmg",
    "breakDamage",
    "superBreakDamage",
    "breakEffect",
    "elation",
    "merrymake",
]

export const visibleBuff: BuffType[] = [
    "atkFlat",
    "hpFlat",
    "spdFlat",
    "defFlat",
    "atkPercent",
    "hpPercent",
    "spdPercent",
    "defPercent",
    "dmgCrit",
    "propCrit",
    "dmg",
    "vul",
    "penRes",
    "redDef"
]

export const chartData: ChartData[] = [
    { buff: "hpFlat", valor: 0 },
    { buff: "atkFlat", valor: 0 },
    { buff: "defFlat", valor: 0 },
    { buff: "spdFlat", valor: 0 },
    { buff: "propCrit", valor: 5 },
    { buff: "dmgCrit", valor: 50 },
    { buff: "dmg", valor: 0 },
    { buff: "breakDamage", valor: 0 },
    { buff: "superBreakDamage", valor: 0 },
    { buff: "breakEffect", valor: 0 },
    { buff: "elation", valor: 0 },
    { buff: "redDef", valor: 0 },
    { buff: "vul", valor: 0 },
    { buff: "penRes", valor: 0 }
]

export const buffOrigin: Origen[] = [
    "basic",
    "skill",
    "talent",
    "ultimate",
    "Trace",
    "Eidolon",
    "technique",
    "lightCone",
    "setBonus",
]

export const buffTarget: Target[] = [
    "allAllies",
    "thisCharacter",
    "targetCharacter",
    "allAlliesExcludingThis"
]

export const statBuffDependiente: StatBuffDependent[] = [
    "atkThisCharacter",
    "defThisCharacter",
    "hpThisCharacter",
    "spdThisCharacter",
    "critDmgThisCharacter",
    "critRateThisCharacter",
    "energyOfTarget",
]