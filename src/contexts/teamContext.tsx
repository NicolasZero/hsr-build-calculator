import { createContext, useContext } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Character } from "@/schema/character"
import type { BuffData } from "@/schema/buffData"
import type { RelicData } from "@/schema/relicData"
import type { TotalStatsValues } from "@/utils/calculateTotalStats"
import type { StoredCharacterBuild, StoredTeam } from "@/lib/indexedDB"

export type TeamCharacterIds = Array<number | null>

export interface TeamMember {
    id: number
    name: string
    slot: number
    build: StoredCharacterBuild
}

export interface TeamMemberStats {
    total: TotalStatsValues
}

export interface SaveCharacterResult {
    success: boolean
    id?: number
    error?: string
}

export interface SaveTeamResult {
    success: boolean
    updated?: boolean
    error?: string
}

export interface LoadTeamResult {
    loaded: number
    omitted: number
}

/**
 * Estado del constructor de personajes. Al separarlo del contexto de equipo,
 * escribir en el formulario no re-renderiza la selección ni las stats del equipo.
 */
export interface CharacterContextValue {
    character: Character
    characterId: number | null
    editCharacter: (target: { name: string; value: Character[keyof Character] }) => void
    savedCharacters: StoredCharacterBuild[]
    saveCharacter: (asNew?: boolean) => Promise<SaveCharacterResult>
    loadCharacter: (id: number) => Promise<boolean>
    deleteCharacter: (id: number) => Promise<boolean>
    resetCharacter: () => void
    refreshSavedCharacters: () => Promise<void>
    buffs: BuffData[]
    setBuffs: Dispatch<SetStateAction<BuffData[]>>
    relics: RelicData
    setRelics: Dispatch<SetStateAction<RelicData>>
    characterStats: TotalStatsValues
    isDirty: boolean
    isLoading: boolean
    error: string | null
}

export interface TeamContextValue {
    savedCharacters: StoredCharacterBuild[]
    buildsById: Map<number, StoredCharacterBuild>
    currentTeamCharacterIds: TeamCharacterIds
    setTeamSlot: (slot: number, characterId: number | null) => void
    removeTeamSlot: (slot: number) => void
    clearTeam: () => void
    teamMembers: TeamMember[]
    teamStats: Record<number, TeamMemberStats>
    teams: StoredTeam[]
    activeTeam: StoredTeam | null
    saveTeam: (name: string, characterIds: number[], teamId?: number) => Promise<SaveTeamResult>
    deleteTeam: (id: number) => Promise<boolean>
    loadTeam: (team: StoredTeam) => LoadTeamResult
    refreshTeams: () => Promise<void>
    isLoading: boolean
    error: string | null
}

export const CharacterContext = createContext<CharacterContextValue | null>(null)
export const TeamContext = createContext<TeamContextValue | null>(null)

export function useCharacter(): CharacterContextValue {
    const contextValue = useContext(CharacterContext)
    if (!contextValue) {
        throw new Error("useCharacter must be used within a TeamProvider")
    }
    return contextValue
}

export function useTeam(): TeamContextValue {
    const contextValue = useContext(TeamContext)
    if (!contextValue) {
        throw new Error("useTeam must be used within a TeamProvider")
    }
    return contextValue
}
