import { useEffect, useState, lazy } from 'react'
import { useTeam } from '@/contexts/teamContext'
import { validation } from '@/utils/validation'
import { FolderOpenIcon, PlusIcon, FloppyDiskIcon, CheckCircleIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import LoadCharacterModal from '@/components/characterBuilder/loadCharacterModal'

const CharacterSelector = lazy(() => import('@/components/characterBuilder/imageSelector'))
const BaseStats = lazy(() => import('@/components/characterBuilder/baseStats'))
const RelicSelector = lazy(() => import('@/components/characterBuilder/relicSelector'))
const TotalStats = lazy(() => import('@/components/characterBuilder/totalStats'))
const BuffsSelector = lazy(() => import('@/components/characterBuilder/buffsSelector'))

const ALERT_DURATION = 5000

export default function TeamBuilderPage() {
    const [error, setError] = useState<string[]>([])
    const [message, setMessage] = useState<string>('')
    const [openLoadModal, setOpenLoadModal] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    useEffect(() => {
        if (error.length === 0) return

        const timeout = setTimeout(() => setError([]), ALERT_DURATION)
        return () => clearTimeout(timeout)
    }, [error])

    useEffect(() => {
        if (!message) return

        const timeout = setTimeout(() => setMessage(''), ALERT_DURATION)
        return () => clearTimeout(timeout)
    }, [message])

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
        setMessage('')

        try {
            const res = await saveCharacter(asNew)
            if (res.success) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                })
                setMessage(
                    asNew
                        ? `¡"${character.name}" se guardó como un nuevo registro!`
                        : `¡"${character.name}" se actualizó correctamente!`
                )
            } else {
                setError([res.error || 'Ocurrió un error al guardar el personaje'])
            }
        } catch {
            setMessage('')
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
            <div className='pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-auto sm:w-[calc(100vw-2rem)] sm:max-w-sm'>
                {message && (
                    <Alert className='pointer-events-auto border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                        <CheckCircleIcon />
                        <AlertTitle>Éxito</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                        <AlertAction>
                            <Button
                                type='button'
                                variant='ghost'
                                size='icon-xs'
                                onClick={() => setMessage('')}
                                aria-label='Cerrar mensaje de éxito'
                                title='Cerrar mensaje'
                            >
                                <XIcon />
                            </Button>
                        </AlertAction>
                    </Alert>
                )}

                {error.length > 0 && (
                    <Alert variant='destructive' className='pointer-events-auto'>
                        <WarningCircleIcon />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            <ul className='list-disc pl-4'>
                                {error.map((err, index) => <li key={index}>{err}</li>)}
                            </ul>
                        </AlertDescription>
                        <AlertAction>
                            <Button
                                type='button'
                                variant='ghost'
                                size='icon-xs'
                                onClick={() => setError([])}
                                aria-label='Cerrar mensaje de error'
                                title='Cerrar mensaje'
                            >
                                <XIcon />
                            </Button>
                        </AlertAction>
                    </Alert>
                )}
            </div>

            {/* Barra superior de gestión y carga de personajes */}
            <section className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border'>
                <div>
                    <h1 className='text-2xl font-bold text-primary dark:text-cyan-500'>
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
                            onClick={() => handleSave(true)}
                            className='px-5'
                        >
                            <PlusIcon size={18} />
                            <span>Guardar como Nuevo</span>
                        </Button>

                        <Button
                            type='button'
                            disabled={isSaving}
                            onClick={() => handleSave(false)}
                            className='px-6 font-semibold shadow-md'
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
                        className='px-6 font-semibold shadow-md'
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
                onLoaded={(msg) => {
                    setError([])
                    setMessage(msg)
                }}
            />
        </main>
    )
}