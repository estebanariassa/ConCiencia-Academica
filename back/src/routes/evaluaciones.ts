import { Router } from 'express'
import { z } from 'zod'
import { SupabaseDB } from '../config/supabase-only'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = Router()

const evaluacionSchema = z.object({
  profesor_id: z.string().uuid(),
  grupo_id: z.number().int().positive(),
  periodo_id: z.number().int().positive(),
  comentarios: z.string().optional(),
  respuestas: z.array(z.object({
    pregunta_id: z.number().int().positive(),
    respuesta_rating: z.number().int().min(1).max(5).optional(),
    respuesta_texto: z.string().optional(),
    respuesta_opcion: z.string().optional()
  }))
})

// GET /evaluaciones - Listar evaluaciones del estudiante
router.get('/', authenticateToken, requireRole(['estudiante']), async (req: any, res) => {
  try {
    const evaluaciones = await SupabaseDB.getEvaluationsByStudent(req.user.id)
    res.json(evaluaciones)
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /evaluaciones - Crear nueva evaluación
router.post('/', authenticateToken, requireRole(['estudiante']), async (req: any, res) => {
  try {
    const validatedData = evaluacionSchema.parse(req.body)
    
    // Verificar que el estudiante esté inscrito en el grupo
    const inscripcion = await SupabaseDB.findInscription(req.user.id, validatedData.grupo_id)

    if (!inscripcion) {
      return res.status(403).json({ error: 'No estás inscrito en este grupo' })
    }

    // Verificar que no exista una evaluación previa
    const evaluacionExistente = await SupabaseDB.findExistingEvaluation(
      req.user.id, 
      validatedData.profesor_id, 
      validatedData.grupo_id, 
      validatedData.periodo_id
    )

    if (evaluacionExistente) {
      return res.status(400).json({ error: 'Ya has evaluado a este profesor en este grupo' })
    }

    // Crear evaluación con respuestas
    const evaluationData = {
      estudiante_id: req.user.id,
      profesor_id: validatedData.profesor_id,
      grupo_id: validatedData.grupo_id,
      periodo_id: validatedData.periodo_id,
      comentarios: validatedData.comentarios,
      completada: true,
      fecha_completada: new Date().toISOString()
    }

    const responses = validatedData.respuestas.map(respuesta => ({
      pregunta_id: respuesta.pregunta_id,
      respuesta_rating: respuesta.respuesta_rating,
      respuesta_texto: respuesta.respuesta_texto,
      respuesta_opcion: respuesta.respuesta_opcion
    }))

    const evaluacion = await SupabaseDB.createEvaluationWithResponses(evaluationData, responses)

    // Obtener la evaluación completa con relaciones
    const evaluacionCompleta = await SupabaseDB.getEvaluationWithRelations(evaluacion.id)

    res.status(201).json({
      message: 'Evaluación creada exitosamente',
      evaluacion: evaluacionCompleta
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    console.error('Error al crear evaluación:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /evaluaciones/preguntas - Obtener preguntas de evaluación
router.get('/preguntas', authenticateToken, async (req, res) => {
  try {
    const preguntas = await SupabaseDB.getQuestionsWithCategories()
    res.json(preguntas)
  } catch (error) {
    console.error('Error al obtener preguntas:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router


