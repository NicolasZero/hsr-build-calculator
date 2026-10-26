export interface Character {
    id?: number;
    name: string;
    atq: number | string;
    lvl: number | string;
    hp: number | string;
    vel: number | string;
    def: number | string;
    // offensiveStat: '' | 'ATQ' | 'HP' | 'DEF';
    lightCone: string;
    maxEnergy: number | string;
    image: Blob | null;
}