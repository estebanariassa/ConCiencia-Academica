import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TeacherSelection from './pages/evaluation/TeacherSelection'
import EvaluationForm from './pages/evaluation/EvaluationForm'
import ConfirmationPage from './pages/evaluation/ConfirmationPage'
import ReportsPage from './pages/ReportsPage'
import { User, Teacher, Course, EvaluationData } from './types'
import { supabase } from './lib/supabase/client'
import { useAuth } from './hooks/useAuth'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null)
  const { session, loading } = useAuth()

  // Sincronizar el estado del usuario con la sesión de Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
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
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleStartEvaluation = () => {
    // La navegación se manejará dentro del componente Dashboard con useNavigate
  }

  const handleViewReports = () => {
    console.log('Ver reportes')
  }

  const handleTeacherCourseSelected = (teacher: Teacher, course: Course) => {
    setSelectedTeacher(teacher)
    setSelectedCourse(course)
  }

  const handleEvaluationSubmit = (data: EvaluationData) => {
    setEvaluationData(data)
  }

  const handleBackToDashboard = () => {
    setSelectedTeacher(null)
    setSelectedCourse(null)
    setEvaluationData(null)
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Cargando...</div>
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
              onStartEvaluation={handleStartEvaluation}
              onViewReports={handleViewReports}
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
        <Route 
          path="/evaluation-form" 
          element={
            <EvaluationFormWrapper 
              user={user}
              teacher={selectedTeacher}
              course={selectedCourse}
              onSubmit={handleEvaluationSubmit}
              onBack={() => setSelectedTeacher(null)}
            />
          } 
        />
        <Route 
          path="/confirmation" 
          element={
            <ConfirmationPageWrapper 
              user={user}
              evaluationData={evaluationData}
              teacher={selectedTeacher}
              course={selectedCourse}
              onBackToDashboard={handleBackToDashboard}
            />
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ReportsPageWrapper 
              user={user}
              onBack={handleBackToDashboard}
            />
          } 
        />
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

function DashboardWrapper({ user, onStartEvaluation, onViewReports, onLogout }: { 
  user: User | null, 
  onStartEvaluation: () => void, 
  onViewReports: () => void,
  onLogout: () => void
}) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return (
    <Dashboard 
      user={user} 
      onStartEvaluation={onStartEvaluation} 
      onViewReports={onViewReports}
      onLogout={onLogout}
    />
  )
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

function EvaluationFormWrapper({ user, teacher, course, onSubmit, onBack }: { 
  user: User | null,
  teacher: Teacher | null,
  course: Course | null,
  onSubmit: (data: EvaluationData) => void,
  onBack: () => void
}) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (!teacher || !course) {
    return <Navigate to="/evaluate" replace />
  }
  return (
    <EvaluationForm 
      teacher={teacher}
      course={course}
      user={user}
      onSubmit={onSubmit}
      onBack={onBack}
    />
  )
}

function ConfirmationPageWrapper({ user, evaluationData, teacher, course, onBackToDashboard }: { 
  user: User | null,
  evaluationData: EvaluationData | null,
  teacher: Teacher | null,
  course: Course | null,
  onBackToDashboard: () => void
}) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (!evaluationData || !teacher || !course) {
    return <Navigate to="/dashboard" replace />
  }
  return (
    <ConfirmationPage 
      evaluationData={evaluationData}
      teacher={teacher}
      course={course}
      onBackToDashboard={onBackToDashboard}
    />
  )
}

function ReportsPageWrapper({ user, onBack }: { 
  user: User | null,
  onBack: () => void
}) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <ReportsPage user={user} onBack={onBack} />
}

export default App