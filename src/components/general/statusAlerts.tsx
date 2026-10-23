import { useEffect, useRef, useState, type ReactNode } from "react"
import { CheckCircleIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const DEFAULT_DURATION = 5000 // 5000 = 5 segundos

export interface AlertProps {
    error: string | string[]
    message: string
    onDismissError: () => void
    onDismissMessage: () => void
}

export interface StatusAlertsProps extends AlertProps {
    duration?: number
}

function useAutoDismiss(active: boolean, onDismiss: () => void, duration = DEFAULT_DURATION) {
    const callbackRef = useRef(onDismiss)
    callbackRef.current = onDismiss

    useEffect(() => {
        if (!active) return

        if (duration !== 0) {
            const timer = setTimeout(() => callbackRef.current(), duration)
            return () => clearTimeout(timer)
        }
    }, [active, duration])
}

interface AlertItemProps {
    variant?: "default" | "destructive" | "success"
    className?: string
    icon: ReactNode
    title: string
    onDismiss: () => void
    dismissLabel: string
    children: ReactNode
}

function AlertItem({
    variant = "default",
    className,
    icon,
    title,
    onDismiss,
    dismissLabel,
    children,
}: AlertItemProps) {
    return (
        <Alert variant={variant} className={`pointer-events-auto ${className ?? ""}`}>
            {icon}
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{children}</AlertDescription>
            <AlertAction>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={onDismiss}
                    aria-label={dismissLabel}
                    title={dismissLabel}
                >
                    <XIcon />
                </Button>
            </AlertAction>
        </Alert>
    )
}

export function useStatusAlerts() {
    const [error, setError] = useState<string | string[]>("")
    const [message, setMessage] = useState<string>("")

    const showSuccess = (msg: string) => {
        setError("")
        setMessage(msg)
    }

    const showError = (err: string | string[]) => {
        setMessage("")
        setError(err)
    }

    const clear = () => {
        setError("")
        setMessage("")
    }

    return {
        error,
        message,
        setError,
        setMessage,
        showSuccess,
        showError,
        clear,
        alertProps: {
            error,
            message,
            onDismissError: () => setError(""),
            onDismissMessage: () => setMessage(""),
        },
    }
}

export default function StatusAlerts({
    error,
    message,
    onDismissError,
    onDismissMessage,
    duration = DEFAULT_DURATION,
}: StatusAlertsProps) {
    const hasError = Array.isArray(error) ? error.length > 0 : Boolean(error)

    useAutoDismiss(Boolean(message), onDismissMessage, duration)
    useAutoDismiss(hasError, onDismissError, duration)

    if (!hasError && !message) return null

    return (
        <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-auto sm:w-[calc(100vw-2rem)] sm:max-w-lg">
            {message && (
                <AlertItem
                    variant="success"
                    icon={<CheckCircleIcon />}
                    title="Éxito"
                    onDismiss={onDismissMessage}
                    dismissLabel="Cerrar mensaje de éxito"
                >
                    {message}
                </AlertItem>
            )}

            {hasError && (
                <AlertItem
                    variant="destructive"
                    icon={<WarningCircleIcon />}
                    title="Error"
                    onDismiss={onDismissError}
                    dismissLabel="Cerrar mensaje de error"
                >
                    {Array.isArray(error) ? (
                        <ul className="list-disc pl-4">
                            {error.map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        error
                    )}
                </AlertItem>
            )}
        </div>
    )
}