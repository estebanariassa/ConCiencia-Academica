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
import { User } from '../types';
import { 
  Calendar as CalendarIcon, 
  ClipboardCheck, 
  Bell, 
  Star,
  BookOpen,
  Clock,
  Mail,
  BarChart3,
  User as UserIcon,
  Award,
  Target,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchTeacherStats } from '../api/teachers';

// Importar el componente Calendar externo
import Calendar from '../components/Calendar';

// Importar la imagen de fondo
const fondo = new URL('../assets/fondo.webp', import.meta.url).href;

interface DashboardProfesorProps {
  user: User;
}

// Componente reutilizable para las cards
interface SectionCardProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  className?: string;
}

const SectionCard = ({ title, icon: Icon, children, className = '' }: SectionCardProps) => {
  return (
    <Card className={`bg-white shadow-md border border-gray-200 p-8 ${className}`}>
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-gray-700" />
          <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default function DashboardProfesor({ user }: DashboardProfesorProps) {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // Cargar user desde backend/localStorage si existe
  const storedUser = ((): User | null => {
    try {
      const u = localStorage.getItem('user');
      if (!u) return null;
      const parsed = JSON.parse(u);
      return {
        id: parsed.id,
        name: `${parsed.nombre} ${parsed.apellido}`.trim(),
        type: (parsed.tipo_usuario as any) ?? 'teacher',
        email: parsed.email,
      } as User;
    } catch {
      return null;
    }
  })();
  
  const handleViewReports = () => {
    navigate('/reports');
  };

  const handleViewEvaluations = () => {
    navigate('/evaluations');
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

  const currentUser = user ?? storedUser ?? { id: '', name: 'Profesor', type: 'teacher', email: '' };

  // Cargar estadísticas del profesor
  useEffect(() => {
    const loadTeacherStats = async () => {
      if (!currentUser.id) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);
        setStatsError(null);
        console.log('🔍 Loading teacher stats for user ID:', currentUser.id);
        
        const stats = await fetchTeacherStats(currentUser.id);
        console.log('✅ Teacher stats loaded:', stats);
        setTeacherStats(stats);
      } catch (error) {
        console.error('❌ Error loading teacher stats:', error);
        setStatsError('Error al cargar las estadísticas');
      } finally {
        setLoadingStats(false);
      }
    };

    loadTeacherStats();
  }, [currentUser.id]);

  // Datos específicos para profesores (usar datos reales si están disponibles)
  const profesorData = {
    stats: {
      averageRating: teacherStats?.calificacionPromedio || 0,
      totalEvaluations: teacherStats?.totalEvaluaciones || 0,
      coursesTeaching: teacherStats?.totalCursos || 0,
      pendingReviews: 0, // TODO: Implementar lógica para evaluaciones pendientes
      studentsEvaluated: teacherStats?.totalEstudiantes || 0,
      currentSemester: '2025-1'
    },
    recentEvaluations: teacherStats?.evaluacionesPorCurso?.map((curso: any) => ({
      id: curso.curso_id,
      course: curso.nombre,
      students: curso.total,
      completed: curso.total,
      average: curso.promedio,
      period: 'Semestre 2025-1',
      status: 'completed'
    })) || [],
    upcomingDeadlines: [
      { id: 1, course: 'Matemáticas I', task: 'Revisar evaluaciones pendientes', deadline: '2025-01-25', urgent: true },
      { id: 2, course: 'Física II', task: 'Cierre de período de evaluación', deadline: '2025-01-28', urgent: false },
      { id: 3, course: 'Cálculo III', task: 'Envío de reportes', deadline: '2025-02-01', urgent: false }
    ],
    notifications: [
      { id: 1, text: '15 estudiantes han completado tu evaluación de Matemáticas I', time: '2 horas', urgent: false },
      { id: 2, text: 'Recordatorio: Cierre de evaluaciones este viernes', time: '1 día', urgent: true },
      { id: 3, text: 'Nuevo mensaje de un estudiante en Física II', time: '3 días', urgent: false },
      { id: 4, text: 'Reporte de evaluaciones disponible para descarga', time: '5 días', urgent: false }
    ],
    quickActions: [
        {
          icon: BarChart3,
          label: 'Mis Estadísticas',
          description: 'Ver análisis detallado',
          onClick: handleViewReports,
          variant: 'default' as const,
          className: 'bg-red-600 hover:bg-red-700 text-white w-[300px] md:w-[250px] lg:w-[250px]'
        },
        {
          icon: Eye,
          label: 'Ver Evaluaciones',
          description: 'Revisar evaluaciones recibidas',
          onClick: handleViewEvaluations,
          variant: 'outline' as const,
          className: 'border-gray-300 text-gray-600 hover:bg-gray-50'
        },
      {
        icon: CalendarIcon,
        label: 'Calendario',
        description: 'Fechas importantes',
        onClick: toggleCalendar,
        variant: 'outline' as const,
        className: 'border-gray-300'
      }
    ]
  };

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
        {/* Usamos el componente Header */}
        <Header user={currentUser} />
        
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
                  {getGreeting()}, Prof. {currentUser.name.split(' ')[0]}!
                </h2>
                <p className="text-lg text-gray-600">
                  Bienvenido a tu panel de control docente. Aquí puedes gestionar tus evaluaciones y ver tu rendimiento.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards - Específicas para profesores */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-8xl">
            {/* Calificación Promedio */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-10 w-[300px] md:w-[450px] lg:w-[450px]">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                  <CardTitle className="text-xl font-medium text-gray-900 text-left">
                    Calificación Promedio
                  </CardTitle>
                  <Star className="h-8 w-8 text-yellow-600 ml-4" />
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="text-3xl font-bold text-gray-400">
                      Cargando...
                    </div>
                  ) : statsError ? (
                    <div className="text-lg font-medium text-red-600">
                      Error
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-yellow-600">
                      {profesorData.stats.averageRating}/5.0
                    </div>
                  )}
                  <p className="text-base text-gray-500 mt-3 text-left">
                    {loadingStats ? 'Cargando datos...' : 'Calificación promedio'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Evaluaciones */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-10 w-[400px] md:w-[450px] lg:w-[450px]">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                  <CardTitle className="text-xl font-medium text-gray-900 text-left">
                    Total Evaluaciones
                  </CardTitle>
                  <ClipboardCheck className="h-8 w-8 text-green-600 ml-4" />
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="text-4xl font-bold text-gray-400">
                      Cargando...
                    </div>
                  ) : statsError ? (
                    <div className="text-xl font-medium text-red-600">
                      Error
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-green-600">
                      {profesorData.stats.totalEvaluations}
                    </div>
                  )}
                  <p className="text-base text-gray-500 mt-3 text-left">
                    {loadingStats ? 'Cargando datos...' : 'Evaluaciones recibidas'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cursos Impartidos */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-10 w-[400px] md:w-[450px] lg:w-[450px]">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                  <CardTitle className="text-xl font-medium text-gray-900 text-left">
                    Cursos Impartidos
                  </CardTitle>
                  <BookOpen className="h-8 w-8 text-blue-600 ml-4" />
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="text-4xl font-bold text-gray-400">
                      Cargando...
                    </div>
                  ) : statsError ? (
                    <div className="text-xl font-medium text-red-600">
                      Error
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-blue-600">
                      {profesorData.stats.coursesTeaching}
                    </div>
                  )}
                  <p className="text-base text-gray-500 mt-3 text-left">
                    {loadingStats ? 'Cargando datos...' : 'Cursos evaluados'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            </div>
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
                <Card className="bg-white shadow-md border border-gray-200 p-8">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <Target className="h-6 w-6 text-gray-700" />
                      <CardTitle className="text-3xl text-gray-900">Acciones Rápidas</CardTitle>
                    </div>
                    <CardDescription className="text-lg">
                      Herramientas para gestionar tu actividad docente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                        {profesorData.quickActions.map((action, index) => (
                          <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              onClick={action.onClick}
                              variant={action.variant}
                              className={`w-full h-auto py-8 flex flex-col items-center justify-center gap-4 ${action.className}`}
                            >
                              <action.icon className="h-10 w-10" />
                              <div className="text-center">
                                <div className="font-medium text-xl">
                                  {action.label}
                                </div>
                                <div className="text-base opacity-80">
                                  {action.description}
                                </div>
                              </div>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Evaluaciones Recientes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-white shadow-md border border-gray-200 p-8">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-6 w-6 text-gray-700" />
                      <CardTitle className="text-3xl text-gray-900">Evaluaciones Recientes</CardTitle>
                    </div>
                    <CardDescription className="text-lg">
                      Estado de tus evaluaciones por curso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {loadingStats ? (
                        <div className="text-center py-12 text-gray-500 text-lg">
                          Cargando evaluaciones...
                        </div>
                      ) : statsError ? (
                        <div className="text-center py-12 text-red-500 text-lg">
                          Error al cargar las evaluaciones
                        </div>
                      ) : profesorData.recentEvaluations.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-lg">
                          No hay evaluaciones disponibles
                        </div>
                      ) : (
                        profesorData.recentEvaluations.map((evaluation: any, index: number) => (
                        <motion.div
                          key={evaluation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-medium text-xl text-gray-900">{evaluation.course}</p>
                              <Badge 
                                variant="outline" 
                                className={`text-base py-2 px-3 ${
                                  evaluation.status === 'completed' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}
                              >
                                {evaluation.status === 'completed' ? 'Completada' : 'En Progreso'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-base">
                              <div>
                                <span className="text-gray-500">Estudiantes:</span>
                                <span className="ml-1 font-medium">{evaluation.students}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Completadas:</span>
                                <span className="ml-1 font-medium">{evaluation.completed}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Promedio:</span>
                                <span className="ml-1 font-medium">{evaluation.average}/5.0</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Columna lateral */}
            <div className="space-y-8">
              {/* Notificaciones */}
              <SectionCard title="Notificaciones" icon={Bell}>
                <div className="space-y-5">
                  {profesorData.notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className={`p-5 rounded-lg border transition-colors ${
                        notification.urgent 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <p className="text-lg font-medium text-gray-900">{notification.text}</p>
                      <p className="text-base text-gray-500 mt-2">{notification.time}</p>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>

              {/* Próximas Fechas Límite */}
              <SectionCard title="Próximas Fechas Límite" icon={Clock}>
                <div className="space-y-5">
                  {profesorData.upcomingDeadlines.map((deadline, index) => (
                    <motion.div
                      key={deadline.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className={`p-5 rounded-lg border transition-colors ${
                        deadline.urgent 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-lg text-gray-900">{deadline.course}</p>
                        {deadline.urgent && (
                          <Badge variant="outline" className="text-sm bg-red-100 text-red-700 border-red-200 py-1 px-2">
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <p className="text-base text-gray-600 mb-2">{deadline.task}</p>
                      <p className="text-base text-gray-500">{deadline.deadline}</p>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>

              {/* Información del Profesor */}
              <SectionCard title="Información del Profesor" icon={UserIcon}>
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-lg text-gray-900">{currentUser.name}</p>
                      <p className="text-base text-gray-600">Profesor</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <p className="text-base text-gray-600">{currentUser.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-gray-500" />
                      <p className="text-base text-gray-600">Facultad de Ingeniería</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-gray-500" />
                      <p className="text-base text-gray-600">Semestre {profesorData.stats.currentSemester}</p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Calendario */}
      <AnimatePresence>
        {showCalendar && <Calendar onClose={toggleCalendar} />}
      </AnimatePresence>
    </div>
  );
}
