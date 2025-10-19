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

// Función para obtener cursos de un profesor específico
export async function fetchTeacherCourses(teacherId: string): Promise<any[]> {
  try {
    console.log('🌐 Fetching teacher courses for ID:', teacherId);
    const response = await apiClient.get(`/api/teachers/${teacherId}/courses`);
    console.log('✅ Teacher courses loaded:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching teacher courses:', error);
    throw new Error('Error al obtener los cursos del profesor');
  }
}

// Función para obtener estadísticas del coordinador (solo de su carrera)
export async function fetchCoordinatorStats(): Promise<{
  totalProfesores: number;
  totalCursos: number;
  totalCarreras: number;
}> {
  try {
    console.log('🌐 Fetching coordinator stats...');
    
    // Obtener la carrera del coordinador desde localStorage
    const raw = localStorage.getItem('user');
    if (!raw) {
      throw new Error('No se encontró información del usuario');
    }
    
    const user = JSON.parse(raw);
    console.log('🔍 Usuario completo desde localStorage:', user);
    console.log('🔍 user.coordinador:', user?.coordinador);
    console.log('🔍 user.carrera_id:', user?.carrera_id);
    console.log('🔍 user.profesor:', user?.profesor);
    
    let carreraId = String(user?.coordinador?.carrera_id ?? user?.carrera_id ?? user?.profesor?.carrera_id ?? '');
    
    // TEMPORAL: Forzar carrera_id para coordinadores conocidos
    if (user?.email === 'ejhernandez@udemedellin.edu.co') {
      carreraId = '1'; // Emilcy - Sistemas
      console.log('🔧 TEMPORAL: Forzando carrera_id = 1 para Emilcy (Sistemas)');
    } else if (user?.email === 'magonzalez@udemedellin.edu.co') {
      carreraId = '5'; // Mauricio - Telecomunicaciones
      console.log('🔧 TEMPORAL: Forzando carrera_id = 5 para Mauricio (Telecomunicaciones)');
    }
    
    console.log('🔍 Carrera del coordinador final:', carreraId);
    
    if (!carreraId) {
      // Si no tiene carrera asignada, retornar valores por defecto
      console.warn('⚠️ Coordinador sin carrera asignada');
      return {
        totalProfesores: 0,
        totalCursos: 0,
        totalCarreras: 0
      };
    }
    
    // Obtener profesores de la carrera específica del coordinador
    console.log('🔍 Llamando a fetchProfessorsByCareer con carreraId:', carreraId);
    const profesores = await fetchProfessorsByCareer(carreraId);
    console.log('🔍 Profesores obtenidos:', profesores);
    console.log('🔍 Cantidad de profesores:', profesores?.length || 0);
    
    // Obtener TODOS los cursos de la carrera (no solo los que tienen profesores)
    console.log('🔍 Obteniendo todos los cursos de la carrera:', carreraId);
    const { data: todosLosCursos, error: cursosError } = await apiClient.get(`/api/courses/by-career/${carreraId}`);
    
    let totalCursos = 0;
    if (cursosError) {
      console.warn('⚠️ Error obteniendo todos los cursos, usando solo cursos con profesores:', cursosError);
      // Fallback: contar solo cursos con profesores
      const cursosUnicos = new Set();
      profesores.forEach((profesor: any) => {
        if (profesor.cursos && Array.isArray(profesor.cursos)) {
          profesor.cursos.forEach((course: any) => {
            cursosUnicos.add(course.id);
          });
        }
      });
      totalCursos = cursosUnicos.size;
    } else {
      totalCursos = todosLosCursos?.length || 0;
      console.log('✅ Total de cursos de la carrera:', totalCursos);
    }
    
    const stats = {
      totalProfesores: profesores.length,
      totalCursos: totalCursos,
      totalCarreras: 1 // Siempre será 1 (la carrera del coordinador)
    };
    
    console.log('✅ Coordinator stats for carrera', carreraId, ':', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error fetching coordinator stats:', error);
    throw new Error('Error al obtener estadísticas del coordinador');
  }
}

