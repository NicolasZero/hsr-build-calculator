import type { Element } from "@/schema/statsData"

export const ELEMENTS: Element[] = [
    "physical",
    "ice",
    "fire",
    "wind",
    "lightning",
    "quantum",
    "imaginary"
]

export const ELEMENT_MULTI: Record<Exclude<Element, "none">, number> = {
    "physical": 2,
    "ice": 1,
    "fire": 2,
    "wind": 1.5,
    "lightning": 1,
    "quantum": 0.5,
    "imaginary": 0.5
}