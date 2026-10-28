export type Element = "FISICO" | "HIELO" | "FUEGO" | "VIENTO" | "RAYO" | "CUANTICO" | "IMAGINARIO"

export type BreakDamage = Record<Element, number>

export type PlayablePath =
    "CONSERVACION" |
    "DESTRUCCION" |
    "ABUNDANCIA" |
    "ERUDICION" |
    "CAZERIA" |
    "ARMONIA" |
    "NIHILIDAD" |
    "REMINISCENCIA" |
    "EXULTACION"

export type AttackType = "Basic" | "Skill" | "Ultimate" | "Follow-Up"

export type AttackTarget = "UNICO" | "RAFAGA" | "TODOS" | "REBOTE"

