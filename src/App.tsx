import { Routes, Route, Navigate } from 'react-router'
import Layout from './components/layout/layout'
import Loader from '@/components/layout/loader'
import { lazy, Suspense } from 'react'
import MaintenancePage from './pages/maintenance'
import { TeamProvider } from "@/contexts/TeamProvider";

const CharacterBuilderPage = lazy(() => import('@/pages/createCharacterPage'))
const TeamPage = lazy(() => import('@/pages/teamPage'))
const SavedCharactersPage = lazy(() => import('@/pages/savedCharactersPage'))
const DamageCalculatorPage = lazy(() => import('@/pages/damageCalculatorPage'))


function App() {

  return (
    <TeamProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<CharacterBuilderPage />} />
            <Route path='characters' element={<SavedCharactersPage />} />
            <Route path='build-calc' element={<MaintenancePage />} />
            <Route path='dmg-calc' element={<DamageCalculatorPage />} />
            <Route path='speed-calc' element={<MaintenancePage />} />
            <Route path='teams' element={<TeamPage />} />
            <Route path='*' element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </TeamProvider>
  )
}

export default App
