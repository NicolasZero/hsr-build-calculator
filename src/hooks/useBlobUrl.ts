import { useEffect, useState } from "react"

interface BlobUrlEntry {
    blob: Blob
    url: string
}

/**
 * Crea una URL de objeto para un Blob y la revoca al cambiar el Blob o al
 * desmontar el componente.
 *
 * La URL se crea dentro del efecto a propósito: en `StrictMode` React ejecuta
 * montar → limpiar → montar, y si la URL se creara en render/memo la limpieza
 * la revocaría dejando el `<img>` apuntando a una URL inválida. Creándola en
 * cada montaje, el segundo montaje genera una URL nueva y válida.
 */
export function useBlobUrl(blob: Blob | null | undefined): string | null {
    const [entry, setEntry] = useState<BlobUrlEntry | null>(null)

    useEffect(() => {
        if (!blob) return

        const url = URL.createObjectURL(blob)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- la URL solo puede crearse tras el montaje
        setEntry({ blob, url })

        return () => {
            URL.revokeObjectURL(url)
            setEntry((current) => (current?.url === url ? null : current))
        }
    }, [blob])

    // Nunca devolvemos una URL de un Blob anterior (se mostraría la imagen
    // equivocada mientras el efecto del nuevo Blob todavía no ha corrido).
    return blob && entry?.blob === blob ? entry.url : null
}
