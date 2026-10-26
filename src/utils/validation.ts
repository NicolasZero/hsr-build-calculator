import type { Character } from "@/schema/character";

export interface ValidationResult {
    isValid: boolean
    errors: string
}

export const validation = (character: Character): ValidationResult => {
    const errors: string[] = []

    if (!character.name) errors.push("'Nombre'")
    if (!character.hp) errors.push("'HP'")
    if (!character.atq) errors.push("'ATQ'")
    if (!character.def) errors.push("'DEF'")
    if (!character.vel) errors.push("'VEL'")
    if (!character.maxEnergy) errors.push("'Energía'")
    if (!character.lvl) errors.push("'Nivel'")

    let first: boolean = true
    let msg: string = ""

    for (const e of errors) {
        if (first == true) msg = e
        else msg = msg + ", " + e
        first = false
    }

    let numErrors: number = errors.length

    if (numErrors > 0) {
        if (numErrors == 1) msg = "El campo " + msg + " es requerido"
        else msg = "Los campos " + msg + " son requeridos"
    }

    return {
        isValid: numErrors === 0,
        errors: msg,
    }
}