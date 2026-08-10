export const subStats = [
    "ATQ",
    "HP",
    "DEF",
    "ATQ %",
    "HP %",
    "DEF %",
    "VEL",
    "P.CRIT",
    "D.CRIT"
] as const

export const mainStats = [
    "ATQ %",
    "HP %",
    "DEF %",
    "VEL",
    "P.CRIT",
    "D.CRIT",
    "DAÑO",
    "REC.E",
    "RUPT"
] as const

export const mainStatsByType = {
    // "CABEZA": ["HP"],
    // "MANO": ["ATQ"],
    "CUERPO": ["HP %", "ATQ %", "DEF %", "D.CRIT", "P.CRIT"],
    "BOTAS": ["VEL", "HP %", "ATQ %", "DEF %"],
    "ORBE": ["DAÑO", "HP %", "ATQ %", "DEF %"],
    "CUERDA": ["REC.E", "HP %", "ATQ %", "DEF %", "RUPT"]
} as const

export const valueByMainStat = {
    "HP %": 43.2,
    "ATQ %": 43.2,
    "DEF %": 54,
    "VEL": 25,
    "P.CRIT": 34.8,
    "D.CRIT": 64.8,
    "DAÑO": 38.8,
    "REC.E": 36,
    "RUPT": 64.8,
} as const

export const relics = [
    // "CABEZA",
    // "MANO",
    "CUERPO",
    "BOTAS",
    "ORBE",
    "CUERDA"
] as const

// export type Relic = typeof relics[number]
// export type SubStat = typeof subStats[number]
// export type MainStat = typeof mainStats[number]
