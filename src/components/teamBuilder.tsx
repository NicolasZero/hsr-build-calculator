import { ImageUploader } from '@/components/imageUploader'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useState } from 'react'

export default function TeamBuilder() {
    const [stat, setStat] = useState('ATQ')
    const handleSelect = (value: string) => {
        setStat(value)
    }
    return (
        <form method='POST' className='flex flex-col gap-4 p-4'>
            <fieldset className='flex items-center gap-4'>
                <label htmlFor="teamName" className='text-2xl font-bold text-center'>Team</label>
                <Input id="teamName" type="text" placeholder="Nombre del team" />
            </fieldset>

            <fieldset className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                <div>
                    <label htmlFor="selectedCharacter">Personaje principal</label>
                    <ImageUploader id="selectedCharacter" />
                    <Input id="nameSelectedCharacter" type="text" placeholder="Nombre del personaje" className='mt-2' />
                </div>

                <div>
                    <label htmlFor="character2">Personaje 2</label>
                    <ImageUploader id="character2" />
                    <Input id="nameCharacter2" type="text" placeholder="Nombre del personaje" className='mt-2' />
                </div>
                <div>
                    <label htmlFor="character3">Personaje 3</label>
                    <ImageUploader id="character3" />
                    <Input id="nameCharacter3" type="text" placeholder="Nombre del personaje" className='mt-2' />
                </div>
                <div>
                    <label htmlFor="character4">Personaje 4</label>
                    <ImageUploader id="character4" />
                    <Input id="nameCharacter4" type="text" placeholder="Nombre del personaje" className='mt-2' />
                </div>
            </fieldset>

            <h2 className=''>Stats del personaje principal</h2>
            <div className='grid grid-cols-3 gap-4'>
                {/* row 1 */}
                <Input id="statBase" type="number" placeholder={`${stat} base`} min={0} />
                <Input id="statTotal" type="number" placeholder={`${stat} total`} min={0} />
                <Select value={stat} onValueChange={handleSelect}>
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder="ATQ o HP" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ATQ">ATQ</SelectItem>
                        <SelectItem value="HP">HP</SelectItem>
                    </SelectContent>
                </Select>
                {/* row 2 */}
                <Input id="VEL_base" type="number" placeholder="VEL base" min={0} />
                <Input id="VEL_total" type="number" placeholder="VEL total" min={0} />
                <Input id="nivel" type="number" placeholder="Nivel" min={0} max={90} />
                {/* row 3 */}
                <p className='text-center col-span-3 text-muted-foreground'>Nota: Otras stats seran ingresadas en un futuro</p>

            </div>
        </form>
    )
}