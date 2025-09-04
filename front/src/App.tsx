import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import { User } from './types'

function App() {
  const [user, setUser] = useState<User | null>(null)

  const handleStartEvaluation = () => {
    // Aquí puedes navegar a la página de evaluación o abrir un modal, etc.
    console.log('Iniciar evaluación');
  }

  const handleViewReports = () => {
    // Aquí puedes navegar a la página de reportes
    console.log('Ver reportes');
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={setUser} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? 
              <Dashboard 
                user={user} 
                onStartEvaluation={handleStartEvaluation}
                onViewReports={handleViewReports}
              /> 
              : <Navigate to="/login" replace />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App