import { ModeToggle } from "@/components/mode-toggle";

export default function Header() {
    return (
        <header className='flex justify-between items-center bg-muted p-4'>
            <h1 className='text-2xl md:text-3xl font-bold text-center px-3 text-primary dark:text-primary-foreground'>Build Calculator</h1>
            <ModeToggle />
        </header>
    )
}