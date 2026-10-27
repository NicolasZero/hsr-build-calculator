import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PlusIcon } from "@phosphor-icons/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { buffOrigin, buffTarget, buffType, statBuffDependiente } from "@/const/buffType"
import { TEAM_SIZE } from "@/const/team"
import type { BuffData, Target } from "@/schema/buffData"

function BuffStatusField({ status, onStatusChange }: { status: boolean; onStatusChange: (status: boolean) => void }) {
    return (
        <div className="flex items-center gap-2">
            <label htmlFor="status">Status:</label>
            <Switch id="status" checked={status} onCheckedChange={onStatusChange} />
            <span className={status ? "text-green-500" : "text-red-500"}>{status ? "Activo" : "Inactivo"}</span>
        </div>
    )
}

interface BuffFormProps {
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>, type: "add" | "edit") => void
    onCancel: () => void
    type: "add" | "edit"
    error: string
    buffToEdit?: BuffData
}

function BuffForm({ onSubmit, onCancel, type, error, buffToEdit }: BuffFormProps) {
    const [dependiente, setDependiente] = useState(Boolean(buffToEdit?.targetStat))
    const [status, setStatus] = useState(buffToEdit?.status ?? true)
    const [objetivo, setObjetivo] = useState<Target>(buffToEdit?.objetivo ?? buffTarget[0])
    const [targetSlot, setTargetSlot] = useState(buffToEdit?.targetSlot ?? 1)

    return (
        <>
            {error && <p id="buff-form-error" className="text-red-500 text-sm" role="alert">{error}</p>}
            <form
                onSubmit={(e) => onSubmit(e, type)}
                aria-describedby={error ? "buff-form-error" : undefined}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:py-4"
            >
                <input type="hidden" name="status" value={status ? "true" : "false"} />
                <label className="text-xs">Valor (%):
                    <Input step="any" inputMode="decimal" type="number" required name="valor" placeholder="Valor (ej: 10%)" defaultValue={buffToEdit?.valor} />
                </label>

                <label className="text-xs">Tipo de Buff:
                    <Select name="buff" defaultValue={buffToEdit?.buff} required>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tipo de Buff" />
                        </SelectTrigger>
                        <SelectContent>
                            {buffType.map((buffTypeOption) => (
                                <SelectItem key={buffTypeOption} value={buffTypeOption}>
                                    {buffTypeOption}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>

                <div className="border border-dashed rounded-md bg-secondary p-2 md:p-4 md:col-span-2 space-y-3">
                    <label className="flex flex-col sm:flex-row gap-2 items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium">¿El buff depende de alguna stat del personaje?</span>
                        <Switch checked={dependiente} onCheckedChange={setDependiente} />
                    </label>

                    {dependiente && (
                        <>
                            <label className="text-xs flex flex-col gap-1">
                                <span>¿Con qué estadística escala el buff?:</span>
                                <Select name="targetStat" defaultValue={buffToEdit?.targetStat || statBuffDependiente[0]}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="¿Con cuál escala el buff?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statBuffDependiente.map((stat) => (
                                            <SelectItem key={stat} value={stat}>
                                                {stat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </label>
                            {/* <p className="text-xs text-primary">
                                Ej: Con 2000 ATQ y el buff escala con "ATQ de este personaje", el valor es "10" y el Buff es "ATQ" el buff aportará 200 de ATQ.
                            </p> */}

                            <label className="text-xs flex flex-col gap-1">
                                <span>A partir de qué valor de la stat (opcional):</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    inputMode="decimal"
                                    name="umbralStat"
                                    placeholder="Desde 0"
                                    defaultValue={buffToEdit?.umbralStat}
                                />
                            </label>

                            <p className="text-xs mt-1 text-primary">
                                El porcentaje configurado se calcula solo sobre la parte de la estadística que supere este valor.
                            </p>

                            <label className="text-xs flex flex-col gap-1">
                                <span>Valor máximo del buff (opcional):</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    inputMode="decimal"
                                    name="valorMaximo"
                                    placeholder="Sin límite"
                                    defaultValue={buffToEdit?.valorMaximo}
                                />
                            </label>

                            <p className="text-xs mt-1 text-primary">
                                Dejar vacío para que no tenga limite
                            </p>
                        </>
                    )}
                </div>

                <label className="text-xs">Origen del Buff:
                    <Select name="origen" defaultValue={buffToEdit?.origen} required>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Origen del Buff" />
                        </SelectTrigger>
                        <SelectContent>
                            {buffOrigin.map((origin) => (
                                <SelectItem key={origin} value={origin}>
                                    {origin}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>

                <label className="text-xs">Objetivo del Buff:
                    <Select name="objetivo" value={objetivo} onValueChange={(value) => setObjetivo(value as Target)} required>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Objetivo del Buff" />
                        </SelectTrigger>
                        <SelectContent>
                            {buffTarget.map((target) => (
                                <SelectItem key={target} value={target}>
                                    {target}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>

                {objetivo === "Personaje objetivo" && (
                    <label className="text-xs">
                        Posición del personaje objetivo:
                        <Select
                            name="targetSlot"
                            value={String(targetSlot)}
                            onValueChange={(value) => setTargetSlot(Number(value))}
                            required
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una posición" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: TEAM_SIZE }, (_, index) => index + 1).map((slot) => (
                                    <SelectItem key={slot} value={String(slot)}>
                                        Posición {slot}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </label>
                )}

                {buffToEdit && (
                    <BuffStatusField status={status} onStatusChange={setStatus} />
                )}

                <div className="flex justify-end gap-2 md:col-span-2">
                    <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">{type === "add" ? "Registrar" : "Editar"}</Button>
                </div>
            </form>
        </>
    )
}

interface ModalProps {
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>, type: "add" | "edit") => void
    openModal: boolean
    setOpenModal: (open: boolean) => void
    error: string
    buffToEdit?: BuffData
    setBuffToEdit: (buff: BuffData | undefined) => void
}

export default function Modal({ onSubmit, openModal, setOpenModal, error, buffToEdit, setBuffToEdit }: ModalProps) {
    const type = buffToEdit ? "edit" : "add"
    const handleOpenChange = (open: boolean) => {
        setOpenModal(open)
        if (!open) setBuffToEdit(undefined)
    }

    return (
        <Dialog open={openModal} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button type="button" onClick={() => setOpenModal(true)}>
                    <PlusIcon />Agregar Buff
                </Button>
            </DialogTrigger>
            <DialogContent className="overflow-auto max-h-[90vh] md:max-w-[60vw]" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{type === "add" ? "Agregar Nuevo Buff" : "Editar Buff"}</DialogTitle>
                    <DialogDescription>{type === "add" ? "Agrega los buffs de tu personaje" : "Edita los buffs de tu personaje"}</DialogDescription>
                </DialogHeader>
                <BuffForm
                    key={openModal ? `open-${buffToEdit?.id ?? "new"}` : "closed"}
                    onSubmit={onSubmit}
                    onCancel={() => handleOpenChange(false)}
                    type={type}
                    error={error}
                    buffToEdit={buffToEdit}
                />
            </DialogContent>
        </Dialog>
    )
}
