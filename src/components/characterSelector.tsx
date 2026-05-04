import { ImageUploader } from '@/components/imageUploader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface props {
    characterKey: string;
    value: string;
    number: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, characterId: string) => void;
}

const CharacterSelector = ({
    characterKey,
    value,
    number,
    isSelected,
    onSelect,
    onChange
}: props) => {
    return (
        <div>
            <div className='flex items-center justify-between'>
                <label htmlFor={characterKey}>
                    {`Personaje ${number}`}
                </label>
                <Button
                    className='hover:bg-primary/80 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800'
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
                value={value}
                onChange={(e) => onChange(e, characterKey)}
                placeholder="Nombre del personaje"
                className='mt-2'
                autoComplete='off'
            />
        </div>
    );
};

export default CharacterSelector