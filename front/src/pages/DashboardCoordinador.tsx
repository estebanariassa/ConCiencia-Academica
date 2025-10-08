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
  UserCog,
  AlertCircle,
  User as UserIcon,
  Award,
  Target,
  MessageSquare,
  FileText,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
  Building,
  GraduationCap,
  PieChart,
  Activity
} from 'lucide-react';
import { useState } from 'react';

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
      } as User;
    } catch {
      return null;
    }
  })();
  
  const handleViewReports = () => {
    navigate('/reports');
  };

  const handleManageTeachers = () => {
    navigate('/teachers');
  };

  const handleManageStudents = () => {
    navigate('/students');
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

  const currentUser = user ?? storedUser ?? { id: '', name: 'Coordinador', type: 'coordinator', email: '' };

  // Datos específicos para coordinadores
  const coordinadorData = {
    stats: {
      totalTeachers: 24,
      evaluationsCompleted: 180,
      averageRating: 4.5,
      pendingApprovals: 3,
      totalStudents: 450,
      activeCourses: 12,
      departments: 3
    },
    departmentStats: [
      { 
        id: 1, 
        name: 'Matemáticas', 
        teachers: 8, 
        students: 150, 
        averageRating: 4.6,
        evaluations: 60,
        status: 'active'
      },
      { 
        id: 2, 
        name: 'Física', 
        teachers: 6, 
        students: 120, 
        averageRating: 4.4,
        evaluations: 45,
        status: 'active'
      },
      { 
        id: 3, 
        name: 'Química', 
        teachers: 10, 
        students: 180, 
        averageRating: 4.5,
        evaluations: 75,
        status: 'active'
      }
    ],
    pendingApprovals: [
      { 
        id: 1, 
        teacher: 'Dr. Juan Pérez', 
        course: 'Matemáticas Avanzadas', 
        type: 'new_course',
        submitted: '2025-01-20',
        urgent: true
      },
      { 
        id: 2, 
        teacher: 'Dra. Ana Martín', 
        course: 'Física Experimental', 
        type: 'evaluation_review',
        submitted: '2025-01-22',
        urgent: false
      },
      { 
        id: 3, 
        teacher: 'Prof. Carlos López', 
        course: 'Química Orgánica', 
        type: 'curriculum_update',
        submitted: '2025-01-23',
        urgent: false
      }
    ],
    notifications: [
      { id: 1, text: 'Reporte de evaluaciones del departamento de Matemáticas listo', time: '2 horas', urgent: false },
      { id: 2, text: '3 profesores requieren revisión de evaluaciones', time: '1 día', urgent: true },
      { id: 3, text: 'Reunión de coordinación el próximo lunes', time: '3 días', urgent: false },
      { id: 4, text: 'Nuevo profesor asignado al departamento de Física', time: '5 días', urgent: false },
      { id: 5, text: 'Evaluaciones del semestre 2025-1 completadas al 85%', time: '1 semana', urgent: false }
    ],
    quickActions: [
        {
          icon: Users,
          label: 'Gestión de Profesores',
          description: 'Administrar docentes',
          onClick: handleManageTeachers,
          variant: 'default' as const,
          className: 'bg-red-600 hover:bg-red-700 text-white'
        },
        {
          icon: BarChart3,
          label: 'Reportes Generales',
          description: 'Ver reportes del departamento',
          onClick: handleViewReports,
          variant: 'outline' as const,
          className: 'border-red-300 text-red-600 hover:bg-red-50'
        },
        {
          icon: GraduationCap,
          label: 'Gestión de Estudiantes',
          description: 'Administrar estudiantes',
          onClick: handleManageStudents,
          variant: 'outline' as const,
          className: 'border-red-300 text-red-600 hover:bg-red-50'
        },
        {
          icon: Eye,
          label: 'Ver Evaluaciones',
          description: 'Revisar evaluaciones',
          onClick: handleViewEvaluations,
          variant: 'outline' as const,
          className: 'border-red-300 text-red-600 hover:bg-red-50'
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
                  {getGreeting()}, Coord. {currentUser.name.split(' ')[0]}!
                </h2>
                <p className="text-lg text-gray-600">
                  Panel de coordinación académica. Gestiona profesores, estudiantes y evaluaciones del departamento.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards - Específicas para coordinadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total de Profesores */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Total de Profesores
                  </CardTitle>
                  <Users className="h-6 w-6 text-blue-600 ml-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {coordinadorData.stats.totalTeachers}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    En el departamento
                  </p>
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
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Evaluaciones Completadas
                  </CardTitle>
                  <ClipboardCheck className="h-6 w-6 text-green-600 ml-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {coordinadorData.stats.evaluationsCompleted}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    En el sistema
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Calificación Promedio */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Calificación Promedio
                  </CardTitle>
                  <Star className="h-6 w-6 text-yellow-600 ml-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {coordinadorData.stats.averageRating}/5.0
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    Departamento
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Aprobaciones Pendientes */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    Aprobaciones Pendientes
                  </CardTitle>
                  <AlertCircle className="h-6 w-6 text-orange-600 ml-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {coordinadorData.stats.pendingApprovals}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    Por revisar
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
                      <Shield className="h-5 w-5 text-gray-700" />
                      <CardTitle className="text-2xl text-gray-900">Panel de Coordinación</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      Herramientas de gestión académica y administrativa
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

              {/* Estadísticas por Departamento */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-white shadow-md border border-gray-200 p-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-gray-700" />
                      <CardTitle className="text-2xl text-gray-900">Estadísticas por Departamento</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      Rendimiento y métricas de cada departamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {coordinadorData.departmentStats.map((dept, index) => (
                        <motion.div
                          key={dept.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-lg text-gray-900">{dept.name}</p>
                              <Badge 
                                variant="outline" 
                                className="text-sm py-1 bg-green-50 text-green-700 border-green-200"
                              >
                                Activo
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Profesores:</span>
                                <span className="ml-1 font-medium">{dept.teachers}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Estudiantes:</span>
                                <span className="ml-1 font-medium">{dept.students}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Evaluaciones:</span>
                                <span className="ml-1 font-medium">{dept.evaluations}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Promedio:</span>
                                <span className="ml-1 font-medium">{dept.averageRating}/5.0</span>
                              </div>
                            </div>
                          </div>
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
                </div>
              </SectionCard>

              {/* Aprobaciones Pendientes */}
              <SectionCard title="Aprobaciones Pendientes" icon={CheckCircle}>
                <div className="space-y-4">
                  {coordinadorData.pendingApprovals.map((approval, index) => (
                    <motion.div
                      key={approval.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className={`p-4 rounded-lg border transition-colors ${
                        approval.urgent 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{approval.teacher}</p>
                        {approval.urgent && (
                          <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{approval.course}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {approval.type === 'new_course' ? 'Nuevo Curso' :
                           approval.type === 'evaluation_review' ? 'Revisión' :
                           'Actualización'}
                        </Badge>
                        <p className="text-sm text-gray-500">{approval.submitted}</p>
                      </div>
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
                      <p className="text-sm text-gray-600">Coordinador Académico</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Facultad de Ingeniería</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Departamento de Ciencias</p>
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
