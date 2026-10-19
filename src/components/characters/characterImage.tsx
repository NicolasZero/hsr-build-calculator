import { useEffect, useState } from "react"
import { UserCircleIcon } from "@phosphor-icons/react"

export default function CharacterImage({
    image,
    name,
    className,
}: {
    image: Blob | null | undefined
    name: string
    className: string
}) {
    const [imageSource, setImageSource] = useState<{ image: Blob; url: string } | null>(null)

    useEffect(() => {
        if (!image) return

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setImageSource({ image, url: reader.result })
            }
        }
        reader.onerror = () => console.error("Error al cargar la imagen del personaje:", reader.error)
        reader.readAsDataURL(image)

        return () => {
            if (reader.readyState === FileReader.LOADING) reader.abort()
        }
    }, [image])

    const imageUrl = image && imageSource?.image === image ? imageSource.url : null

    return imageUrl ? (
        <img src={imageUrl} alt={name} className={className} />
    ) : (
        <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
            <UserCircleIcon size={56} />
        </div>
    )
}