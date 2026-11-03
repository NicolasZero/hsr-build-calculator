import type { Character } from "@/schema/character"

export const characterDefault: Character = {
    name: '',
    atk: "",
    lvl: "80",
    hp: "",
    spd: "",
    def: "",
    element: null,
    lightCone: "",
    maxEnergy: "",
    image: null,
}

/** Devuelve siempre un objeto nuevo para no compartir estado entre sesiones. */
export const createDefaultCharacter = (): Character => ({ ...characterDefault })