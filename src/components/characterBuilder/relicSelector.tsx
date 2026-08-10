import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { subStats, relics, mainStatsByType, valueByMainStat } from "@/const/relicStats"
import type { subStatsType, mainStatsType, mainStat, subStat, pieceName } from "@/schema/relicData"
import { useState } from "react"
import { PlusIcon, XIcon } from "@phosphor-icons/react"


export default function RelicSelector() {
    const [subStat, setSubStat] = useState<subStat[]>([])
    const [mainStats, setMainStats] = useState<mainStat[]>([])

    // const [totalStat, setTotalStat] = useState<Record<string, number>>({})

    const [relicOpt, setRelicOpt] = useState<string>("")
    const [mainStatOpt, setMainStatOpt] = useState<string>("")


    // useEffect(() => {
    //     //Calcular los stats
    //     const total = subStat.reduce((acc, stat) => {
    //         acc[stat.stat] = (acc[stat.stat] || 0) + Number(stat.value)
    //         return acc
    //     }, {} as Record<string, number>)

    //     // console.log(total)
    //     setTotalStat(total)
    // }, [subStat])
    // const { character, editCharacter } = useTeam()

    // const handleSubStat = (value: string) => {
    //     setSubStat((prev) => ({ ...prev, stat: value }))
    // }

    const handleAddRelic = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const piece = formData.get('piece') as pieceName
        const mainStat = formData.get('mainStat') as mainStatsType
        if (!piece || !mainStat) return
        setMainStats((prev) => {
            const existing = prev.find((stat) => stat.piece === piece)
            if (existing) {
                return prev.map((stat) => stat.piece === piece ? { piece, mainStat } : stat)
            }
            return [...prev, { piece, mainStat }]
        })
    }

    const removeStat = (index: number, type: "main" | "sub") => {
        if (type === "main") {
            setMainStats((current) => current.filter((_, idx) => idx !== index))
        } else {
            setSubStat((current) => current.filter((_, idx) => idx !== index))
        }
    }

    const handleAddSubStat = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const stat = formData.get('stat') as subStatsType
        const value = formData.get('value') as string
        if (!stat || !value) return
        setSubStat((prev) => [...prev, { stat, value }])
        // console.log(stat, value)
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <header className="col-span-full">
                <h2 className="text-xl font-semibold text-primary dark:text-fuchsia-600">Artefactos y Ornamentos</h2>
                <p className="text-sm text-muted-foreground">Agrega los stats de los artefactos</p>
            </header>

            <label className="col-span-full flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <span className="text-sm">Nombre</span>
                <Input placeholder="Nombre del set (Opcional)" />
            </label>

            <div>
                <h3 className="text-lg font-semibold">Stats Principales</h3>
                <form onSubmit={handleAddRelic} className="flex gap-4 items-end">
                    {/* Piece selection */}
                    <Select name="piece" value={relicOpt} onValueChange={(v) => {
                        setRelicOpt(v)
                        setMainStatOpt("")
                    }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pieza" />
                        </SelectTrigger>
                        <SelectContent>
                            {relics.map((relic) => (
                                <SelectItem key={relic} value={relic}>{relic}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Main stat selection */}
                    <Select name="mainStat" value={mainStatOpt} onValueChange={(v) => setMainStatOpt(v)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Main Stat" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                relicOpt ?
                                    mainStatsByType[relicOpt as keyof typeof mainStatsByType].map((stat: string) => (
                                        <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                                    )) : null
                            }
                        </SelectContent>
                    </Select>
                    <Button type="submit"><PlusIcon /></Button>
                </form>
                <div className="flex flex-col flex-wrap gap-2 py-2">
                    {mainStats.map((stat, index) => (
                        <div key={index} className="p-2 border rounded flex items-center justify-between gap-2">
                            <p className="text-sm whitespace-nowrap">{stat.piece}: {stat.mainStat} = {valueByMainStat[stat.mainStat as keyof typeof valueByMainStat]}</p>
                            <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => removeStat(index, "main")}>
                                <XIcon />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/*Sub Stats*/}
            <div>
                <h3 className="text-lg font-semibold">Sub-stats</h3>
                <form onSubmit={handleAddSubStat} className="flex gap-4 " >
                    <Select name="stat">
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Stat" />
                        </SelectTrigger>
                        <SelectContent>
                            {subStats.map((stat) => (
                                <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input type="number" name="value" min={0} placeholder="Valor" step="any" inputMode="decimal" />
                    <Button type="submit"><PlusIcon /></Button>
                </form>
                <div className="flex flex-col flex-wrap gap-2 py-2">
                    {subStat.map((stat, index) => (
                        <div key={index} className="p-2 border rounded flex items-center justify-between gap-2">
                            <p className="text-sm whitespace-nowrap">{stat.stat}: {stat.value}</p>
                            <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => removeStat(index, "sub")}>
                                <XIcon />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}       