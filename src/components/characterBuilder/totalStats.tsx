import { useTeam } from "@/contexts/teamContext"
import StatsChart from "./statsChart"
import { valueByMainStat } from "@/const/relicStats"

export default function TotalStats() {
    const { character, buffs, relics } = useTeam()

    // Base stats
    const atq = Number(character.atq) || 0;
    const def = Number(character.def) || 0;
    const vel = Number(character.vel) || 0;
    const hp = Number(character.hp) || 0;

    interface Stats {
        atqFlat: number;
        defFlat: number;
        hpFlat: number;
        velFlat: number;
        propCrit: number;
        dmgCrit: number;
        atqPercent?: number;
        defPercent?: number;
        hpPercent?: number;
        velPercent?: number;
        dmg?: number;
        redDef?: number;
        vul?: number;
        penRes?: number;
    }

    const initialStats = {
        atqPercent: 0,
        defPercent: 0,
        hpPercent: 0,
        velPercent: 0,
        atqFlat: 0,
        defFlat: 0,
        hpFlat: 0,
        velFlat: 0,
        propCrit: 0,
        dmgCrit: 0,
        dmg: 0,
        redDef: 0,
        vul: 0,
        penRes: 0
    } as Stats;

    const statsMap: Partial<Record<string, keyof Stats>> = {
        'ATQ %': 'atqPercent',
        'DEF %': 'defPercent',
        'HP %': 'hpPercent',
        'VEL %': 'velPercent',
        'ATQ': 'atqFlat',
        'DEF': 'defFlat',
        'HP': 'hpFlat',
        'VEL': 'velFlat',
        'P.CRIT': 'propCrit',
        'D.CRIT': 'dmgCrit',
        'DAÑO': 'dmg',
        'RED DEF': 'redDef',
        'VUL': 'vul',
        'PEN RES': 'penRes'
    };

    // ===== Relics stats ===== //
    const relicsStatsMain: Stats = relics.relics.reduce((acc, relic) => {
        const mainStat = relic.mainStat;
        if (mainStat) {
            const key = statsMap[mainStat];
            if (key) {
                return { ...acc, [key]: (acc[key] || 0) + valueByMainStat[mainStat] };
            }
        }
        return acc;
    }, initialStats);

    // console.log(relicsStatsMain);


    const relicsStats: Stats = relics.subStats.reduce((acc, subStat) => {
        const key = statsMap[subStat.stat];
        if (key) {
            acc[key] = (acc[key] || 0) + Number(subStat.value);
        }
        return acc;
    }, initialStats);

    // ===== Buffs stats ===== //
    const buffsStats: Stats = buffs.reduce((acc, buff) => {
        if (buff.status) {
            const key = statsMap[buff.buff];
            if (key) {
                acc[key] = (acc[key] || 0) + Number(buff.valor);
            }
        }
        return acc;
    }, initialStats);

    const atqTotal = atq ? (relicsStatsMain.atqFlat + relicsStats.atqFlat + buffsStats.atqFlat) / atq * 100 : 0
    const defTotal = def ? (relicsStatsMain.defFlat + relicsStats.defFlat + buffsStats.defFlat) / def * 100 : 0
    const velTotal = vel ? (relicsStatsMain.velFlat + relicsStats.velFlat + buffsStats.velFlat) / vel * 100 : 0
    const hpTotal = hp ? (relicsStatsMain.hpFlat + relicsStats.hpFlat + buffsStats.hpFlat) / hp * 100 : 0


    const total = {
        atq: atqTotal + relicsStatsMain.atqPercent + relicsStats.atqPercent + buffsStats.atqPercent,
        def: defTotal + relicsStatsMain.defPercent + relicsStats.defPercent + buffsStats.defPercent,
        vel: velTotal + relicsStatsMain.velPercent + relicsStats.velPercent + buffsStats.velPercent,
        hp: hpTotal + relicsStatsMain.hpPercent + relicsStats.hpPercent + buffsStats.hpPercent,
        propCrit: 5 + relicsStats.propCrit + relicsStatsMain.propCrit + buffsStats.propCrit,
        dmgCrit: 50 + relicsStats.dmgCrit + relicsStatsMain.dmgCrit + buffsStats.dmgCrit,
        dmg: relicsStatsMain.dmg + buffsStats.dmg,
        redDef: relicsStatsMain.redDef + buffsStats.redDef,
        vul: relicsStatsMain.vul + buffsStats.vul,
        penRes: relicsStatsMain.penRes + buffsStats.penRes,
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