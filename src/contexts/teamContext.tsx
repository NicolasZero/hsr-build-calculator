import { createContext, useState, type Dispatch, type SetStateAction } from "react";
import type { Characters } from "@/schema/character";
import type { BuffData } from "@/schema/buffData";
import { charactersDefault } from '@/const/charactersTemplate'

interface props {
    children: React.ReactNode
}

interface context {
    team: Characters
    setTeam: Dispatch<SetStateAction<Characters>>
    selectedCharacter: string
    editCharacter: (target: { name: string, value: string | number | boolean, characterId: string }) => void
    setSelectedCharacter: (character: string) => void
    buffs: BuffData[]
    setBuffs: Dispatch<SetStateAction<BuffData[]>>
}

export const TeamContext = createContext<context | null>(null)

export function TeamProvider({ children }: props) {
    const [team, setTeam] = useState<Characters>(charactersDefault)
    const [selectedCharacter, setSelectedCharacter] = useState<string>('character1')
    const [buffs, setBuffs] = useState<BuffData[]>([])

    const editCharacter = (target: { name: string, value: string | number | boolean, characterId: string }) => {
        const { name, value, characterId } = target;

        setTeam((prev: Characters) => ({
            ...prev,
            [characterId]: {
                ...prev[characterId],
                [name]: value,
            },
        }));
    }

    // const removeCharacter = (character: Character) => {
    //     setTeam(team.filter((c) => c.name !== character.name))
    // }

    // const selectPlayer = (character: Character) => {
    //     setSelectedPlayer(character)
    // }

    // const unselectPlayer = () => {
    //     setSelectedPlayer(null)
    // }



    return (
        <TeamContext.Provider value={{ team, setTeam, editCharacter, selectedCharacter, setSelectedCharacter, buffs, setBuffs }}>
            {children}
        </TeamContext.Provider>
    )
}