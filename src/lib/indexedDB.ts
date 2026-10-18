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

const getTransaction = async (storeName: string, mode: IDBTransactionMode): Promise<IDBTransaction> => {
    const db = await initDB();
    return db.transaction(storeName, mode);
};

export const guardarPersonaje = async (build: SavedCharacterBuild): Promise<number> => {
    const tx = await getTransaction('characters', 'readwrite');
    const store = tx.objectStore('characters');

    const dataToSave: Omit<SavedCharacterBuild, 'id'> & { id?: number } = {
        name: build.name,
        character: { ...build.character },
        buffs: build.buffs,
        relics: build.relics,
        updatedAt: Date.now(),
        createdAt: build.createdAt ?? Date.now(),
    };

    // CRÍTICO: En IndexedDB con autoIncrement, si 'id' existe con valor undefined o null,
    // IndexedDB arroja DataError: "Evaluating the object store's key path yielded a value that is not a valid key."
    // Solo definimos 'id' cuando es un número válido existente (edición).
    if (typeof build.id === 'number') {
        dataToSave.id = build.id;
        dataToSave.character.id = build.id;
    } else {
        delete dataToSave.id;
        delete dataToSave.character.id;
    }

    return new Promise((resolve, reject) => {
        const request = store.put(dataToSave);
        request.onsuccess = () => {
            resolve(request.result as number);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const obtenerPersonajes = async (): Promise<SavedCharacterBuild[]> => {
    const tx = await getTransaction('characters', 'readonly');
    const store = tx.objectStore('characters');

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            resolve((request.result as SavedCharacterBuild[]) || []);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const obtenerPersonajePorId = async (id: number): Promise<SavedCharacterBuild | undefined> => {
    const tx = await getTransaction('characters', 'readonly');
    const store = tx.objectStore('characters');

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
            resolve(request.result as SavedCharacterBuild | undefined);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const eliminarPersonaje = async (id: number): Promise<void> => {
    const tx = await getTransaction('characters', 'readwrite');
    const store = tx.objectStore('characters');

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const guardarEquipo = async (team: SavedTeam): Promise<number> => {
    const tx = await getTransaction('teams', 'readwrite');
    const store = tx.objectStore('teams');
    const dataToSave: Omit<SavedTeam, 'id'> & { id?: number } = {
        name: team.name.trim(),
        characters: team.characters,
        createdAt: team.createdAt ?? Date.now(),
        updatedAt: Date.now(),
    };

    if (typeof team.id === 'number') {
        dataToSave.id = team.id;
    }

    return new Promise((resolve, reject) => {
        const request = store.put(dataToSave);
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
    });
};

export const obtenerEquipos = async (): Promise<SavedTeam[]> => {
    const tx = await getTransaction('teams', 'readonly');
    const store = tx.objectStore('teams');

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve((request.result as SavedTeam[]) || []);
        request.onerror = () => reject(request.error);
    });
};

export const eliminarEquipo = async (id: number): Promise<void> => {
    const tx = await getTransaction('teams', 'readwrite');
    const store = tx.objectStore('teams');

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// Retrocompatibilidad
export const guardarDatos = async <T extends Record<string, unknown>>(datos: T, storeName: string): Promise<IDBValidKey> => {
    const tx = await getTransaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const dataToSave: Record<string, unknown> = { ...datos };
    if (dataToSave.id === undefined || dataToSave.id === null) {
        delete dataToSave.id;
    }
    return new Promise((resolve, reject) => {
        const request = store.put(dataToSave);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const obtenerDatos = async <T = unknown>(storeName: string): Promise<T[]> => {
    const tx = await getTransaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
