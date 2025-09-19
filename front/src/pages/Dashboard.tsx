import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CardHeader, 
  CardContent, 
  CardDescription, 
  CardTitle 
} from '../components/Card';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Header from '../components/Header';
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar';
import { User } from '../types';
import { 
  Settings, 
  Calendar as CalendarIcon, 
  ClipboardCheck, 
  Bell, 
  Star,
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  UserCog
} from 'lucide-react';
import { useState } from 'react';

// Importar el componente Calendar externo
import Calendar from '../components/Calendar';

// Importar la imagen de fondo
const fondo = new URL('../assets/fondo.webp', import.meta.url).href;

interface DashboardProps {
  user: User;
  onStartEvaluation: () => void;
  onViewReports: () => void;
}

export default function Dashboard({ user, onStartEvaluation, onViewReports }: DashboardProps) {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  
  const handleStartEvaluation = () => {
    navigate('/evaluate/selection');
  };

  // Modificamos handleViewReports para que navegue a la ruta de reportes
  const handleViewReports = () => {
    navigate('/reports');
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  // Datos específicos por tipo de usuario
  const getUserSpecificData = () => {
    switch (user.type) {
      case 'student':
        return {
          stats: {
            evaluationsPending: 2,
            evaluationsCompleted: 5,
            currentCourses: 6,
            averageGrade: 8.7
          },
          upcomingEvaluations: [
            { id: 1, course: 'Matemáticas I', teacher: 'Dr. Juan Pérez', deadline: '2025-01-25' },
            { id: 2, course: 'Física II', teacher: 'Dra. Ana Martín', deadline: '2025-01-28' }
          ],
          notifications: [
            { id: 1, text: 'Nueva evaluación disponible para Matemáticas I', time: '2 horas', urgent: true },
            { id: 2, text: 'Recordatorio: Evaluación de Física II vence mañana', time: '1 día', urgent: false },
            { id: 3, text: 'Resultados de evaluación publicados', time: '3 días', urgent: false }
          ],
          quickActions: [
            {
              icon: ClipboardCheck,
              label: 'Nueva Evaluación',
              description: 'Evaluar un docente',
              onClick: handleStartEvaluation,
              variant: 'default' as const,
              className: 'bg-red-600 hover:bg-red-700 text-white'
            },
            {
              icon: CalendarIcon,
              label: 'Ver Calendario',
              description: 'Fechas importantes',
              onClick: toggleCalendar,
              variant: 'outline' as const,
              className: 'border-gray-300'
            }
          ]
        };
      case 'teacher':
        return {
          stats: {
            averageRating: 4.7,
            totalEvaluations: 45,
            coursesTeaching: 4,
            pendingReviews: 5
          },
          upcomingEvaluations: [
            { id: 1, course: 'Matemáticas I', period: 'Semestre 2025-1', deadline: '2025-01-25' },
            { id: 2, course: 'Física II', period: 'Semestre 2025-1', deadline: '2025-01-28' }
          ],
          notifications: [
            { id: 1, text: '15 estudiantes han completado tu evaluación', time: '2 horas', urgent: false },
            { id: 2, text: 'Recordatorio: Cierre de evaluaciones este viernes', time: '1 día', urgent: true },
            { id: 3, text: 'Nuevo mensaje de un estudiante', time: '3 días', urgent: false }
          ],
          quickActions: [
            {
              icon: BarChart3,
              label: 'Análisis y Reportes',
              description: 'Ver mis estadísticas',
              onClick: handleViewReports, // Cambiado para usar la nueva función
              variant: 'default' as const,
              className: 'bg-red-600 hover:bg-red-650 text-white'
            },
            {
              icon: CalendarIcon,
              label: 'Ver Calendario',
              description: 'Fechas importantes',
              onClick: toggleCalendar,
              variant: 'outline' as const,
              className: 'border-gray-300'
            }
          ]
        };
      case 'coordinator':
        return {
          stats: {
            totalTeachers: 24,
            evaluationsCompleted: 180,
            averageRating: 4.5,
            pendingApprovals: 3
          },
          upcomingEvaluations: [
            { id: 1, course: 'Departamento de Matemáticas', period: 'Ciclo 2025-1', deadline: '2025-01-25' },
            { id: 2, course: 'Departamento de Física', period: 'Ciclo 2025-1', deadline: '2025-01-28' }
          ],
          notifications: [
            { id: 1, text: 'Reporte de evaluaciones del departamento listo', time: '2 horas', urgent: false },
            { id: 2, text: '3 profesores requieren revisión de evaluaciones', time: '1 día', urgent: true },
            { id: 3, text: 'Reunión de coordinación el próximo lunes', time: '3 días', urgent: false }
          ],
          quickActions: [
            {
              icon: Users,
              label: 'Gestión de Profesores',
              description: 'Administrar docentes',
              onClick: () => console.log('Gestión de Profesores'),
              variant: 'default' as const,
              className: 'bg-green-600 hover:bg-green-700 text-white'
            },
            {
              icon: BarChart3,
              label: 'Reportes Generales',
              description: 'Ver reportes del departamento',
              onClick: handleViewReports, // Cambiado para usar la nueva función
              variant: 'outline' as const,
              className: 'border-gray-300'
            }
          ]
        };
      default:
        return {
          stats: {
            evaluationsPending: 2,
            evaluationsCompleted: 5,
            currentCourses: 6,
            averageGrade: 8.7
          },
          upcomingEvaluations: [
            { id: 1, course: 'Matemáticas I', teacher: 'Dr. Juan Pérez', deadline: '2025-01-25' },
            { id: 2, course: 'Física II', teacher: 'Dra. Ana Martín', deadline: '2025-01-28' }
          ],
          notifications: [
            { id: 1, text: 'Nueva evaluación disponible', time: '2 horas', urgent: true },
            { id: 2, text: 'Recordatorio: Evaluación pendiente', time: '1 día', urgent: false }
          ],
          quickActions: [
            {
              icon: ClipboardCheck,
              label: 'Nueva Evaluación',
              description: 'Evaluar un docente',
              onClick: handleStartEvaluation,
              variant: 'default' as const,
              className: 'bg-red-600 hover:bg-red-700 text-white'
            },
            {
              icon: CalendarIcon,
              label: 'Ver Calendario',
              description: 'Fechas importantes',
              onClick: toggleCalendar,
              variant: 'outline' as const,
              className: 'border-gray-300'
            }
          ]
        };
    }
  };

  const userData = getUserSpecificData();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Función para obtener el subtítulo de la evaluación según el tipo de usuario
  const getEvaluationSubtitle = (evaluation: any) => {
    switch (user.type) {
      case 'student':
        return evaluation.teacher;
      case 'teacher':
      case 'coordinator':
        return evaluation.period;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Fondo fijo que cubre toda la página */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay oscuro que cubre toda la página */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Usamos el componente Header */}
        <Header user={user} />
        
        <main className="max-w-[1700px] mx-auto p-6 lg:p-8 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white shadow-md border border-gray-200 p-6">
              <CardContent className="space-y-3">
                <h2 className="text-3xl font-semibold text-gray-900">
                  {getGreeting()}, {user.type === 'teacher' ? '' : ''} {user.name.split(' ')[0]}!
                </h2>
                <p className="text-lg text-gray-600">
                  Aquí tienes un resumen de tu actividad reciente en el sistema.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards - Específicas para cada tipo de usuario */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjeta 1 - Diferente según el tipo de usuario */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    {user.type === 'student' ? 'Evaluaciones Pendientes' : 
                     user.type === 'teacher' ? 'Calificación Promedio' : 
                     'Total de Profesores'}
                  </CardTitle>
                  {user.type === 'student' ? <ClipboardCheck className="h-6 w-6 text-red-600" /> :
                   user.type === 'teacher' ? <Star className="h-6 w-6 text-yellow-600" /> :
                   <Users className="h-6 w-6 text-blue-600" />}
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    user.type === 'student' ? 'text-red-600' :
                    user.type === 'teacher' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {user.type === 'student' ? userData.stats.evaluationsPending :
                     user.type === 'teacher' ? userData.stats.averageRating :
                     userData.stats.totalTeachers}
                    {user.type === 'teacher' && '/5.0'}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {user.type === 'student' ? 'Deben completarse pronto' :
                     user.type === 'teacher' ? 'Última evaluación' :
                     'En el departamento'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tarjeta 2 - Evaluaciones Completadas/Total Evaluaciones */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    {user.type === 'student' ? 'Evaluaciones Completadas' : 
                     user.type === 'teacher' ? 'Total Evaluaciones' :
                     'Evaluaciones Completadas'}
                  </CardTitle>
                  <Star className="h-6 w-6 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {user.type === 'student' ? userData.stats.evaluationsCompleted :
                     user.type === 'teacher' ? userData.stats.totalEvaluations :
                     userData.stats.evaluationsCompleted}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {user.type === 'student' ? 'Este período académico' :
                     user.type === 'teacher' ? 'Evaluaciones recibidas' :
                     'En el sistema'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tarjeta 3 - Cursos Actuales/Cursos Impartidos */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    {user.type === 'student' ? 'Cursos Actuales' : 
                     user.type === 'teacher' ? 'Cursos Impartidos' :
                     'Aprobaciones Pendientes'}
                  </CardTitle>
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {user.type === 'student' ? userData.stats.currentCourses :
                     user.type === 'teacher' ? userData.stats.coursesTeaching :
                     userData.stats.pendingApprovals}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {user.type === 'student' ? 'Cursos matriculados' :
                     user.type === 'teacher' ? 'Este semestre' :
                     'Por revisar'}
                  </p>
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
                transition={{ delay: 0.6 }}
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
                      {userData.quickActions.map((action, index) => (
                        <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={action.onClick}
                            variant={action.variant}
                            className={`w-full h-auto py-5 flex flex-col items-center gap-3 ${action.className}`}
                          >
                            <action.icon className="h-8 w-8" />
                            <div className="text-center">
                              <div className="font-medium text-lg">
                                {action.label}
                              </div>
                              <div className="text-sm opacity-80">
                                {action.description}
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Evaluaciones Próximas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-white shadow-md border border-gray-200 p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900">
                      {user.type === 'student' ? 'Evaluaciones Próximas' :
                       user.type === 'teacher' ? 'Próximos Cierres' :
                       'Próximas Revisiones'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {userData.upcomingEvaluations.map((evaluation, index) => (
                      <motion.div
                        key={evaluation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-lg text-gray-900">{evaluation.course}</p>
                          <p className="text-sm text-gray-600">
                            {getEvaluationSubtitle(evaluation)}
                          </p>
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

            {/* Columna lateral - Notificaciones e Información de Usuario */}
            <div className="space-y-8">
              {/* Notificaciones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="bg-white shadow-md border border-gray-200 p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900">Notificaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userData.notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
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

              {/* Información del Usuario */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Card className="bg-white shadow-md border border-gray-200 p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900">Información del Usuario</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-red-600 text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {user.type === 'student' ? 'Estudiante' :
                           user.type === 'teacher' ? 'Profesor' :
                           'Coordinador'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">+123 456 7890</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">Facultad de Ingeniería</p>
                      </div>
                    </div>
                    </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Calendario - Usando el componente externo */}
      <AnimatePresence>
        {showCalendar && <Calendar onClose={toggleCalendar} />}
      </AnimatePresence>
    </div>
  );
}