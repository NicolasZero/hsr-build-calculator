import { useTeam } from "@/contexts/teamContext"

import StatsChart from "./statsChart"

export default function TotalStats() {

    const { buffs } = useTeam()

    // const atqBase = Number(character.atq)
    // const defBase = Number(character.def)
    // const velBase = Number(character.vel)
    // const hpBase = Number(character.hp)
    // const offensiveStat = character.offensiveStat === 'ATQ' ? 'ATQ' : 'HP'

    // const statBasePorcentaje = Math.floor(((statTotal - statBase) * 100) / statBase) || 0
    // const velBasePorcentaje = Math.floor(((velTotal - velBase) * 100) / velBase) || 0

    const atqBuff = buffs.filter((buff) => buff.buff === 'ATQ' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)
    const defBuff = buffs.filter((buff) => buff.buff === 'DEF' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)
    const hpBuff = buffs.filter((buff) => buff.buff === 'HP' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)
    const velBuff = buffs.filter((buff) => buff.buff === 'VEL' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)
    const propCritBuff = buffs.filter((buff) => buff.buff === 'P.CRIT' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)
    const dmgCritBuff = buffs.filter((buff) => buff.buff === 'D.CRIT' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)
    const dmgBuff = buffs.filter((buff) => buff.buff === 'DAÑO' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)
    const redDefBuff = buffs.filter((buff) => buff.buff === 'RED DEF' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)
    const vulBuff = buffs.filter((buff) => buff.buff === 'VUL' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)
    const penResBuff = buffs.filter((buff) => buff.buff === 'PEN RES' && buff.status).reduce((acc, buff) => acc + Number(buff.valor), 0)

    const total = {
        atq: atqBuff,
        def: defBuff,
        vel: velBuff,
        hp: hpBuff,
        propCrit: 5 + propCritBuff,
        dmgCrit: 50 + dmgCritBuff,
        dmg: dmgBuff,
        redDef: redDefBuff,
        vul: vulBuff,
        penRes: penResBuff
    }

    const data = [
        { buff: "ATQ", valor: total.atq },
        { buff: "HP", valor: total.hp },
        { buff: "DEF", valor: total.def },
        { buff: "VEL", valor: total.vel },
        { buff: "D.CRIT", valor: total.dmgCrit },
        { buff: "P.CRIT", valor: total.propCrit },
        { buff: "DAÑO", valor: total.dmg },
        { buff: "RED DEF", valor: total.redDef },
        { buff: "VUL", valor: total.vul },
        { buff: "PEN RES", valor: total.penRes },
    ]

    return (<>
        {/* {(statBase && statTotal) || (velBase && velTotal) ?
            <div className='p-4 flex items-center justify-start gap-5'>
                {statBase && <span className="text-sm">{offensiveStat}: {statTotal} = ({statBasePorcentaje}%)</span>}
                {velBase && <span className="text-sm">VEL: {velTotal} = ({velBasePorcentaje}%)</span>}
            </div>
            : null
        } */}
        <h2 className='font-semibold text-xl text-primary dark:text-fuchsia-600'>Stats totales</h2>
        <section className='flex flex-col md:flex-row gap-4'>
            <ul className='flex flex-col justify-around gap-4 bg-muted/50 rounded-lg p-4 md:w-fit text-nowrap'>
                <span className="text-lg text-primary dark:text-fuchsia-600 font-semibold">Buffs</span>
                <li title="ATQ">ATQ: {total.atq}%</li>
                <li title="HP">HP: {total.hp}%</li>
                <li title="DEF">DEF: {total.def}%</li>
                <li title="Velocidad">VEL: {total.vel}%</li>
                <li title="Daño Critico">D.CRIT: {total.dmgCrit}%</li>
                <li title="Probabilidad Critica">P.CRIT: {total.propCrit}%</li>
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