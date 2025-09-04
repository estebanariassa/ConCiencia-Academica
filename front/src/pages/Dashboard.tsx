// pages/Dashboard.tsx
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/Card';
import Button from '../components/Button';
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
import fondo from '../assets/fondo.webp';

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

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="relative z-10 p-8">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Sistema de Evaluación</h1>
                <p className="text-sm text-gray-600">Universidad XYZ</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
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

        <main className="space-y-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900">
              ¡Bienvenido, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-gray-600">
              Aquí tienes un resumen de tu actividad reciente en el sistema.
            </p>
          </motion.div>

          {/* Simple Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-lg p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-blue-900">Evaluaciones Pendientes</h4>
                  <ClipboardCheck className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-2">3</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-green-900">Completadas</h4>
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600 mt-2">12</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-purple-900">Cursos</h4>
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600 mt-2">6</p>
              </div>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-lg p-6"
          >
            <Button
              onClick={onStartEvaluation}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <div className="flex items-center justify-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Iniciar Evaluación
              </div>
            </Button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}