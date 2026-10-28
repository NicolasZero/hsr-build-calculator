import type { Element } from "@/schema/statsData"

export interface EnemyData {
    name: string // Nombre
    lvl: number // Nivel
    image?: Blob | null
    maxHP?: number // HP maximo en caso de necesitarlo
    hp?: number // HP actual
    maxToughness?: number // Firmeza maxima en caso de necesitarlo
    toughness?: number // Barra de Firmeza
    toughnessBroken?: boolean // Si se rompió la firmeza
    speed?: number // Velocidad
    weaknesses?: Element[]
    elementalResistance: {
        [key in Element]: number // Resistencia Elemental
    }
    weakness: Element // Debilidad Elemental
    mitigation?: number // Mitigación Porcentual
    defenseReduction?: number
    defenseIgnore?: number
    vulnerability?: number
}
