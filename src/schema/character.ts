import type { Element } from "@/schema/statsData"

export interface Character {
    id?: number;
    name: string;
    atk: number | string;
    lvl: number | string;
    hp: number | string;
    spd: number | string;
    def: number | string;
    element: Element | null;
    lightCone: string;
    maxEnergy: number | string;
    image: Blob | null;
}