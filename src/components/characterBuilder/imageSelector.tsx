import { ImageUploader } from '@/components/general/imageUploader'
import { Input } from '@/components/ui/input'
import { useTeam } from '@/contexts/teamContext'
import { useTranslation } from 'react-i18next';



const CharacterSelector = () => {
    const { editCharacter, character } = useTeam()
    const { t } = useTranslation('builder');

    return (
        <div className='w-full sm:w-75'>
            <h2 className='font-semibold text-xl text-primary'>{t('placeholders.character')}</h2>
            <ImageUploader name='character_img' label={t('placeholders.upload_img')} image={character.image} onChange={editCharacter} />
            <Input
                type="text"
                name="name"
                value={character.name}
                onChange={(e) => editCharacter(e.target)}
                placeholder={t('placeholders.name_character')}
                className='mt-2'
                autoComplete='off'
            />
        </div>
    );
};

export default CharacterSelector