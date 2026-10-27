import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Character } from "@/schema/character"
import type { BuffData } from "@/schema/buffData"
import type { RelicData } from "@/schema/relicData"
import { TEAM_SIZE } from "@/const/team"
import { createDefaultCharacter } from "@/const/charactersTemplate"
import { createDefaultRelics } from "@/const/relicStats"
import { getCharacterKey, getCharacterName, getNameKey } from "@/lib/characterBuild"
import {
    eliminarEquipo,
    eliminarPersonaje,
    guardarEquipo,
    guardarPersonaje,
    initDB,
    obtenerEquipos,
    obtenerPersonajes,
    obtenerPersonajePorId,
} from "@/lib/indexedDB"
import type { StoredCharacterBuild, StoredTeam } from "@/lib/indexedDB"
import { calculateFase1Stats, calculateTotalStats } from "@/utils/calculateTotalStats"
import type { TeamSnapshot } from "@/utils/calculateTotalStats"
import {
    CharacterContext,
    TeamContext,
} from "@/contexts/teamContext"
import type {
    CharacterContextValue,
    LoadTeamResult,
    SaveCharacterResult,
    SaveTeamResult,
    TeamCharacterIds,
    TeamContextValue,
    TeamMember,
    TeamMemberStats,
} from "@/contexts/teamContext"

const emptyTeam = (): TeamCharacterIds =>
    Array.from({ length: TEAM_SIZE }, () => null)

const errorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) return error.message
    if (typeof error === "string" && error) return error
    return fallback
}

const replaceBuild = (
    builds: StoredCharacterBuild[],
    saved: StoredCharacterBuild
): StoredCharacterBuild[] => {
    const exists = builds.some((build) => build.id === saved.id)
    return exists
        ? builds.map((build) => (build.id === saved.id ? saved : build))
        : [saved, ...builds]
}

const replaceTeam = (teams: StoredTeam[], saved: StoredTeam): StoredTeam[] => {
    const exists = teams.some((team) => team.id === saved.id)
    return exists
        ? teams.map((team) => (team.id === saved.id ? saved : team))
        : [saved, ...teams]
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
    const [character, setCharacter] = useState<Character>(createDefaultCharacter)
    const [buffs, setBuffs] = useState<BuffData[]>([])
    const [relics, setRelics] = useState<RelicData>(createDefaultRelics)

    const [savedCharacters, setSavedCharacters] = useState<StoredCharacterBuild[]>([])
    const [teams, setTeams] = useState<StoredTeam[]>([])
    const [currentTeamCharacterIds, setCurrentTeamCharacterIds] = useState<TeamCharacterIds>(emptyTeam)
    const [activeTeam, setActiveTeam] = useState<StoredTeam | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const charactersRequest = useRef(0)
    const teamsRequest = useRef(0)

    const characterId = character.id ?? null

    // Carga inicial: una sola lectura para personajes y equipos.
    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                await initDB()
                const [characters, savedTeams] = await Promise.all([
                    obtenerPersonajes(),
                    obtenerEquipos(),
                ])
                if (cancelled) return

                setSavedCharacters(characters)
                setTeams(savedTeams)
                setError(null)
            } catch (loadError) {
                if (cancelled) return
                const message = errorMessage(loadError, "No se pudieron cargar los datos guardados.")
                console.error("Error al inicializar IndexedDB:", loadError)
                setError(message)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        void load()

        return () => {
            cancelled = true
        }
    }, [])

    const refreshSavedCharacters = useCallback(async () => {
        const requestId = ++charactersRequest.current
        try {
            const list = await obtenerPersonajes()
            if (requestId !== charactersRequest.current) return
            setSavedCharacters(list)
            setError(null)
        } catch (refreshError) {
            if (requestId !== charactersRequest.current) return
            console.error("Error al obtener personajes guardados:", refreshError)
            setError(errorMessage(refreshError, "No se pudieron cargar los personajes."))
        }
    }, [])

    const refreshTeams = useCallback(async () => {
        const requestId = ++teamsRequest.current
        try {
            const list = await obtenerEquipos()
            if (requestId !== teamsRequest.current) return
            setTeams(list)
            setError(null)
        } catch (refreshError) {
            if (requestId !== teamsRequest.current) return
            console.error("Error al obtener equipos guardados:", refreshError)
            setError(errorMessage(refreshError, "No se pudieron cargar los equipos."))
        }
    }, [])

    const editCharacter = useCallback(
        (target: { name: string; value: Character[keyof Character] }) => {
            const { name, value } = target
            if (name === "id") return
            setCharacter((previous) => ({ ...previous, [name]: value }))
        },
        []
    )

    const resetCharacter = useCallback(() => {
        setCharacter(createDefaultCharacter())
        setBuffs([])
        setRelics(createDefaultRelics())
    }, [])

    const saveCharacter = useCallback(
        async (asNew = false): Promise<SaveCharacterResult> => {
            const name = character.name.trim()
            if (!name) {
                return { success: false, error: "El personaje debe tener un nombre antes de guardarlo" }
            }

            try {
                const targetId = asNew ? undefined : character.id
                const saved = await guardarPersonaje({
                    ...(typeof targetId === "number" ? { id: targetId } : {}),
                    name,
                    character,
                    buffs,
                    relics,
                })

                setSavedCharacters((current) => replaceBuild(current, saved))
                setCharacter((previous) => ({
                    ...previous,
                    id: saved.id,
                    name: saved.name,
                }))
                setError(null)
                return { success: true, id: saved.id }
            } catch (saveError) {
                console.error("Error al guardar personaje:", saveError)
                const message = errorMessage(saveError, "Error al guardar en IndexedDB")
                setError(message)
                return { success: false, error: message }
            }
        },
        [character, buffs, relics]
    )

    const loadCharacter = useCallback(async (id: number): Promise<boolean> => {
        try {
            const record = await obtenerPersonajePorId(id)
            if (!record) {
                console.warn(`No se encontró el personaje con id: ${id}`)
                return false
            }

            setCharacter({
                ...createDefaultCharacter(),
                ...record.character,
                id: record.id,
                name: record.name,
            })
            setBuffs(record.buffs.map((buff) => ({ ...buff })))
            setRelics({
                setName: record.relics.setName,
                relics: record.relics.relics.map((relic) => ({ ...relic })),
                subStats: record.relics.subStats.map((subStat) => ({ ...subStat })),
            })
            setError(null)
            return true
        } catch (loadError) {
            console.error("Error al cargar personaje:", loadError)
            setError(errorMessage(loadError, "No se pudo cargar el personaje."))
            return false
        }
    }, [])

    const deleteCharacter = useCallback(
        async (id: number): Promise<boolean> => {
            try {
                // La eliminación en IndexedDB también limpia las referencias en equipos.
                await eliminarPersonaje(id)

                setSavedCharacters((current) => current.filter((build) => build.id !== id))
                setTeams((current) =>
                    current.map((team) =>
                        team.characters.includes(id)
                            ? {
                                ...team,
                                characters: team.characters.filter((characterId) => characterId !== id),
                            }
                            : team
                    )
                )
                setCurrentTeamCharacterIds((current) =>
                    current.map((characterId) => (characterId === id ? null : characterId))
                )

                if (character.id === id) {
                    resetCharacter()
                }

                setError(null)
                return true
            } catch (deleteError) {
                console.error("Error al eliminar personaje:", deleteError)
                setError(errorMessage(deleteError, "No se pudo eliminar el personaje."))
                return false
            }
        },
        [character.id, resetCharacter]
    )

    const characterStats = useMemo(() => {
        const { total } = calculateTotalStats(character, buffs, relics, undefined, 1)
        return total
    }, [character, buffs, relics])

    const buildsById = useMemo(
        () => new Map(savedCharacters.map((build) => [build.id, build] as const)),
        [savedCharacters]
    )

    const teamMembers = useMemo<TeamMember[]>(
        () =>
            currentTeamCharacterIds.flatMap((id, index) => {
                if (id === null) return []
                const build = buildsById.get(id)
                if (!build) return []
                return [{
                    id: build.id,
                    name: getCharacterName(build),
                    slot: index + 1,
                    build,
                }]
            }),
        [currentTeamCharacterIds, buildsById]
    )

    const teamStats = useMemo<Record<number, TeamMemberStats>>(() => {
        if (teamMembers.length === 0) return {}

        // Fase 1: snapshots congelados para evitar ciclos de retroalimentación.
        const snapshots: Record<string | number, TeamSnapshot> = {}
        for (const member of teamMembers) {
            const snapshot = calculateFase1Stats(
                member.build.character,
                member.build.buffs,
                member.build.relics,
                undefined,
                member.slot
            )
            snapshots[member.id] = {
                stats: snapshot.fase1Stats,
                base: snapshot.base,
            }
        }

        // Precalculamos los buffs de cada emisor una sola vez.
        const buffsByEmitter = teamMembers.map((member) => ({
            id: member.id,
            buffs: (member.build.buffs ?? []).map((buff) => ({
                ...buff,
                emisorId: String(member.id),
            })),
        }))

        const result: Record<number, TeamMemberStats> = {}
        for (const member of teamMembers) {
            const otherMembersBuffs = buffsByEmitter
                .filter((emitter) => emitter.id !== member.id)
                .flatMap((emitter) => emitter.buffs)

            result[member.id] = calculateTotalStats(
                member.build.character,
                member.build.buffs,
                member.build.relics,
                otherMembersBuffs,
                member.slot,
                snapshots
            )
        }

        return result
    }, [teamMembers])

    const setTeamSlot = useCallback((slot: number, characterIdValue: number | null) => {
        if (!Number.isInteger(slot) || slot < 0 || slot >= TEAM_SIZE) return
        setCurrentTeamCharacterIds((current) =>
            current.map((currentId, index) => (index === slot ? characterIdValue : currentId))
        )
    }, [])

    const removeTeamSlot = useCallback((slot: number) => {
        setTeamSlot(slot, null)
    }, [setTeamSlot])

    const clearTeam = useCallback(() => {
        setCurrentTeamCharacterIds(emptyTeam())
        setActiveTeam(null)
    }, [])

    const loadTeam = useCallback(
        (team: StoredTeam): LoadTeamResult => {
            const usedNames = new Set<string>()
            const validIds = team.characters.flatMap((id) => {
                const build = buildsById.get(id)
                if (!build) return []
                const key = getCharacterKey(build)
                if (usedNames.has(key)) return []
                usedNames.add(key)
                return [id]
            }).slice(0, TEAM_SIZE)

            if (validIds.length > 0) {
                setCurrentTeamCharacterIds(
                    Array.from({ length: TEAM_SIZE }, (_, index) => validIds[index] ?? null)
                )
                // Recordamos el equipo cargado para que el botón de guardar
                // actualice sus integrantes en lugar de crear uno nuevo.
                setActiveTeam(team)
            }

            return {
                loaded: validIds.length,
                omitted: team.characters.length - validIds.length,
            }
        },
        [buildsById]
    )

    const saveTeam = useCallback(
        async (name: string, characterIds: number[], teamId?: number): Promise<SaveTeamResult> => {
            const trimmedName = name.trim()
            if (!trimmedName) {
                return { success: false, error: "Escribe un nombre para el equipo." }
            }
            if (characterIds.length === 0) {
                return { success: false, error: "Selecciona al menos un personaje antes de guardar el equipo." }
            }

            // Al actualizar un equipo cargado usamos su id. Si no, se busca por
            // nombre para no crear duplicados.
            const existing = typeof teamId === "number"
                ? teams.find((team) => team.id === teamId)
                : teams.find((team) => getNameKey(team.name) === getNameKey(trimmedName))
            const targetId = typeof teamId === "number" ? teamId : existing?.id
            const isUpdate = typeof targetId === "number"

            try {
                const saved = await guardarEquipo({
                    ...(isUpdate ? { id: targetId } : {}),
                    name: trimmedName,
                    characters: characterIds,
                })
                setTeams((current) => replaceTeam(current, saved))
                setActiveTeam(saved)
                setError(null)
                return { success: true, updated: isUpdate }
            } catch (saveError) {
                console.error("Error al guardar el equipo:", saveError)
                const message = errorMessage(saveError, "No se pudo guardar el equipo.")
                setError(message)
                return { success: false, error: message }
            }
        },
        [teams]
    )

    const deleteTeam = useCallback(async (id: number): Promise<boolean> => {
        try {
            await eliminarEquipo(id)
            setTeams((current) => current.filter((team) => team.id !== id))
            setActiveTeam((current) => (current?.id === id ? null : current))
            setError(null)
            return true
        } catch (deleteError) {
            console.error("Error al eliminar el equipo:", deleteError)
            setError(errorMessage(deleteError, "No se pudo eliminar el equipo."))
            return false
        }
    }, [])

    const characterValue = useMemo<CharacterContextValue>(
        () => ({
            character,
            characterId,
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
            characterStats,
            isLoading,
            error,
        }),
        [
            character,
            characterId,
            editCharacter,
            savedCharacters,
            saveCharacter,
            loadCharacter,
            deleteCharacter,
            resetCharacter,
            refreshSavedCharacters,
            buffs,
            relics,
            characterStats,
            isLoading,
            error,
        ]
    )

    const teamValue = useMemo<TeamContextValue>(
        () => ({
            savedCharacters,
            buildsById,
            currentTeamCharacterIds,
            setTeamSlot,
            removeTeamSlot,
            clearTeam,
            teamMembers,
            teamStats,
            teams,
            activeTeam,
            saveTeam,
            deleteTeam,
            loadTeam,
            refreshTeams,
            isLoading,
            error,
        }),
        [
            savedCharacters,
            buildsById,
            currentTeamCharacterIds,
            setTeamSlot,
            removeTeamSlot,
            clearTeam,
            teamMembers,
            teamStats,
            teams,
            activeTeam,
            saveTeam,
            deleteTeam,
            loadTeam,
            refreshTeams,
            isLoading,
            error,
        ]
    )

    return (
        <CharacterContext.Provider value={characterValue}>
            <TeamContext.Provider value={teamValue}>
                {children}
            </TeamContext.Provider>
        </CharacterContext.Provider>
    )
}
