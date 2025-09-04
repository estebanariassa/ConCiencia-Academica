// pages/Dashboard.tsx
import { motion } from 'framer-motion';
import { 
  CardHeader, 
  CardContent, 
  CardDescription, 
  CardTitle 
} from '../components/Card';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar';
import { User } from '../types';
import { 
  GraduationCap, 
  UserCheck, 
  Settings, 
  Calendar, 
  ClipboardCheck, 
  BarChart3, 
  Bell, 
  Star,
  BookOpen,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';

// Importar la imagen de fondo
const fondo = new URL('../assets/fondo.webp', import.meta.url).href;

interface DashboardProps {
  user: User;
  onStartEvaluation: () => void;
  onViewReports: () => void;
}

export default function Dashboard({ user, onStartEvaluation, onViewReports }: DashboardProps) {
  const getUserIcon = () => {
    switch (user.type) {
      case 'student':
        return <GraduationCap className="h-5 w-5" />;
      case 'teacher':
        return <UserCheck className="h-5 w-5" />;
      case 'coordinator':
        return <Settings className="h-5 w-5" />;
      default:
        return <GraduationCap className="h-5 w-5" />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const mockStats = {
    student: {
      evaluationsPending: 3,
      evaluationsCompleted: 12,
      currentCourses: 6
    },
    teacher: {
      averageRating: 4.7,
      totalEvaluations: 45,
      coursesTeaching: 4
    },
    coordinator: {
      totalTeachers: 24,
      evaluationsCompleted: 180,
      averageRating: 4.5
    }
  };

  const mockNotifications = [
    { id: 1, text: 'Nueva evaluación disponible para Matemáticas I', time: '2 horas', urgent: true },
    { id: 2, text: 'Recordatorio: Evaluación de Física II vence mañana', time: '1 día', urgent: false },
    { id: 3, text: 'Resultados de evaluación publicados', time: '3 días', urgent: false }
  ];

  const mockUpcomingEvaluations = [
    { id: 1, course: 'Matemáticas I', teacher: 'Dr. Juan Pérez', deadline: '2025-01-25' },
    { id: 2, course: 'Física II', teacher: 'Dra. Ana Martín', deadline: '2025-01-28' },
    { id: 3, course: 'Química Orgánica', teacher: 'Prof. Luis García', deadline: '2025-02-02' }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay más claro */}
      <div className="absolute inset-0 bg-white bg-opacity-90"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 p-4 lg:p-6 shadow-sm"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Sistema de Evaluación</h1>
                  <p className="text-sm text-gray-600">Universidad XYZ</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-red-600 text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <div className="flex items-center gap-1">
                    {getUserIcon()}
                    <p className="text-xs text-gray-600 capitalize">{user.type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-semibold text-gray-900">
              {getGreeting()}, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-gray-600">
              Aquí tienes un resumen de tu actividad reciente en el sistema.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.type === 'student' && (
              <>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <Card className="relative overflow-hidden bg-white shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-transparent" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                      <CardTitle className="text-sm font-medium">Evaluaciones Pendientes</CardTitle>
                      <ClipboardCheck className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-red-600">{mockStats.student.evaluationsPending}</div>
                      <p className="text-xs text-gray-500">Deben completarse pronto</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Evaluaciones Completadas</CardTitle>
                      <Star className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{mockStats.student.evaluationsCompleted}</div>
                      <p className="text-xs text-gray-500">Este período académico</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cursos Actuales</CardTitle>
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{mockStats.student.currentCourses}</div>
                      <p className="text-xs text-gray-500">Cursos matriculados</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}

            {user.type === 'teacher' && (
              <>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <Card className="relative overflow-hidden bg-white shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-transparent" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                      <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
                      <Star className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-red-600">{mockStats.teacher.averageRating}/5.0</div>
                      <p className="text-xs text-gray-500">Últimas evaluaciones</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{mockStats.teacher.totalEvaluations}</div>
                      <p className="text-xs text-gray-500">Evaluaciones recibidas</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cursos Impartidos</CardTitle>
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{mockStats.teacher.coursesTeaching}</div>
                      <p className="text-xs text-gray-500">Este semestre</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}

            {user.type === 'coordinator' && (
              <>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <Card className="relative overflow-hidden bg-white shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-transparent" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                      <CardTitle className="text-sm font-medium">Total Docentes</CardTitle>
                      <Users className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-red-600">{mockStats.coordinator.totalTeachers}</div>
                      <p className="text-xs text-gray-500">En el departamento</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Evaluaciones Completadas</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{mockStats.coordinator.evaluationsCompleted}</div>
                      <p className="text-xs text-gray-500">Este período</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Calificación Media</CardTitle>
                      <Star className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{mockStats.coordinator.averageRating}/5.0</div>
                      <p className="text-xs text-gray-500">Promedio departamental</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5" />
                    Acciones Rápidas
                  </CardTitle>
                  <CardDescription>
                    Accede rápidamente a las funciones más utilizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.type === 'student' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={onStartEvaluation}
                          className="w-full h-auto p-4 bg-red-600 hover:bg-red-700 text-white flex flex-col items-center gap-2"
                        >
                          <ClipboardCheck className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-medium">Nueva Evaluación</div>
                            <div className="text-xs opacity-80">Evaluar un docente</div>
                          </div>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full h-auto p-4 flex flex-col items-center gap-2 border-gray-300"
                        >
                          <Calendar className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-medium">Ver Calendario</div>
                            <div className="text-xs opacity-80">Fechas importantes</div>
                          </div>
                        </Button>
                      </motion.div>
                    </div>
                  )}

                  {(user.type === 'teacher' || user.type === 'coordinator') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={onViewReports}
                          className="w-full h-auto p-4 bg-red-600 hover:bg-red-700 text-white flex flex-col items-center gap-2"
                        >
                          <BarChart3 className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-medium">Ver Reportes</div>
                            <div className="text-xs opacity-80">Análisis y estadísticas</div>
                          </div>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full h-auto p-4 flex flex-col items-center gap-2 border-gray-300"
                        >
                          <Settings className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-medium">Configuración</div>
                            <div className="text-xs opacity-80">Ajustes del sistema</div>
                          </div>
                        </Button>
                      </motion.div>
                    </div>
                  )}

                  {user.type === 'student' && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Evaluaciones Próximas</h4>
                      <div className="space-y-2">
                        {mockUpcomingEvaluations.map((evaluation, index) => (
                          <motion.div
                            key={evaluation.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm text-gray-900">{evaluation.course}</p>
                              <p className="text-xs text-gray-600">{evaluation.teacher}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {evaluation.deadline}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className={`p-3 rounded-lg border transition-colors ${
                        notification.urgent 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}