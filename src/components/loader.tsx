import { SpinnerGapIcon } from "@phosphor-icons/react";

export default function Loader() {
    return (
        <div className="flex items-center justify-center p-10">
            <div className="flex items-center gap-2 text-muted-foreground">
                <SpinnerGapIcon className="w-5 h-5 animate-spin" /> Cargando...
            </div>
        </div>
    )
}