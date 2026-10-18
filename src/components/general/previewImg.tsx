
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { XIcon } from "@phosphor-icons/react"

export default function PreviewImage({
    open,
    onOpenChange,
    image,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    image: string | null
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className=" shadow-2xl p-0 sm:max-w-[80vw]"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">
                    Vista previa de la imagen
                </DialogTitle>

                <DialogDescription className="sr-only">
                    Vista ampliada de la imagen seleccionada.
                </DialogDescription>

                <Button
                    variant="secondary"
                    type="button"
                    size="icon"
                    aria-label="Cerrar vista previa"
                    onClick={() => onOpenChange(false)}
                    className="absolute right-3 top-3 z-10 h-9 w-9"
                >
                    <XIcon className="h-5 w-5" />
                </Button>

                {image ? (
                    <div className="flex h-[80vh] max-h-full w-full items-center justify-center">
                        <img
                            src={image}
                            alt="Vista previa"
                            className="block max-h-full max-w-full select-none object-contain"
                        />
                    </div>
                ) : (
                    <div className="space-y-1">
                        <p className="font-medium ">
                            Imagen no disponible
                        </p>
                        <p className="text-sm">
                            No se encontró una imagen para mostrar.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}