import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CardHeader, 
  CardContent, 
  CardDescription, 
  CardTitle 
} from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Header from '../../components/Header';
import { User } from '../../types';
import { 
  ArrowLeft, 
  Download, 
  TrendingUp, 
  Users, 
  Star,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Importar la imagen de fondo
const fondo = new URL('../../assets/fondo.webp', import.meta.url).href;

interface ReportsPageProps {
  user: User;
}

export default function ReportsPage({ user }: ReportsPageProps) {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('2024-1');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for charts
  const categoryData = [
    { category: 'Claridad Expositiva', rating: 4.2, total: 45 },
    { category: 'Conocimiento', rating: 4.7, total: 45 },
    { category: 'Responsabilidad', rating: 4.5, total: 45 },
    { category: 'Interacción', rating: 3.8, total: 45 },
    { category: 'Metodología', rating: 4.1, total: 45 },
    { category: 'Evaluación', rating: 4.3, total: 45 },
    { category: 'Trato Personal', rating: 4.6, total: 45 },
    { category: 'Motivación', rating: 3.9, total: 45 },
    { category: 'Disponibilidad', rating: 4.0, total: 45 },
    { category: 'Recomendación', rating: 4.4, total: 45 }
  ];

  const trendData = [
    { period: '2022-1', rating: 3.8 },
    { period: '2022-2', rating: 4.0 },
    { period: '2023-1', rating: 4.2 },
    { period: '2023-2', rating: 4.3 },
    { period: '2024-1', rating: 4.5 }
  ];

  const radarData = [
    { subject: 'Claridad', A: 4.2, fullMark: 5 },
    { subject: 'Conocimiento', A: 4.7, fullMark: 5 },
    { subject: 'Metodología', A: 4.1, fullMark: 5 },
    { subject: 'Evaluación', A: 4.3, fullMark: 5 },
    { subject: 'Trato', A: 4.6, fullMark: 5 },
    { subject: 'Motivación', A: 3.9, fullMark: 5 }
  ];

  const distributionData = [
    { name: '5 Estrellas', value: 35, color: '#10B981' },
    { name: '4 Estrellas', value: 28, color: '#3B82F6' },
    { name: '3 Estrellas', value: 20, color: '#F59E0B' },
    { name: '2 Estrellas', value: 12, color: '#EF4444' },
    { name: '1 Estrella', value: 5, color: '#6B7280' }
  ];

  const departmentData = [
    { department: 'Ingeniería', rating: 4.3, evaluations: 120 },
    { department: 'Ciencias', rating: 4.1, evaluations: 85 },
    { department: 'Humanidades', rating: 4.5, evaluations: 95 },
    { department: 'Administración', rating: 4.0, evaluations: 110 }
  ];

  const mockStats = {
    totalEvaluations: user.type === 'coordinator' ? 410 : 45,
    averageRating: 4.3,
    responseRate: 87,
    improvement: user.type === 'coordinator' ? 5.2 : 8.1
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
        
        <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Header interno con botón de volver y filtros */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border-b border-gray-200 p-4 lg:p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {user.type === 'coordinator' ? 'Dashboard de Reportes' : 'Mis Evaluaciones'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {user.type === 'coordinator' 
                      ? 'Análisis y estadísticas departamentales' 
                      : 'Resultados de tus evaluaciones docentes'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-32 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                >
                  <option value="2024-1">2024-1</option>
                  <option value="2023-2">2023-2</option>
                  <option value="2023-1">2023-1</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {user.type === 'coordinator' && (
              <div className="flex gap-3">
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-48 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                >
                  <option value="all">Todos los Departamentos</option>
                  <option value="engineering">Ingeniería</option>
                  <option value="sciences">Ciencias</option>
                  <option value="humanities">Humanidades</option>
                  <option value="business">Administración</option>
                </select>
              </div>
            )}
          </motion.header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
                  <BarChart3 className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{mockStats.totalEvaluations}</div>
                  <p className="text-xs text-gray-500">Este período académico</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{mockStats.averageRating}/5.0</div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    +{mockStats.improvement}% vs período anterior
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{mockStats.responseRate}%</div>
                  <p className="text-xs text-gray-500">De estudiantes elegibles</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {user.type === 'coordinator' ? 'Docentes Evaluados' : 'Cursos Evaluados'}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {user.type === 'coordinator' ? '24' : '6'}
                  </div>
                  <p className="text-xs text-gray-500">
                    {user.type === 'coordinator' ? 'En el departamento' : 'Cursos completados'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Ratings Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle>Calificaciones por Categoría</CardTitle>
                  <CardDescription>
                    Promedio de calificaciones en cada dimensión evaluada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="rating" fill="#E63946" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle>Tendencia Histórica</CardTitle>
                  <CardDescription>
                    Evolución de las calificaciones a lo largo del tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#E63946" 
                        strokeWidth={3}
                        dot={{ fill: '#E63946', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle>Perfil de Competencias</CardTitle>
                  <CardDescription>
                    Vista radial de las principales dimensiones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 5]} />
                      <Radar
                        name="Calificación"
                        dataKey="A"
                        stroke="#E63946"
                        fill="#E63946"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Distribution Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle>Distribución de Calificaciones</CardTitle>
                  <CardDescription>
                    Porcentaje de evaluaciones por nivel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle>Estadísticas Rápidas</CardTitle>
                  <CardDescription>
                    Métricas clave del período
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Mejor Calificación</span>
                      <Badge className="bg-green-100 text-green-800">4.9/5.0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Categoría Destacada</span>
                      <Badge variant="outline">Conocimiento</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Área de Mejora</span>
                      <Badge variant="outline" className="text-orange-600">Interacción</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Participación</span>
                      <Badge className="bg-blue-100 text-blue-800">87%</Badge>
                    </div>
                  </div>

                  {user.type === 'coordinator' && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium mb-3">Por Departamento</h4>
                      <div className="space-y-2">
                        {departmentData.map((dept, index) => (
                          <div key={dept.department} className="flex justify-between text-sm">
                            <span>{dept.department}</span>
                            <span className="font-medium">{dept.rating}/5.0</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Export Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Card className="bg-white shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Opciones de Exportación
                </CardTitle>
                <CardDescription>
                  Descarga reportes detallados en diferentes formatos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Reporte PDF
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Datos Excel
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Gráficos PNG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}