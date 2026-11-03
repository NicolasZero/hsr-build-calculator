import { useCharacter } from "@/contexts/teamContext"
import { Input } from "@/components/ui/input"
import { useTranslation } from 'react-i18next';
import { ImageUploader } from '@/components/general/imageUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ELEMENTS } from "@/const/element";


export default function BaseStats() {
    const { character, editCharacter } = useCharacter()
    const { t } = useTranslation(['builder', 'stats']);

    return (
        <section className="bg-muted/40 px-4 py-2 border flex flex-col sm:flex-row gap-4">

            <div className='w-full max-w-sm '>
                <h2 className='font-semibold text-xl text-primary'>{t('baseStats.dataBasic')}</h2>

                <ImageUploader name='character_img' label={t('placeholders.uploadImg')} image={character.image} onChange={editCharacter} />

                <label className="text-sm block mt-2">{t('baseStats.nameCharacter')}
                    <Input
                        type="text"
                        name="name"
                        value={character.name}
                        onChange={(e) => editCharacter(e.target)}
                        placeholder={t('placeholders.name')}
                        autoComplete='off'
                    />
                </label>
            </div>

            <div className='w-full grid grid-cols-2 lg:grid-cols-3 gap-4 items-end'>
                <div className='col-span-full'>
                    <h2 className='font-semibold text-xl text-primary'>{t('baseStats.stats')}</h2>
                    <p className="text-muted-foreground text-sm">{t('baseStats.description')}</p>
                </div>

                <label className="text-sm md:col-span-2">{t('baseStats.lightCone')} ({t('optional')})
                    <Input name="lightCone" value={character.lightCone} type="text" placeholder={t('baseStats.lightCone')} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">{t('baseStats.element')}
                    <Select onValueChange={(value) => editCharacter({ name: 'element', value })} value={character.element || ''}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('baseStats.element')} />
                        </SelectTrigger>
                        <SelectContent>
                            {ELEMENTS.map((element) => (
                                <SelectItem key={element} value={element}>
                                    {t(`elements.${element}`, { ns: 'stats' })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>

                <label className="text-sm">{t('baseStats.hpBase')}
                    <Input name="hp" value={character.hp} type="number" placeholder={t('buffs.types.hpFlat', { ns: 'stats' })} min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">{t('baseStats.atkBase')}
                    <Input name="atk" value={character.atk} type="number" placeholder={t('buffs.types.atkFlat', { ns: 'stats' })} min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">{t('baseStats.defBase')}
                    <Input name="def" value={character.def} type="number" placeholder={t('buffs.types.defFlat', { ns: 'stats' })} min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">{t('baseStats.spdBase')}
                    <Input name="spd" value={character.spd} type="number" placeholder={t('buffs.types.spdFlat', { ns: 'stats' })} min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">
                    <span>{t('baseStats.maxEnergy')}</span>
                    <Input name="maxEnergy" value={character.maxEnergy} type="number" placeholder={t('baseStats.maxEnergy')} min={0} onChange={(e) => editCharacter(e.target)} />
                </label>

                <label className="text-sm">
                    <span>{t(`baseStats.level`)}</span>
                    <Input name="lvl" value={character.lvl} type="number" placeholder={t(`baseStats.level`)} min={0} max={100} onChange={(e) => editCharacter(e.target)} />
                </label>
                {/* <p className='text-center mt-3 text-muted-foreground'>Nota: Otras stats ofensivas seran agregadas en un futuro</p> */}
            </div>
        </section>
    )
}