import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { evaluacionesApi, Evaluacion } from '../api/evaluaciones'
import { 
  CardHeader, 
  CardContent, 
  CardDescription, 
  CardTitle 
} from '../components/Card'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Header from '../components/Header'
import { 
  BookOpen, 
  User, 
  Calendar, 
  CheckCircle, 
  Clock,
  TrendingUp,
  FileText,
  Star
} from 'lucide-react'

const fondo = new URL('../assets/fondo.webp', import.meta.url).href

export default function DashboardEstudiante() {
  const { user } = useAuth()
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEvaluaciones()
  }, [])

  const loadEvaluaciones = async () => {
    try {
      setLoading(true)
      const data = await evaluacionesApi.getEvaluaciones()
      setEvaluaciones(data)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al cargar evaluaciones')
    } finally {
      setLoading(false)
    }
  }

  const evaluacionesCompletadas = evaluaciones.filter(e => e.completada)
  const evaluacionesPendientes = evaluaciones.filter(e => !e.completada)
  const promedioGeneral = evaluacionesCompletadas.length > 0 
    ? evaluacionesCompletadas.reduce((sum, e) => sum + (e.calificacion_promedio || 0), 0) / evaluacionesCompletadas.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Fondo */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="relative z-10">
        <Header 
          user={{
            id: user?.id || '',
            name: `${user?.nombre} ${user?.apellido}`,
            type: user?.tipo_usuario as any,
            email: user?.email || ''
          }}
        />

        <main className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold">
                        ¡Hola, {user?.nombre}!
                      </h1>
                      <p className="text-red-100 mt-1 text-sm sm:text-base">
                        Bienvenido a tu panel de estudiante
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                        <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30 text-xs">
                          {user?.tipo_usuario === 'estudiante' ? 'Estudiante' : 'Usuario'}
                        </Badge>
                        <span className="text-red-100 text-xs sm:text-sm">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold">
                      {evaluaciones.length > 0 ? Math.round((evaluacionesCompletadas.length / evaluaciones.length) * 100) : 0}%
                    </div>
                    <p className="text-red-100 text-xs sm:text-sm">Progreso General</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluaciones Completadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{evaluacionesCompletadas.length}</div>
                  <p className="text-xs text-gray-500">De {evaluaciones.length} total</p>
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
                  <CardTitle className="text-sm font-medium">Evaluaciones Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{evaluacionesPendientes.length}</div>
                  <p className="text-xs text-gray-500">Por completar</p>
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
                  <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {promedioGeneral > 0 ? promedioGeneral.toFixed(1) : '0.0'}/5.0
                  </div>
                  <p className="text-xs text-gray-500">Calificación promedio</p>
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
                  <CardTitle className="text-sm font-medium">Progreso</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {evaluaciones.length > 0 ? Math.round((evaluacionesCompletadas.length / evaluaciones.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-gray-500">Completado</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Evaluaciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white shadow-md border border-gray-200">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="h-5 w-5" />
                  Mis Evaluaciones
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Historial de evaluaciones realizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Cargando evaluaciones...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    {error}
                  </div>
                ) : evaluaciones.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes evaluaciones asignadas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evaluaciones.map((evaluacion) => (
                      <motion.div
                        key={evaluacion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                                {evaluacion.grupo.curso.nombre}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {evaluacion.grupo.curso.codigo}
                                </Badge>
                                {evaluacion.completada ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    Completada
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                                    Pendiente
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>
                                  {evaluacion.profesor.usuario.nombre} {evaluacion.profesor.usuario.apellido}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{evaluacion.grupo.periodo.nombre}</span>
                              </div>
                              {evaluacion.completada && evaluacion.calificacion_promedio && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  <span>{evaluacion.calificacion_promedio.toFixed(1)}/5.0</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {!evaluacion.completada && (
                            <Button 
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-xs sm:text-sm"
                            >
                              Evaluar
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}


