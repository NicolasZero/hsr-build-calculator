import uhEtoBleh from '@/assets/uh_eto_bleh.png'


export default function MaintenancePage() {
    return (
        <main>
            <img className='mt-8 m-auto w-[75%] md:w-1/3 rounded-lg' src={uhEtoBleh} alt="uh_eto_bleh" />
            <p className='text-center text-2xl my-4 text-muted-foreground'>En mantenimiento . . .</p>
        </main>
    )
}
