import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TeacherSelection from './pages/evaluation/TeacherSelection'
import EvaluationForm from './pages/evaluation/EvaluationForm'
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

function DashboardWrapper({ user, onStartEvaluation, onViewReports }: { 
  user: User | null, 
  onStartEvaluation: () => void, 
  onViewReports: () => void 
}) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Dashboard user={user} onStartEvaluation={onStartEvaluation} onViewReports={onViewReports} />
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

export default App