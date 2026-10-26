import { useTheme } from "@/components/layout/theme-provider"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon, SpinnerIcon } from "@phosphor-icons/react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircleIcon className="size-5 text-emerald-800 dark:text-emerald-600" />
        ),
        info: (
          <InfoIcon className="size-5 text-blue-800 dark:text-blue-600" />
        ),
        warning: (
          <WarningIcon className="size-5 text-amber-800 dark:text-amber-600" />
        ),
        error: (
          <XCircleIcon className="size-5 text-red-800 dark:text-red-600" />
        ),
        loading: (
          <SpinnerIcon className="size-5 animate-spin text-primary" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
