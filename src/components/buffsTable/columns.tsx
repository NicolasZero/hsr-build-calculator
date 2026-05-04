import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { TrashIcon, PenIcon, } from "@phosphor-icons/react"
import type { BuffData } from "@/schema/buffData"

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
                        onClick={() => {
                            ((table.options.meta as any)?.editRow(buff))
                        }}
                    >
                        <PenIcon />
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
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