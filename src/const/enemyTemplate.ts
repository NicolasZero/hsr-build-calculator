import type { EnemyData } from "@/schema/enemyData";

export const enemyTemplate: EnemyData = {
    name: "",
    lvl: 1,
    toughnessBroken: false,
    elementalResistance: {
        "physical": 0,
        "ice": 20,
        "fire": 20,
        "wind": 20,
        "lightning": 20,
        "quantum": 20,
        "imaginary": 20,
    },
    weakness: "physical",
    weaknesses: ["physical"],
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
        "physical": 0,
        "ice": 20,
        "fire": 20,
        "wind": 20,
        "lightning": 20,
        "quantum": 20,
        "imaginary": 20,
    },
    weakness: "physical",
    weaknesses: ["physical"],
    mitigation: 0,
    defenseReduction: 0,
    vulnerability: 0
}