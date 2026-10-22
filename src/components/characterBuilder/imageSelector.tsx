import { ImageUploader } from '@/components/general/imageUploader'
import { Input } from '@/components/ui/input'
import { useTeam } from '@/contexts/teamContext'
import { useTranslation } from 'react-i18next';


interface props {
    onChange: (target: { name: string, value: string | number | boolean | File | Blob | null }) => void;
}

const CharacterSelector = ({ onChange }: props) => {
    const { character } = useTeam()
    const { t } = useTranslation('builder');

    return (
        <div className='w-full sm:w-75'>
            <h2 className='font-semibold text-xl text-primary dark:text-cyan-500'>{t('placeholders.character')}</h2>
            <ImageUploader name='chara1-img' label={t('placeholders.upload_img')} image={character.image} onChange={onChange} />
            <Input
                type="text"
                name="name"
                value={character.name}
                onChange={(e) => onChange(e.target)}
                placeholder={t('placeholders.name_character')}
                className='mt-2'
                autoComplete='off'
            />
        </div>
    );
};

export default CharacterSelector