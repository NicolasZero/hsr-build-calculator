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

export interface SavedTeam {
    id?: number;
    name: string;
    characters: number[];
    createdAt?: number;
    updatedAt?: number;
}

const DB_NAME = 'teamBuilder'
const DB_VERSION = 3

// Helper para convertir requests de indexedDB en promesas
const requestToPromise = <T,>(request: IDBRequest<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error ?? new Error("IndexedDB error"))
    })
}

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

export const initDB = (): Promise<IDBDatabase> => {
    if (dbInstance) {
        return Promise.resolve(dbInstance);
    }
    if (dbInitPromise) {
        return dbInitPromise;
    }

    dbInitPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            const tx = (e.target as IDBOpenDBRequest).transaction;

            let store: IDBObjectStore;
            if (!db.objectStoreNames.contains('characters')) {
                store = db.createObjectStore('characters', { keyPath: 'id', autoIncrement: true });
            } else {
                store = tx!.objectStore('characters');
            }

            if (store.indexNames.contains('name')) {
                store.deleteIndex('name');
            }
            store.createIndex('name', 'name', { unique: false });

            if (!store.indexNames.contains('updatedAt')) {
                store.createIndex('updatedAt', 'updatedAt', { unique: false });
            }

            if (!db.objectStoreNames.contains('teams')) {
                const teamsStore = db.createObjectStore('teams', { keyPath: 'id', autoIncrement: true });
                teamsStore.createIndex('name', 'name', { unique: false });
                teamsStore.createIndex('characters', 'characters', { unique: false });
            }
        };

        request.onsuccess = (e) => {
            dbInstance = (e.target as IDBOpenDBRequest).result;
            resolve(dbInstance);
        };

        request.onerror = (e) => {
            dbInitPromise = null;
            reject((e.target as IDBOpenDBRequest).error);
        };
    });

    return dbInitPromise;
};

// Ejecuta una operación contra un object store de IndexedDB gestionando el
// ciclo de vida completo de la transacción (abrir BD -> transacción -> store -> esperar confirmación).
const withStore = async <T>(
    storeName: string,
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => Promise<T>,
): Promise<T> => {
    // 1) Abre (o reutiliza, gracias al memoizado de initDB) la conexión a la BD.
    const db = await initDB();

    // 2) Crea la transacción que abarca `storeName` en el modo indicado.
    const tx = db.transaction(storeName, mode);

    // 3) Promesa que se resuelve cuando la transacción se confirma de verdad.
    //    Se registra ANTES de ejecutar `run`: si la transacción termina mientras
    //    se espera, el evento ya se habría emitido y la promesa quedaría colgada.
    const completion = new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onabort = tx.onerror = () => reject(tx.error ?? new Error("Transaction aborted"));
    });

    // 4) Ejecuta la operación concreta sobre el object store.
    let result: T;
    try {
        result = await run(tx.objectStore(storeName));
    } catch (error) {
        // Si la operación falla, se aborta la transacción para no dejar
        // escrituras a medias. `catch` silencioso por si ya había finalizado.
        completion.catch(() => undefined);
        try {
            tx.abort();
        } catch {
            // La transacción ya estaba finalizada: no hay nada que abortar.
        }
        throw error;
    }

    // 5) En escritura, el "onsuccess" del request no garantiza que la transacción
    //    se haya confirmado (puede abortar después, p.ej. por un índice unique).
    //    Por eso se espera a `oncomplete`. En "readonly" no hay nada que confirmar.
    if (mode !== "readonly") {
        await completion;
    } else {
        // Se ignora explícitamente para que no quede como unhandled rejection.
        completion.catch(() => undefined);
    }

    return result;
};

export const guardarPersonaje = async (build: SavedCharacterBuild): Promise<number> => {
    return withStore('characters', 'readwrite', async (store) => {
        const dataToSave: Omit<SavedCharacterBuild, 'id'> & { id?: number } = {
            name: build.name,
            character: { ...build.character },
            buffs: build.buffs,
            relics: build.relics,
            updatedAt: Date.now(),
            createdAt: build.createdAt ?? Date.now(),
        };

        if (typeof build.id === 'number') {
            dataToSave.id = build.id;
            dataToSave.character.id = build.id;
        } else {
            delete dataToSave.id;
            delete dataToSave.character.id;
        }

        const request = store.put(dataToSave);
        return (await requestToPromise(request)) as number;
    });
};

export const obtenerPersonajes = async (): Promise<SavedCharacterBuild[]> => {
    return withStore('characters', 'readonly', async (store) => {
        const result = await requestToPromise(store.getAll());
        return (result as SavedCharacterBuild[]) || [];
    });
};

export const obtenerPersonajePorId = async (id: number): Promise<SavedCharacterBuild | undefined> => {
    return withStore('characters', 'readonly', async (store) => {
        const result = await requestToPromise(store.get(id));
        return result as SavedCharacterBuild | undefined;
    });
};

export const eliminarPersonaje = async (id: number): Promise<void> => {
    await withStore('characters', 'readwrite', async (store) => {
        await requestToPromise(store.delete(id));
    });
};

export const guardarEquipo = async (team: SavedTeam): Promise<number> => {
    return withStore('teams', 'readwrite', async (store) => {
        const dataToSave: Omit<SavedTeam, 'id'> & { id?: number } = {
            name: team.name.trim(),
            characters: team.characters,
            createdAt: team.createdAt ?? Date.now(),
            updatedAt: Date.now(),
        };

        if (typeof team.id === 'number') {
            dataToSave.id = team.id;
        }

        const request = store.put(dataToSave);
        return (await requestToPromise(request)) as number;
    });
};

export const obtenerEquipos = async (): Promise<SavedTeam[]> => {
    return withStore('teams', 'readonly', async (store) => {
        const result = await requestToPromise(store.getAll());
        return (result as SavedTeam[]) || [];
    });
};

export const eliminarEquipo = async (id: number): Promise<void> => {
    await withStore('teams', 'readwrite', async (store) => {
        await requestToPromise(store.delete(id));
    });
};

// Retrocompatibilidad
export const guardarDatos = async <T extends Record<string, unknown>>(datos: T, storeName: string): Promise<IDBValidKey> => {
    return withStore(storeName, 'readwrite', async (store) => {
        const dataToSave: Record<string, unknown> = { ...datos };
        if (dataToSave.id === undefined || dataToSave.id === null) {
            delete dataToSave.id;
        }
        const request = store.put(dataToSave);
        return requestToPromise(request);
    });
};

export const obtenerDatos = async <T = unknown>(storeName: string): Promise<T[]> => {
    return withStore(storeName, 'readonly', async (store) => {
        const result = await requestToPromise(store.getAll());
        return (result as T[]) || [];
    });
};
