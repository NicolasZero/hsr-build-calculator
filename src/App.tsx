import { Routes, Route, Navigate } from 'react-router'
import Layout from './components/layout/layout'
import { lazy } from 'react'
import CharacterBuilderPage from '@/pages/createCharacterPage'
import MaintenancePage from './pages/maintenance'
import { TeamProvider } from "@/contexts/TeamProvider";

const TeamPage = lazy(() => import('@/pages/teamPage'))
const SavedCharactersPage = lazy(() => import('@/pages/savedCharactersPage'))
const DamageCalculatorPage = lazy(() => import('@/pages/damageCalculatorPage'))
const SettingsPage = lazy(() => import('@/pages/settingsPage'))


function App() {

  return (
    <TeamProvider>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<CharacterBuilderPage />} />
          <Route path='characters' element={<SavedCharactersPage />} />
          <Route path='build-calc' element={<MaintenancePage />} />
          <Route path='dmg-calc' element={<DamageCalculatorPage />} />
          <Route path='speed-calc' element={<MaintenancePage />} />
          <Route path='teams' element={<TeamPage />} />
          <Route path='settings' element={<SettingsPage />} />
          <Route path='*' element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </TeamProvider>
  )
}

export default App
