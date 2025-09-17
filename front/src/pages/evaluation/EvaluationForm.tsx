import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardHeader, CardContent, CardTitle, CardDescription } from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LikertScale from '../../components/LikertScale';
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
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 p-4 lg:p-6"
        >
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Evaluación Docente - Paso 2 de 2</h1>
              <p className="text-sm text-gray-600">Evalúa el desempeño del profesor</p>
            </div>
          </div>
        </motion.header>

        <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-900">
                  Pregunta {currentQuestion + 1} de {questions.length}
                </span>
                <span className="text-lg font-medium text-gray-900">
                  {Math.round(progress)}% completado
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-red-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

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
                <CardTitle className="text-xl text-gray-900">{questions[currentQuestion].category}</CardTitle>
                <CardDescription className="text-md">
                  {questions[currentQuestion].question}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Rating Scale */}
                <div className="space-y-6">
                  <LikertScale
                    value={ratings[currentQuestion]}
                    onChange={handleRatingSelect}
                    options={5}
                    leftLabel="Muy Deficiente"
                    rightLabel="Excelente"
                  />

                  {/* Rating Labels */}
                  <div className="flex justify-between px-2 mt-4">
                    {ratingLabels.map((label, index) => (
                      <span
                        key={index}
                        className="text-sm text-gray-600 font-medium text-center"
                        style={{ width: `${100 / ratingLabels.length}%` }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* Current Rating Feedback */}
                  {ratings[currentQuestion] > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-center p-4 rounded-lg text-lg font-medium ${
                        ratings[currentQuestion] >= 4
                          ? 'bg-green-50 text-green-700'
                          : ratings[currentQuestion] >= 3
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      Has calificado: {ratings[currentQuestion]}/5 -{' '}
                      {ratingLabels[ratings[currentQuestion] - 1]}
                    </motion.div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-10">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="px-6 py-3 text-lg"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 text-lg"
                  >
                    {currentQuestion === questions.length - 1 ? 'Finalizar Evaluación' : 'Siguiente'}
                    <ChevronRight className="h-5 w-5 ml-2" />
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