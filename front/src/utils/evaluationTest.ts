// Script de prueba para el frontend - verificar el flujo de evaluaciones
import { EvaluationRequest } from '../types/evaluationTypes';

// Datos de prueba para una evaluación
export const testEvaluationData: EvaluationRequest = {
  teacherId: "123e4567-e89b-12d3-a456-426614174000", // UUID válido
  courseId: "123e4567-e89b-12d3-a456-426614174001",   // UUID válido
  groupId: "1", // Grupo opcional
  answers: [
    {
      questionId: 1,
      rating: 4,
      textAnswer: null,
      selectedOption: null
    },
    {
      questionId: 2,
      rating: 5,
      textAnswer: null,
      selectedOption: null
    },
    {
      questionId: 3,
      rating: null,
      textAnswer: "El profesor explica muy bien los conceptos",
      selectedOption: null
    }
  ],
  overallRating: 4.5,
  comments: "Excelente profesor, muy recomendado"
};

// Función para validar los datos antes del envío
export function validateEvaluationData(data: EvaluationRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar teacherId (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.teacherId)) {
    errors.push('teacherId debe ser un UUID válido');
  }
  
  // Validar courseId (UUID)
  if (!uuidRegex.test(data.courseId)) {
    errors.push('courseId debe ser un UUID válido');
  }
  
  // Validar que haya al menos una respuesta
  if (!data.answers || data.answers.length === 0) {
    errors.push('Debe haber al menos una respuesta');
  }
  
  // Validar cada respuesta
  data.answers.forEach((answer, index) => {
    if (!answer.questionId || answer.questionId <= 0) {
      errors.push(`Respuesta ${index + 1}: questionId debe ser un número positivo`);
    }
    
    if (answer.rating !== null && (answer.rating < 1 || answer.rating > 5)) {
      errors.push(`Respuesta ${index + 1}: rating debe estar entre 1 y 5`);
    }
    
    if (!answer.rating && !answer.textAnswer && !answer.selectedOption) {
      errors.push(`Respuesta ${index + 1}: debe tener al menos un valor (rating, textAnswer o selectedOption)`);
    }
  });
  
  // Validar overallRating
  if (data.overallRating < 1 || data.overallRating > 5) {
    errors.push('overallRating debe estar entre 1 y 5');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Función para simular el proceso de evaluación en el frontend
export function simulateFrontendEvaluationProcess(questions: any[], ratings: number[], textAnswers: string[], comments: string) {
  console.log('🧪 Simulando proceso de evaluación en el frontend...');
  
  // Simular mapeo de respuestas
  const answers = questions.map((q, idx) => {
    if (q.type === 'rating') {
      return {
        questionId: parseInt(q.id, 10),
        rating: ratings[idx],
        textAnswer: null
      };
    } else {
      return {
        questionId: parseInt(q.id, 10),
        rating: null,
        textAnswer: textAnswers[idx]
      };
    }
  });
  
  // Calcular rating promedio
  const ratingQuestions = questions.filter(q => q.type === 'rating');
  const ratingAnswers = answers.filter(a => a.rating !== null);
  const total = ratingAnswers.reduce((a, b) => a + (b.rating || 0), 0);
  const overallRating = ratingQuestions.length > 0 ? Number((total / ratingQuestions.length).toFixed(2)) : 0;
  
  console.log('📊 Respuestas procesadas:', answers);
  console.log('📊 Rating promedio calculado:', overallRating);
  
  return {
    answers,
    overallRating,
    comments
  };
}

// Función para probar el flujo completo
export function testCompleteEvaluationFlow() {
  console.log('🚀 Iniciando prueba del flujo completo de evaluaciones...\n');
  
  // Datos de prueba simulados
  const mockQuestions = [
    { id: '1', type: 'rating', texto_pregunta: '¿Qué tan claro es el profesor?' },
    { id: '2', type: 'rating', texto_pregunta: '¿Qué tan preparado está el profesor?' },
    { id: '3', type: 'text', texto_pregunta: 'Comentarios adicionales' }
  ];
  
  const mockRatings = [4, 5, null];
  const mockTextAnswers = [null, null, 'Excelente profesor'];
  const mockComments = 'Muy recomendado';
  
  // Simular el proceso
  const processedData = simulateFrontendEvaluationProcess(mockQuestions, mockRatings, mockTextAnswers, mockComments);
  
  // Crear datos de evaluación finales
  const evaluationData: EvaluationRequest = {
    teacherId: "123e4567-e89b-12d3-a456-426614174000",
    courseId: "123e4567-e89b-12d3-a456-426614174001",
    groupId: "1",
    answers: processedData.answers,
    overallRating: processedData.overallRating,
    comments: processedData.comments
  };
  
  // Validar datos
  const validation = validateEvaluationData(evaluationData);
  
  console.log('\n📋 Resultado de la validación:');
  console.log('Válido:', validation.isValid);
  if (!validation.isValid) {
    console.log('Errores:', validation.errors);
  }
  
  console.log('\n📊 Datos finales de evaluación:');
  console.log(JSON.stringify(evaluationData, null, 2));
  
  console.log('\n✅ Prueba del flujo completo completada');
  
  return {
    isValid: validation.isValid,
    evaluationData,
    errors: validation.errors
  };
}
