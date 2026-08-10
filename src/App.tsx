import { Routes, Route, Navigate } from 'react-router'
import Layout from './layout'
// import CharacterBuilderPage from './pages/teamBuilder'
import Loader from '@/components/loader'
import { lazy, Suspense } from 'react'
// import DMGCalc from './pages/dmgCalc'
// import SpeedCalc from './pages/speedCalc'
import TeamPage from './pages/teamPage'
import MaintenancePage from './pages/maintenance'
import { TeamProvider } from "@/contexts/teamContext";

const CharacterBuilderPage = lazy(() => import('@/pages/teamBuilder'))


function App() {

  return (
    <TeamProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<CharacterBuilderPage />} />
            <Route path='build-calc' element={<MaintenancePage />} />
            <Route path='dmg-calc' element={<MaintenancePage />} />
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
