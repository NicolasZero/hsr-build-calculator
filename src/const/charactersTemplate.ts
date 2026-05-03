export interface CharacterTemplate {
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
    character1: CharacterTemplate;
    character2: CharacterTemplate;
    character3: CharacterTemplate;
    character4: CharacterTemplate;
}

export const charactersDefault: Characters = {
    character1: {
        name: '',
        img: '',
        statBase: '',
        statTotal: '',
        velBase: '',
        velTotal: '',
        nivel: '',
        offensiveStat: '',
    },
    character2: {
        name: '',
        img: '',
        statBase: '',
        statTotal: '',
        velBase: '',
        velTotal: '',
        nivel: '',
        offensiveStat: '',
    },
    character3: {
        name: '',
        img: '',
        statBase: '',
        statTotal: '',
        velBase: '',
        velTotal: '',
        nivel: '',
        offensiveStat: '',
    },
    character4: {
        name: '',
        img: '',
        statBase: '',
        statTotal: '',
        velBase: '',
        velTotal: '',
        nivel: '',
        offensiveStat: '',
    }
}