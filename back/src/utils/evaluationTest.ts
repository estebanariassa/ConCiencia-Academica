// Script de prueba para verificar el flujo completo de evaluaciones
// Este script simula el proceso completo de guardado de una evaluación

import { EvaluationRequest } from './types/evaluationTypes';

// Datos de prueba para una evaluación
const testEvaluationData: EvaluationRequest = {
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
function validateEvaluationData(data: EvaluationRequest): { isValid: boolean; errors: string[] } {
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

// Función para simular el envío de la evaluación
async function simulateEvaluationSubmission(data: EvaluationRequest): Promise<{ success: boolean; message: string; evaluationId?: string }> {
  console.log('🧪 Simulando envío de evaluación...');
  console.log('📊 Datos a enviar:', JSON.stringify(data, null, 2));
  
  // Validar datos
  const validation = validateEvaluationData(data);
  if (!validation.isValid) {
    console.error('❌ Validación fallida:', validation.errors);
    return {
      success: false,
      message: 'Datos de evaluación inválidos: ' + validation.errors.join(', ')
    };
  }
  
  console.log('✅ Validación exitosa');
  
  // Simular llamada a la API
  try {
    // Aquí normalmente harías la llamada real a la API
    // const response = await submitEvaluation(data);
    
    // Simulación de respuesta exitosa
    const mockResponse = {
      success: true,
      message: 'Evaluación guardada exitosamente',
      evaluationId: 'eval_' + Date.now()
    };
    
    console.log('✅ Evaluación guardada exitosamente:', mockResponse);
    return mockResponse;
    
  } catch (error) {
    console.error('❌ Error en la simulación:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

// Ejecutar la prueba
async function runTest() {
  console.log('🚀 Iniciando prueba del flujo de evaluaciones...\n');
  
  const result = await simulateEvaluationSubmission(testEvaluationData);
  
  console.log('\n📋 Resultado de la prueba:');
  console.log('Éxito:', result.success);
  console.log('Mensaje:', result.message);
  if (result.evaluationId) {
    console.log('ID de evaluación:', result.evaluationId);
  }
  
  console.log('\n✅ Prueba completada');
}

// Exportar para uso en otros archivos
export { testEvaluationData, validateEvaluationData, simulateEvaluationSubmission, runTest };

// Ejecutar si es el archivo principal
if (require.main === module) {
  runTest();
}
