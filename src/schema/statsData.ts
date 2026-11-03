export type Element = "fire" | "ice" | "imaginary" | "physical" | "quantum" | "lightning" | "wind" | "none"

export type BreakDamage = Record<Element, number>

export type PlayablePath =
    "preservation" |
    "erudition" |
    "abundance" |
    "hunt" |
    "harmony" |
    "nihility" |
    "destruction" |
    "remembrance" |
    "elation"

export type AttackType = "basic" | "skill" | "ultimate" | "followUp"

export type AttackTarget = "single" | "blast" | "aoe" | "bounce"