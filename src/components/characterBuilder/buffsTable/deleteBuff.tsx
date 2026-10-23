// import { Button } from "@/components/ui/button";
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
import { TrashIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"

interface props {
    openModal: boolean
    title?: string
    description?: string
    // children: React.ReactNode
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
    onSubmit: () => void
}

export default function ConfirmModal({ openModal, setOpenModal, onSubmit }: props) {
    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Eliminar Buff</DialogTitle>
                    <DialogDescription>¿Estas seguro de que quieres eliminar este buff?</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>Cancelar</Button>
                    <Button variant="destructive" type="button" onClick={() => { onSubmit(); setOpenModal(false) }}>
                        <TrashIcon />
                        Eliminar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
