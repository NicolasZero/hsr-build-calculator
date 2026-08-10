import { useState, type ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon, ImageIcon } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

interface ImageUploaderProps {
    name: string;
    label?: string;
    className?: string;
    onChange: (target: { name: string, value: string | number | boolean | File | Blob | null }) => void;
}

export function ImageUploader(
    {
        name,
        label = "Haz clic para subir",
        className,
        onChange,
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

            const previewReader = new FileReader();
            previewReader.onload = () => {
                setSelectedImage(previewReader.result as string);
            };
            previewReader.readAsDataURL(file);

            const arrayBufferReader = new FileReader()
            arrayBufferReader.onload = () => {
                const blob = new Blob([arrayBufferReader.result], { type: file.type });
                onChange({ name: 'image', value: blob });
            }

            arrayBufferReader.readAsArrayBuffer(file);

        }
    };

    const removeImage = () => {
        setSelectedImage(null);
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
                    <Dialog open={openModal}>
                        <DialogContent onInteractOutside={() => setOpenModal(false)} showCloseButton={false}>
                            <DialogTitle className='hidden'>Preview</DialogTitle>
                            <DialogDescription className='hidden'>Preview</DialogDescription>
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="w-full h-full"
                            />
                        </DialogContent>
                    </Dialog>

                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-full h-48 object-cover border"
                        onClick={() => setOpenModal(true)}
                    />
                    <Button
                        variant="outline"
                        type='button'
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7 border-muted-foreground text-muted-foreground hover:text-muted-foreground"
                        onClick={removeImage}
                    >
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </figure>
    );
}