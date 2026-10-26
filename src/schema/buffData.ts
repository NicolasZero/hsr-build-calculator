export interface BuffData {
    id: string
    valor: string // El valor puede ser un número o un número %
    buff: BuffType // El buff que se aplica al personaje
    origen: Origen // El origen del buff
    objetivo: Target // El objetivo del buff
    status: boolean // Si el buff esta activo
    emisorId?: string // Id del personaje que aplica el buff
    targetStat?: StatBuffDependent // La estadistica objetivo del buff si escala con otra estadistica
    targetSlot?: number // Posición del equipo afectada cuando el objetivo es "Personaje objetivo"
    hasMaxCap?: boolean // Si el buff tiene un maximo
    capPercentage?: number // El porcentaje maximo
    capValue?: number // El valor maximo
}

export type BuffType = "ATQ" | "HP" | "VEL" | "DEF" | "ATQ %" | "HP %" | "VEL %" | "DEF %" | "D.CRIT" | "P.CRIT" | "DAÑO" | "VUL" | "PEN RES" | "RED RES" | "RED DEF"

export type Origen = "Básico" | "Habilidad" | "Talento" | "Definitiva" | "Rastro" | "Eidolon" | "Técnica" | "Cono de Luz" | "Set"

export type Target =
    "Todos los aliados" |
    "Este personaje" |
    "Todos excepto este personaje" |
    "Personaje objetivo"

export type StatBuffDependent =
    "ATQ de este personaje" |
    "DEF de este personaje" |
    "HP de este personaje" |
    "VEL de este personaje" |
    "D.CRIT de este personaje" |
    "P.CRIT de este personaje"