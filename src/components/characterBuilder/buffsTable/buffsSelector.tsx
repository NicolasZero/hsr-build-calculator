import { columns } from "./columns"
import { DataTable } from "./data-table"
import NewBuffModal from "./buffModal"
import { useState } from "react"
import { cn } from "@/lib/utils"
import ConfirmModal from "@/components/characterBuilder/buffsTable/deleteBuff"
// import EditModal from "@/components/buffsTable/editBuff"
import type { BuffData, BuffType, Origen, Target } from "@/schema/buffData"
import { useTeam } from '@/contexts/teamContext'

interface props {
    className?: string
}

export default function BuffsSelector({ className }: props) {
    const { buffs, setBuffs } = useTeam()
    const [openConfirmModal, setConfirmModal] = useState(false)
    const [id, setId] = useState("")
    const [error, setError] = useState("")
    const [openModal, setOpenModal] = useState(false)

    // const [openEditModal, setOpenEditModal] = useState(false)
    const [buffToEdit, setBuffToEdit] = useState<BuffData | undefined>(undefined)

    const handleModal = (id: string) => {
        setConfirmModal(true)
        setId(id)
    }

    const handleEditModal = (buff: BuffData) => {
        // setOpenEditModal(true)
        setBuffToEdit(buff)
        setOpenModal(true)
    }

    const deleteBuff = (id: string) => {
        setBuffs(buffs.filter((buff) => buff.id !== id))
    }

    const handleBuff = (e: React.SubmitEvent<HTMLFormElement>, type: "add" | "edit" = "add") => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const buffData: BuffData = {
            id: type === "edit" ? id : Math.random().toString(),
            valor: formData.get("valor") as string,
            buff: formData.get("buff") as BuffType,
            origen: formData.get("origen") as Origen,
            objetivo: formData.get("objetivo") as Target,
            status: formData.get("status") as unknown as boolean,
        }

        if (type === "edit") {
            if (buffToEdit) {
                setBuffs(buffs.map((buff) => buffToEdit.id === buff.id ? buffData : buff))
            }
            setError("")
            setOpenModal(false)
            setBuffToEdit(undefined)
            return
        }

        if (buffs.some(buff => buff.valor === buffData.valor && buff.buff === buffData.buff && buff.origen === buffData.origen && buff.objetivo === buffData.objetivo)) {
            setError("El buff ya existe")
            return
        }

        setBuffs([...buffs, buffData])
        setError("")
        setOpenModal(false)
        setBuffToEdit(undefined)
    }

    return (
        <section className={cn("w-full mx-auto", className)}>
            <header className="flex justify-between flex-col md:flex-row md:items-center mb-4 gap-2">
                <h1 className="text-xl font-semibold text-primary dark:text-fuchsia-500">Buffs del personaje</h1>
                <NewBuffModal onSubmit={handleBuff} error={error} openModal={openModal} setOpenModal={setOpenModal} buffToEdit={buffToEdit} setBuffToEdit={setBuffToEdit} />
            </header>

            <ConfirmModal openModal={openConfirmModal} setOpenModal={setConfirmModal} onSubmit={() => deleteBuff(id)} />
            <DataTable columns={columns} data={buffs} onDelete={handleModal} onEdit={handleEditModal} />
        </section>
    )
}