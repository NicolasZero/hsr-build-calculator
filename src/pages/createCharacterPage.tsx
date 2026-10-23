import { useState, lazy } from 'react'
import { useTeam } from '@/contexts/teamContext'
import { validation } from '@/utils/validation'
import { FolderOpenIcon, PlusIcon, FloppyDiskIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import StatusAlerts, { useStatusAlerts } from '@/components/general/statusAlerts'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next';

// import LoadCharacterModal from '@/components/characterBuilder/loadCharacterModal'

const CharacterSelector = lazy(() => import('@/components/characterBuilder/imageSelector'))
const BaseStats = lazy(() => import('@/components/characterBuilder/baseStats'))
const RelicSelector = lazy(() => import('@/components/characterBuilder/relicSelector'))
const TotalStats = lazy(() => import('@/components/characterBuilder/characterStats'))
const BuffsSelector = lazy(() => import('@/components/characterBuilder/buffsSelector'))

export default function TeamBuilderPage() {
    const navigate = useNavigate()
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const { showSuccess, showError, alertProps } = useStatusAlerts()
    const { t } = useTranslation('builder');

    const {
        character,
        characterId,
        editCharacter,
        setRelics,
        saveCharacter,
        savedCharacters,
        resetCharacter,
    } = useTeam()

    type SaveType = 'update' | 'saved_new' | 'create'

    const handleSave = async (saveType: SaveType = 'update') => {
        const { isValid, errors } = validation(character)

        if (!isValid) {
            showError(errors)
            return
        }

        setIsSaving(true)

        try {
            const res = await saveCharacter(saveType === 'saved_new')
            if (res.success) {
                showSuccess(
                    saveType === 'saved_new'
                        ? t('alerts.character_saved_new', { name: character.name })
                        : saveType === 'update'
                            ? t('alerts.character_updated', { name: character.name })
                            : t('alerts.character_saved', { name: character.name })
                )
            } else {
                showError(t('alerts.character_error'))
            }
        } catch {
            showError(t('alerts.character_error'))
        } finally {
            setIsSaving(false)
        }
    }

    const handleNewCharacter = () => {
        resetCharacter()
        showSuccess(t('alerts.character_reset'))
    }

    return (
        <main className='flex flex-col gap-6 p-4 md:px-8 max-w-7xl mx-auto w-full'>
            <StatusAlerts {...alertProps} />

            {/* Barra superior de gestión y carga de personajes */}
            <section className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border'>
                <div>
                    <h1 className='text-2xl font-bold text-primary dark:text-cyan-500'>
                        {t('builder.title')}
                    </h1>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                        {t('builder.description')}
                    </p>
                </div>

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
                            <span className='ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-semibold dark:bg-cyan-500/15 bg-primary/15 text-primary dark:text-cyan-500'>
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
                        <span>{t('buttons.new')}</span>
                    </Button>
                </div>
            </section>

            {/* Formulario principal */}
            <section className='grid grid-cols-1 md:grid-cols-[300px_minmax(100px,1fr)] bg-muted/40 px-4 py-2.5 rounded-2xl border gap-6'>
                <CharacterSelector onChange={editCharacter} />
                <BaseStats handleChange={editCharacter} />
            </section>

            <section className='bg-muted/40 px-4 py-2.5 rounded-2xl border'>
                <RelicSelector onChange={setRelics} />
            </section>

            <section className='bg-muted/40 px-4 py-2.5 rounded-2xl border'>
                <BuffsSelector />
            </section>

            <section className='bg-muted/40 px-4 py-2.5 rounded-2xl border'>
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