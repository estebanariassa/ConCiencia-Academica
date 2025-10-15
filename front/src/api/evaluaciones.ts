import { apiClient } from './client'

export interface EvaluacionData {
  profesor_id: string
  grupo_id: number
  periodo_id: number
  comentarios?: string
  respuestas: {
    pregunta_id: number
    respuesta_rating?: number
    respuesta_texto?: string
    respuesta_opcion?: string
  }[]
}

export interface PreguntaEvaluacion {
  id: number
  categoria_id: number
  texto_pregunta: string
  descripcion?: string
  tipo_pregunta: string
  opciones?: any
  obligatoria: boolean
  orden: number
  activa: boolean
  categoria: {
    id: number
    nombre: string
    descripcion?: string
    orden: number
  }
}

export interface Evaluacion {
  id: string
  estudiante_id: string
  profesor_id: string
  grupo_id: number
  periodo_id: number
  completada: boolean
  comentarios?: string
  calificacion_promedio?: number
  fecha_inicio: string
  fecha_completada?: string
  fecha_creacion: string
  profesor: {
    id: string
    usuario: {
      nombre: string
      apellido: string
    }
  }
  grupo: {
    id: number
    curso: {
      id: number
      nombre: string
      codigo: string
    }
    periodo: {
      id: number
      nombre: string
      codigo: string
    }
  }
  respuestas_evaluacion: {
    id: string
    pregunta_id: number
    respuesta_rating?: number
    respuesta_texto?: string
    respuesta_opcion?: string
    pregunta: {
      id: number
      texto_pregunta: string
      categoria: {
        nombre: string
      }
    }
  }[]
}

export const evaluacionesApi = {
  // Obtener evaluaciones del estudiante
  getEvaluaciones: async (): Promise<Evaluacion[]> => {
    const response = await apiClient.get('/api/evaluaciones')
    return response.data
  },

  // Crear nueva evaluación
  createEvaluacion: async (data: EvaluacionData): Promise<{ message: string; evaluacion: Evaluacion }> => {
    const response = await apiClient.post('/api/evaluaciones', data)
    return response.data
  },

  // Obtener preguntas de evaluación
  getPreguntas: async (): Promise<PreguntaEvaluacion[]> => {
    const response = await apiClient.get('/api/evaluaciones/preguntas')
    return response.data
  }
}


