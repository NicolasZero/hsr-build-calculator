// Nombres de las tablas que existen en la base de datos
const DB_NAME = 'teamBuilder'
const DB_VERSION = 1
let db;

// Inicializa la base de datos
export const initDB = () => {
    // Abrir o crear la base de datos
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    // Se ejecuta cuando se crea o actualiza la base de datos
    request.onupgradeneeded = (e) => {
        tableCharacters(e.target.result)
    }

    // Se ejecuta cuando se abre la base de datos
    request.onsuccess = (e) => {
        db = e.target.result
        console.log("Base de datos abierta correctamente")
    }

    // Se ejecuta si hay un error al abrir la base de datos
    request.onerror = (e) => {
        console.error("Error al abrir la base de datos")
        console.error(e)
    }
}

// Obtener transacción
// storeName: string | "characters" | "teams"  // Nombres de las tablas que existen en la base de datos
// mode: string | "readonly" | "readwrite"    // Modo de la transacción
const obtenerTransaccion = (storeName, mode) => {
    if (!db) throw new Error("La base de datos no está inicializada.")
    const tx = db.transaction(storeName, mode)
    tx.onerror = (e) => console.error("Error en transacción:", e)
    return tx
}

// guardar datos en la base de datos
export const guardarDatos = async (datos, storeName) => {
    const tx = obtenerTransaccion(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    // const request = store.put(datos)
    const request = store.add(datos)
    request.onsuccess = () => resolve(request.result)
    request.onerror = (e) => reject(e)
}

// Obtener todos los datos de una tabla
export const obtenerDatos = async (storeName) => {
    const tx = obtenerTransaccion(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = (e) => reject(e)
}

// === Tablas de la base de datos === //
const tableCharacters = (table) => {
    // Creamos el almacén con un id autoincremental
    const store = table.createObjectStore('characters', { keyPath: 'id', autoIncrement: true })
    // Creamos los índices
    store.createIndex("name", "name", { unique: true })
    store.createIndex("img", "img", { unique: false })
    store.createIndex("buffs", "buffs", { unique: false })
    store.createIndex("relics", "relics", { unique: false })
}

const tableTeams = (table) => {
    // Creamos el almacén con un id autoincremental
    const store = table.createObjectStore('teams', { keyPath: 'id', autoIncrement: true })
    // Creamos los índices
    store.createIndex("name", "name", { unique: true })
    store.createIndex("characters", "characters", { unique: false })
}

