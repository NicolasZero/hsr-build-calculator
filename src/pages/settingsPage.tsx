import { useState, useRef, useEffect, useTransition } from "react"
import { useTranslation } from "react-i18next"
import {
    GearIcon,
    MoonIcon,
    SunIcon,
    DesktopIcon,
    TranslateIcon,
    DatabaseIcon,
    TrashIcon,
    DownloadSimpleIcon,
    UploadSimpleIcon,
    WarningCircleIcon,
    CheckCircleIcon,
    UserIcon,
    FloppyDiskIcon
} from "@phosphor-icons/react"

import { useTheme } from "@/components/layout/theme-provider"
import { useCharacter, useTeam } from "@/contexts/teamContext"
import {
    obtenerPersonajes,
    limpiarBaseDeDatos,
    exportarBaseDeDatosCompleta,
    exportarPersonajePorId,
    importarDatos,
    type StoredCharacterBuild,
    type DatabaseExportData
} from "@/lib/indexedDB"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function SettingsPage() {
    const { t, i18n } = useTranslation()
    const { theme, setTheme } = useTheme()
    const { refreshSavedCharacters, resetCharacter } = useCharacter()
    const { refreshTeams } = useTeam()

    const [characters, setCharacters] = useState<StoredCharacterBuild[]>([])
    const [selectedCharId, setSelectedCharId] = useState<string>("")
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
    const [pendingImportData, setPendingImportData] = useState<DatabaseExportData | null>(null)
    const [importMode, setImportMode] = useState<"merge" | "replace">("merge")
    const [isProcessing, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const loadLocalCharacters = async () => {
        try {
            const list = await obtenerPersonajes()
            setCharacters(list)
            if (list.length > 0 && !selectedCharId) {
                setSelectedCharId(String(list[0].id))
            }
        } catch {
            // Silently handle error or report
        }
    }

    useEffect(() => {
        loadLocalCharacters()
    }, [])

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value)
        toast.success(value === "es" ? "Idioma cambiado a Español" : "Language changed to English")
    }

    const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
        setTheme(newTheme)
        toast.success(
            newTheme === "dark"
                ? "Tema oscuro activado"
                : newTheme === "light"
                    ? "Tema claro activado"
                    : "Tema del sistema activado"
        )
    }

    const triggerDownload = (data: object, filename: string) => {
        const jsonStr = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonStr], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleExportFullDB = async () => {
        try {
            const data = await exportarBaseDeDatosCompleta()
            const dateStr = new Date().toISOString().split("T")[0]
            triggerDownload(data, `hsk_builder_backup_${dateStr}.json`)
            toast.success("Base de datos exportada con éxito")
        } catch {
            toast.error("Error al exportar la base de datos")
        }
    }

    const handleExportSingleCharacter = async () => {
        const id = Number(selectedCharId)
        if (!id) {
            toast.warning("Selecciona un personaje para exportar")
            return
        }

        try {
            const data = await exportarPersonajePorId(id)
            if (!data) {
                toast.error("No se encontró el personaje seleccionado")
                return
            }
            const charName = data.characters[0]?.name || `char_${id}`
            const safeName = charName.replace(/[^a-zA-Z0-9_\-]/g, "_").toLowerCase()
            triggerDownload(data, `personaje_${safeName}.json`)
            toast.success(`Personaje "${charName}" exportado correctamente`)
        } catch {
            toast.error("Error al exportar el personaje")
        }
    }

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const parsed = JSON.parse(content) as DatabaseExportData
                if (!parsed || !Array.isArray(parsed.characters)) {
                    throw new Error("Formato no válido")
                }
                setPendingImportData(parsed)
                setIsImportDialogOpen(true)
            } catch {
                toast.error("El archivo seleccionado no es un JSON de respaldo válido")
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
            }
        }
        reader.readAsText(file)
    }

    const executeImport = () => {
        if (!pendingImportData) return

        startTransition(async () => {
            try {
                const result = await importarDatos(pendingImportData, importMode)
                await refreshSavedCharacters()
                await refreshTeams()
                await loadLocalCharacters()
                setIsImportDialogOpen(false)
                setPendingImportData(null)
                toast.success(
                    `Importación completada: ${result.importedCharacters} personaje(s), ${result.importedTeams} equipo(s).`
                )
            } catch {
                toast.error("Ocurrió un error al importar los datos")
            }
        })
    }

    const handleClearDatabase = () => {
        startTransition(async () => {
            try {
                await limpiarBaseDeDatos()
                resetCharacter()
                await refreshSavedCharacters()
                await refreshTeams()
                setCharacters([])
                setSelectedCharId("")
                setIsClearDialogOpen(false)
                toast.success("Base de datos limpiada correctamente")
            } catch {
                toast.error("Error al limpiar la base de datos")
            }
        })
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8 min-h-[calc(100vh-140px)]">
            <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <GearIcon size={32} weight="duotone" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-sm text-muted-foreground">
                        Administra la apariencia, idioma y copias de seguridad de la aplicación
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* APARIENCIA / TEMA */}
                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <SunIcon size={22} className="text-amber-500" />
                            Apariencia
                        </CardTitle>
                        <CardDescription>
                            Selecciona el tema visual de la interfaz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={theme === "light" ? "default" : "outline"}
                                className="flex flex-col h-auto py-3 gap-1"
                                onClick={() => handleThemeChange("light")}
                            >
                                <SunIcon size={20} />
                                <span className="text-xs">Claro</span>
                            </Button>
                            <Button
                                variant={theme === "dark" ? "default" : "outline"}
                                className="flex flex-col h-auto py-3 gap-1"
                                onClick={() => handleThemeChange("dark")}
                            >
                                <MoonIcon size={20} />
                                <span className="text-xs">Oscuro</span>
                            </Button>
                            <Button
                                variant={theme === "system" ? "default" : "outline"}
                                className="flex flex-col h-auto py-3 gap-1"
                                onClick={() => handleThemeChange("system")}
                            >
                                <DesktopIcon size={20} />
                                <span className="text-xs">Sistema</span>
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground border-t pt-3">
                        Tema actual: <span className="font-semibold ml-1 capitalize">{theme}</span>
                    </CardFooter>
                </Card>

                {/* IDIOMA */}
                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TranslateIcon size={22} className="text-blue-500" />
                            Idioma
                        </CardTitle>
                        <CardDescription>
                            Selecciona tu idioma preferido para la aplicación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Idioma de la interfaz</label>
                            <Select
                                value={i18n.language ? i18n.language.split("-")[0] : "es"}
                                onValueChange={handleLanguageChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un idioma" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="es">Español</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground border-t pt-3">
                        Idioma activo: <span className="font-semibold ml-1">{i18n.language?.startsWith("en") ? "English" : "Español"}</span>
                    </CardFooter>
                </Card>
            </div>

            {/* SECCIÓN BASE DE DATOS */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <DatabaseIcon size={22} className="text-emerald-500" />
                        Gestión de los Datos Guardados
                    </CardTitle>
                    <CardDescription>
                        Exporta tus personajes y configuraciones para mantener respaldos, o importa datos existentes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* EXPORTAR COMPLETA */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold flex items-center gap-1.5">
                                <DownloadSimpleIcon size={18} />
                                Exportar todos los datos
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Genera un archivo .json con todos tus personajes guardados y equipos.
                            </p>
                        </div>
                        <Button onClick={handleExportFullDB} variant="outline" className="shrink-0 gap-2">
                            <FloppyDiskIcon size={18} />
                            Exportar Todo
                        </Button>
                    </div>

                    {/* EXPORTAR PERSONAJE INDIVIDUAL */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold flex items-center gap-1.5">
                                <UserIcon size={18} />
                                Exportar personaje individual
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Selecciona una build específica para compartirla o guardarla por separado.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select
                                value={selectedCharId}
                                onValueChange={setSelectedCharId}
                                disabled={characters.length === 0}
                            >
                                <SelectTrigger className="w-full sm:w-50">
                                    <SelectValue placeholder={characters.length === 0 ? "Sin personajes" : "Selecciona personaje"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {characters.map((char) => (
                                        <SelectItem key={char.id} value={String(char.id)}>
                                            {char.name || "Sin nombre"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleExportSingleCharacter}
                                variant="outline"
                                disabled={characters.length === 0 || !selectedCharId}
                                className="shrink-0"
                            >
                                Exportar
                            </Button>
                        </div>
                    </div>

                    {/* IMPORTAR ARCHIVO */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold flex items-center gap-1.5">
                                <UploadSimpleIcon size={18} />
                                Importar datos desde JSON
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Carga personajes o copias de seguridad completas desde un archivo .json.
                            </p>
                        </div>
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,application/json"
                                className="hidden"
                                onChange={handleFileSelected}
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="shrink-0 gap-2"
                            >
                                <UploadSimpleIcon size={18} />
                                Seleccionar archivo
                            </Button>
                        </div>
                    </div>

                    {/* LIMPIAR BASE DE DATOS */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                                <WarningCircleIcon size={18} />
                                Limpiar base de datos
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Borra permanentemente todos los personajes y equipos guardados en este navegador.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => setIsClearDialogOpen(true)}
                            className="shrink-0 gap-2"
                        >
                            <TrashIcon size={18} />
                            Limpiar BD
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* MODAL DIALOG: CONFIRMAR LIMPIAR BD */}
            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <WarningCircleIcon size={20} />
                            ¿Limpiar toda la base de datos?
                        </DialogTitle>
                        <DialogDescription>
                            Esta acción eliminará de forma irreversible todos los personajes guardados y equipos de tu navegador. Te recomendamos exportar una copia antes de continuar.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsClearDialogOpen(false)} disabled={isProcessing}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleClearDatabase} disabled={isProcessing}>
                            {isProcessing ? "Limpiando..." : "Sí, limpiar todo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL DIALOG: CONFIRMAR IMPORTACIÓN */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircleIcon size={20} className="text-emerald-500" />
                            Confirmar importación de datos
                        </DialogTitle>
                        <DialogDescription>
                            Se detectaron{" "}
                            <span className="font-semibold text-foreground">
                                {pendingImportData?.characters.length ?? 0} personaje(s)
                            </span>{" "}
                            y{" "}
                            <span className="font-semibold text-foreground">
                                {pendingImportData?.teams?.length ?? 0} equipo(s)
                            </span>{" "}
                            en el archivo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <label className="text-sm font-medium">Modo de importación:</label>
                        <div className="space-y-2">
                            <label className="flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="merge"
                                    checked={importMode === "merge"}
                                    onChange={() => setImportMode("merge")}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="text-sm font-semibold">Combinar (Recomendado)</div>
                                    <div className="text-xs text-muted-foreground">
                                        Agrega los personajes y equipos nuevos sin borrar tus datos actuales.
                                    </div>
                                </div>
                            </label>
                            <label className="flex items-start gap-2 p-2.5 rounded-lg border border-destructive/30 cursor-pointer hover:bg-destructive/10 transition-colors">
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="replace"
                                    checked={importMode === "replace"}
                                    onChange={() => setImportMode("replace")}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-destructive">Reemplazar todo</div>
                                    <div className="text-xs text-muted-foreground">
                                        Borra los datos existentes y los reemplaza con los del archivo.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsImportDialogOpen(false)
                                setPendingImportData(null)
                            }}
                            disabled={isProcessing}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={executeImport} disabled={isProcessing}>
                            {isProcessing ? "Importando..." : "Importar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}

