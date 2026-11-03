import type { Character } from "@/schema/character"
import type { BuffData } from "@/schema/buffData"
import type { RelicData } from "@/schema/relicData"

export interface SavedCharacterBuild {
    id?: number;
    name: string;
    character: Character;
    buffs: BuffData[];
    relics: RelicData;
    createdAt?: number;
    updatedAt?: number;
}

/** Registro tal y como se devuelve desde IndexedDB: siempre tiene id y fechas. */
export interface StoredCharacterBuild extends SavedCharacterBuild {
    id: number;
    createdAt: number;
    updatedAt: number;
}

export interface SavedTeam {
    id?: number;
    name: string;
    characters: number[];
    createdAt?: number;
    updatedAt?: number;
}

/** Registro tal y como se devuelve desde IndexedDB: siempre tiene id y fechas. */
export interface StoredTeam extends SavedTeam {
    id: number;
    createdAt: number;
    updatedAt: number;
}

const DB_NAME = "teamBuilder"
const DB_VERSION = 4

const CHARACTERS_STORE = "characters"
const TEAMS_STORE = "teams"

let dbInstance: IDBDatabase | null = null
let dbInitPromise: Promise<IDBDatabase> | null = null

const resetConnection = () => {
    dbInstance = null
    dbInitPromise = null
}

const requestToPromise = <T,>(request: IDBRequest<T>): Promise<T> =>
    new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error ?? new Error("Error de IndexedDB"))
    })

const transactionDone = (tx: IDBTransaction): Promise<void> =>
    new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onabort = () => reject(tx.error ?? new Error("Transacción de IndexedDB abortada"))
        tx.onerror = () => reject(tx.error ?? new Error("Error en la transacción de IndexedDB"))
    })

const ensureStore = (
    db: IDBDatabase,
    tx: IDBTransaction,
    name: string
): IDBObjectStore =>
    db.objectStoreNames.contains(name)
        ? tx.objectStore(name)
        : db.createObjectStore(name, { keyPath: "id", autoIncrement: true })

const ensureIndex = (
    store: IDBObjectStore,
    name: string,
    keyPath: string,
    options?: IDBIndexParameters
) => {
    if (!store.indexNames.contains(name)) {
        store.createIndex(name, keyPath, options)
    }
}

export const initDB = (): Promise<IDBDatabase> => {
    if (dbInstance) {
        return Promise.resolve(dbInstance)
    }
    if (dbInitPromise) {
        return dbInitPromise
    }

    dbInitPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = () => {
            const db = request.result
            const tx = request.transaction
            if (!tx) return

            // Migraciones idempotentes: cada versión se asegura de que los stores
            // e índices existan, vengan de la versión que vengan.
            const charactersStore = ensureStore(db, tx, CHARACTERS_STORE)
            ensureIndex(charactersStore, "name", "name")
            ensureIndex(charactersStore, "updatedAt", "updatedAt")

            const teamsStore = ensureStore(db, tx, TEAMS_STORE)
            ensureIndex(teamsStore, "name", "name")
            ensureIndex(teamsStore, "updatedAt", "updatedAt")

            // Índice antiguo sobre un array sin multiEntry: no permitía buscar por
            // personaje y solo ocupaba espacio.
            if (teamsStore.indexNames.contains("characters")) {
                teamsStore.deleteIndex("characters")
            }
        }

        request.onsuccess = () => {
            const db = request.result

            // Si otra pestaña abre una versión nueva, cerramos la conexión para no
            // bloquearla y forzamos a reabrir en la siguiente operación.
            db.onversionchange = () => {
                db.close()
                resetConnection()
            }
            db.onclose = () => resetConnection()

            dbInstance = db
            resolve(db)
        }

        request.onerror = () => {
            resetConnection()
            reject(request.error ?? new Error("No se pudo abrir IndexedDB"))
        }

        request.onblocked = () => {
            resetConnection()
            reject(new Error(
                "La base de datos está bloqueada por otra pestaña. " +
                "Cierra las demás pestañas de la aplicación y vuelve a intentarlo."
            ))
        }
    })

    return dbInitPromise
}

const openTransaction = async (
    storeNames: string | string[],
    mode: IDBTransactionMode
): Promise<IDBTransaction> => {
    try {
        const db = await initDB()
        return db.transaction(storeNames, mode)
    } catch (error) {
        // La conexión pudo cerrarse por un cambio de versión en otra pestaña.
        if (error instanceof DOMException && error.name === "InvalidStateError") {
            resetConnection()
            const db = await initDB()
            return db.transaction(storeNames, mode)
        }
        throw error
    }
}

/**
 * Ejecuta una operación dentro de una transacción y resuelve cuando la
 * transacción ha hecho commit (no cuando la petición individual responde).
 */
const withStore = async <T,>(
    storeName: string,
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => Promise<T>
): Promise<T> => {
    const tx = await openTransaction(storeName, mode)
    const done = mode === "readonly" ? Promise.resolve() : transactionDone(tx)
    const result = await run(tx.objectStore(storeName))
    await done
    return result
}

const cloneRelics = (relics?: RelicData): RelicData => ({
    setName: relics?.setName,
    relics: relics?.relics ? relics.relics.map((relic) => ({ ...relic })) : [],
    subStats: relics?.subStats ? relics.subStats.map((subStat) => ({ ...subStat })) : [],
})

/**
 * Normaliza un registro antiguo o nuevo:
 * - Un solo nombre canónico (`name`) replicado en `character.name`.
 * - El id vive solo en el registro, nunca dentro de `character`.
 * - Garantiza buffs/relics y fechas.
 */
const normalizeBuild = (record: SavedCharacterBuild & { id: number }): StoredCharacterBuild => {
    const name = (record.name?.trim() || record.character?.name?.trim() || "").trim()
    const character: Character = { ...record.character, name }
    delete character.id

    return {
        ...record,
        id: record.id,
        name,
        character,
        buffs: record.buffs ?? [],
        relics: cloneRelics(record.relics),
        createdAt: record.createdAt ?? record.updatedAt ?? 0,
        updatedAt: record.updatedAt ?? record.createdAt ?? 0,
    }
}

export const guardarPersonaje = async (
    build: SavedCharacterBuild
): Promise<StoredCharacterBuild> => {
    return withStore(CHARACTERS_STORE, "readwrite", async (store) => {
        const now = Date.now()
        const existing = typeof build.id === "number"
            ? await requestToPromise<SavedCharacterBuild | undefined>(store.get(build.id))
            : undefined

        const name = (build.character?.name?.trim() || build.name?.trim() || "").trim()
        const character: Character = { ...build.character, name }
        delete character.id

        const record: SavedCharacterBuild = {
            ...(typeof build.id === "number" ? { id: build.id } : {}),
            name,
            character,
            buffs: build.buffs ?? [],
            relics: cloneRelics(build.relics),
            createdAt: existing?.createdAt ?? build.createdAt ?? now,
            updatedAt: now,
        }

        const key = await requestToPromise(store.put(record))
        const stored: SavedCharacterBuild & { id: number } = { ...record, id: Number(key) }
        return normalizeBuild(stored)
    })
}

export const obtenerPersonajes = async (): Promise<StoredCharacterBuild[]> => {
    return withStore(CHARACTERS_STORE, "readonly", async (store) => {
        const records = await requestToPromise<SavedCharacterBuild[]>(store.getAll())
        return records
            .filter((record): record is SavedCharacterBuild & { id: number } =>
                typeof record.id === "number"
            )
            .map(normalizeBuild)
    })
}

export const obtenerPersonajePorId = async (
    id: number
): Promise<StoredCharacterBuild | undefined> => {
    return withStore(CHARACTERS_STORE, "readonly", async (store) => {
        const record = await requestToPromise<SavedCharacterBuild | undefined>(store.get(id))
        if (!record || typeof record.id !== "number") return undefined
        return normalizeBuild({ ...record, id: record.id })
    })
}


// Elimina el personaje y, en la misma transacción, lo quita de los equipos
// guardados para no dejar referencias huérfanas.
export const eliminarPersonaje = async (id: number): Promise<void> => {
    const tx = await openTransaction([CHARACTERS_STORE, TEAMS_STORE], "readwrite")
    const done = transactionDone(tx)

    tx.objectStore(CHARACTERS_STORE).delete(id)

    const teamsStore = tx.objectStore(TEAMS_STORE)
    const teams = await requestToPromise<SavedTeam[]>(teamsStore.getAll())
    const now = Date.now()
    for (const team of teams) {
        if (typeof team.id === "number" && team.characters?.includes(id)) {
            teamsStore.put({
                ...team,
                characters: team.characters.filter((characterId) => characterId !== id),
                updatedAt: now,
            })
        }
    }

    await done
}

// ===== Equipos/Team ===== //
export const guardarEquipo = async (team: SavedTeam): Promise<StoredTeam> => {
    return withStore(TEAMS_STORE, "readwrite", async (store) => {
        const now = Date.now()
        const existing = typeof team.id === "number"
            ? await requestToPromise<SavedTeam | undefined>(store.get(team.id))
            : undefined

        const record: SavedTeam = {
            ...(typeof team.id === "number" ? { id: team.id } : {}),
            name: team.name.trim(),
            characters: [...team.characters],
            createdAt: existing?.createdAt ?? team.createdAt ?? now,
            updatedAt: now,
        }

        const key = await requestToPromise(store.put(record))
        return {
            ...record,
            id: Number(key),
            createdAt: record.createdAt ?? now,
            updatedAt: record.updatedAt ?? now,
        }
    })
}

export const obtenerEquipos = async (): Promise<StoredTeam[]> => {
    return withStore(TEAMS_STORE, "readonly", async (store) => {
        const records = await requestToPromise<SavedTeam[]>(store.getAll())
        return records
            .filter((team): team is SavedTeam & { id: number } => typeof team.id === "number")
            .map((team) => ({
                ...team,
                id: team.id,
                characters: team.characters ?? [],
                createdAt: team.createdAt ?? team.updatedAt ?? 0,
                updatedAt: team.updatedAt ?? team.createdAt ?? 0,
            }))
    })
}

export const eliminarEquipo = async (id: number): Promise<void> => {
    return withStore(TEAMS_STORE, "readwrite", async (store) => {
        await requestToPromise(store.delete(id))
    })
}


// ===== Operaciones Globales (Limpiar, Exportar, Importar) ===== //

export interface DatabaseExportData {
    version: number;
    exportedAt: string;
    type: "full" | "character";
    characters: StoredCharacterBuild[];
    teams?: StoredTeam[];
}

/**
 * Limpia todos los registros de personajes y equipos en la base de datos.
 */
export const limpiarBaseDeDatos = async (): Promise<void> => {
    const tx = await openTransaction([CHARACTERS_STORE, TEAMS_STORE], "readwrite")
    const done = transactionDone(tx)
    tx.objectStore(CHARACTERS_STORE).clear()
    tx.objectStore(TEAMS_STORE).clear()
    await done
}

/**
 * Exporta toda la base de datos (personajes y equipos).
 */
export const exportarBaseDeDatosCompleta = async (): Promise<DatabaseExportData> => {
    const characters = await obtenerPersonajes()
    const teams = await obtenerEquipos()
    return {
        version: DB_VERSION,
        exportedAt: new Date().toISOString(),
        type: "full",
        characters,
        teams,
    }
}

/**
 * Exporta un personaje individual por su id.
 */
export const exportarPersonajePorId = async (id: number): Promise<DatabaseExportData | null> => {
    const character = await obtenerPersonajePorId(id)
    if (!character) return null
    return {
        version: DB_VERSION,
        exportedAt: new Date().toISOString(),
        type: "character",
        characters: [character],
    }
}

export interface ImportResult {
    importedCharacters: number;
    importedTeams: number;
}

/**
 * Importa datos a la base de datos (personajes y opcionalmente equipos).
 * Puede operar en modo 'merge' (añadir) o 'replace' (limpia antes).
 */
export const importarDatos = async (
    data: DatabaseExportData,
    mode: "merge" | "replace" = "merge"
): Promise<ImportResult> => {
    if (!data || !Array.isArray(data.characters)) {
        throw new Error("El archivo no tiene un formato válido de exportación")
    }

    if (mode === "replace") {
        await limpiarBaseDeDatos()
    }

    let importedCharacters = 0
    let importedTeams = 0

    // Si reemplaza o fusiona, mapeamos ids de personajes para reasignar ids a los equipos
    const characterIdMap = new Map<number, number>()

    for (const charBuild of data.characters) {
        const oldId = charBuild.id
        const toSave: SavedCharacterBuild = {
            ...charBuild,
            ...(mode === "replace" ? { id: charBuild.id } : {}),
        }
        if (mode === "merge") {
            delete toSave.id
        }
        const saved = await guardarPersonaje(toSave)
        if (typeof oldId === "number") {
            characterIdMap.set(oldId, saved.id)
        }
        importedCharacters++
    }

    if (Array.isArray(data.teams) && data.teams.length > 0) {
        for (const team of data.teams) {
            const mappedCharacters = (team.characters ?? []).map((cid) =>
                characterIdMap.has(cid) ? characterIdMap.get(cid)! : cid
            )

            const teamToSave: SavedTeam = {
                name: team.name,
                characters: mappedCharacters,
                ...(mode === "replace" && typeof team.id === "number" ? { id: team.id } : {}),
            }
            await guardarEquipo(teamToSave)
            importedTeams++
        }
    }

    return {
        importedCharacters,
        importedTeams,
    }
}
