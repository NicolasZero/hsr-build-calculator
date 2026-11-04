import { UserCircleIcon } from "@phosphor-icons/react"
import { useBlobUrl } from "@/hooks/useBlobUrl"
import PreviewImage from "@/components/general/previewImg"
import { useState } from "react"

export default function CharacterImage({
    image,
    name,
    className,
}: {
    image: Blob | null | undefined
    name: string
    className: string
}) {
    const imageUrl = useBlobUrl(image)
    const [openModal, setOpenModal] = useState(false)

    return imageUrl ? (
        <>
            <img src={imageUrl} alt={name} className={className} onClick={() => setOpenModal(true)} />
            <PreviewImage
                open={openModal}
                onOpenChange={setOpenModal}
                image={imageUrl}
            />
        </>
    ) : (
        <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
            <UserCircleIcon size={56} />
        </div>
    )
}
