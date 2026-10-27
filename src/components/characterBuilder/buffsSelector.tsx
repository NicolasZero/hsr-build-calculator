import { useState } from "react"
import { columns } from "./buffsTable/columns"
import { DataTable } from "./buffsTable/data-table"
import NewBuffModal from "./buffsTable/buffModal"
import ConfirmModal from "@/components/characterBuilder/buffsTable/deleteBuff"
import { buffOrigin, buffTarget, buffType, statBuffDependiente } from "@/const/buffType"
import { TEAM_SIZE } from "@/const/team"
import type { BuffData, StatBuffDependent } from "@/schema/buffData"
import { useCharacter } from "@/contexts/teamContext"

function isOption<T extends readonly string[]>(
    options: T,
    value: FormDataEntryValue | null
): value is T[number] {
    return typeof value === "string" && options.some((option) => option === value)
}

function isDuplicate(existing: BuffData, candidate: BuffData) {
    return (
        Number(existing.valor) === Number(candidate.valor) &&
        existing.buff === candidate.buff &&
        existing.origen === candidate.origen &&
        existing.objetivo === candidate.objetivo &&
        existing.targetStat === candidate.targetStat &&
        existing.umbralStat === candidate.umbralStat &&
        existing.valorMaximo === candidate.valorMaximo &&
        existing.targetSlot === candidate.targetSlot
    )
}

export default function BuffsSelector() {
    const { buffs, setBuffs } = useCharacter()
    const [openConfirmModal, setConfirmModal] = useState(false)
    const [buffToDeleteId, setBuffToDeleteId] = useState("")
    const [error, setError] = useState("")
    const [openModal, setOpenModal] = useState(false)
    const [buffToEdit, setBuffToEdit] = useState<BuffData | undefined>(undefined)

    const handleDeleteModal = (buffId: string) => {
        setBuffToDeleteId(buffId)
        setConfirmModal(true)
    }

    const handleEditModal = (buff: BuffData) => {
        setError("")
        setBuffToEdit(buff)
        setOpenModal(true)
    }

    const deleteBuff = (buffId: string) => {
        setBuffs((currentBuffs) => currentBuffs.filter((buff) => buff.id !== buffId))
    }

    const handleBuff = (e: React.SubmitEvent<HTMLFormElement>, type: "add" | "edit" = "add") => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const rawValue = formData.get("valor")
        const valor = typeof rawValue === "string" ? Number(rawValue) : Number.NaN
        const buff = formData.get("buff")
        const origen = formData.get("origen")
        const objetivo = formData.get("objetivo")
        const targetStatValue = formData.get("targetStat")
        const statusValue = formData.get("status")

        if (typeof rawValue !== "string" || rawValue.trim() === "" || !Number.isFinite(valor)) {
            setError("Ingresa un valor numérico válido")
            return
        }
        if (!isOption(buffType, buff) || !isOption(buffOrigin, origen) || !isOption(buffTarget, objetivo)) {
            setError("Completa correctamente los campos del buff")
            return
        }
        if (statusValue !== "true" && statusValue !== "false") {
            setError("El estado del buff no es válido")
            return
        }
        let targetStat: StatBuffDependent | undefined
        if (targetStatValue !== null) {
            if (!isOption(statBuffDependiente, targetStatValue)) {
                setError("Selecciona una estadística válida para el escalado")
                return
            }
            targetStat = targetStatValue
        }

        const rawUmbralStat = formData.get("umbralStat")
        let umbralStat: number | undefined
        if (targetStat !== undefined && rawUmbralStat !== null && rawUmbralStat !== "") {
            const parsedUmbralStat = Number(rawUmbralStat)
            if (typeof rawUmbralStat !== "string" || !Number.isFinite(parsedUmbralStat) || parsedUmbralStat < 0) {
                setError("Ingresa un umbral de estadística válido (mayor o igual a 0)")
                return
            }
            umbralStat = parsedUmbralStat
        }

        const rawValorMaximo = formData.get("valorMaximo")
        let valorMaximo: number | undefined
        if (targetStat !== undefined && rawValorMaximo !== null && rawValorMaximo !== "") {
            const parsedValorMaximo = Number(rawValorMaximo)
            if (typeof rawValorMaximo !== "string" || !Number.isFinite(parsedValorMaximo) || parsedValorMaximo < 0) {
                setError("Ingresa un valor máximo numérico válido (mayor o igual a 0)")
                return
            }
            valorMaximo = parsedValorMaximo
        }

        const targetSlotValue = formData.get("targetSlot")
        let targetSlot: number | undefined
        if (objetivo === "Personaje objetivo") {
            const parsedTargetSlot = typeof targetSlotValue === "string" ? Number(targetSlotValue) : Number.NaN
            if (!Number.isInteger(parsedTargetSlot) || parsedTargetSlot < 1 || parsedTargetSlot > TEAM_SIZE) {
                setError("Selecciona una posición válida del equipo")
                return
            }
            targetSlot = parsedTargetSlot
        }

        if (type === "edit" && !buffToEdit) {
            setError("No se encontró el buff que se intenta editar")
            return
        }

        const buffId = type === "edit" ? buffToEdit?.id : undefined
        const buffData: BuffData = {
            id: buffId ?? crypto.randomUUID(),
            valor: String(valor),
            buff,
            origen,
            objetivo,
            status: statusValue === "true",
            ...(targetStat !== undefined ? { targetStat } : {}),
            ...(umbralStat !== undefined ? { umbralStat } : {}),
            ...(valorMaximo !== undefined ? { valorMaximo } : {}),
            ...(targetSlot !== undefined ? { targetSlot } : {}),
        }

        const duplicate = buffs.some(
            (existingBuff) =>
                existingBuff.id !== buffData.id && isDuplicate(existingBuff, buffData)
        )
        if (duplicate) {
            setError("El buff ya existe")
            return
        }

        if (type === "edit") {
            setBuffs((currentBuffs) =>
                currentBuffs.map((buff) => (buff.id === buffData.id ? buffData : buff))
            )
        } else {
            setBuffs((currentBuffs) => [...currentBuffs, buffData])
        }

        setError("")
        setOpenModal(false)
        setBuffToEdit(undefined)
    }

    return (
        <section className="w-full mx-auto">
            <header className="flex justify-between flex-col md:flex-row md:items-center mb-4 gap-2">
                <h1 className="text-xl font-semibold text-primary dark:text-cyan-500">Buffs del personaje</h1>
                <NewBuffModal
                    onSubmit={handleBuff}
                    error={error}
                    openModal={openModal}
                    setOpenModal={(open) => {
                        setOpenModal(open)
                        if (open) setError("")
                    }}
                    buffToEdit={buffToEdit}
                    setBuffToEdit={setBuffToEdit}
                />
            </header>

            <ConfirmModal
                openModal={openConfirmModal}
                setOpenModal={setConfirmModal}
                onSubmit={() => deleteBuff(buffToDeleteId)}
            />
            <DataTable columns={columns} data={buffs} onDelete={handleDeleteModal} onEdit={handleEditModal} />
        </section>
    )
}
