import { useState, useEffect, type ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon, ImageIcon } from "@phosphor-icons/react";
import PreviewImage from "@/components/general/previewImg"

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
    const [previewOverride, setPreviewOverride] = useState<string | null>(null);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        setPreviewOverride(null);

        if (!image) {
            setObjectUrl(null);
            return;
        }

        const url = URL.createObjectURL(image);
        setObjectUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [image]);

    const selectedImage = previewOverride ?? objectUrl;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen válido.');
                return;
            }

            const previewReader = new FileReader();
            previewReader.onload = () => {
                setPreviewOverride(previewReader.result as string);
            };
            previewReader.readAsDataURL(file);

            const arrayBufferReader = new FileReader()
            arrayBufferReader.onload = () => {
                if (arrayBufferReader.result) {
                    const blob = new Blob([arrayBufferReader.result as ArrayBuffer], { type: file.type });
                    onChange({ name: 'image', value: blob });
                }
            }

            arrayBufferReader.readAsArrayBuffer(file);
        }
    };

    const removeImage = () => {
        setPreviewOverride(null);
        setObjectUrl(null);
        onChange({ name: 'image', value: null });
    };

    const [openModal, setOpenModal] = useState(false)
    return (

        <figure className={className}>
            {!selectedImage ? (
                <label
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed  cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
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
                        className="w-full h-48 object-cover border"
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