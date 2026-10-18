import type { Character } from "@/schema/character";

export interface ValidationResult {
    isValid: boolean
    errors: string[]
}

export const validation = (character: Character): ValidationResult => {
    const errors: string[] = []

    if (!character.name) errors.push("El nombre es requerido")
    if (!character.atq) errors.push("El ATQ es requerido")
    if (!character.def) errors.push("La DEF es requerida")
    if (!character.hp) errors.push("El HP es requerido")
    if (!character.vel) errors.push("La VEL es requerida")

    return {
        isValid: errors.length === 0,
        errors,
    }
}