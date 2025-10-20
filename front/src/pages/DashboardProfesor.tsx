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
  Star,
  BookOpen,
  Clock,
  Mail,
  BarChart3,
  User as UserIcon,
  Award,
  Target
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchTeacherStats, fetchTeacherCourses } from '../api/teachers';

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
    <Card className={`bg-white shadow-md border border-gray-200 p-6 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-gray-700" />
          <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
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
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  
  
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

  const handleViewSurvey = () => {
    navigate('/survey');
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
    const loadTeacherData = async () => {
      if (!currentUser.id) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);
        setStatsError(null);
        console.log('🔍 Loading teacher data for user ID:', currentUser.id);
        
        // Cargar estadísticas y cursos en paralelo
        const [stats, courses] = await Promise.allSettled([
          fetchTeacherStats(currentUser.id),
          fetchTeacherCourses(currentUser.id)
        ]);
        
        // Manejar estadísticas
        if (stats.status === 'fulfilled') {
          console.log('✅ Teacher stats loaded:', stats.value);
          setTeacherStats(stats.value);
        } else {
          console.error('❌ Error loading teacher stats:', stats.reason);
          setTeacherStats(null);
        }
        
        // Manejar cursos
        if (courses.status === 'fulfilled') {
          console.log('✅ Teacher courses loaded:', courses.value);
          setTeacherCourses(courses.value || []);
        } else {
          console.error('❌ Error loading teacher courses:', courses.reason);
          setTeacherCourses([]); // Si hay error, mostrar 0 cursos
        }
      } catch (error) {
        console.error('❌ Error loading teacher data:', error);
        setStatsError('Error al cargar los datos del profesor');
      } finally {
        setLoadingStats(false);
      }
    };

    loadTeacherData();
  }, [currentUser.id]);


  // Datos específicos para profesores (usar datos reales si están disponibles)
  const profesorData = {
    stats: {
      averageRating: teacherStats?.calificacionPromedio || 0,
      totalEvaluations: teacherStats?.totalEvaluaciones || 0,
      coursesTeaching: teacherCourses?.length || 0, // Usar cursos reales de asignaciones_profesor
      pendingReviews: 0, // TODO: Implementar lógica para evaluaciones pendientes
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
    quickActions: [
        {
          icon: BarChart3,
          label: 'Mis Estadísticas',
          description: 'Ver análisis detallado',
          onClick: handleViewReports,
          variant: 'default' as const,
          className: 'bg-red-600 hover:bg-red-700 text-white'
        },
        {
          icon: ClipboardCheck,
          label: 'Ver Encuesta',
          description: 'Ver la encuesta de mi carrera',
          onClick: handleViewSurvey,
          variant: 'outline' as const,
          className: 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
        },
        {
          icon: CalendarIcon,
          label: 'Calendario',
          description: 'Fechas importantes',
          onClick: toggleCalendar,
          variant: 'outline' as const,
          className: 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Calificación Promedio */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Calificación Promedio
                  </CardTitle>
                  <Star className="h-6 w-6 text-yellow-600 ml-4" />
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="text-3xl font-bold text-gray-400">
                      Cargando...
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-yellow-600">
                      {profesorData.stats.averageRating > 0 ? `${profesorData.stats.averageRating}/5.0` : '0.0/5.0'}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2 text-left">
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
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Total Evaluaciones
                  </CardTitle>
                  <ClipboardCheck className="h-6 w-6 text-green-600 ml-4" />
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="text-3xl font-bold text-gray-400">
                      Cargando...
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-green-600">
                      {profesorData.stats.totalEvaluations || 0}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2 text-left">
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
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Cursos Impartidos
                  </CardTitle>
                  <BookOpen className="h-6 w-6 text-blue-600 ml-4" />
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="text-3xl font-bold text-gray-400">
                      Cargando...
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-blue-600">
                      {profesorData.stats.coursesTeaching}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    {loadingStats ? 'Cargando datos...' : 'Cursos impartidos'}
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
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-gray-700" />
                      <CardTitle className="text-2xl text-gray-900">Acciones Rápidas</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      Herramientas para gestionar tu actividad docente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profesorData.quickActions.map((action, index) => (
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

              {/* Evaluaciones Recientes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-white shadow-md border border-gray-200 p-6">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-gray-700" />
                        <CardTitle className="text-2xl text-gray-900">Evaluaciones Recientes</CardTitle>
                      </div>
                      {/* Filtro por curso */}
                      <div className="flex items-center gap-2">
                        <label htmlFor="course-filter" className="text-sm text-gray-600 whitespace-nowrap">
                          Filtrar por curso:
                        </label>
                        <select
                          id="course-filter"
                          value={selectedCourseFilter}
                          onChange={(e) => setSelectedCourseFilter(e.target.value)}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white min-w-[200px]"
                        >
                          <option value="all">Todos los cursos</option>
                          {profesorData.recentEvaluations.map((evaluation: any) => (
                            <option key={evaluation.id} value={evaluation.id}>
                              {evaluation.course}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <CardDescription className="text-base mt-2">
                      Estado de tus evaluaciones por curso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loadingStats ? (
                        <div className="text-center py-8 text-gray-500">
                          Cargando evaluaciones...
                        </div>
                      ) : statsError ? (
                        <div className="text-center py-8 text-red-500">
                          Error al cargar las evaluaciones
                        </div>
                      ) : profesorData.recentEvaluations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No hay evaluaciones disponibles
                        </div>
                      ) : (
                        (() => {
                          const filteredEvaluations = profesorData.recentEvaluations
                            .filter((evaluation: any) => selectedCourseFilter === 'all' || evaluation.id === selectedCourseFilter);
                          
                          if (filteredEvaluations.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                No hay evaluaciones para el curso seleccionado
                              </div>
                            );
                          }
                          
                          return filteredEvaluations.map((evaluation: any, index: number) => (
                            <motion.div
                              key={evaluation.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.8 + index * 0.1 }}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium text-lg text-gray-900">{evaluation.course}</p>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-sm py-1 ${
                                      evaluation.status === 'completed' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}
                                  >
                                    {evaluation.status === 'completed' ? 'Completada' : 'En Progreso'}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
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
                          ));
                        })()
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Columna lateral */}
            <div className="space-y-8">

              {/* Próximas Fechas Límite */}
              <SectionCard title="Próximas Fechas Límite" icon={Clock}>
                <div className="space-y-4">
                  {profesorData.upcomingDeadlines.map((deadline, index) => (
                    <motion.div
                      key={deadline.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className={`p-4 rounded-lg border transition-colors ${
                        deadline.urgent 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{deadline.course}</p>
                        {deadline.urgent && (
                          <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{deadline.task}</p>
                      <p className="text-sm text-gray-500">{deadline.deadline}</p>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>

              {/* Información del Profesor */}
              <SectionCard title="Información del Profesor" icon={UserIcon}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{currentUser.name}</p>
                      <p className="text-sm text-gray-600">Profesor</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Facultad de Ingeniería</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Semestre {profesorData.stats.currentSemester}</p>
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