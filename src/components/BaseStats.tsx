import { useTeam } from "@/contexts/teamContext"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"


export default function BaseStats({ handleChange }: { handleChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: 'offensiveStat', value: string } }) => void }) {

    const { team, selectedCharacter } = useTeam()

    return (
        <fieldset className='grid grid-cols-3 gap-4'>
            <div className='col-span-full'>
                <h2 className='font-semibold text-lg text-primary dark:text-fuchsia-600'>Stats de: <span className='text-secondary-foreground'>{team[selectedCharacter]?.name || 'Sin especificar'}</span></h2>
            </div>
            {/* row 1 */}
            <label className="text-sm">
                <span>ATQ o HP base</span>
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="statBase" value={team[selectedCharacter]?.statBase} type="number" placeholder={`${team[selectedCharacter]?.offensiveStat || 'ATQ o HP'} base`} min={0} onChange={(e) => handleChange(e)} />
            </label>
            <label className="text-sm">
                <span>ATQ o HP total</span>
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="statTotal" value={team[selectedCharacter]?.statTotal} type="number" placeholder={`${team[selectedCharacter]?.offensiveStat || 'ATQ o HP'} total`} min={0} onChange={(e) => handleChange(e)} />
            </label>
            <label className="text-sm">
                <span>Stat Principal</span>
                <Select value={team[selectedCharacter]?.offensiveStat} onValueChange={(value) => { handleChange({ target: { name: 'offensiveStat', value } }) }}>
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder="ATQ o HP" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ATQ">ATQ</SelectItem>
                        <SelectItem value="HP">HP</SelectItem>
                    </SelectContent>
                </Select>
            </label>
            {/* row 2 */}
            <label className="text-sm">
                <span>VEL base</span>
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="velBase" value={team[selectedCharacter]?.velBase} type="number" placeholder="VEL base" min={0} onChange={(e) => handleChange(e)} />
            </label>
            <label className="text-sm">
                <span>VEL total</span>
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="velTotal" value={team[selectedCharacter]?.velTotal} type="number" placeholder="VEL total" min={0} onChange={(e) => handleChange(e)} />
            </label>
            <label className="text-sm">
                <span>Nivel</span>
                <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' name="nivel" value={team[selectedCharacter]?.nivel} type="number" placeholder="Nivel" min={0} max={90} onChange={(e) => handleChange(e)} />
            </label>
        </fieldset>
    )
}
