import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { subStats, relics as relicPieces, mainStatsByType, valueByMainStat } from "@/const/relicStats"
import type { SubStatsType, MainStatsType, PieceName } from "@/schema/relicData"
import { useState } from "react"
import { PlusIcon, XIcon } from "@phosphor-icons/react"
import { useCharacter } from "@/contexts/teamContext"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export default function RelicSelector() {
    const { relics, setRelics } = useCharacter()
    const { t } = useTranslation('builder');

    // UI local que no forma parte de los datos del personaje.
    const [relicOpt, setRelicOpt] = useState<string>("")
    const [mainStatOpt, setMainStatOpt] = useState<string>("")

    // Una sola fuente de verdad: el contexto. Sin estado espejo ni efectos.
    const setName = relics.setName ?? ""
    const mainStats = relics.relics
    const subStat = relics.subStats

    const setSetName = (value: string) => {
        setRelics((current) => ({ ...current, setName: value || undefined }))
    }

    const handleAddRelic = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const piece = formData.get('piece') as PieceName
        const mainStat = formData.get('mainStat') as MainStatsType

        if (!piece || !mainStat) return
        setRelics((current) => {
            const exists = current.relics.some((stat) => stat.piece === piece)
            return {
                ...current,
                relics: exists
                    ? current.relics.map((stat) => stat.piece === piece ? { piece, mainStat } : stat)
                    : [...current.relics, { piece, mainStat }],
            }
        })
    }

    const removeStat = (index: number, type: "main" | "sub") => {
        setRelics((current) => ({
            ...current,
            ...(type === "main"
                ? { relics: current.relics.filter((_, idx) => idx !== index) }
                : { subStats: current.subStats.filter((_, idx) => idx !== index) }),
        }))
    }

    const handleAddSubStat = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const stat = formData.get('stat') as SubStatsType
        const value = formData.get('value') as string
        if (!stat || !value) return
        if (subStat.length >= 24) {
            toast.error("Ya tienes 24 sub-stats")
            return
        }
        setRelics((current) => ({
            ...current,
            subStats: [...current.subStats, { stat, value }],
        }))
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <header className="col-span-full">
                <h2 className="text-xl font-semibold text-primary dark:text-cyan-500">{t('relics.title')}</h2>
                <p className="text-sm text-muted-foreground">{t('relics.description')}</p>
            </header>

            <label className="col-span-full flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <span className="text-sm whitespace-nowrap">{t('relics.set')}</span>
                <Input name="set" value={setName} onChange={(e) => setSetName(e.target.value)} placeholder={t('placeholders.name_relic')} />
            </label>

            {/*Main stats*/}
            <div>
                <h3 className="text-lg font-semibold">Stats Principales</h3>
                <form onSubmit={handleAddRelic} className="flex gap-4 items-end mb-4">
                    {/* Piece selection */}
                    <Select name="piece" value={relicOpt} onValueChange={(v) => {
                        setRelicOpt(v)
                        setMainStatOpt(v === "CABEZA" ? "HP" : v === "MANO" ? "ATQ" : "")
                    }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pieza" />
                        </SelectTrigger>
                        <SelectContent>
                            {relicPieces.map((relic) => (
                                <SelectItem key={relic} value={relic}>{relic}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Main stat selection */}
                    <Select name="mainStat" value={mainStatOpt} onValueChange={(v) => setMainStatOpt(v)} >
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

                <div className="grid md:grid-cols-2 gap-4 md:px-4">
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
                <form onSubmit={handleAddSubStat} className="flex gap-4 mb-4" >
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

                <div className={`grid grid-cols-2 gap-4 max-h-55 md:px-4 overflow-auto`}>
                    {subStat.map((stat, index) => (
                        <div key={index} className="p-2 h-fit border rounded flex items-center justify-between gap-2">
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
