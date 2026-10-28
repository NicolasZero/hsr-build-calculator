export type SubStatsType = "ATQ" | "HP" | "DEF" | "ATQ %" | "HP %" | "DEF %" | "VEL" | "P.CRIT" | "D.CRIT" | "EFECTO. RUP"

export type MainStatsType = "ATQ" | "ATQ %" | "HP" | "HP %" | "DEF %" | "VEL" | "P.CRIT" | "D.CRIT" | "DAÑO" | "REC.E" | "EFECTO. RUP"

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