import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TeacherSelection from './pages/evaluation/TeacherSelection'
import { User, Teacher, Course } from './types'
import { supabase } from './lib/supabase/client'
import { useAuth } from './hooks/useAuth'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const { session, loading } = useAuth()

  // Sincronizar el estado del usuario con la sesión de Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          // Obtener datos adicionales del usuario desde la base de datos
          const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('correo', session.user.email)
            .single()

          if (!error && data) {
            setUser({
              id: data.id,
              email: data.correo,
              name: data.nombre,
              type: data.tipo,
              // otras propiedades según tu estructura
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        setUser(null)
      }
    }

    fetchUserData()
  }, [session])

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const handleTeacherCourseSelected = (teacher: Teacher, course: Course) => {
    setSelectedTeacher(teacher)
    setSelectedCourse(course)
  }

  const handleBackToDashboard = () => {
    setSelectedTeacher(null)
    setSelectedCourse(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
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
          element={
            <LoginPageWrapper 
              user={user} 
              onLogin={handleLogin} 
            />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <DashboardWrapper 
              user={user}
              onLogout={handleLogout}
            />
          } 
        />
        <Route 
          path="/evaluate" 
          element={
            <TeacherSelectionWrapper 
              user={user}
              onTeacherCourseSelected={handleTeacherCourseSelected}
              onBack={handleBackToDashboard}
            />
          } 
        />
        {/* Agrega más rutas aquí cuando crees las demás páginas */}
      </Routes>
    </BrowserRouter>
  )
}

// Wrapper components para usar useNavigate
function LoginPageWrapper({ user, onLogin }: { user: User | null, onLogin: (user: User) => void }) {
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  return <LoginPage onLogin={onLogin} />
}

function DashboardWrapper({ user, onLogout }: { 
  user: User | null, 
  onLogout: () => void
}) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Dashboard user={user} onLogout={onLogout} />
}

function TeacherSelectionWrapper({ user, onTeacherCourseSelected, onBack }: { 
  user: User | null,
  onTeacherCourseSelected: (teacher: Teacher, course: Course) => void,
  onBack: () => void
}) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <TeacherSelection onTeacherCourseSelected={onTeacherCourseSelected} onBack={onBack} />
}

export default App