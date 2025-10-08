import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitEvaluation, fetchStudentInfo, fetchEvaluationQuestions } from '../../api/teachers';
import { CardHeader, CardContent, CardTitle, CardDescription } from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Header from '../../components/Header';
import LikertScale from '../../components/LikertScale';
import ProgressBar from '../../components/ProgressBar';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ArrowLeft, ChevronRight } from 'lucide-react';
// import { submitEvaluation, getCurrentUserId } from '../../lib/supabase/queries' // Removido - usar API del backend

const fondo = new URL('../../assets/fondo.webp', import.meta.url).href;

interface EvaluationQuestion {
  id: string;
  category: string;
  question: string;
}

export default function EvaluationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { teacher, course, group } = location.state || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [ratings, setRatings] = useState<number[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [comments, setComments] = useState('');
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  // Cargar información del estudiante y preguntas al montar el componente
  useEffect(() => {
    const loadStudentInfoAndQuestions = async () => {
      try {
        console.log('🔍 Loading student info and questions...');
        
        // Obtener información del estudiante
        const studentData = await fetchStudentInfo();
        setStudentInfo(studentData);
        console.log('✅ Student info loaded:', studentData);

        // Obtener preguntas según el curso (no la carrera del estudiante)
        if (course?.id) {
          const questionsData = await fetchEvaluationQuestions(String(course.id));
          setQuestions(questionsData.questions);
          setRatings(Array(questionsData.questions.length).fill(0));
          console.log('✅ Questions loaded for course:', questionsData.courseName, 'Code:', questionsData.courseCode, 'Count:', questionsData.questions.length);
        } else {
          throw new Error('No course ID available');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading student info or questions:', error);
        // Fallback a preguntas por defecto
        const defaultQuestions: EvaluationQuestion[] = [
          { id: '1', category: 'Claridad Expositiva', question: 'El profesor explica claramente los conceptos del curso' },
          { id: '2', category: 'Dominio del Tema', question: 'El profesor demuestra amplio conocimiento de la materia' },
          { id: '3', category: 'Disponibilidad', question: 'El profesor está disponible para resolver dudas' },
          { id: '4', category: 'Material de Clase', question: 'El material proporcionado es adecuado y útil' },
          { id: '5', category: 'Evaluación Justa', question: 'Las evaluaciones reflejan adecuadamente los contenidos' },
          { id: '6', category: 'Motivación', question: 'El profesor motiva a los estudiantes a participar' },
          { id: '7', category: 'Organización', question: 'Las clases están bien organizadas y estructuradas' },
          { id: '8', category: 'Retroalimentación', question: 'Proporciona retroalimentación útil sobre el progreso' },
          { id: '9', category: 'Respeto', question: 'Muestra respeto por las opiniones de los estudiantes' },
          { id: '10', category: 'Innovación', question: 'Utiliza métodos innovadores en la enseñanza' }
        ];
        setQuestions(defaultQuestions);
        setRatings(Array(defaultQuestions.length).fill(0));
        setLoading(false);
      }
    };

    loadStudentInfoAndQuestions();
  }, [course?.id]);

  const ratingLabels = ['Muy Deficiente', 'Deficiente', 'Regular', 'Bueno', 'Excelente'];

  const handleRatingSelect = (rating: number) => {
    const newRatings = [...ratings];
    newRatings[currentQuestion] = rating;
    setRatings(newRatings);
  };

  const handleNext = () => {
    if (ratings[currentQuestion] === 0) {
      alert('Por favor selecciona una calificación antes de continuar');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowCommentsSection(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleBackToQuestions = () => {
    setShowCommentsSection(false);
    setCurrentQuestion(questions.length - 1);
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      if (!teacher?.id || !course?.id) {
        alert('Error: Faltan datos del profesor o curso')
        return
      }

      const answers = questions.map((q, idx) => ({
        questionId: q.id,
        rating: ratings[idx],
      }))
      const total = ratings.reduce((a, b) => a + b, 0)
      const overallRating = Number((total / ratings.length).toFixed(2))

      console.log('📤 Enviando evaluación:', {
        teacherId: String(teacher.id),
        courseId: String(course.id),
        groupId: group ? String(group.id) : undefined,
        comments,
        answers,
        overallRating,
        teacher: teacher,
        course: course,
        group: group
      })

      const result = await submitEvaluation({
        teacherId: String(teacher.id),
        courseId: String(course.id),
        groupId: group ? String(group.id) : undefined,
        comments,
        answers,
        overallRating,
      })

      console.log('✅ Evaluación enviada exitosamente:', result)
      setShowConfirmation(false)
      alert('¡Evaluación completada exitosamente!')
      navigate('/dashboard')
    } catch (e: any) {
      console.error('❌ Error enviando evaluación:', e)
      const errorMessage = e?.message ?? 'Error guardando la evaluación'
      alert(errorMessage)
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  const totalSteps = questions.length + 1; // Preguntas + sección de comentarios
  const currentStep = showCommentsSection ? totalSteps : currentQuestion + 1;

  // Mostrar loading mientras se cargan las preguntas
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
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
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando preguntas de evaluación</h2>
            <p className="text-gray-600">Obteniendo preguntas específicas para tu carrera...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
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
          title="Evaluación Docente - Paso 2 de 2"
          subtitle="Evalúa el desempeño del profesor"
        />

        <div className="bg-white border-b border-gray-200 py-3">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <ProgressBar 
              current={currentStep} 
              total={totalSteps} 
              label={showCommentsSection ? 'Comentarios' : `Pregunta ${currentQuestion + 1} de ${questions.length}`}
            />
          </div>
        </div>

        <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
          <div className="flex justify-start">
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => navigate(-1)}
              className="ml-2 text-lg py-2 px-4 bg-white bg-opacity-90 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver a seleccionar Docente
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white shadow-lg border border-gray-200 p-6">
              <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">{teacher?.name}</h2>
                            <p className="text-md text-gray-600">{course?.name} - {course?.code}</p>
                            {course && (
                              <p className="text-sm text-blue-600 font-medium">
                                📚 Evaluación para: {course.code} - {course.name}
                              </p>
                            )}
                          </div>
                        </div>
                
                {group && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold text-lg">G{group.numero_grupo}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">Grupo {group.numero_grupo}</h3>
                        <div className="flex flex-wrap gap-4 mt-1">
                          {group.horario && (
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              📅 {group.horario}
                            </span>
                          )}
                          {group.aula && (
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              🏢 {group.aula}
                            </span>
                          )}
                          {group.cup && (
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              👥 {group.cup} cupos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {!showCommentsSection ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-lg border border-gray-200 p-6">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {questions[currentQuestion].category}
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-700 mt-2">
                    {questions[currentQuestion].question}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <LikertScale
                      value={ratings[currentQuestion]}
                      onChange={handleRatingSelect}
                      options={5}
                      leftLabel="En desacuerdo"
                      rightLabel="De acuerdo"
                    />

                    {ratings[currentQuestion] > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-center p-6 rounded-2xl text-xl font-semibold border-2 ${
                          ratings[currentQuestion] >= 4
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : ratings[currentQuestion] >= 3
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        Has calificado: {ratings[currentQuestion]}/5
                        <br />
                        <span className="text-lg font-medium">
                          {ratingLabels[ratings[currentQuestion] - 1]}
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex justify-between mt-12">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      className="px-8 py-4 text-lg border-2"
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-red-600 hover:bg-red-700 px-8 py-4 text-lg"
                    >
                      {currentQuestion === questions.length - 1 ? 'Ir a comentarios' : 'Siguiente'}
                      <ChevronRight className="h-6 w-6 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-lg border border-gray-200 p-6">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Comentarios Adicionales
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-700 mt-2">
                    ¿Tienes algún comentario adicional sobre el desempeño del profesor? (Opcional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Escribe tus comentarios aquí..."
                      className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-between mt-12">
                    <Button
                      variant="outline"
                      onClick={handleBackToQuestions}
                      className="px-8 py-4 text-lg border-2"
                    >
                      Volver a Preguntas
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="bg-red-600 hover:bg-red-700 px-8 py-4 text-lg"
                    >
                      Finalizar Evaluación
                      <ChevronRight className="h-6 w-6 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Evaluación"
        message="¿Estás seguro de que deseas finalizar la evaluación? Una vez enviada, no podrás modificarla."
        confirmText="Confirmar y Enviar"
        cancelText="Cancelar"
      />
    </div>
  );
}