import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PenIcon } from "@phosphor-icons/react";
import type { BuffData } from "@/schema/buffData";

interface props {
    editBuff: (e: React.FormEvent<HTMLFormElement>) => void
    openModal?: boolean
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
    buffToEdit?: BuffData
}

export default function Modal({ editBuff, openModal, setOpenModal, buffToEdit }: props) {
    return (
        <Dialog open={openModal}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Editar Buff</DialogTitle>
                    <DialogDescription>Edita los buffs de los personajes de tu team</DialogDescription>
                </DialogHeader>
                <form onSubmit={editBuff} className="grid gap-4 py-4">
                    <Input required name="valor" placeholder="Valor (ej: 10%)" defaultValue={buffToEdit?.valor} />
                    <Input required name="buff" placeholder="Buff (ej: ATQ)" defaultValue={buffToEdit?.buff} />
                    <Input required name="origen" placeholder="Origen (ej: Pasiva 1)" defaultValue={buffToEdit?.origen} />
                    <Input required name="personaje" placeholder="Personaje" defaultValue={buffToEdit?.personaje} />
                    {/* <DialogClose asChild> */}
                    <Button type="submit" onClick={() => setOpenModal(false)}>
                        <PenIcon />
                        Editar
                    </Button>
                    {/* </DialogClose> */}
                </form>
            </DialogContent>
        </Dialog>
    )
}