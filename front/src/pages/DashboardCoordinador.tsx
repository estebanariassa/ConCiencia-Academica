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
  Bell, 
  BookOpen,
  Clock,
  Users,
  Mail,
  BarChart3,
  User as UserIcon,
  Award,
  Target,
  GraduationCap,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchCoordinatorStats } from '../api/teachers';

// Importar el componente Calendar externo
import Calendar from '../components/Calendar';

// Importar la imagen de fondo
const fondo = new URL('../assets/fondo.webp', import.meta.url).href;

interface DashboardCoordinadorProps {
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

export default function DashboardCoordinador({ user }: DashboardCoordinadorProps) {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [stats, setStats] = useState({
    totalProfesores: 0,
    totalCursos: 0,
    totalCarreras: 0,
    promedioEvaluaciones: 4.2
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  
  // Cargar user desde backend/localStorage si existe
  const storedUser = ((): User | null => {
    try {
      const u = localStorage.getItem('user');
      if (!u) return null;
      const parsed = JSON.parse(u);
      return {
        id: parsed.id,
        name: `${parsed.nombre} ${parsed.apellido}`.trim(),
        type: (parsed.tipo_usuario as any) ?? 'coordinator',
        email: parsed.email,
        roles: parsed.roles || []
      } as User;
    } catch {
      return null;
    }
  })();

  const currentUser = user ?? storedUser ?? { id: '', name: 'Coordinador', type: 'coordinator', email: '', roles: [] };

  // Cargar estadísticas del coordinador
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const coordinatorStats = await fetchCoordinatorStats();
        setStats(prevStats => ({
          ...prevStats,
          ...coordinatorStats
        }));
      } catch (error) {
        console.error('Error cargando estadísticas del coordinador:', error);
        // Mantener valores por defecto en caso de error
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };


  // Datos específicos para coordinadores
  const coordinadorData = {
    stats: stats,
    quickActions: [
      {
        icon: Users,
        label: 'Gestionar Profesores',
        description: 'Ver y administrar profesores',
        onClick: () => navigate('/profesores/gestionar'),
        variant: 'default' as const,
        className: 'bg-red-600 hover:bg-red-700 text-white'
      },
      {
        icon: BookOpen,
        label: 'Programar Encuestas',
        description: 'Definir período y fechas para encuestas',
        onClick: () => navigate('/surveys/schedule'),
        variant: 'outline' as const,
        className: 'border-red-300 text-red-600 hover:bg-red-50'
      },
      {
        icon: BarChart3,
        label: 'Reportes Generales',
        description: 'Ver estadísticas de la facultad',
        onClick: () => navigate('/reports'),
        variant: 'outline' as const,
        className: 'border-red-300 text-red-600 hover:bg-red-50'
      },
      {
        icon: CalendarIcon,
        label: 'Calendario',
        description: 'Fechas importantes',
        onClick: () => setShowCalendar(true),
        variant: 'outline' as const,
        className: 'border-gray-300'
      }
    ],
    notifications: [
      { id: 1, text: 'Nueva evaluación disponible para revisión', time: '2 horas', urgent: false },
      { id: 2, text: 'Recordatorio: Reunión de coordinadores mañana', time: '1 día', urgent: true },
      { id: 3, text: 'Reporte mensual de evaluaciones listo', time: '3 días', urgent: false },
      { id: 4, text: 'Solicitud de nuevo curso pendiente de aprobación', time: '5 días', urgent: false }
    ],
    upcomingDeadlines: [
      { id: 1, task: 'Revisión de evaluaciones del período', deadline: '2025-01-25', urgent: true },
      { id: 2, task: 'Reporte de rendimiento académico', deadline: '2025-01-28', urgent: false },
      { id: 3, task: 'Planificación del próximo semestre', deadline: '2025-02-01', urgent: false }
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
                  {getGreeting()}, Coord. {currentUser.name.split(' ')[0]}!
                </h2>
                <p className="text-lg text-gray-600">
                  Bienvenido a tu panel de control como coordinador. Aquí puedes supervisar los profesores de tu carrera y gestionar la actividad académica.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards - Específicas para coordinadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Carreras */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Encuestas Activas
                  </CardTitle>
                  <GraduationCap className="h-6 w-6 text-blue-600 ml-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {loadingStats ? (
                      <div className="animate-pulse bg-blue-200 h-8 w-16 rounded"></div>
                    ) : (
                      coordinadorData.stats.totalCarreras
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    Encuestas activas (siempre 1)
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Profesores */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Total Profesores
                  </CardTitle>
                  <Users className="h-6 w-6 text-green-600 ml-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {loadingStats ? (
                      <div className="animate-pulse bg-green-200 h-8 w-16 rounded"></div>
                    ) : (
                      coordinadorData.stats.totalProfesores
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    Profesores de mi carrera
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Cursos */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Cursos Activos
                  </CardTitle>
                  <BookOpen className="h-6 w-6 text-purple-600 ml-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {loadingStats ? (
                      <div className="animate-pulse bg-purple-200 h-8 w-16 rounded"></div>
                    ) : (
                      coordinadorData.stats.totalCursos
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    Cursos de mi carrera
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Promedio Evaluaciones */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Promedio Evaluaciones
                  </CardTitle>
                  <TrendingUp className="h-6 w-6 text-yellow-600 ml-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {coordinadorData.stats.promedioEvaluaciones}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-left">Promedio general de la carrera</p>
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
                      Herramientas para gestionar tu actividad como coordinador
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {coordinadorData.quickActions.map((action, index) => (
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

            </div>

            {/* Columna lateral */}
            <div className="space-y-8">
              {/* Notificaciones */}
              <SectionCard title="Notificaciones" icon={Bell}>
                <div className="space-y-4">
                  {coordinadorData.notifications.map((notification, index) => (
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
                </div>
              </SectionCard>

              {/* Próximas Fechas Límite */}
              <SectionCard title="Próximas Fechas Límite" icon={Clock}>
                <div className="space-y-4">
                  {coordinadorData.upcomingDeadlines.map((deadline, index) => (
                    <motion.div
                      key={deadline.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className={`p-4 rounded-lg border transition-colors ${
                        deadline.urgent 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{deadline.task}</p>
                        {deadline.urgent && (
                          <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{deadline.deadline}</p>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>

              {/* Información del Coordinador */}
              <SectionCard title="Información del Coordinador" icon={UserIcon}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{currentUser.name}</p>
                      <p className="text-sm text-gray-600">Coordinador-Profesor</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Facultad de Ingeniería</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Coordinador Académico</p>
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
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Calendario Académico</h3>
                <Button variant="outline" onClick={() => setShowCalendar(false)}>
                  Cerrar
                </Button>
              </div>
              <Calendar onClose={() => setShowCalendar(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


