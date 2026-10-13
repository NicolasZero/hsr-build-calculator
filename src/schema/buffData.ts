export type BuffData = {
    id: string
    valor: string
    buff: BuffType
    origen: Origen
    objetivo: Target
    status: boolean
}

export type BuffType = "ATQ" | "HP" | "VEL" | "DEF" | "ATQ %" | "HP %" | "VEL %" | "DEF %" | "D.CRIT" | "P.CRIT" | "DAÑO" | "VUL" | "PEN RES" | "RED RES" | "RED DEF"

export type Origen = "Básico" | "Habilidad" | "Talento" | "Definitiva" | "Rastro" | "Eidolon" | "Técnica" | "Cono de Luz" | "Set"

export type Target = "Todos los aliados" | "Este personaje" | "Primero del equipo" | "Todos excepto este personaje" | "Personajes de la misma vía" | "Personajes de la misma vía (excepto este)"