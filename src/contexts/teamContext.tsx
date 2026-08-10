import { createContext, useContext, useState, type Dispatch, type SetStateAction, useEffect } from "react";
import type { Character } from "@/schema/character";
import type { BuffData } from "@/schema/buffData";
import { initDB, guardarDatos } from '@/lib/indexedDB'
// import { charactersDefault } from '@/const/charactersTemplate'
import { characterDefault } from '@/const/charactersTemplate'


interface props {
    children: React.ReactNode
}

interface context {
    character: Character
    setCharacter: Dispatch<SetStateAction<Character>>
    // selectedCharacter: string
    editCharacter: (target: { name: string, value: string | number | boolean | File | Blob | null }) => void
    // setSelectedCharacter: (character: string) => void
    saveCharacter: (character: Character) => void
    buffs: BuffData[]
    setBuffs: Dispatch<SetStateAction<BuffData[]>>
}

export const TeamContext = createContext<context | null>(null)

export function useTeam() {
    const contextValue = useContext(TeamContext)
    if (!contextValue) {
        throw new Error("useTeam must be used within a TeamProvider")
    }
    return contextValue
}

export function TeamProvider({ children }: props) {
    const [character, setCharacter] = useState<Character>(characterDefault)
    // const [selectedCharacter, setSelectedCharacter] = useState<string>('character1')
    const [buffs, setBuffs] = useState<BuffData[]>([])

    useEffect(() => {
        // initDB()
    }, [])

    const editCharacter = (target: { name: string, value: string | number | boolean }) => {
        const { name, value } = target;

        // console.log("name: " + name + ", value: " + value)
        setCharacter((prev: Character) => ({
            ...prev,
            [name]: value,
        }));
    }

    const saveCharacter = async (character: Character) => {
        await guardarDatos(character, "characters")
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
        // <TeamContext.Provider value={{ team, setTeam, editCharacter, selectedCharacter, setSelectedCharacter, buffs, setBuffs }}>
        <TeamContext.Provider value={{ character, setCharacter, editCharacter, saveCharacter, buffs, setBuffs }}>
            {children}
        </TeamContext.Provider>
    )
}