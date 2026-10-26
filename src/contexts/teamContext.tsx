import { createContext, useContext, useState, useMemo, type Dispatch, type SetStateAction, useEffect, useCallback } from "react";
import type { Character } from "@/schema/character";
import type { BuffData } from "@/schema/buffData";
import { TEAM_SIZE } from "@/const/team";
import { relicDefault } from "@/const/relicStats";
import {
    initDB,
    guardarPersonaje,
    obtenerPersonajes,
    obtenerPersonajePorId,
    eliminarPersonaje,
    type SavedCharacterBuild
} from '@/lib/indexedDB'
import { characterDefault } from '@/const/charactersTemplate'
import type { RelicData } from "@/schema/relicData";
import type { TotalStatsValues, TeamSnapshot } from "@/utils/calculateTotalStats";
import { calculateTotalStats, calculateFase1Stats } from "@/utils/calculateTotalStats";

type TeamCharacterIds = Array<number | null>

export interface TeamMember {
    id: number
    name: string
    slot: number
    build: SavedCharacterBuild
}

export interface TeamMemberStats {
    total: TotalStatsValues
}

interface TeamContextValue {
    character: Character
    characterId: number | null
    setCharacterId: Dispatch<SetStateAction<number | null>>
    editCharacter: (target: { name: string, value: string | number | boolean | File | Blob | null }) => void
    savedCharacters: SavedCharacterBuild[]
    saveCharacter: (asNew?: boolean) => Promise<{ success: boolean; id?: number; error?: string }>
    loadCharacter: (id: number) => Promise<boolean>
    deleteCharacter: (id: number) => Promise<boolean>
    resetCharacter: () => void
    refreshSavedCharacters: () => Promise<void>
    buffs: BuffData[]
    setBuffs: Dispatch<SetStateAction<BuffData[]>>
    relics: RelicData
    setRelics: Dispatch<SetStateAction<RelicData>>
    currentTeamCharacterIds: TeamCharacterIds
    setCurrentTeamCharacterIds: Dispatch<SetStateAction<TeamCharacterIds>>
    teamMembers: TeamMember[]
    teamStats: Record<number, TeamMemberStats>
    characterStats: TotalStatsValues
}

export const TeamContext = createContext<TeamContextValue | null>(null)

export function useTeam() {
    const contextValue = useContext(TeamContext)
    if (!contextValue) {
        throw new Error("useTeam must be used within a TeamProvider")
    }
    return contextValue
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
    // ID del registro guardado (null si es nuevo)
    const [characterId, setCharacterId] = useState<number | null>(null)
    const [character, setCharacter] = useState<Character>(characterDefault)
    const [buffs, setBuffs] = useState<BuffData[]>([])
    const [relics, setRelics] = useState<RelicData>(relicDefault)

    // Lista de personajes guardados
    const [savedCharacters, setSavedCharacters] = useState<SavedCharacterBuild[]>([])

    // IDs ordenados de los personajes del equipo actual
    const [currentTeamCharacterIds, setCurrentTeamCharacterIds] = useState<TeamCharacterIds>(
        () => Array<TeamCharacterIds[number]>(TEAM_SIZE).fill(null)
    )

    const refreshSavedCharacters = useCallback(async () => {
        try {
            const list = await obtenerPersonajes()
            setSavedCharacters(list)
        } catch (error) {
            console.error("Error al obtener personajes guardados:", error)
        }
    }, [])

    useEffect(() => {
        // Inicializar base de datos y cargar lista
        initDB()
            .then(() => refreshSavedCharacters())
            .catch((err) => console.error("Error al inicializar base de datos:", err))
    }, [refreshSavedCharacters])

    // Editar stats del personaje
    const editCharacter = (target: { name: string, value: string | number | boolean | File | Blob | null }) => {
        const { name, value } = target;

        setCharacter((prev: Character) => ({
            ...prev,
            [name]: value,
        }));
    }

    // Reiniciar a nuevo personaje
    const resetCharacter = () => {
        setCharacterId(null)
        setCharacter({ ...characterDefault })
        setBuffs([])
        setRelics(relicDefault)
    }

    // Guardar personaje en indexedDB (con character, buffs y relics)
    const saveCharacter = async (asNew: boolean = false): Promise<{ success: boolean; id?: number; error?: string }> => {
        if (!character.name.trim()) {
            return { success: false, error: "El personaje debe tener un nombre antes de guardarlo" }
        }

        try {
            const targetId = asNew ? undefined : (characterId ?? undefined)
            const id = await guardarPersonaje({
                id: targetId,
                name: character.name,
                character: {
                    ...character,
                    id: targetId,
                },
                buffs,
                relics,
            })

            setCharacterId(id)
            setCharacter((prev) => ({ ...prev, id }))
            await refreshSavedCharacters()
            return { success: true, id }
        } catch (error) {
            console.error("Error al guardar personaje:", error)
            const errorMsg = error instanceof Error ? error.message : "Error al guardar en IndexedDB"
            return { success: false, error: errorMsg }
        }
    }

    // Cargar personaje por ID de la BD
    const loadCharacter = async (id: number): Promise<boolean> => {
        try {
            const record = await obtenerPersonajePorId(id)
            if (!record) {
                console.warn(`No se encontró el personaje con id: ${id}`)
                return false
            }

            setCharacterId(record.id ?? id)

            if (record.character) {
                setCharacter({
                    ...characterDefault,
                    ...record.character,
                    id: record.id ?? id,
                })
            } else {
                setCharacter({
                    ...characterDefault,
                    name: record.name || "",
                    id: record.id ?? id,
                })
            }

            setBuffs(record.buffs || [])
            setRelics(record.relics || relicDefault)

            return true
        } catch (error) {
            console.error("Error al cargar personaje:", error)
            return false
        }
    }

    // Eliminar personaje por ID de la BD
    const deleteCharacter = async (id: number): Promise<boolean> => {
        try {
            await eliminarPersonaje(id)
            setCurrentTeamCharacterIds((currentTeam) =>
                currentTeam.map((characterId) => characterId === id ? null : characterId)
            )
            if (characterId === id) {
                resetCharacter()
            }
            await refreshSavedCharacters()
            return true
        } catch (error) {
            console.error("Error al eliminar personaje:", error)
            return false
        }
    }

    const { characterStats } = useMemo(() => {
        const { total } = calculateTotalStats(character, buffs, relics, undefined, 1)

        return { characterStats: total }
    }, [character, buffs, relics])

    const teamMembers: TeamMember[] = useMemo(() => {
        return currentTeamCharacterIds.flatMap((id, index) => {
            if (id === null) return []
            const build = savedCharacters.find((character) => character.id === id)
            if (!build || build.id === undefined) return []
            return [{
                id: build.id,
                name: build.character?.name?.trim() || build.name.trim(),
                slot: index + 1,
                build,
            }]
        })
    }, [currentTeamCharacterIds, savedCharacters])

    // Estadísticas calculadas y cacheadas para cada integrante del equipo
    // Solo se recalculan si cambian los integrantes o los datos de sus builds guardadas
    const teamStats: Record<number, TeamMemberStats> = useMemo(() => {
        if (teamMembers.length === 0) return {}

        // FASE 1: Snapshots congelados para cada integrante, evitando ciclos de retroalimentación
        const teamSnapshots: Record<string | number, TeamSnapshot> = {}
        for (const member of teamMembers) {
            const snapshot = calculateFase1Stats(
                member.build.character,
                member.build.buffs,
                member.build.relics,
                undefined,
                member.slot
            )
            teamSnapshots[member.id] = {
                stats: snapshot.fase1Stats,
                base: snapshot.base,
            }
        }

        // FASE 2: Calcular estadísticas finales para cada integrante usando el mapa de snapshots
        const result: Record<number, TeamMemberStats> = {}
        for (const member of teamMembers) {
            const otherMembersBuffs = teamMembers
                .filter((other) => other.id !== member.id)
                .flatMap((other) =>
                    (other.build.buffs || []).map((buff) => ({
                        ...buff,
                        emisorId: String(other.id),
                    }))
                )

            result[member.id] = calculateTotalStats(
                member.build.character,
                member.build.buffs,
                member.build.relics,
                otherMembersBuffs,
                member.slot,
                teamSnapshots
            )
        }

        return result
    }, [teamMembers])

    return (
        <TeamContext.Provider
            value={{
                character,
                characterId,
                setCharacterId,
                editCharacter,
                savedCharacters,
                saveCharacter,
                loadCharacter,
                deleteCharacter,
                resetCharacter,
                refreshSavedCharacters,
                buffs,
                setBuffs,
                relics,
                setRelics,
                currentTeamCharacterIds,
                setCurrentTeamCharacterIds,
                teamMembers,
                teamStats,
                characterStats,
            }}
        >
            {children}
        </TeamContext.Provider>
    )
}