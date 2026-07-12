import { Input } from '@/components/ui/input'
import Loader from '@/components/loader'
import CharacterSelector from '@/components/characterSelector'
import { useTeam } from '@/contexts/teamContext'
import BaseStats from './BaseStats'

// Dinamic import for better performance
import React, { lazy, Suspense } from 'react'

const TotalStats = lazy(() => import('./totalStats'))
const BuffsSelector = lazy(() => import('./buffsTable/buffsSelector'))

export default function TeamBuilder() {

    const { team, editCharacter, selectedCharacter, setSelectedCharacter } = useTeam()
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
        const { name, value } = e.target
        editCharacter({ name, value, characterId: characterId || selectedCharacter })
    };

    return (
        <form onSubmit={(e) => e.preventDefault()} className='flex flex-col gap-5 p-4 md:py-8 md:px-6'>
            <fieldset className='flex items-center gap-4'>
                <label htmlFor="teamName" className='md:text-nowrap'>Nombre del Team:</label>
                <Input id="teamName" type="text" placeholder="Nombre del team" />
            </fieldset>


            <fieldset className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='col-span-full'>
                    <h2 className='font-semibold text-lg text-primary dark:text-fuchsia-600'>Agrega los personajes del team</h2>
                    <p className='text-sm text-muted-foreground'>No es necesario cargar una imagen para funcionar</p>
                </div>
                {
                    Object.entries(team).map(([key, character]: any, i) => (
                        <CharacterSelector
                            key={key}
                            characterKey={key}
                            value={character.name}
                            number={i + 1}
                            isSelected={selectedCharacter === key}
                            onSelect={setSelectedCharacter}
                            onChange={handleChange}
                        />
                    ))
                }
            </fieldset>

            <fieldset>
                <BaseStats handleChange={handleChange} />
                <p className='text-center mt-3 text-muted-foreground'>Nota: Otras stats ofensivas seran agregadas en un futuro</p>
            </fieldset>

            <fieldset>
                <Suspense fallback={<Loader />}>
                    <BuffsSelector />
                </Suspense>
                {/* <p className='text-center mt-3 text-muted-foreground'>Nota: Los buffs negativos seran implementados en un futuro</p> */}
            </fieldset>

            <fieldset>
                <h2 className='font-semibold text-lg text-primary dark:text-fuchsia-600'>Stats totales de: <span className='text-secondary-foreground'>{team[selectedCharacter]?.name || 'Sin especificar'}</span></h2>
                <Suspense fallback={<Loader />}>
                    <TotalStats />
                </Suspense>
            </fieldset>
        </form>
    )
}