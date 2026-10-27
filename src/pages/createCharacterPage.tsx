import { useState, lazy } from 'react'
import { useCharacter, useTeam } from '@/contexts/teamContext'
import { validation } from '@/utils/validation'
import { FolderOpenIcon, PlusIcon, FloppyDiskIcon, PencilIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next';
import { toast } from "sonner"

const BaseData = lazy(() => import('@/components/characterBuilder/baseData'))
const RelicSelector = lazy(() => import('@/components/characterBuilder/relicSelector'))
const TotalStats = lazy(() => import('@/components/characterBuilder/characterStats'))
const BuffsSelector = lazy(() => import('@/components/characterBuilder/buffsSelector'))

export default function TeamBuilderPage() {
    const navigate = useNavigate()
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const { t } = useTranslation('builder');

    const {
        character,
        characterId,
        saveCharacter,
        resetCharacter,
    } = useCharacter()
    const { savedCharacters } = useTeam()

    type SaveType = 'update' | 'saved_new' | 'create'

    const handleSave = async (saveType: SaveType = 'update') => {
        const { isValid, errors } = validation(character)

        if (!isValid) {
            toast.error(t('alerts.character_error'), {
                description: errors,
            })
            return
        }

        setIsSaving(true)

        try {
            const res = await saveCharacter(saveType === 'saved_new')
            if (res.success) {
                toast.success(
                    saveType === 'saved_new'
                        ? t('alerts.character_saved_new', { name: character.name })
                        : saveType === 'update'
                            ? t('alerts.character_updated', { name: character.name })
                            : t('alerts.character_saved', { name: character.name })
                )
            } else {
                toast.error(t('alerts.character_error'))
            }
        } catch {
            toast.error(t('alerts.character_error'))
        } finally {
            setIsSaving(false)
        }
    }

    const handleNewCharacter = () => {
        resetCharacter()
        toast.success(t('alerts.character_reset'))
    }

    return (
        <main className='flex flex-col gap-6 mt-4 px-4 md:px-8 max-w-7xl mx-auto w-full'>
            {/* Barra superior de gestión y carga de personajes */}
            <header className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/40 border'>
                <section>
                    <div className="flex items-center gap-2 mb-1 text-2xl">
                        <PencilIcon className="text-primary" />
                        <h2 className=" font-semibold">{t('builder.title')}</h2>
                    </div>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                        {t('builder.description')}
                    </p>
                </section>

                <div className='flex items-center gap-2.5 flex-wrap'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => navigate("/characters")}
                        className='flex items-center gap-2 relative shadow-xs'
                    >
                        <FolderOpenIcon size={18} />
                        <span>{t('buttons.load')}</span>
                        {savedCharacters.length > 0 && (
                            <span className='ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-semibold dark:bg-cyan-950 bg-purple-100 text-primary '>
                                {savedCharacters.length}
                            </span>
                        )}
                    </Button>

                    <Button
                        type='button'
                        variant='ghost'
                        onClick={handleNewCharacter}
                        className='flex items-center gap-1.5 text-muted-foreground hover:text-foreground'
                    >
                        <PlusIcon size={16} />
                        <span>{t('buttons.newCharacter')}</span>
                    </Button>
                </div>
            </header>

            {/* Formulario principal */}
            <BaseData />

            <section className='bg-muted/40 px-4 py-2 border'>
                <RelicSelector />
            </section>

            <section className='bg-muted/40 px-4 py-2 border'>
                <BuffsSelector />
            </section>

            <section className='bg-muted/40 px-4 py-2 border'>
                <TotalStats />
            </section>

            {/* Botones de acción inferior */}
            <section className='flex items-center justify-end gap-3 flex-wrap'>
                {characterId ? (
                    <>
                        <Button
                            type='button'
                            variant='outline'
                            disabled={isSaving}
                            onClick={() => handleSave('saved_new')}
                            className='px-5'
                        >
                            <PlusIcon size={18} />
                            <span>{t('buttons.saveNew')}</span>
                        </Button>

                        <Button
                            type='button'
                            disabled={isSaving}
                            onClick={() => handleSave('update')}
                            className='px-6 font-semibold shadow-md'
                        >
                            <FloppyDiskIcon size={18} />
                            <span>{isSaving ? t('buttons.saveLoading') : t('buttons.update')}</span>
                        </Button>
                    </>
                ) : (
                    <Button
                        type='button'
                        disabled={isSaving}
                        onClick={() => handleSave('create')}
                        className='px-6 font-semibold shadow-md'
                    >
                        <FloppyDiskIcon size={18} />
                        <span>{isSaving ? t('buttons.saveLoading') : t('buttons.save')}</span>
                    </Button>
                )}
            </section>
        </main>
    )
}