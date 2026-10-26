import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TooltipComponent({ children, content, className }: { children: React.ReactNode, content: string, className?: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent className={className}>
                <p>{content}</p>
            </TooltipContent>
        </Tooltip>
    )
}