// import { useState } from "react"
import { columns, type BuffData } from "./columns"
import { DataTable } from "./data-table"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PlusIcon } from "@phosphor-icons/react"

interface props {
    data: BuffData[]
    setData: React.Dispatch<React.SetStateAction<BuffData[]>>
    onDelete: (id: string) => void
}

export default function BuffsSelector({ data, setData, onDelete }: props) {
    // Estado inicial vacío
    // const [data, setData] = useState<BuffData[]>([])

    // Función para agregar un nuevo buff (simplificada)
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
        <div className="container mx-auto py-10">
            <div className="flex justify-end items-center mb-4">
                {/* <h1 className="text-2xl font-bold">Mis Buffs</h1> */}

                {/* Botón que abre el Diálogo */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button><PlusIcon />Agregar Buff</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Nuevo Buff</DialogTitle>
                            <DialogDescription>Agrega los buffs de los personajes de tu team</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={addBuff} className="grid gap-4 py-4">
                            <Input name="valor" placeholder="Valor (ej: 10%)" />
                            <Input name="buff" placeholder="Buff (ej: ATQ)" />
                            <Input name="origen" placeholder="Origen (ej: Pasiva 1)" />
                            <Input name="personaje" placeholder="Personaje" />
                            <Button type="submit">Guardar</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable columns={columns} data={data} onDelete={onDelete} />
        </div>
    )
}