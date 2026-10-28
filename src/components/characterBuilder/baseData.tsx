import { useCharacter } from "@/contexts/teamContext"
import { Input } from "@/components/ui/input"
import { useTranslation } from 'react-i18next';
import { ImageUploader } from '@/components/general/imageUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ELEMENTS } from "@/const/element";


export default function BaseStats() {
    const { character, editCharacter } = useCharacter()
    const { t } = useTranslation('builder');

    return (
        <section className="bg-muted/40 px-4 py-2 border flex flex-col sm:flex-row gap-4">

            <div className='w-full max-w-sm '>
                <h2 className='font-semibold text-xl text-primary'>{t('baseStats.dataBasic')}</h2>

                <ImageUploader name='character_img' label={t('placeholders.uploadImg')} image={character.image} onChange={editCharacter} />

                <label className="text-sm block mt-2">{t('placeholders.nameCharacter')}
                    <Input
                        type="text"
                        name="name"
                        value={character.name}
                        onChange={(e) => editCharacter(e.target)}
                        placeholder={t('placeholders.nameCharacter')}
                        autoComplete='off'
                    />
                </label>
            </div>

            <div className='w-full grid grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='col-span-full'>
                    <h2 className='font-semibold text-xl text-primary'>{t('baseStats.stats')}</h2>
                    <p className="text-muted-foreground text-sm">{t('baseStats.description')}</p>
                </div>

                <label className="text-sm md:col-span-2">Cono de luz (opcional)
                    <Input name="lightCone" value={character.lightCone} type="text" placeholder="Cono de luz" onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">Elemento
                    <Select onValueChange={(value) => editCharacter({ name: 'element', value })} value={character.element || ''}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Elemento" />
                        </SelectTrigger>
                        <SelectContent>
                            {ELEMENTS.map((element) => (
                                <SelectItem key={element} value={element}>
                                    {/* <ElementIcon element={element} /> */}
                                    {element}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>

                <label className="text-sm">HP Base
                    <Input name="hp" value={character.hp} type="number" placeholder="HP" min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">ATQ Base
                    <Input name="atq" value={character.atq} type="number" placeholder="ATQ" min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">DEF Base
                    <Input name="def" value={character.def} type="number" placeholder="DEF" min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">VEL Base
                    <Input name="vel" value={character.vel} type="number" placeholder="VEL" min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">
                    <span>Energía Máxima</span>
                    <Input name="maxEnergy" value={character.maxEnergy} type="number" placeholder="Energía" min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">
                    <span>Nivel</span>
                    <Input name="lvl" value={character.lvl} type="number" placeholder="Nivel" min={0} max={90} onChange={(e) => editCharacter(e.target)} />
                </label>
                {/* <p className='text-center mt-3 text-muted-foreground'>Nota: Otras stats ofensivas seran agregadas en un futuro</p> */}
            </div>
        </section>
    )
}