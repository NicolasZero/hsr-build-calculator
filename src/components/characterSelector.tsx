// // import { useState } from "react"
import { ImageUploader } from '@/components/imageUploader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { CharacterTemplate } from '@/const/charactersTemplate';

interface props {
    characterKey: string;
    character: CharacterTemplate;
    number: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, characterId: string) => void;
}

const CharacterSelector = ({
    characterKey,
    character,
    number,
    isSelected,
    onSelect,
    onChange
}: props) => {
    return (
        <div key={characterKey}>
            <div className='flex items-center justify-between'>
                <label htmlFor={characterKey}>
                    {`Personaje ${number}`}
                </label>
                <Button
                    className='bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-700'
                    onClick={() => onSelect(characterKey)}
                    disabled={isSelected}
                >
                    {isSelected ? 'Seleccionado' : 'Seleccionar'}
                </Button>
            </div>

            <ImageUploader name={characterKey + '-img'} />

            <Input
                id={characterKey}
                type="text"
                name="name"
                value={character.name}
                onChange={(e) => onChange(e, characterKey)}
                placeholder="Nombre del personaje"
                className='mt-2'
                autoComplete='off'
            />
        </div>
    );
};

export default CharacterSelector