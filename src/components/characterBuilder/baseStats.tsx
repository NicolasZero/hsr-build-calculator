import { useTeam } from "@/contexts/teamContext"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"


export default function BaseStats({ handleChange }: { handleChange: (target: { name: string, value: string }) => void }) {
    const { character } = useTeam()

    return (
        <div className='w-full grid grid-cols-2 md:grid-cols-3 gap-4'>
            <div className='col-span-full'>
                <h2 className='font-semibold text-xl text-primary dark:text-cyan-500'>Stats base</h2>
                <p className="text-muted-foreground text-sm">Con o sin cono de luz equipado</p>
            </div>

            <label className="text-sm">HP Base
                <Input name="hp" value={character.hp} type="number" placeholder="HP" min={0} onChange={(e) => handleChange(e.target)} />
            </label>

            <label className="text-sm">ATQ Base
                <Input name="atq" value={character.atq} type="number" placeholder="ATQ" min={0} onChange={(e) => handleChange(e.target)} />
            </label>

            <label className="text-sm">DEF Base
                <Input name="def" value={character.def} type="number" placeholder="DEF" min={0} onChange={(e) => handleChange(e.target)} />
            </label>

            <label className="text-sm">VEL Base
                <Input name="vel" value={character.vel} type="number" placeholder="VEL" min={0} onChange={(e) => handleChange(e.target)} />
            </label>

            <label className="text-sm">Stat Principal
                <Select value={character.offensiveStat} onValueChange={(value) => { handleChange({ name: 'offensiveStat', value }) }}>
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ATQ">ATQ</SelectItem>
                        <SelectItem value="HP">HP</SelectItem>
                        <SelectItem value="DEF">DEF</SelectItem>
                    </SelectContent>
                </Select>
            </label>

            <label className="text-sm">
                <span>Nivel</span>
                <Input name="lvl" value={character.lvl} type="number" placeholder="Nivel" min={0} max={90} onChange={(e) => handleChange(e.target)} />
            </label>
            {/* <p className='text-center mt-3 text-muted-foreground'>Nota: Otras stats ofensivas seran agregadas en un futuro</p> */}
        </div>
    )
}
