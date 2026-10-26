import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { subStats, relics, mainStatsByType, valueByMainStat } from "@/const/relicStats"
import type { SubStatsType, MainStatsType, PieceName } from "@/schema/relicData"
import { useState } from "react"
import { PlusIcon, XIcon } from "@phosphor-icons/react"
import { useTeam } from "@/contexts/teamContext"
import { useTranslation } from "react-i18next"

function isPieceName(value: FormDataEntryValue | null): value is PieceName {
    return typeof value === "string" && relics.some((piece) => piece === value)
}

function isMainStatForPiece(piece: PieceName, value: FormDataEntryValue | null): value is MainStatsType {
    return typeof value === "string" && mainStatsByType[piece].some((stat) => stat === value)
}

function isSubStat(value: FormDataEntryValue | null): value is SubStatsType {
    return typeof value === "string" && subStats.some((stat) => stat === value)
}

export default function RelicSelector() {
    const { relics: relicData, setRelics } = useTeam()
    const { t } = useTranslation('builder');

    const [relicOpt, setRelicOpt] = useState<PieceName | "">("")
    const [mainStatOpt, setMainStatOpt] = useState<MainStatsType | "">("")
    const mainStats = relicData.relics
    const subStat = relicData.subStats

    const handleAddRelic = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const piece = formData.get('piece')
        const mainStat = formData.get('mainStat')

        if (!isPieceName(piece) || !isMainStatForPiece(piece, mainStat)) return

        setRelics((current) => {
            const hasPiece = current.relics.some((stat) => stat.piece === piece)
            const relics = hasPiece
                ? current.relics.map((stat) => stat.piece === piece ? { piece, mainStat } : stat)
                : [...current.relics, { piece, mainStat }]

            return { ...current, relics }
        })
    }

    const removeMainStat = (piece: PieceName) => {
        setRelics((current) => ({
            ...current,
            relics: current.relics.filter((stat) => stat.piece !== piece),
        }))
    }

    const removeSubStat = (index: number) => {
        setRelics((current) => ({
            ...current,
            subStats: current.subStats.filter((_, idx) => idx !== index),
        }))
    }

    const handleAddSubStat = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const stat = formData.get('stat')
        const value = formData.get('value')
        const numericValue = Number(value)

        if (!isSubStat(stat) || typeof value !== "string" || !value.trim()
            || !Number.isFinite(numericValue) || numericValue < 0) return
        if (subStat.length >= 4) {
            alert("Ya tienes 4 sub-stats")
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
                <Input
                    name="set"
                    value={relicData.setName ?? ""}
                    onChange={(e) => setRelics((current) => ({
                        ...current,
                        setName: e.target.value || undefined,
                    }))}
                    placeholder={t('placeholders.name_relic')}
                />
            </label>

            {/*Main stats*/}
            <div>
                <h3 className="text-lg font-semibold">Stats Principales</h3>
                <form onSubmit={handleAddRelic} className="flex gap-4 items-end mb-4">
                    {/* Piece selection */}
                    <Select name="piece" value={relicOpt} onValueChange={(value) => {
                        if (!isPieceName(value)) return
                        setRelicOpt(value)
                        setMainStatOpt(value === "CABEZA" ? "HP" : value === "MANO" ? "ATQ" : "")
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
                    <Select name="mainStat" value={mainStatOpt} onValueChange={(value) => {
                        if (relicOpt && isMainStatForPiece(relicOpt, value)) {
                            setMainStatOpt(value)
                        }
                    }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Main Stat" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                relicOpt ?
                                    mainStatsByType[relicOpt].map((stat) => (
                                        <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                                    )) : null
                            }
                        </SelectContent>
                    </Select>
                    <Button type="submit"><PlusIcon /></Button>
                </form>

                <div className="grid md:grid-cols-2 gap-4 md:px-4">
                    {mainStats.map((stat) => (
                        <div key={stat.piece} className="p-2 border rounded flex items-center justify-between gap-2">
                            <p className="text-sm whitespace-nowrap">{stat.piece}: {stat.mainStat} = {valueByMainStat[stat.mainStat]}</p>
                            <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => removeMainStat(stat.piece)}>
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
                            <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => removeSubStat(index)}>
                                <XIcon />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}       