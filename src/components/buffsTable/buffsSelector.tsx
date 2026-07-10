import { columns } from "./columns"
import { DataTable } from "./data-table"
import NewBuffModal from "./newBuff"
import { cn } from "@/lib/utils"
import { useState, useContext } from "react"
import ConfirmModal from "@/components/buffsTable/deleteBuff"
import EditModal from "@/components/buffsTable/editBuff"
import type { BuffData } from "@/schema/buffData"
import { TeamContext } from '@/contexts/teamContext'

interface props {
    className?: string
}

export default function BuffsSelector({ className }: props) {
    const { buffs, setBuffs } = useContext(TeamContext)
    const [openConfirmModal, setConfirmModal] = useState(false)
    const [id, setId] = useState("")
    const [error, setError] = useState("")
    const [openModal, setOpenModal] = useState(false)

    const [openEditModal, setOpenEditModal] = useState(false)
    const [buffToEdit, setBuffToEdit] = useState<BuffData | null>(null)

    const handleModal = (id: string) => {
        setConfirmModal(true)
        setId(id)
    }

    const handleEditModal = (buff: BuffData) => {
        setOpenEditModal(true)
        setBuffToEdit(buff)
    }

    const deleteBuff = (id: string) => {
        setBuffs(buffs.filter((buff) => buff.id !== id))
    }

    const editBuff = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const updatedBuff: BuffData = {
            id: id,
            valor: formData.get("valor") as string,
            buff: formData.get("buff") as string,
            origen: formData.get("origen") as string,
            personaje: formData.get("personaje") as string,
            status: formData.get("status") ? "Activo" : "Inactivo",
        }
        setBuffs(buffs.map((buff) => buff.id === buffToEdit?.id ? updatedBuff : buff))
    }

    const addBuff = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const newEntry: BuffData = {
            id: Math.random().toString(),
            valor: formData.get("valor") as string,
            buff: formData.get("buff") as string,
            origen: formData.get("origen") as string,
            personaje: formData.get("personaje") as string,
            status: formData.get("status") ? "Activo" : "Inactivo",
        }

        if (newEntry.personaje === '') {
            setError("Debes seleccionar un personaje")
            return
        }

        if (buffs.some(buff => buff.valor === newEntry.valor && buff.buff === newEntry.buff && buff.origen === newEntry.origen && buff.personaje === newEntry.personaje)) {
            setError("El buff ya existe")
            return
        }

        setBuffs([...buffs, newEntry])
        setError("")
    }

    return (
        <div className={cn("w-[90vw] md:w-full mx-auto", className)}>
            <div className="flex justify-between flex-col md:flex-row md:items-center mb-4 gap-2">
                <h1 className="text-xl font-semibold text-primary dark:text-fuchsia-600">Agrega los buffs del team</h1>
                <NewBuffModal addBuff={addBuff} error={error} openModal={openModal} setOpenModal={setOpenModal} />
            </div>

            <ConfirmModal openModal={openConfirmModal} setOpenModal={setConfirmModal} onSubmit={() => deleteBuff(id)} />

            <EditModal openModal={openEditModal} setOpenModal={setOpenEditModal} buffToEdit={buffToEdit} editBuff={editBuff} />

            <DataTable columns={columns} data={buffs} onDelete={handleModal} onEdit={handleEditModal} />
        </div>
    )
}