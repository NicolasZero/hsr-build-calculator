import type { SavedCharacterBuild } from "@/lib/indexedDB"

/**
 * El nombre canónico vive en `build.name`; `build.character.name` se mantiene
 * sincronizado al leer/escribir en IndexedDB por compatibilidad con datos antiguos.
 */
export const getCharacterName = (
    build: Pick<SavedCharacterBuild, "name" | "character">
): string => build.name?.trim() || build.character?.name?.trim() || "Personaje"

/** Clave normalizada para comparar personajes y evitar duplicados en el equipo. */
export const getCharacterKey = (build: Pick<SavedCharacterBuild, "name" | "character">): string =>
    getCharacterName(build).toLocaleLowerCase()

/** Clave normalizada a partir de un nombre suelto. */
export const getNameKey = (name: string): string => name.trim().toLocaleLowerCase()

export const formatDateTime = (timestamp?: number, fallback = "Fecha no disponible"): string => {
    if (!timestamp) return fallback
    return new Date(timestamp).toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}
