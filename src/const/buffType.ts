export const buffType = [
    "ATQ",
    "HP",
    "VEL",
    "DEF",
    "ATQ %",
    "HP %",
    "VEL %",
    "DEF %",
    "D.CRIT",
    "P.CRIT",
    "DAÑO",
    "VUL",
    "PEN RES",
    "RED DEF",
] as const

export const buffOrigin = [
    "Básico",
    "Habilidad",
    "Talento",
    "Definitiva",
    "Rastro",
    "Eidolon",
    "Técnica",
    "Cono de Luz",
    "Set",
] as const

export const buffTarget = [
    "Todos los aliados",
    "Este personaje",
    "Primero del equipo",
    "Personajes de la misma vía",
    "Todos excepto este personaje"
] as const