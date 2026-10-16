import { useState, lazy } from 'react'
import { useTeam } from '@/contexts/teamContext'
import { validation } from '@/utils/validation'
import { FolderOpenIcon, PlusIcon, FloppyDiskIcon, CheckCircleIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import LoadCharacterModal from '@/components/characterBuilder/loadCharacterModal'

const CharacterSelector = lazy(() => import('@/components/characterBuilder/imageSelector'))
const BaseStats = lazy(() => import('@/components/characterBuilder/baseStats'))
const RelicSelector = lazy(() => import('@/components/characterBuilder/relicSelector'))
const TotalStats = lazy(() => import('@/components/characterBuilder/totalStats'))
const BuffsSelector = lazy(() => import('@/components/characterBuilder/buffsTable/buffsSelector'))

export default function TeamBuilderPage() {
    const [error, setError] = useState<string[]>([])
    const [message, setMessage] = useState<string>('')
    const [openLoadModal, setOpenLoadModal] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const {
        character,
        characterId,
        editCharacter,
        setRelics,
        saveCharacter,
        savedCharacters,
        resetCharacter,
    } = useTeam()

    const handleSave = async (asNew: boolean = false) => {
        const { isValid, errors } = validation(character)

        if (!isValid) {
            setError(errors)
            setMessage('')
            return
        }

        setIsSaving(true)
        setError([])

        try {
            const res = await saveCharacter(asNew)
            if (res.success) {
                setMessage(
                    asNew
                        ? `¡"${character.name}" se guardó como un nuevo registro!`
                        : `¡"${character.name}" se actualizó correctamente!`
                )
            } else {
                setError([res.error || 'Ocurrió un error al guardar el personaje'])
            }
        } catch {
            setError(['Error inesperado al guardar el personaje'])
        } finally {
            setIsSaving(false)
        }
    }

    const handleNewCharacter = () => {
        resetCharacter()
        setError([])
        setMessage('Formulario reiniciado para un nuevo personaje.')
    }

    return (
        <main className='flex flex-col gap-6 p-4 md:px-8 max-w-7xl mx-auto w-full'>
            {/* Mensajes de error o éxito */}
            <div className='flex flex-col gap-2'>
                {error.length > 0 && (
                    <div className='flex flex-col gap-1 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
                        {error.map((err, index) => (
                            <div key={index} className='flex items-center gap-2 font-medium'>
                                <WarningCircleIcon size={16} className='shrink-0' />
                                <span>{err}</span>
                            </div>
                        ))}
                    </div>
                )}

                {message && (
                    <div className='flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium'>
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon size={18} className='shrink-0' />
                            <span>{message}</span>
                        </div>
                        <button onClick={() => setMessage(null)} className="cursor-pointer p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <XIcon size={18} className='shrink-0' />
                        </button>
                    </div>
                )}
            </div>

            {/* Barra superior de gestión y carga de personajes */}
            <section className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border'>
                <div>
                    <h1 className='text-2xl font-bold text-primary dark:text-fuchsia-500'>
                        Constructor de Personaje
                    </h1>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                        Configura atributos base, artefactos y mejoras para calcular el rendimiento total.
                    </p>
                </div>

                <div className='flex items-center gap-2.5 flex-wrap'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => setOpenLoadModal(true)}
                        className='flex items-center gap-2 relative shadow-xs'
                    >
                        <FolderOpenIcon size={18} />
                        <span>Cargar Personaje</span>
                        {savedCharacters.length > 0 && (
                            <span className='ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-semibold bg-primary/15 text-primary dark:text-fuchsia-400'>
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
                        <span>Nuevo</span>
                    </Button>
                </div>
            </section>

            {/* Banner de estado: Personaje cargado / editando */}
            {/* {characterId && (
                <div className='flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-sm'>
                    <div className='flex items-center gap-2 text-primary dark:text-fuchsia-400 font-medium'>
                        <span className='w-2 h-2 rounded-full bg-primary animate-pulse' />
                        <span>
                            Editando registro guardado: <strong>{character.name || 'Sin nombre'}</strong>
                        </span>
                    </div>
                    <button
                        type='button'
                        onClick={handleNewCharacter}
                        className='text-xs underline hover:text-primary transition-colors cursor-pointer text-muted-foreground'
                    >
                        Crear nuevo en su lugar
                    </button>
                </div>
            )} */}

            {/* Formulario principal */}
            <section className='grid grid-cols-1 md:grid-cols-[300px_minmax(100px,1fr)] bg-muted/40 px-4 py-2.5 rounded-2xl border border-primary/20 gap-6'>
                <CharacterSelector onChange={editCharacter} />
                <BaseStats handleChange={editCharacter} />
            </section>

            <section className='bg-muted/40 px-4 py-2.5 rounded-2xl border border-primary/20'>
                <RelicSelector onChange={setRelics} />
            </section>

            <section className='bg-muted/40 px-4 py-2.5 rounded-2xl border border-primary/20'>
                <BuffsSelector />
            </section>

            <section className='bg-muted/40 px-4 py-2.5 rounded-2xl border border-primary/20'>
                <TotalStats />
            </section>

            {/* Botones de acción inferior */}
            <section className='flex items-center justify-end gap-3 pt-2 pb-6 flex-wrap'>
                {characterId ? (
                    <>
                        <Button
                            type='button'
                            variant='outline'
                            disabled={isSaving}
                            onClick={() => handleSave(true)}
                            className='flex items-center gap-2 rounded-full px-5'
                        >
                            <PlusIcon size={18} />
                            <span>Guardar como Nuevo</span>
                        </Button>

                        <Button
                            type='button'
                            disabled={isSaving}
                            onClick={() => handleSave(false)}
                            className='flex items-center gap-2 rounded-full px-6 font-semibold shadow-md'
                        >
                            <FloppyDiskIcon size={18} />
                            <span>{isSaving ? 'Guardando...' : 'Actualizar Personaje'}</span>
                        </Button>
                    </>
                ) : (
                    <Button
                        type='button'
                        disabled={isSaving}
                        onClick={() => handleSave(false)}
                        className='flex items-center gap-2 rounded-full px-6 font-semibold shadow-md'
                    >
                        <FloppyDiskIcon size={18} />
                        <span>{isSaving ? 'Guardando...' : 'Guardar Personaje'}</span>
                    </Button>
                )}
            </section>

            {/* Modal para cargar personajes de IndexedDB */}
            <LoadCharacterModal
                open={openLoadModal}
                onOpenChange={setOpenLoadModal}
                onLoaded={(name) => {
                    setError([])
                    setMessage(`Personaje "${name}" cargado exitosamente.`)
                }}
            />
        </main>
    )
}