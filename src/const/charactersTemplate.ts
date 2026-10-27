import type { Character } from "@/schema/character"

export const characterDefault: Character = {
    name: '',
    atq: "",
    lvl: "80",
    hp: "",
    vel: "",
    def: "",
    // offensiveStat: "",
    lightCone: "",
    maxEnergy: "",
    image: null,
}

/** Devuelve siempre un objeto nuevo para no compartir estado entre sesiones. */
export const createDefaultCharacter = (): Character => ({ ...characterDefault })