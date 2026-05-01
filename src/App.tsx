import './App.css'
import uhEtoBleh from '@/assets/uh_eto_bleh.png'
import { ModeToggle } from '@/components/mode-toggle'
import TeamBuilder from '@/components/teamBuilder'

function App() {

  return (
    <>
      <header className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-center px-3 text-primary dark:text-fuchsia-700'>Aplicación para calcular builds en HSR</h1>
        <ModeToggle />
      </header>

      <main>
        <TeamBuilder />

        <img className='mt-8 m-auto w-1/3 rounded-lg' src={uhEtoBleh} alt="uh_eto_bleh" />
        <p className='text-center text-2xl my-4 text-muted-foreground'>En proceso . . .</p>
      </main>

      <footer className='flex justify-center items-center'>
        <p className='text-center my-4'>Creado por <span className='font-bold text-blue-600 dark:text-blue-400'>Nico</span> - 2026</p>
      </footer>
    </>
  )
}

export default App
