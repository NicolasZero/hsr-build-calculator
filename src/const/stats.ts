import type { statsType } from "@/schema/stats"

// Definimos las estadísticas base en un array constante
export const STATS: statsType[] = [
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
    "dmg",
    "breakEffect",
    "energyRegeneration",
    "breakDamage",
    "superBreakDamage",
    "elation",
    "redDef",
    "vul",
    "penRes",
    "redRes",
    "originalDmg",
    "merrymake"
] as const;