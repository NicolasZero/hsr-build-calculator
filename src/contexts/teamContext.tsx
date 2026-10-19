import { createContext, useContext, useState, type Dispatch, type SetStateAction, useEffect, useCallback } from "react";
import type { Character } from "@/schema/character";
import type { BuffData } from "@/schema/buffData";
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

type TeamCharacterIds = Array<number | null>

const TEAM_SIZE = 4

export const relicDefault: RelicData = {
    setName: undefined,
    relics: [],
    subStats: [],
}

interface props {
    children: React.ReactNode
}

interface context {
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
}

export const TeamContext = createContext<context | null>(null)

export function useTeam() {
    const contextValue = useContext(TeamContext)
    if (!contextValue) {
        throw new Error("useTeam must be used within a TeamProvider")
    }
    return contextValue
}

export function TeamProvider({ children }: props) {
    // ID del registro guardado (null si es nuevo)
    const [characterId, setCharacterId] = useState<number | null>(null)

    // Stats del personaje
    const [character, setCharacter] = useState<Character>(characterDefault)

    // Buffs
    const [buffs, setBuffs] = useState<BuffData[]>([])

    // Stats de reliquias
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
        setCharacter(characterDefault)
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

    // Cargar personaje por ID
    const loadCharacter = async (id: number): Promise<boolean> => {
        try {
            const record = await obtenerPersonajePorId(id)
            if (!record) {
                console.warn(`No se encontró el personaje con id: ${id}`)
                return false
            }

            setCharacterId(record.id ?? id)

            // Cargar datos del personaje
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

            // Cargar buffs
            setBuffs(record.buffs || [])

            // Cargar reliquias
            setRelics(record.relics || relicDefault)

            return true
        } catch (error) {
            console.error("Error al cargar personaje:", error)
            return false
        }
    }

    // Eliminar personaje por ID
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
            }}
        >
            {children}
        </TeamContext.Provider>
    )
}