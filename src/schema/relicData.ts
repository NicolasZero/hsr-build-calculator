export type SubStatsType = "ATQ" | "HP" | "DEF" | "ATQ %" | "HP %" | "DEF %" | "VEL" | "P.CRIT" | "D.CRIT"

export type MainStatsType = "ATQ %" | "HP %" | "DEF %" | "VEL" | "P.CRIT" | "D.CRIT" | "DAÑO" | "REC.E" | "RUPT"

export type PieceName = "CABEZA" | "MANO" | "CUERPO" | "BOTAS" | "ORBE" | "CUERDA"

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