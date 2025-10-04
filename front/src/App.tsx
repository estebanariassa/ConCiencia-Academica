import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TeacherSelection from './pages/evaluation/TeacherSelection'
import EvaluationForm from './pages/evaluation/EvaluationForm'
import ReportsPage from './pages/Reports/ReportsPage' // Nueva importación
import { User, Teacher, Course } from './types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const handleLogin = (userData: User) => {
    setUser(userData)
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
    console.log('Profesor seleccionado:', teacher.name)
    console.log('Curso seleccionado:', course.name)
  }

  const handleBackFromEvaluation = () => {
    setSelectedTeacher(null)
    setSelectedCourse(null)
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
            />
          } 
        />
        <Route 
          path="/evaluate/selection" 
          element={
            <TeacherSelectionWrapper 
              user={user}
              onTeacherCourseSelected={handleTeacherCourseSelected}
              onBack={handleBackFromEvaluation}
            />
          } 
        />
        <Route 
          path="/evaluate/form" 
          element={
            <EvaluationFormWrapper 
              user={user}
            />
          } 
        />
        {/* Nueva ruta para reportes */}
        <Route 
          path="/reports" 
          element={
            <ReportsPageWrapper 
              user={user}
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

// Wrapper components para usar useNavigate
function LoginPageWrapper({ user, onLogin }: { user: User | null, onLogin: (user: User) => void }) {
  try {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) {
      const u = JSON.parse(stored)
      const normalized: User = {
        id: u.id,
        name: `${u.nombre} ${u.apellido}`.trim(),
        type: (u.tipo_usuario as any) ?? 'student',
        email: u.email,
      }
      onLogin(normalized)
      return <Navigate to="/dashboard" replace />
    }
  } catch {}
  return <Login />
}

function DashboardWrapper({ user, onStartEvaluation, onViewReports }: { 
  user: User | null, 
  onStartEvaluation: () => void, 
  onViewReports: () => void 
}) {
  let effectiveUser = user
  if (!effectiveUser) {
    try {
      const stored = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (stored && token) {
        const u = JSON.parse(stored)
        effectiveUser = {
          id: u.id,
          name: `${u.nombre} ${u.apellido}`.trim(),
          type: (u.tipo_usuario as any) ?? 'student',
          email: u.email,
        }
      }
    } catch {}
  }
  if (!effectiveUser) return <Navigate to="/login" replace />
  return <Dashboard user={effectiveUser} onStartEvaluation={onStartEvaluation} onViewReports={onViewReports} />
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

function EvaluationFormWrapper({ user }: { user: User | null }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <EvaluationForm />
}

// Nuevo wrapper para ReportsPage
function ReportsPageWrapper({ user }: { user: User | null }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <ReportsPage user={user} />
}

export default App