import { apiClient } from './client'
import { Teacher } from '../types'

export interface TeachersResponse {
  teachers: Teacher[]
}

// Función para obtener profesores con sus cursos
export async function fetchTeachersWithCourses(): Promise<Teacher[]> {
  try {
    const response = await apiClient.get<Teacher[]>('/api/teachers')
    return response.data
  } catch (error) {
    console.error('Error fetching teachers:', error)
    throw new Error('Error al cargar los profesores')
  }
}

// Función para obtener grupos de un curso específico
export async function fetchCourseGroups(profesorId: string, courseId: string): Promise<any[]> {
  try {
    console.log('🌐 Making API call to:', `/teachers/${profesorId}/courses/${courseId}/groups`);
    const response = await apiClient.get(`/api/teachers/${profesorId}/courses/${courseId}/groups`)
    console.log('🌐 API Response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Error fetching course groups:', error)
    console.error('❌ Error details:', {
      message: (error as any)?.message,
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data
    });
    throw new Error('Error al cargar los grupos del curso')
  }
}

export async function fetchTeacherStats(profesorId: string): Promise<any> {
  try {
    console.log('🌐 Making API call to:', `/teachers/${profesorId}/stats`);
    const response = await apiClient.get(`/api/teachers/${profesorId}/stats`)
    console.log('🌐 Teacher Stats API Response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Error fetching teacher stats:', error)
    console.error('❌ Error details:', {
      message: (error as any)?.message,
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data
    });
    throw new Error('Error al cargar las estadísticas del profesor')
  }
}

export async function fetchTeacherHistoricalStats(profesorId: string, period?: string): Promise<any> {
  try {
    const url = period 
      ? `/api/teachers/${profesorId}/stats/historical?period=${period}`
      : `/api/teachers/${profesorId}/stats/historical`;
    console.log('🌐 Making API call to:', url);
    const response = await apiClient.get(url)
    console.log('🌐 Teacher Historical Stats API Response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Error fetching teacher historical stats:', error)
    console.error('❌ Error details:', {
      message: (error as any)?.message,
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data
    });
    throw new Error('Error al cargar las estadísticas históricas del profesor')
  }
}

export async function submitEvaluation(evaluationData: {
  teacherId: string;
  courseId: string;
  groupId?: string;
  answers: Array<{ questionId: string; rating: number | null; textAnswer: string | null }>;
  overallRating: number;
  comments?: string;
}): Promise<any> {
  try {
    console.log('🌐 Submitting evaluation:', evaluationData);
    const response = await apiClient.post('/api/teachers/evaluations', evaluationData)
    console.log('🌐 Evaluation submission response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Error submitting evaluation:', error)
    console.error('❌ Error details:', {
      message: (error as any)?.message,
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data
    });
    throw new Error('Error al enviar la evaluación')
  }
}

export async function fetchEvaluationQuestions(courseId: string): Promise<any> {
  try {
    console.log('🌐 Fetching evaluation questions for courseId:', courseId);
    const response = await apiClient.get(`/api/teachers/evaluation-questions/${courseId}`)
    console.log('🌐 Evaluation questions response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Error fetching evaluation questions:', error)
    console.error('❌ Error details:', {
      message: (error as any)?.message,
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data
    });
    throw new Error('Error al obtener las preguntas de evaluación')
  }
}

export async function fetchStudentInfo(): Promise<any> {
  try {
    console.log('🌐 Fetching student info');
    const response = await apiClient.get('/api/teachers/student-info')
    console.log('🌐 Student info response:', response.data);
    return response.data
  } catch (error) {
    console.error('❌ Error fetching student info:', error)
    console.error('❌ Error details:', {
      message: (error as any)?.message,
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data
    });
    throw new Error('Error al obtener la información del estudiante')
  }
}

// Función para obtener profesores por carrera (para coordinadores)
export async function fetchProfessorsByCareer(careerId: string): Promise<any[]> {
  try {
    console.log('🌐 fetchProfessorsByCareer: Iniciando llamada a /api/teachers/by-career/' + careerId)
    const response = await apiClient.get(`/api/teachers/by-career/${careerId}`)
    console.log('🌐 fetchProfessorsByCareer: Respuesta recibida:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ fetchProfessorsByCareer: Error:', error)
    throw new Error('Error al cargar los profesores de la carrera')
  }
}

export async function fetchCourseRating(professorId: string, courseId: string): Promise<any> {
  try {
    console.log(`🌐 fetchCourseRating: Obteniendo calificación para profesor ${professorId} en curso ${courseId}`)
    const response = await apiClient.get(`/api/teachers/course-rating/${professorId}/${courseId}`)
    console.log('🌐 fetchCourseRating: Respuesta recibida:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ fetchCourseRating: Error:', error)
    throw new Error('Error al cargar la calificación del curso')
  }
}

// Función para obtener carreras disponibles (para coordinadores)
export async function fetchCareers(): Promise<any[]> {
  try {
    const response = await apiClient.get('/api/teachers/careers')
    return response.data
  } catch (error) {
    console.error('Error fetching careers:', error)
    throw new Error('Error al cargar las carreras')
  }
}

