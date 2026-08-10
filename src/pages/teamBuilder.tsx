import { lazy } from 'react'

const CharacterSelector = lazy(() => import('@/components/characterBuilder/characterSelector'))
const BaseStats = lazy(() => import('@/components/characterBuilder/baseStats'))
const RelicSelector = lazy(() => import('@/components/characterBuilder/relicSelector'))
const TotalStats = lazy(() => import('@/components/characterBuilder/totalStats'))
const BuffsSelector = lazy(() => import('@/components/characterBuilder/buffsTable/buffsSelector'))
import { useTeam } from '@/contexts/teamContext'

export default function TeamBuilderPage() {

    const {
        // character,
        editCharacter,
    } = useTeam()


    const test = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Validar personaje
        // if (validation(character)) {
        // console.log("Valido")
        // console.log(character)
        // }
    }

    return (
        <main className='flex flex-col gap-5 p-4 md:px-6'>
            <form onSubmit={(e) => test(e)} className='grid grid-cols-1 md:grid-cols-[300px_minmax(100px,1fr)] gap-4'>

                <CharacterSelector onChange={editCharacter} />

                <BaseStats handleChange={editCharacter} />

                {/* <div className='col-span-1 md:col-span-2 flex flex-col md:flex-row items-end justify-end gap-2'>

                    {error && (
                        <p className="text-red-500 text-center">{error}</p>
                    )}

                    {message && (
                        <p className="text-green-500 text-center">{message}</p>
                    )}

                    <Button>Guardar Personaje</Button>
                </div> */}
            </form>

            <section>
                <RelicSelector />
            </section>

            <section>
                <BuffsSelector />
            </section>

            <section>
                <TotalStats />
            </section>

            {/* {character.image && (
                <img className='w-20 h-20 rounded-full object-cover' src={URL.createObjectURL(character.image)} alt="" />
            )} */}
        </main>
    )
}