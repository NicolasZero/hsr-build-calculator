import { useEffect, useState } from "react"
import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { UserCircleIcon } from "@phosphor-icons/react"
import PreviewImage from "@/components/general/previewImg"

interface Props {
    build: SavedCharacterBuild | null
    onClick?: () => void
}

export default function CharacterPortrait({ build, onClick }: Props) {
    const [open, setOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    useEffect(() => {
        const image = build?.character?.image
        if (!image) return

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") setImageUrl(reader.result)
        }
        reader.onerror = () => console.error("Error al cargar la imagen del personaje:", reader.error)
        reader.readAsDataURL(image)
        return () => {
            if (reader.readyState === FileReader.LOADING) reader.abort()
        }
    }, [build?.character?.image])

    return (
        <div className="w-24 min-h-24 md:min-h-32 h-full md:w-48 shrink-0 overflow-hidden rounded-xl border bg-muted">
            <PreviewImage
                open={open}
                onOpenChange={setOpen}
                image={imageUrl}
            />
            {imageUrl && build?.character?.image ? (
                <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onClick={() => setOpen(true)}
                />
            ) : (
                <div onClick={onClick} className="w-full h-full flex items-center justify-center cursor-pointer">
                    <UserCircleIcon size={50} className="text-muted-foreground" />
                </div>
            )}
        </div>
    )
}