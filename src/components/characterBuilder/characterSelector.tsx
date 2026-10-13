import { ImageUploader } from '@/components/imageUploader'
import { Input } from '@/components/ui/input'
import { useTeam } from '@/contexts/teamContext'

interface props {
    onChange: (target: { name: string, value: string | number | boolean | File | Blob | null }) => void;
}

const CharacterSelector = ({ onChange }: props) => {
    const { character } = useTeam()

    return (
        <div className='w-full sm:w-75'>
            <h2 className='font-semibold text-xl text-primary dark:text-fuchsia-600'>Personaje</h2>
            <ImageUploader name='chara1-img' image={character.image} onChange={onChange} />
            <Input
                type="text"
                name="name"
                value={character.name}
                onChange={(e) => onChange(e.target)}
                placeholder="Nombre del personaje"
                className='mt-2'
                autoComplete='off'
            />
        </div>
    );
};

export default CharacterSelector