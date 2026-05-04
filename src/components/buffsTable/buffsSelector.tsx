import { columns } from "./columns"
import { DataTable } from "./data-table"
import Modal from "./newBuff"
import { cn } from "@/lib/utils"
import { useState } from "react"
import ConfirmModal from "@/components/buffsTable/deleteBuff"
import EditModal from "@/components/buffsTable/editBuff"
import type { BuffData } from "@/schema/buffData"

interface props {
    data: BuffData[]
    setData: React.Dispatch<React.SetStateAction<BuffData[]>>
    onDelete: (id: string) => void
    className?: string
}

export default function BuffsSelector({ data, setData, onDelete, className }: props) {
    const [openConfirmModal, setConfirmModal] = useState(false)
    const [id, setId] = useState("")

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

    const editBuff = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const updatedBuff: BuffData = {
            id: id,
            valor: formData.get("valor") as string,
            buff: formData.get("buff") as string,
            origen: formData.get("origen") as string,
            personaje: formData.get("personaje") as string,
            status: "Activo",
        }
        setData(data.map((buff) => buff.id === buffToEdit?.id ? updatedBuff : buff))
    }

    const addBuff = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const newEntry: BuffData = {
            id: Math.random().toString(),
            valor: formData.get("valor") as string,
            buff: formData.get("buff") as string,
            origen: formData.get("origen") as string,
            personaje: formData.get("personaje") as string,
            status: "Activo",
        }

        setData([...data, newEntry])
    }

    return (
        <div className={cn("w-[90vw] md:w-full mx-auto", className)}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold text-primary dark:text-fuchsia-600">Agregar Buffs</h1>
                <Modal addBuff={addBuff} />
            </div>

            <ConfirmModal openModal={openConfirmModal} setOpenModal={setConfirmModal} onSubmit={() => onDelete(id)} />

            <EditModal openModal={openEditModal} setOpenModal={setOpenEditModal} buffToEdit={buffToEdit} editBuff={editBuff} />

            <DataTable columns={columns} data={data} onDelete={handleModal} onEdit={handleEditModal} />
        </div>
    )
}