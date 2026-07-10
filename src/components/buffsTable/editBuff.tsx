import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PenIcon } from "@phosphor-icons/react";
import type { BuffData } from "@/schema/buffData";
import { buffType } from "@/const/buffType";
import {
    useState
    // , useEffect
} from 'react'
import { useTeam } from '@/contexts/teamContext'
import { Switch } from "@/components/ui/switch";

interface props {
    editBuff: (e: React.SubmitEvent<HTMLFormElement>) => void
    openModal?: boolean
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
    buffToEdit?: BuffData
}

export default function Modal({ editBuff, openModal, setOpenModal, buffToEdit }: props) {
    const { team } = useTeam()
    const [status, setStatus] = useState(buffToEdit?.status === "Activo" ? true : false)

    // useEffect(() => {
    //     // setStatus(buffToEdit?.status === "Activo" ? true : false)
    //     console.log(buffToEdit);
    // }, [buffToEdit])

    return (
        <Dialog open={openModal}>
            <DialogContent onInteractOutside={() => setOpenModal(false)} showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Editar Buff</DialogTitle>
                    <DialogDescription>Edita los buffs de los personajes de tu team</DialogDescription>
                </DialogHeader>
                <form onSubmit={editBuff} className="grid gap-4 py-4">
                    <Input required name="valor" placeholder="Valor (ej: 10%)" defaultValue={buffToEdit?.valor} />
                    <Select name="buff" defaultValue={buffToEdit?.buff}>
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
                    <Input required name="origen" placeholder="Origen (ej: Pasiva 1)" defaultValue={buffToEdit?.origen} />
                    <Select name="personaje" defaultValue={buffToEdit?.personaje}>
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
                        <Button type="submit" onClick={() => setOpenModal(false)}>
                            <PenIcon />
                            Editar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}