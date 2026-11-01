export interface BuffData {
    id: string
    valor: string // El valor puede ser un número o un número %
    buff: BuffType // El buff que se aplica al personaje
    origen: Origen // El origen del buff
    objetivo: Target // El objetivo del buff
    status: boolean // Si el buff esta activo
    emisorId?: string // Id del personaje que aplica el buff
    targetStat?: StatBuffDependent // La estadistica objetivo del buff si escala con otra estadistica
    umbralStat?: number // La estadistica solo escala por encima de este valor
    valorMaximo?: number // Tope para el valor calculado de un buff escalable
    targetSlot?: number // Posición del equipo afectada cuando el objetivo es "targetCharacter"
}

export type BuffType =
    "atqFlat" |
    "defFlat" |
    "hpFlat" |
    "velFlat" |
    "atqPercent" |
    "defPercent" |
    "hpPercent" |
    "velPercent" |
    "propCrit" |
    "dmgCrit" |
    "dmg" |
    "breakEffect" |
    "breakDamage" |
    "superBreakDamage" |
    "elation" |
    "redDef" |
    "vul" |
    "penRes" |
    "redRes" |
    "originalDmg" |
    "merrymake"

export interface ChartData {
    buff: BuffType
    valor: number
}

export type Origen =
    "basic" |
    "skill" |
    "talent" |
    "ultimate" |
    "Trace" |
    "Eidolon" |
    "technique" |
    "lightCone" |
    "setBonus"

export type Target =
    "allAllies" |
    "thisCharacter" |
    "allAlliesExcludingThis" |
    "targetCharacter"

// Buffs que escalan con otras estadisticas
// Este personaje = el personaje que tiene el buff aplicado (el emisor)
// del Aliado = el personaje que recibe el buff
export type StatBuffDependent =
    "ATQ de este personaje" |
    "DEF de este personaje" |
    "HP de este personaje" |
    "VEL de este personaje" |
    "D.CRIT de este personaje" |
    "P.CRIT de este personaje" |
    "Energía del aliado"