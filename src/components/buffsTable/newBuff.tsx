import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "@phosphor-icons/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { buffType } from "@/const/buffType";

interface props {
    addBuff: (e: React.FormEvent<HTMLFormElement>) => void
}

export default function Modal({ addBuff }: props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="hover:bg-primary/80 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800">
                    <PlusIcon />Agregar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Buff</DialogTitle>
                    <DialogDescription>Agrega los buffs de los personajes de tu team</DialogDescription>
                </DialogHeader>
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
                    <Input required name="personaje" placeholder="Personaje" />
                    <DialogClose asChild>
                        <Button className="hover:bg-primary/80 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800" type="submit">Registrar</Button>
                    </DialogClose>
                </form>
            </DialogContent>
        </Dialog>
    )
}