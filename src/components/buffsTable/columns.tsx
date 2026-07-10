import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { TrashIcon, PenIcon, } from "@phosphor-icons/react"
import type { BuffData } from "@/schema/buffData"
import { PersonajeCell } from "./PersonajeCell"

declare module "@tanstack/react-table" {
    interface TableMeta<TData> {
        removeRow: (id: string) => void
        editRow: (buff: TData) => void
    }
}

export const columns: ColumnDef<BuffData>[] = [
    { accessorKey: "valor", header: "Valor" },
    { accessorKey: "buff", header: "Buff" },
    { accessorKey: "origen", header: "Origen del Buff" },
    {
        accessorKey: "personaje",
        header: "Personaje",
        cell: ({ row }) => <PersonajeCell buff={row.original} />
    },
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
                        onClick={() => (table.options.meta?.editRow(buff))}
                    >
                        <PenIcon />
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => (table.options.meta?.removeRow(buff.id))}
                    >
                        <TrashIcon />
                        Eliminar
                    </Button>
                </div>
            )
        },
    },
]