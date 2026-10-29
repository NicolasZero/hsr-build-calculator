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
    vulnerability: 0
}

export const enemyDefault: EnemyData = {
    name: "Enemigo Generico",
    lvl: 95,
    maxHP: 438100,
    hp: 438100,
    maxToughness: 720,
    toughness: 720,
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
    vulnerability: 0
}