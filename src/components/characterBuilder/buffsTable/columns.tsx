import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { TrashIcon, PenIcon, } from "@phosphor-icons/react"
import type { BuffData } from "@/schema/buffData"
// import { PersonajeCell } from "./PersonajeCell"

declare module "@tanstack/react-table" {
    interface TableMeta<TData> {
        removeRow: (id: string) => void
        editRow: (buff: TData) => void
    }
}

export const columns: ColumnDef<BuffData>[] = [
    { accessorKey: "valor", header: "Valor" },
    { accessorKey: "buff", header: "Buff" },
    { accessorKey: "origen", header: "Origen" },
    {
        accessorKey: "objetivo",
        header: "Objetivo",
        cell: ({ row }) => {
            const { objetivo, targetSlot } = row.original
            return objetivo === "Personaje objetivo" && targetSlot
                ? `${objetivo} (Posición ${targetSlot})`
                : objetivo
        },
    },
    {
        accessorKey: "status", header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as boolean
            return <p className={status ? 'text-green-500' : 'text-red-500'}>{status ? 'Activo' : 'Inactivo'}</p>
        }
    },
    {
        id: "acciones",
        cell: ({ row, table }) => {
            const buff = row.original

            return (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        aria-label={`Editar buff ${buff.buff} (${buff.valor})`}
                        onClick={() => (table.options.meta?.editRow(buff))}
                    >
                        <PenIcon />
                        <span className="hidden sm:block">
                            Editar
                        </span>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        aria-label={`Eliminar buff ${buff.buff} (${buff.valor})`}
                        onClick={() => (table.options.meta?.removeRow(buff.id))}
                    >
                        <TrashIcon />
                        <span className="hidden sm:block">
                            Eliminar
                        </span>
                    </Button>
                </div>
            )
        },
    },
]