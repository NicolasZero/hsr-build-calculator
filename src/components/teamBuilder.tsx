import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

import CharacterSelector from '@/components/characterSelector'
import BuffsSelector from '@/components/buffsTable/buffsSelector'
import type { BuffData } from '@/schema/buffData'

import { charactersDefault } from '@/const/charactersTemplate'
import { type Characters } from '@/schema/character'


export default function TeamBuilder() {
    // Guardar el personaje seleccionado por el usuario
    const [characterSelected, setCharacterSelected] = useState<string>('character1')
    // Guardar los datos de los personajes del team
    const [characters, setCharacters] = useState<Characters>(charactersDefault)

    const [data, setData] = useState<BuffData[]>([])

    // Función para eliminar
    const handleDelete = (id: string) => {
        setData((prev) => prev.filter((item) => item.id !== id))
    }

    // logica para guardar los personajes en localStorage
    // useEffect(() => {
    //     localStorage.setItem('teamCharacters', JSON.stringify(characters));
    // }, [characters]);

    //     const limpiarDatos = () => {
    //     localStorage.removeItem('stats_personajes');
    //     window.location.reload(); // Recargar para volver al estado inicial
    //   };

    // Guarda los cambios realizados en los inputs en el estado characters
    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string, value: string } }, characterId: string = '') => {
        const { name, value } = e.target;
        const id = characterId || characterSelected;

        setCharacters((prev: Characters) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [name]: value,
            },
        }));
    };

    return (
        <form onSubmit={(e) => e.preventDefault()} className='flex flex-col gap-5 p-4 md:py-8 md:px-6'>
            <fieldset className='flex items-center gap-4'>
                <label htmlFor="teamName" className='text-nowrap'>Nombre del Team:</label>
                <Input id="teamName" type="text" placeholder="Nombre del team" />
            </fieldset>


            <fieldset className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='col-span-full'>
                    <h2 className='font-semibold text-lg text-primary dark:text-fuchsia-600'>Agrega los personajes de tu team</h2>
                    <p className='text-sm text-muted-foreground'>No es necesario cargar una imagen para funcionar</p>
                </div>
                {
                    Object.entries(characters).map(([key, character]: any, i) => (
                        <CharacterSelector
                            key={key}
                            characterKey={key}
                            value={character.name}
                            number={i + 1}
                            isSelected={characterSelected === key}
                            onSelect={setCharacterSelected}
                            onChange={handleChange}
                        />
                    ))
                }
            </fieldset>

            <fieldset className='grid grid-cols-3 gap-4'>
                <div className='col-span-full'>
                    <h2 className='font-semibold text-lg text-primary dark:text-fuchsia-600'>Stats de: <span className='text-secondary-foreground'>{characters[characterSelected]?.name || 'Sin especificar'}</span></h2>
                </div>
                {/* row 1 */}
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="statBase" value={characters[characterSelected]?.statBase} type="number" placeholder={`${characters[characterSelected]?.offensiveStat || 'ATQ o HP'} base`} min={0} onChange={(e) => handleChange(e)} />
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="statTotal" value={characters[characterSelected]?.statTotal} type="number" placeholder={`${characters[characterSelected]?.offensiveStat || 'ATQ o HP'} total`} min={0} onChange={(e) => handleChange(e)} />
                <Select value={characters[characterSelected]?.offensiveStat} onValueChange={(value) => { handleChange({ target: { name: 'offensiveStat', value } }) }}>
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder="ATQ o HP" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ATQ">ATQ</SelectItem>
                        <SelectItem value="HP">HP</SelectItem>
                    </SelectContent>
                </Select>
                {/* row 2 */}
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="velBase" value={characters[characterSelected]?.velBase} type="number" placeholder="VEL base" min={0} onChange={(e) => handleChange(e)} />
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="velTotal" value={characters[characterSelected]?.velTotal} type="number" placeholder="VEL total" min={0} onChange={(e) => handleChange(e)} />
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="nivel" value={characters[characterSelected]?.nivel} type="number" placeholder="Nivel" min={0} max={90} onChange={(e) => handleChange(e)} />
                {/* row 3 */}
                <p className='text-center col-span-3 text-muted-foreground'>Nota: Otras stats ofensivas seran agregadas en un futuro</p>

            </fieldset>

            <fieldset>
                <BuffsSelector data={data} setData={setData} onDelete={handleDelete} />
                <p className='text-center col-span-3 text-muted-foreground'>Nota: Los buffs negativos seran implementados en un futuro</p>
            </fieldset>

            <fieldset>
                <h2 className='font-semibold text-lg text-primary dark:text-fuchsia-600'>Calculadora de stats de: <span className='text-secondary-foreground'>{characters[characterSelected]?.name || 'Sin especificar'}</span></h2>
                <div className='bg-muted/50 rounded-lg p-4'>
                    <p>En construcción</p>
                </div>
            </fieldset>
        </form>
    )
}