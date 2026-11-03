import type { AttackTarget, AttackType } from "@/schema/statsData"

export const attackTarget: AttackTarget[] = [
    "single", "blast", "aoe", "bounce"
]

export const attackType: AttackType[] = [
    "basic", "skill", "ultimate", "followUp"
]