import { useState, type ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon, ImageIcon } from "@phosphor-icons/react";
// import { cn } from '@/lib/utils';

interface ImageUploaderProps {
    name: string;
    label?: string;
    className?: string;
}

export function ImageUploader(
    {
        name,
        label = "Haz clic para subir",
        className,
    }: ImageUploaderProps
) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen válido.');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
    };

    return (
        <figure className={className}>
            {!selectedImage ? (
                // <figure className="flex items-center justify-center w-full">
                <label
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
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
                // </figure>
            ) : (
                // preview de la imagen
                <div className="relative mt-2">

                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full border-muted-foreground text-muted-foreground hover:text-muted-foreground"
                        onClick={removeImage}
                    >
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </figure>
    );
}