import { UserCircleIcon } from "@phosphor-icons/react"
import { useBlobUrl } from "@/hooks/useBlobUrl"

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

    return imageUrl ? (
        <img src={imageUrl} alt={name} className={className} />
    ) : (
        <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
            <UserCircleIcon size={56} />
        </div>
    )
}
