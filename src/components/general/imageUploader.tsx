import { useState, useEffect, type ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon, ImageIcon } from "@phosphor-icons/react";
import PreviewImage from "@/components/general/previewImg"
import { toast } from "sonner"

interface ImageUploaderProps {
    name: string;
    label?: string;
    className?: string;
    image?: Blob | null;
    onChange: (target: { name: string, value: string | number | boolean | File | Blob | null }) => void;
}

export function ImageUploader(
    {
        name,
        label = "Haz clic para subir",
        className,
        image,
        onChange,
    }: ImageUploaderProps
) {
    const [preview, setPreview] = useState<{ image: Blob; src: string } | null>(null);

    useEffect(() => {
        if (!image) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setPreview({ image, src: reader.result });
            }
        };
        reader.onerror = () => {
            toast.error("No se pudo cargar la previsualización de la imagen.");
        };
        reader.readAsDataURL(image);

        return () => {
            reader.abort();
        };
    }, [image]);

    const selectedImage = preview && preview.image === image ? preview.src : null;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                // alert('Por favor, selecciona un archivo de imagen válido.');
                toast.error("Por favor, selecciona un archivo de imagen válido.")
                return;
            }

            onChange({ name: 'image', value: file });
        }
    };

    const removeImage = () => {
        onChange({ name: 'image', value: null });
    };

    const [openModal, setOpenModal] = useState(false)
    return (
        <figure className={className}>
            {!selectedImage ? (
                <label
                    className="flex flex-col items-center justify-center w-full sm:h-48 h-36 border-2 border-dashed cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                    <Input
                        name={name}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </label>
            ) : (
                // preview de la imagen
                <div className="relative mt-2">
                    <PreviewImage
                        open={openModal}
                        onOpenChange={setOpenModal}
                        image={selectedImage}
                    />

                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-full sm:h-48 h-36 object-cover border"
                        onClick={() => setOpenModal(true)}
                    />
                    <Button
                        variant="destructive"
                        type='button'
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7"
                        onClick={removeImage}
                    >
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </figure>
    );
}