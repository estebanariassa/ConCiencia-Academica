import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Card, { CardHeader, CardContent, CardDescription, CardTitle } from '../components/Card'
import Button from '../components/Button'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, TrendingUp, Users, Star, MessageSquare } from 'lucide-react'

export default function SurveyResults() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const courseId = searchParams.get('courseId')
  const professorId = searchParams.get('professorId')
  const fondo = new URL('../assets/fondo.webp', import.meta.url).href

  const storedUser = (() => {
    try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null } catch { return null }
  })()

  const [loading, setLoading] = useState(true)
  const [surveyData, setSurveyData] = useState<any>(null)

  useEffect(() => {
    const loadSurveyResults = async () => {
      if (!courseId || !professorId) {
        navigate('/profesores/gestionar')
        return
      }

      setLoading(true)
      try {
        // TODO: Implementar llamada al backend para obtener resultados de encuestas
        // const data = await fetchSurveyResults(courseId, professorId)
        
        // Datos mock para demostración
        const mockData = {
          course: {
            id: courseId,
            name: 'Programación de Computadores',
            code: 'PROG001'
          },
          professor: {
            id: professorId,
            name: 'Profesor Ejemplo'
          },
          totalResponses: 45,
          averageRating: 4.2,
          questions: [
            {
              id: 1,
              text: '¿Qué tan claro es el profesor en sus explicaciones?',
              average: 4.3,
              responses: [
                { rating: 5, count: 20 },
                { rating: 4, count: 15 },
                { rating: 3, count: 7 },
                { rating: 2, count: 2 },
                { rating: 1, count: 1 }
              ]
            },
            {
              id: 2,
              text: '¿Qué tan útil es el material de clase?',
              average: 4.1,
              responses: [
                { rating: 5, count: 18 },
                { rating: 4, count: 17 },
                { rating: 3, count: 8 },
                { rating: 2, count: 1 },
                { rating: 1, count: 1 }
              ]
            },
            {
              id: 3,
              text: '¿Qué tan accesible es el profesor fuera de clase?',
              average: 4.0,
              responses: [
                { rating: 5, count: 15 },
                { rating: 4, count: 20 },
                { rating: 3, count: 7 },
                { rating: 2, count: 2 },
                { rating: 1, count: 1 }
              ]
            }
          ],
          comments: [
            'Excelente profesor, muy claro en sus explicaciones',
            'El material es muy útil y actualizado',
            'Muy accesible para resolver dudas',
            'Podría mejorar en la organización del tiempo'
          ]
        }
        
        setSurveyData(mockData)
      } catch (error) {
        console.error('Error loading survey results:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSurveyResults()
  }, [courseId, professorId, navigate])

  const backToManageProfessors = () => navigate('/profesores/gestionar')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <div className="fixed inset-0 z-0" style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Cargando resultados de encuestas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <div className="fixed inset-0 z-0" style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <p>No se encontraron resultados de encuestas</p>
            <Button onClick={backToManageProfessors} className="mt-4">
              Volver a Gestionar Profesores
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="relative z-10">
        <Header user={{ 
          id: storedUser?.id || '', 
          name: `${storedUser?.nombre || ''} ${storedUser?.apellido || ''}`.trim() || 'Coordinador', 
          type: 'coordinator', 
          email: storedUser?.email || '' 
        }} />

        <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          <div className="flex justify-start">
            <Button variant="ghost" size="lg" onClick={backToManageProfessors} className="ml-2 text-lg py-2 px-4 bg-white bg-opacity-90 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver a Gestionar Profesores
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white shadow-md border border-gray-200 p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-5 w-5" /> Resultados de Encuestas
                </CardTitle>
                <CardDescription>
                  {surveyData.course.name} ({surveyData.course.code}) - {surveyData.professor.name}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardContent className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{surveyData.totalResponses}</div>
                  <p className="text-sm text-gray-600">Respuestas Totales</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardContent className="text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{surveyData.averageRating}</div>
                  <p className="text-sm text-gray-600">Calificación Promedio</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardContent className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">85%</div>
                  <p className="text-sm text-gray-600">Satisfacción</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Preguntas y respuestas */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-white shadow-md border border-gray-200 p-6">
              <CardHeader>
                <CardTitle className="text-gray-900">Preguntas de Evaluación</CardTitle>
                <CardDescription>Resultados detallados por pregunta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {surveyData.questions.map((question: any, index: number) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{question.text}</h4>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Promedio:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{question.average}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {question.responses.map((response: any) => (
                        <div key={response.rating} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-8">{response.rating}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(response.count / surveyData.totalResponses) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{response.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Comentarios */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-white shadow-md border border-gray-200 p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <MessageSquare className="h-5 w-5" /> Comentarios de Estudiantes
                </CardTitle>
                <CardDescription>Comentarios adicionales de los estudiantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {surveyData.comments.map((comment: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">"{comment}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}



