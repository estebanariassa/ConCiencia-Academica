import { motion } from 'framer-motion';
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
  Users,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

// Importar la imagen de fondo
const fondo = new URL('../assets/fondo.webp', import.meta.url).href;

// Importar tu logo - asegúrate de tener el archivo en la ruta correcta
const logoUniversidad = new URL('../assets/logo_conciencia.webp', import.meta.url).href;

interface DashboardProps {
  user: User;
  onStartEvaluation: () => void;
  onViewReports: () => void;
}

export default function Dashboard({ user, onStartEvaluation, onViewReports }: DashboardProps) {
  const navigate = useNavigate();
  
  const handleStartEvaluation = () => {
    navigate('/evaluate');
  };

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

  // Datos específicos por tipo de usuario
  const getUserSpecificData = () => {
    switch (user.type) {
      case 'student':
        return {
          stats: {
            evaluationsPending: 2, // Modificado a 2 para coincidir con la imagen
            evaluationsCompleted: 5, // Modificado
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
          ]
        };
    }
  };

  const userData = getUserSpecificData();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
        {/* Header simplificado */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 p-4 lg:p-6"
        >
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Aquí se reemplaza el birrete por tu logo */}
              <img 
                src={logoUniversidad} 
                alt="Logo Universidad de Medellín" 
  className="h-[100px] w-[120px] object-contain"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ConCiencia Academica</h1>
                <p className="text-m text-gray-600">Universidad de Medellín</p>
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
          >
            <Card className="bg-white shadow-md border border-gray-200 p-6">
              <CardContent className="space-y-3">
                <h2 className="text-3xl font-semibold text-gray-900">
                  {getGreeting()}, {user.name.split(' ')[0]}!
                </h2>
                <p className="text-lg text-gray-600">
                  Aquí tienes un resumen de tu actividad reciente en el sistema.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards - Específicas para cada tipo de usuario */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjeta 1 - Evaluaciones Pendientes */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    Evaluaciones Pendientes
                  </CardTitle>
                  <ClipboardCheck className="h-6 w-6 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {userData.stats.evaluationsPending}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Deben completarse pronto
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tarjeta 2 - Evaluaciones Completadas */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    Evaluaciones Completadas
                  </CardTitle>
                  <Star className="h-6 w-6 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {userData.stats.evaluationsCompleted}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Este período académico
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tarjeta 3 - Cursos Actuales */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    Cursos Actuales
                  </CardTitle>
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {userData.stats.currentCourses}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Cursos matriculados
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
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={handleStartEvaluation}
                          className="w-full h-auto py-5 bg-red-600 hover:bg-red-700 text-white flex flex-col items-center gap-3"
                        >
                          <ClipboardCheck className="h-8 w-8" />
                          <div className="text-center">
                            <div className="font-medium text-lg">
                              Nueva Evaluación
                            </div>
                            <div className="text-sm opacity-80">
                              Evaluar un docente
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={onViewReports}
                          variant="outline"
                          className="w-full h-auto py-5 flex flex-col items-center gap-3 border-gray-300"
                        >
                          <BarChart3 className="h-8 w-8" />
                          <div className="text-center">
                            <div className="font-medium text-lg">
                              Ver Calendario
                            </div>
                            <div className="text-sm opacity-80">
                              Fechas importantes
                            </div>
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
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-white shadow-md border border-gray-200 p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900">
                      Evaluaciones Próximas
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
                            {evaluation.teacher}
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
                        <p className="text-sm text-gray-600 capitalize">{user.type}</p>
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
    </div>
  );
}