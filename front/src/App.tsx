import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import { User } from './types'

function App() {
  const [user, setUser] = useState<User | null>(null)

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
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App