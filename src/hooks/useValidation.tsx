import { useState, useEffect } from 'react'

export default function useValidation() {
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const validation = (character: any) => {
        if (!character.image) return setError('La imagen del personaje no puede estar en blanco')
        if (character.name === "") return setError('El nombre del personaje no puede estar en blanco')
        if (character.atq === "") return setError('El ATQ del personaje no puede estar en blanco')
        // if (character.element === "") return setError('El elemento del personaje no puede estar en blanco')
        // if (character.path === "") return setError('El camino del personaje no puede estar en blanco')
        if (character.hp === "") return setError('El HP del personaje no puede estar en 0')
        if (character.offensiveStat === '') return setError('Debe seleccionar una estadistica ofensiva')
        if (character.vel === "") return setError('La VEL del personaje no puede estar en 0')
        if (character.def === "") return setError('La DEF del personaje no puede estar en 0')
        if (character.lvl === "") return setError('El nivel del personaje no puede estar en 0')
        setMessage('Personaje validado correctamente')
        return true
    }

    useEffect(() => {
        let errorTimeout: ReturnType<typeof setTimeout>;
        let messageTimeout: ReturnType<typeof setTimeout>;

        if (error) {
            errorTimeout = setTimeout(() => {
                setError('');
            }, 2000);
        }

        if (message) {
            messageTimeout = setTimeout(() => {
                setMessage('');
            }, 2000);
        }

        // ✅ Esto limpia los temporizadores viejos si el componente se desmonta o las dependencias cambian
        return () => {
            clearTimeout(errorTimeout);
            clearTimeout(messageTimeout);
        };
    }, [error, message])

    return {
        validation,
        error,
        message
    }
}