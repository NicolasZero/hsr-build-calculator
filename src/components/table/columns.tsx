import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { TrashIcon, PenIcon, } from "@phosphor-icons/react"


// import { DotsThreeOutlineIcon } from "@phosphor-icons/react"

// 1. Define el tipo de dato
export type BuffData = {
    id: string
    valor: string
    buff: string
    origen: string
    personaje: string
    status: "Activo" | "Inactivo"
}

// 2. Define las columnas
export const columns: ColumnDef<BuffData>[] = [
    { accessorKey: "valor", header: "Valor" },
    { accessorKey: "buff", header: "Buff" },
    { accessorKey: "origen", header: "Origen del Buff" },
    { accessorKey: "personaje", header: "Personaje" },
    { accessorKey: "status", header: "Status" },
    {
        id: "acciones",
        cell: ({ row, table }) => {
            const buff = row.original

            return (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log("Editar:", buff)}
                    >
                        <PenIcon />
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            // Llamamos a la función definida en el meta
                            (table.options.meta as any)?.removeRow(buff.id)
                        }}
                    >
                        <TrashIcon />
                        Eliminar
                    </Button>
                </div>
            )
        },
    },
]