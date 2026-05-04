export interface Character {
    name: string;
    img: string;
    statBase: string;
    statTotal: string;
    velBase: string;
    velTotal: string;
    nivel: string;
    offensiveStat: '' | 'ATQ' | 'HP';
}

export interface Characters {
    [key: string]: Character;
}