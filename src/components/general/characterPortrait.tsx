import { useState } from "react"
import type { SavedCharacterBuild } from "@/lib/indexedDB"
import { UserCircleIcon } from "@phosphor-icons/react"
import PreviewImage from "@/components/general/previewImg"
import { useBlobUrl } from "@/hooks/useBlobUrl"

interface Props {
    build: SavedCharacterBuild | null
    onClick?: () => void
    className?: string
}

export default function CharacterPortrait({ build, onClick, className }: Props) {
    const [open, setOpen] = useState(false)
    const imageUrl = useBlobUrl(build?.character?.image)

    return (
        <div className={`${className} overflow-hidden border bg-muted`}>
            <PreviewImage
                open={open}
                onOpenChange={setOpen}
                image={imageUrl}
            />
            {imageUrl ? (
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