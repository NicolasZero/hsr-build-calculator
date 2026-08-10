import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "@phosphor-icons/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { buffType, buffOrigin, buffTarget } from "@/const/buffType";
import { useEffect, useState } from 'react'
import { Switch } from "@/components/ui/switch"
import type { BuffData } from "@/schema/buffData";
import { cn } from "@/lib/utils";

interface props {
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>, type: "add" | "edit") => void
    openModal: boolean
    setOpenModal: (open: boolean) => void
    error: string
    buffToEdit?: BuffData
    setBuffToEdit: (buff: BuffData | undefined) => void
}

export default function Modal({ onSubmit, openModal, setOpenModal, error, buffToEdit, setBuffToEdit }: props) {
    const type = buffToEdit ? "edit" : "add"
    const [status, setStatus] = useState(true)
    useEffect(() => { if (buffToEdit) setStatus(buffToEdit.status) }, [buffToEdit])

    return (
        <Dialog open={openModal}>
            <DialogTrigger asChild>
                <Button type="button" onClick={() => setOpenModal(true)} className="hover:bg-primary/80 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800">
                    <PlusIcon />Agregar Buff
                </Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={() => { setOpenModal(false); setBuffToEdit(undefined) }} showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle> {type === "add" ? "Agregar Nuevo Buff" : "Editar Buff"}</DialogTitle>
                    <DialogDescription>{type === "add" ? "Agrega los buffs de tu personaje" : "Edita los buffs de tu personaje"}</DialogDescription>
                </DialogHeader>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <form onSubmit={(e) => onSubmit(e, type)} className="grid gap-4 py-4">
                    <label className="text-xs">Valor (%):
                        <Input step="any" inputMode="decimal" type="number" required name="valor" placeholder="Valor (ej: 10%)" defaultValue={buffToEdit?.valor} />
                    </label>

                    <label className="text-xs">Tipo de Buff:
                        <Select name="buff" defaultValue={buffToEdit?.buff}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Tipo de Buff" />
                            </SelectTrigger>
                            <SelectContent>
                                {buffType.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </label>

                    <label className="text-xs">Origen del Buff:
                        <Select name="origen" defaultValue={buffToEdit?.origen}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Origen del Buff" />
                            </SelectTrigger>
                            <SelectContent>
                                {buffOrigin.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </label>

                    <label className="text-xs">Objetivo del Buff:
                        <Select name="objetivo" defaultValue={buffToEdit?.objetivo}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Objetivo del Buff" />
                            </SelectTrigger>
                            <SelectContent>
                                {buffTarget.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </label>


                    <div className={cn("flex items-center gap-2", !buffToEdit && "hidden")}>
                        <label htmlFor="status">Status:</label>
                        <Switch name="status" id="status" checked={status} onCheckedChange={setStatus} />
                        <p className={status ? 'text-green-500' : 'text-red-500'}>{status ? 'Activo' : 'Inactivo'}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => { setOpenModal(false); setBuffToEdit(undefined) }}>Cancelar</Button>
                        <Button className="hover:bg-primary/80 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800" type="submit">{type === "add" ? "Registrar" : "Editar"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}