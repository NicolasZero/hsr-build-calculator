import { useTeam } from "@/contexts/teamContext"

import StatsChart from "./statsChart"

export default function TotalStats() {

    const { team, selectedCharacter, buffs } = useTeam()

    if (!selectedCharacter) return null

    // const statName = team[selectedCharacter]?.offensiveStat === 'ATQ' ? 'ATQ' : 'HP'
    const statBase = Number(team[selectedCharacter]?.statBase)
    const statTotal = Number(team[selectedCharacter]?.statTotal)
    const velBase = Number(team[selectedCharacter]?.velBase)
    const velTotal = Number(team[selectedCharacter]?.velTotal)
    // const nivel = Number(team[selectedCharacter]?.nivel)
    const offensiveStat = team[selectedCharacter]?.offensiveStat === 'ATQ' ? 'ATQ' : 'HP'

    const statBasePorcentaje = Math.floor(((statTotal - statBase) * 100) / statBase) || 0
    const velBasePorcentaje = Math.floor(((velTotal - velBase) * 100) / velBase) || 0

    const offensiveBuff = buffs.filter((buff) => buff.buff === offensiveStat && buff.status === "Activo").reduce((acc, buff) => acc + Number(buff.valor), 0)
    // const hpBuff = buffs.filter((buff) => buff.buff === 'HP' && buff.status === "Activo").reduce((acc, buff) => acc + Number(buff.valor), 0)
    const velBuff = buffs.filter((buff) => buff.buff === 'VEL' && buff.status === "Activo").reduce((acc, buff) => acc + Number(buff.valor), 0)
    const propCritBuff = buffs.filter((buff) => buff.buff === 'P.CRIT' && buff.status === "Activo").reduce((acc, buff) => acc + Number(buff.valor), 0)
    const dmgCritBuff = buffs.filter((buff) => buff.buff === 'D.CRIT' && buff.status === "Activo").reduce((acc, buff) => acc + Number(buff.valor), 0)
    const dmgBuff = buffs.filter((buff) => buff.buff === 'DAÑO' && buff.status === "Activo").reduce((acc, buff) => acc + Number(buff.valor), 0)
    const redDefBuff = buffs.filter((buff) => buff.buff === 'RED DEF' && buff.status === "Activo").reduce((acc, buff) => acc + Number(buff.valor), 0)
    const vulBuff = buffs.filter((buff) => buff.buff === 'VUL' && buff.status === "Activo").reduce((acc, buff) => acc + Number(buff.valor), 0)
    const penResBuff = buffs.filter((buff) => buff.buff === 'PEN RES' && buff.status === "Activo").reduce((acc, buff) => acc + Number(buff.valor), 0)

    const total = {
        stat: statBasePorcentaje + offensiveBuff,
        vel: velBasePorcentaje + velBuff,
        propCrit: 5 + propCritBuff,
        dmgCrit: 50 + dmgCritBuff,
        dmg: dmgBuff,
        redDef: redDefBuff,
        vul: vulBuff,
        penRes: penResBuff
    }

    const data = [
        { buff: "ATQ", valor: total.stat },
        { buff: "VEL", valor: total.vel },
        { buff: "D.CRIT", valor: total.dmgCrit },
        { buff: "P.CRIT", valor: total.propCrit },
        { buff: "DAÑO", valor: total.dmg },
        { buff: "RED DEF", valor: total.redDef },
        { buff: "VUL", valor: total.vul },
        { buff: "PEN RES", valor: total.penRes },
    ]

    return (<>
        {(statBase && statTotal) || (velBase && velTotal) ?
            <div className='p-4 flex items-center justify-start gap-5'>
                {statBase && <span className="text-sm">{offensiveStat}: {statTotal} = ({statBasePorcentaje}%)</span>}
                {velBase && <span className="text-sm">VEL: {velTotal} = ({velBasePorcentaje}%)</span>}
            </div>
            : null
        }
        <div className='flex flex-col md:flex-row gap-4'>
            <ul className='flex flex-col justify-around gap-4 bg-muted/50 rounded-lg p-4 md:w-fit text-nowrap'>
                <span className="text-lg text-primary dark:text-fuchsia-600 font-semibold">Buffs</span>
                <li title={offensiveStat === 'ATQ' ? 'Ataque' : 'Vida'}>{offensiveStat}: {statBasePorcentaje}% + {offensiveBuff}% = {total.stat}%</li>
                <li title="Velocidad">VEL: {velBasePorcentaje}% + {velBuff}% = {total.vel}%</li>
                <li title="Daño Critico">D.CRIT: 50% + {dmgCritBuff}% = {total.dmgCrit}%</li>
                <li title="Probabilidad Critica">P.CRIT: 5% + {propCritBuff}% = {total.propCrit}%</li>
                <li title="Aumento de Daño">DAÑO: 0% + {dmgBuff}% = {total.dmg}%</li>
                <li title="Penetración de Resistencia">PEN RES: 0% + {penResBuff}% = {total.penRes}%</li>
                <li title="Reducción de Defensa">RED DEF: 0% + 0% = 0%</li>
                <li title="Aumento de Vulnerabilidad">VUL: 0% + 0% = 0%</li>
            </ul>

            <div className="max-w-[90vw] md:w-full border rounded-md">
                <StatsChart data={data} />
            </div>
        </div >
    </>

    )
}