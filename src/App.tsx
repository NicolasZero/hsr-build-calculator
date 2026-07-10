import { Routes, Route, Navigate } from 'react-router'
import Layout from './layout'
import TeamBuilderPage from './pages/teamBuilder'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<TeamBuilderPage />} />
        <Route path='*' element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
