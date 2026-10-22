import { SpinnerGapIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

export default function Loader() {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center p-10">
            <div className="flex items-center gap-2 text-muted-foreground">
                <SpinnerGapIcon className="w-5 h-5 animate-spin" /> {t("loading")}
            </div>
        </div>
    )
}