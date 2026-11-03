import type { Character } from "@/schema/character";

export interface ValidationResult {
    isValid: boolean
    errors: string
}

export const validation = (character: Character, t: any): ValidationResult => {
    const errors: string[] = []

    if (!character.name) errors.push(t('placeholders.name'))
    if (!character.hp) errors.push(t('baseStats.hpBase'))
    if (!character.atk) errors.push(t('baseStats.atkBase'))
    if (!character.def) errors.push(t('baseStats.defBase'))
    if (!character.spd) errors.push(t('baseStats.spdBase'))
    if (!character.maxEnergy) errors.push(t('baseStats.maxEnergy'))
    if (!character.lvl) errors.push(t('baseStats.lvl'))

    let first: boolean = true
    let msg: string = ""

    for (const e of errors) {
        if (first == true) msg = e
        else msg = msg + ", " + e
        first = false
    }

    const numErrors: number = errors.length

    if (numErrors > 0) {
        if (numErrors == 1) msg = t('alerts.requiredField', { field: msg })
        else msg = t('alerts.requiredFields', { fields: msg })
    }

    return {
        isValid: numErrors === 0,
        errors: msg,
    }
}