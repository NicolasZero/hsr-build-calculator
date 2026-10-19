import { useEffect, useRef } from "react"
import { CheckCircleIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const ALERT_DURATION = 5000

interface StatusAlertsProps {
    error?: string | string[]
    message?: string
    onDismissError?: () => void
    onDismissMessage?: () => void
}

export default function StatusAlerts({
    error,
    message,
    onDismissError,
    onDismissMessage,
}: StatusAlertsProps) {
    const dismissErrorRef = useRef(onDismissError)
    const dismissMessageRef = useRef(onDismissMessage)
    const hasError = Array.isArray(error) ? error.length > 0 : Boolean(error)

    useEffect(() => {
        dismissErrorRef.current = onDismissError
    }, [onDismissError])

    useEffect(() => {
        dismissMessageRef.current = onDismissMessage
    }, [onDismissMessage])

    useEffect(() => {
        if (!hasError) return

        const timeout = setTimeout(() => dismissErrorRef.current?.(), ALERT_DURATION)
        return () => clearTimeout(timeout)
    }, [hasError, error])

    useEffect(() => {
        if (!message) return

        const timeout = setTimeout(() => dismissMessageRef.current?.(), ALERT_DURATION)
        return () => clearTimeout(timeout)
    }, [message])

    if (!hasError && !message) return null

    return (
        <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-auto sm:w-[calc(100vw-2rem)] sm:max-w-sm">
            {message && (
                <Alert className="pointer-events-auto border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircleIcon />
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                    <AlertAction>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => dismissMessageRef.current?.()}
                            aria-label="Cerrar mensaje de éxito"
                            title="Cerrar mensaje"
                        >
                            <XIcon />
                        </Button>
                    </AlertAction>
                </Alert>
            )}

            {hasError && (
                <Alert variant="destructive" className="pointer-events-auto">
                    <WarningCircleIcon />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {Array.isArray(error) ? (
                            <ul className="list-disc pl-4">
                                {error.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                            </ul>
                        ) : error}
                    </AlertDescription>
                    <AlertAction>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => dismissErrorRef.current?.()}
                            aria-label="Cerrar mensaje de error"
                            title="Cerrar mensaje"
                        >
                            <XIcon />
                        </Button>
                    </AlertAction>
                </Alert>
            )}
        </div>
    )
}
