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
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay más sutil para mejor legibilidad */}
      <div className="absolute inset-0 bg-white bg-opacity-60"></div>
      
      <div className="relative z-10">
        {/* Header simplificado */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 p-4 lg:p-6"
        >
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Sistema de Evaluación</h1>
                <p className="text-sm text-gray-600">Universidad XYZ</p>
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

        <main className="max-w-[1800px] mx-auto p-6 lg:p-8 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h2 className="text-3xl font-semibold text-gray-900">
              {getGreeting()}, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-lg text-gray-600">
              Aquí tienes un resumen de tu actividad reciente en el sistema.
            </p>
          </motion.div>

          {/* Stats Cards - Diseño similar a la referencia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Evaluaciones Pendientes */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Evaluaciones Pendientes</CardTitle>
                  <ClipboardCheck className="h-6 w-6 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{mockStats.student.evaluationsPending}</div>
                  <p className="text-sm text-gray-500 mt-2">Deben completarse pronto</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Evaluaciones Completadas */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Evaluaciones Completadas</CardTitle>
                  <Star className="h-6 w-6 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{mockStats.student.evaluationsCompleted}</div>
                  <p className="text-sm text-gray-500 mt-2">Este período académico</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cursos Actuales */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Cursos Actuales</CardTitle>
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{mockStats.student.currentCourses}</div>
                  <p className="text-sm text-gray-500 mt-2">Cursos matriculados</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Acciones Rápidas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white shadow-md border border-gray-200 p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900">Acciones Rápidas</CardTitle>
                    <CardDescription className="text-base">
                      Accede rápidamente a las funciones más utilizadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={onStartEvaluation}
                          className="w-full h-auto py-5 bg-red-600 hover:bg-red-700 text-white flex flex-col items-center gap-3"
                        >
                          <ClipboardCheck className="h-8 w-8" />
                          <div className="text-center">
                            <div className="font-medium text-lg">Nueva Evaluación</div>
                            <div className="text-sm opacity-80">Evaluar un docente</div>
                          </div>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full h-auto py-5 flex flex-col items-center gap-3 border-gray-300"
                        >
                          <Calendar className="h-8 w-8" />
                          <div className="text-center">
                            <div className="font-medium text-lg">Ver Calendario</div>
                            <div className="text-sm opacity-80">Fechas importantes</div>
                          </div>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Evaluaciones Próximas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white shadow-md border border-gray-200 p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900">Evaluaciones Próximas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {mockUpcomingEvaluations.map((evaluation, index) => (
                      <motion.div
                        key={evaluation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-lg text-gray-900">{evaluation.course}</p>
                          <p className="text-sm text-gray-600">{evaluation.teacher}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-sm bg-white py-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {evaluation.deadline}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Columna lateral - Notificaciones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-8"
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-gray-900">Notificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className={`p-4 rounded-lg border transition-colors ${
                        notification.urgent 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <p className="text-base font-medium text-gray-900">{notification.text}</p>
                      <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
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