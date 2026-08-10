export interface Character {
    name: string;
    atq: string;
    lvl: string;
    hp: string;
    vel: string;
    def: string;
    offensiveStat: '' | 'ATQ' | 'HP' | 'DEF';
    image: Blob | null;
}