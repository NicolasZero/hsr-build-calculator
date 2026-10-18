import { useTeam } from "@/contexts/teamContext"
import StatsChart from "./statsChart"
import { calculateTotalStats } from "@/utils/calculateTotalStats"

export default function TotalStats() {
    const { character, buffs, relics } = useTeam()
    const { total, data } = calculateTotalStats(character, buffs, relics)

    return (
        <>
            <h2 className='font-semibold text-xl text-primary dark:text-cyan-500'>Stats totales</h2>
            <section className='flex flex-col md:flex-row gap-4'>
                <ul className='flex flex-col justify-around gap-4 bg-muted/50 rounded-lg p-4 md:w-fit text-nowrap'>
                    {/* <span className="text-lg text-primary dark:text-cyan-500 font-semibold">Buffs</span> */}
                    <li title="ATQ">ATQ: {total.atq.toFixed(1)}%</li>
                    <li title="HP">HP: {total.hp.toFixed(1)}%</li>
                    <li title="DEF">DEF: {total.def.toFixed(1)}%</li>
                    <li title="Velocidad">VEL: {total.vel.toFixed(1)}%</li>
                    <li title="Daño Critico">D.CRIT: {total.dmgCrit.toFixed(1)}%</li>
                    <li title="Probabilidad Critica">P.CRIT: {total.propCrit.toFixed(1)}%</li>
                    <li title="Aumento de Daño">DAÑO: {total.dmg}%</li>
                    <li title="Penetración de Resistencia">PEN RES: {total.penRes}%</li>
                    <li title="Reducción o Ignorar Defensa">RED DEF: {total.redDef}%</li>
                    <li title="Aumento de Vulnerabilidad">VUL: {total.vul}%</li>
                </ul>

                <div className="max-w-[90vw] md:w-full border rounded-md">
                    <StatsChart data={data} />
                </div>
            </section >
        </>
    )
}