import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TeacherSelection from './pages/evaluation/TeacherSelection'
import EvaluationForm from './pages/evaluation/EvaluationForm'
import ReportsPage from './pages/Reports/ReportsPage' // Nueva importación
import { User, Teacher, Course } from './types'
import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()

  const handleStartEvaluation = () => {
    // La navegación se manejará dentro del componente Dashboard con useNavigate
  }

  const handleViewReports = () => {
    console.log('Ver reportes')
  }

  const handleTeacherCourseSelected = (teacher: Teacher, course: Course) => {
    console.log('Profesor seleccionado:', teacher.name)
    console.log('Curso seleccionado:', course.name)
  }

  const handleBackFromEvaluation = () => {
    // La navegación se manejará dentro del componente con useNavigate
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
            user ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? <DashboardWrapper onStartEvaluation={handleStartEvaluation} onViewReports={handleViewReports} /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/evaluate/selection" 
          element={
            <TeacherSelectionWrapper 
              onTeacherCourseSelected={handleTeacherCourseSelected}
              onBack={handleBackFromEvaluation}
            />
          } 
        />
        <Route 
          path="/evaluate/form" 
          element={
            <EvaluationFormWrapper />
          } 
        />
        {/* Nueva ruta para reportes */}
        <Route 
          path="/reports" 
          element={
            <ReportsPageWrapper />
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}


function DashboardWrapper({ onStartEvaluation, onViewReports }: { 
  onStartEvaluation: () => void, 
  onViewReports: () => void 
}) {
  const { user: authUser } = useAuth()
  
  if (!authUser) {
    return <Navigate to="/login" replace />
  }
  
  // Convertir el usuario del AuthContext al formato esperado por Dashboard
  const user: User = {
    id: authUser.id,
    name: `${authUser.nombre} ${authUser.apellido}`.trim(),
    type: (authUser.tipo_usuario as any) ?? 'student',
    email: authUser.email,
  }
  
  return <Dashboard user={user} onStartEvaluation={onStartEvaluation} onViewReports={onViewReports} />
}

function TeacherSelectionWrapper({ onTeacherCourseSelected, onBack }: { 
  onTeacherCourseSelected: (teacher: Teacher, course: Course) => void,
  onBack: () => void
}) {
  const { user: authUser } = useAuth()
  
  if (!authUser) {
    return <Navigate to="/login" replace />
  }
  
  // Convertir el usuario del AuthContext al formato esperado
  const user: User = {
    id: authUser.id,
    name: `${authUser.nombre} ${authUser.apellido}`.trim(),
    type: (authUser.tipo_usuario as any) ?? 'student',
    email: authUser.email,
  }
  
  return <TeacherSelection user={user} onTeacherCourseSelected={onTeacherCourseSelected} onBack={onBack} />
}

function EvaluationFormWrapper() {
  const { user: authUser } = useAuth()
  
  if (!authUser) {
    return <Navigate to="/login" replace />
  }
  return <EvaluationForm />
}

function ReportsPageWrapper() {
  const { user: authUser } = useAuth()
  
  if (!authUser) {
    return <Navigate to="/login" replace />
  }
  
  // Convertir el usuario del AuthContext al formato esperado
  const user: User = {
    id: authUser.id,
    name: `${authUser.nombre} ${authUser.apellido}`.trim(),
    type: (authUser.tipo_usuario as any) ?? 'student',
    email: authUser.email,
  }
  
  return <ReportsPage user={user} />
}

export default App