import { Button } from "@/components/ui/button"
import { InfoIcon } from "@phosphor-icons/react"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"

export function MoreInfo({ title, description }: { title: string, description: string }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="icon" variant="ghost"><InfoIcon /></Button>
            </PopoverTrigger>
            <PopoverContent align="start">
                <PopoverHeader>
                    <PopoverTitle>{title}</PopoverTitle>
                    <PopoverDescription>
                        {description}
                    </PopoverDescription>
                </PopoverHeader>
            </PopoverContent>
        </Popover>
    )
}
