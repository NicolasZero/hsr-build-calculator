import type { BuffType, Origen, Target, StatBuffDependent } from "@/schema/buffData"

export const buffType: BuffType[] = [
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
    "DAÑO. RUP",
    "DAÑO. ULTRARUP",
    "EFECTO. RUP",
    "Exultación",
    "VUL",
    "PEN RES",
    "RED DEF",
    "DAÑO ORIGINAL",
    "MERRYMAKE",
] as const

export const buffOrigin: Origen[] = [
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

export const buffTarget: Target[] = [
    "Todos los aliados",
    "Este personaje",
    // "Primero del equipo",
    "Personaje objetivo",
    // "Personajes de la misma vía",
    "Todos excepto este personaje"
] as const

export const statBuffDependiente: StatBuffDependent[] = [
    "HP de este personaje",
    "ATQ de este personaje",
    "DEF de este personaje",
    "VEL de este personaje",
    "D.CRIT de este personaje",
    "P.CRIT de este personaje",
    "Energía del aliado",
]