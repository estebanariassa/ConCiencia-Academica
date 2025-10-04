import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/db'
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
    const evaluaciones = await prisma.evaluaciones.findMany({
      where: {
        estudiante_id: req.user.id
      },
      include: {
        profesor: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          }
        },
        grupo: {
          include: {
            curso: true,
            periodo: true
          }
        },
        respuestas_evaluacion: {
          include: {
            pregunta: true
          }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    })

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
    const inscripcion = await prisma.inscripciones.findFirst({
      where: {
        estudiante_id: req.user.id,
        grupo_id: validatedData.grupo_id,
        activa: true
      }
    })

    if (!inscripcion) {
      return res.status(403).json({ error: 'No estás inscrito en este grupo' })
    }

    // Verificar que no exista una evaluación previa
    const evaluacionExistente = await prisma.evaluaciones.findFirst({
      where: {
        estudiante_id: req.user.id,
        profesor_id: validatedData.profesor_id,
        grupo_id: validatedData.grupo_id,
        periodo_id: validatedData.periodo_id
      }
    })

    if (evaluacionExistente) {
      return res.status(400).json({ error: 'Ya has evaluado a este profesor en este grupo' })
    }

    // Crear evaluación
    const evaluacion = await prisma.evaluaciones.create({
      data: {
        estudiante_id: req.user.id,
        profesor_id: validatedData.profesor_id,
        grupo_id: validatedData.grupo_id,
        periodo_id: validatedData.periodo_id,
        comentarios: validatedData.comentarios,
        completada: true,
        fecha_completada: new Date()
      }
    })

    // Crear respuestas
    if (validatedData.respuestas.length > 0) {
      await prisma.respuestas_evaluacion.createMany({
        data: validatedData.respuestas.map(respuesta => ({
          evaluacion_id: evaluacion.id,
          pregunta_id: respuesta.pregunta_id,
          respuesta_rating: respuesta.respuesta_rating,
          respuesta_texto: respuesta.respuesta_texto,
          respuesta_opcion: respuesta.respuesta_opcion
        }))
      })
    }

    // Obtener la evaluación completa con relaciones
    const evaluacionCompleta = await prisma.evaluaciones.findUnique({
      where: { id: evaluacion.id },
      include: {
        profesor: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          }
        },
        grupo: {
          include: {
            curso: true,
            periodo: true
          }
        },
        respuestas_evaluacion: {
          include: {
            pregunta: true
          }
        }
      }
    })

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
    const preguntas = await prisma.preguntas_evaluacion.findMany({
      where: { activa: true },
      include: {
        categoria: true
      },
      orderBy: [
        { categoria: { orden: 'asc' } },
        { orden: 'asc' }
      ]
    })

    res.json(preguntas)
  } catch (error) {
    console.error('Error al obtener preguntas:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router


