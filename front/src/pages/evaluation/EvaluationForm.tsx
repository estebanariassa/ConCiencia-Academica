import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardHeader, CardContent, CardTitle, CardDescription } from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Header from '../../components/Header';
import LikertScale from '../../components/LikertScale';
import ProgressBar from '../../components/ProgressBar';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/Avatar';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const fondo = new URL('../../assets/fondo.webp', import.meta.url).href;

interface EvaluationQuestion {
  id: string;
  category: string;
  question: string;
}

export default function EvaluationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { teacher, course } = location.state || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [ratings, setRatings] = useState<number[]>(Array(10).fill(0));

  const questions: EvaluationQuestion[] = [
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

  const ratingLabels = ['Muy Deficiente', 'Deficiente', 'Regular', 'Bueno', 'Excelente'];

  const handleRatingSelect = (rating: number) => {
    const newRatings = [...ratings];
    newRatings[currentQuestion] = rating;
    setRatings(newRatings);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit evaluation
      console.log('Evaluation completed:', { teacher, course, ratings });
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

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
        {/* Header con componente reutilizable */}
        <Header 
          title="Evaluación Docente - Paso 2 de 2"
          subtitle="Evalúa el desempeño del profesor"
        />

        {/* Barra de progreso justo debajo del header */}
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <ProgressBar 
              current={currentQuestion + 1} 
              total={questions.length} 
              label={`Pregunta ${currentQuestion + 1} de ${questions.length}`}
            />
          </div>
        </div>

        <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Botón de volver independiente */}
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

          {/* Teacher Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-red-600 text-white text-lg">
                    {teacher?.name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{teacher?.name}</h2>
                  <p className="text-md text-gray-600">{course?.name} - {course?.code}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Question Card */}
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
  {/* Rating Scale */}
  <div className="space-y-8">
    <LikertScale
      value={ratings[currentQuestion]}
      onChange={handleRatingSelect}
      options={5}
      leftLabel="En desacuerdo"
      rightLabel="De acuerdo"
    />

    {/* Current Rating Feedback */}
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

  {/* Navigation Buttons */}
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
      {currentQuestion === questions.length - 1 ? 'Finalizar Evaluación' : 'Siguiente'}
      <ChevronRight className="h-6 w-6 ml-2" />
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