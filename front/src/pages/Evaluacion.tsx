import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { evaluacionesApi, PreguntaEvaluacion, EvaluacionData } from '../api/evaluaciones'
import { 
  CardHeader, 
  CardContent, 
  CardDescription, 
  CardTitle 
} from '../components/Card'
import Card from '../components/Card'
import Button from '../components/Button'
import LikertScale from '../components/LikertScale'
import ProgressBar from '../components/ProgressBar'
import ConfirmationModal from '../components/ConfirmationModal'
import { ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react'

const fondo = new URL('../assets/fondo.webp', import.meta.url).href

export default function Evaluacion() {
  const { evaluacionId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [preguntas, setPreguntas] = useState<PreguntaEvaluacion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [respuestas, setRespuestas] = useState<{ [key: number]: any }>({})
  const [comentarios, setComentarios] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPreguntas()
  }, [])

  const loadPreguntas = async () => {
    try {
      setLoading(true)
      const data = await evaluacionesApi.getPreguntas()
      setPreguntas(data)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al cargar preguntas')
    } finally {
      setLoading(false)
    }
  }

  const handleRatingSelect = (rating: number) => {
    const preguntaId = preguntas[currentQuestion].id
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: { ...prev[preguntaId], respuesta_rating: rating }
    }))
  }

  const handleTextChange = (text: string) => {
    const preguntaId = preguntas[currentQuestion].id
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: { ...prev[preguntaId], respuesta_texto: text }
    }))
  }

  const handleNext = () => {
    if (currentQuestion < preguntas.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true)
      setShowConfirmation(false)

      // Preparar datos de la evaluación
      const evaluacionData: EvaluacionData = {
        profesor_id: 'profesor-id-placeholder', // Esto debería venir de la URL o contexto
        grupo_id: 1, // Esto debería venir de la URL o contexto
        periodo_id: 1, // Esto debería venir de la URL o contexto
        comentarios,
        respuestas: Object.entries(respuestas).map(([preguntaId, respuesta]) => ({
          pregunta_id: parseInt(preguntaId),
          ...respuesta
        }))
      }

      await evaluacionesApi.createEvaluacion(evaluacionData)
      navigate('/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al enviar evaluación')
    } finally {
      setSubmitting(false)
    }
  }

  const currentPregunta = preguntas[currentQuestion]
  const currentRespuesta = currentPregunta ? respuestas[currentPregunta.id] : null
  const progress = preguntas.length > 0 ? ((currentQuestion + 1) / preguntas.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando evaluación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

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
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Evaluación Docente
                  </h1>
                  <p className="text-sm text-gray-600">
                    Pregunta {currentQuestion + 1} de {preguntas.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <ProgressBar 
              current={currentQuestion + 1} 
              total={preguntas.length} 
              label={`${currentPregunta?.categoria.nombre || ''}`}
            />
          </div>
        </div>

        <main className="max-w-4xl mx-auto p-4 lg:p-6">
          {currentPregunta && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white shadow-lg border border-gray-200 p-6">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {currentPregunta.categoria.nombre}
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-700 mt-2">
                    {currentPregunta.texto_pregunta}
                  </CardDescription>
                  {currentPregunta.descripcion && (
                    <p className="text-gray-600 mt-2">
                      {currentPregunta.descripcion}
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="space-y-8">
                    {currentPregunta.tipo_pregunta === 'rating' ? (
                      <LikertScale
                        value={currentRespuesta?.respuesta_rating || 0}
                        onChange={handleRatingSelect}
                        options={5}
                        leftLabel="En desacuerdo"
                        rightLabel="De acuerdo"
                      />
                    ) : currentPregunta.tipo_pregunta === 'texto' ? (
                      <textarea
                        value={currentRespuesta?.respuesta_texto || ''}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Escribe tu respuesta aquí..."
                        className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : null}

                    {currentRespuesta?.respuesta_rating > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-4 rounded-lg bg-green-50 border border-green-200"
                      >
                        <div className="flex items-center justify-center gap-2 text-green-800">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Respuesta guardada</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex justify-between mt-12">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      className="px-8 py-3"
                    >
                      Anterior
                    </Button>
                    
                    {currentQuestion === preguntas.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        className="bg-red-600 hover:bg-red-700 px-8 py-3"
                        disabled={submitting}
                      >
                        {submitting ? 'Enviando...' : 'Finalizar Evaluación'}
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="bg-red-600 hover:bg-red-700 px-8 py-3"
                      >
                        Siguiente
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Comentarios adicionales */}
          {currentQuestion === preguntas.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <Card className="bg-white shadow-lg border border-gray-200 p-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Comentarios Adicionales
                  </CardTitle>
                  <CardDescription>
                    ¿Tienes algún comentario adicional sobre el desempeño del profesor? (Opcional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    placeholder="Escribe tus comentarios aquí..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Evaluación"
        message="¿Estás seguro de que deseas finalizar la evaluación? Una vez enviada, no podrás modificarla."
        confirmText="Confirmar y Enviar"
        cancelText="Cancelar"
      />
    </div>
  )
}

