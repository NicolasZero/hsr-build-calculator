import type { Element } from "@/schema/statsData"

export const ELEMENTS: Element[] = [
    "FISICO",
    "HIELO",
    "FUEGO",
    "VIENTO",
    "RAYO",
    "CUANTICO",
    "IMAGINARIO"
]

export const ELEMENT_MULTI: Record<Element, number> = {
    "FISICO": 2,
    "HIELO": 1,
    "FUEGO": 2,
    "VIENTO": 1.5,
    "RAYO": 1,
    "CUANTICO": 0.5,
    "IMAGINARIO": 0.5
}