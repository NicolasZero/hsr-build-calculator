import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "@phosphor-icons/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { buffType } from "@/const/buffType";
import { useContext, useState } from 'react'
import { TeamContext } from '@/contexts/teamContext'
import { Switch } from "@/components/ui/switch"

interface props {
    addBuff: (e: React.SubmitEvent<HTMLFormElement>) => void
    openModal: boolean
    setOpenModal: (open: boolean) => void
    error: string
}

export default function Modal({ addBuff, openModal, setOpenModal, error }: props) {
    const { team } = useContext(TeamContext)
    const [status, setStatus] = useState(true)

    return (
        <Dialog open={openModal}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpenModal(true)} className="hover:bg-primary/80 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800">
                    <PlusIcon />Agregar
                </Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={() => setOpenModal(false)} showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Buff</DialogTitle>
                    <DialogDescription>Agrega los buffs de los personajes de tu team</DialogDescription>
                </DialogHeader>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <form onSubmit={addBuff} className="grid gap-4 py-4">
                    <Input className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' type="number" required name="valor" placeholder="Valor (ej: 10%)" />
                    <Select name="buff">
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Tipo de buff" />
                        </SelectTrigger>
                        <SelectContent>
                            {buffType.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input required name="origen" placeholder="Origen (ej: Definitiva)" />
                    {/* <Input required name="personaje" placeholder="Personaje" /> */}
                    <Select name="personaje">
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Personaje" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(team).map(([key, character]: any) => {
                                if (character.name) {
                                    return (
                                        <SelectItem key={key} value={character.id}>
                                            {character.name}
                                        </SelectItem>
                                    )
                                }
                            })}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                        <label htmlFor="status">Status:</label>
                        <Switch name="status" id="status" checked={status} onCheckedChange={setStatus} />
                        <p className={status ? 'text-green-500' : 'text-red-500'}>{status ? 'Activo' : 'Inactivo'}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>Cancelar</Button>
                        <Button className="hover:bg-primary/80 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800" type="submit">Registrar</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}