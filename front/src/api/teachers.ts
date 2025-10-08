import { apiClient } from './client'
import { Teacher } from '../types'

export interface TeachersResponse {
  teachers: Teacher[]
}

// Función para obtener profesores con sus cursos
export async function fetchTeachersWithCourses(): Promise<Teacher[]> {
  try {
    const response = await apiClient.get<Teacher[]>('/teachers')
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
    const response = await apiClient.get(`/teachers/${profesorId}/courses/${courseId}/groups`)
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
    const response = await apiClient.get(`/teachers/${profesorId}/stats`)
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
      ? `/teachers/${profesorId}/stats/historical?period=${period}`
      : `/teachers/${profesorId}/stats/historical`;
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
  answers: Array<{ questionId: string; rating: number }>;
  overallRating: number;
  comments?: string;
}): Promise<any> {
  try {
    console.log('🌐 Submitting evaluation:', evaluationData);
    const response = await apiClient.post('/teachers/evaluations', evaluationData)
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
    const response = await apiClient.get(`/teachers/evaluation-questions/${courseId}`)
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
    const response = await apiClient.get('/teachers/student-info')
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

