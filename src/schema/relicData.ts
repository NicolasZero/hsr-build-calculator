export type subStatsType = "ATQ" | "HP" | "DEF" | "ATQ %" | "HP %" | "DEF %" | "VEL" | "P.CRIT" | "D.CRIT"

export type mainStatsType = "ATQ %" | "HP %" | "DEF %" | "VEL" | "P.CRIT" | "D.CRIT" | "DAÑO" | "REC.E" | "RUPT"

export type pieceName = "CABEZA" | "MANO" | "CUERPO" | "BOTAS" | "ORBE" | "CUERDA"

export interface subStat {
    stat: subStatsType
    value: string
}

export interface mainStat {
    piece: pieceName
    mainStat: mainStatsType
}

export interface relicData {
    set: string | undefined
    relics: mainStat[]
    subStats: subStat[]
}