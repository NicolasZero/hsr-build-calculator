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
        <section className={cn("w-[90vw] md:w-full mx-auto", className)}>
            <header className="flex justify-between flex-col md:flex-row md:items-center mb-4 gap-2">
                {/* <div> */}
                <h1 className="text-xl font-semibold text-primary dark:text-fuchsia-600">Agrega los buffs del personaje</h1>
                {/* <p className='text-sm text-muted-foreground'>*No agregues buffs de los supports ni de los artefactos</p> */}
                {/* </div> */}
                <NewBuffModal onSubmit={handleBuff} error={error} openModal={openModal} setOpenModal={setOpenModal} buffToEdit={buffToEdit} setBuffToEdit={setBuffToEdit} />
            </header>

            <ConfirmModal openModal={openConfirmModal} setOpenModal={setConfirmModal} onSubmit={() => deleteBuff(id)} />

            {/* <EditModal openModal={openEditModal} setOpenModal={setOpenEditModal} buffToEdit={buffToEdit} editBuff={editBuff} /> */}

            <DataTable columns={columns} data={buffs} onDelete={handleModal} onEdit={handleEditModal} />
        </section>
    )
}