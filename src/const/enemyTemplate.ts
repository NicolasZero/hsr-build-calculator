import type { EnemyData } from "@/schema/enemyData";

export const enemyTemplate: EnemyData = {
    name: "",
    lvl: 1,
    toughnessBroken: false,
    elementalResistance: {
        "FISICO": 0,
        "HIELO": 20,
        "FUEGO": 20,
        "VIENTO": 20,
        "RAYO": 20,
        "CUANTICO": 20,
        "IMAGINARIO": 20,
    },
    weakness: "FISICO",
    weaknesses: ["FISICO"],
    mitigation: 0,
    defenseReduction: 0,
    defenseIgnore: 0,
    vulnerability: 0,
}

export const enemyDefault: EnemyData = {
    name: "Enemigo Generico",
    lvl: 1,
    maxHP: 1000,
    hp: 1000,
    maxToughness: 100,
    toughness: 100,
    toughnessBroken: false,
    speed: 100,
    elementalResistance: {
        "FISICO": 0,
        "HIELO": 20,
        "FUEGO": 20,
        "VIENTO": 20,
        "RAYO": 20,
        "CUANTICO": 20,
        "IMAGINARIO": 20,
    },
    weakness: "FISICO",
    weaknesses: ["FISICO"],
    mitigation: 0,
    defenseReduction: 0,
    defenseIgnore: 0,
    vulnerability: 0,
}