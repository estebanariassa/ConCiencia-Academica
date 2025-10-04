import { Router } from 'express'
import { prisma } from '../config/db'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = Router()

// GET /resultados - Obtener resultados para profesores
router.get('/', authenticateToken, requireRole(['profesor', 'coordinador', 'admin']), async (req: any, res) => {
  try {
    const { periodo_id, grupo_id } = req.query
    
    let whereClause: any = {}
    
    // Si es profesor, solo puede ver sus propios resultados
    if (req.user.tipo_usuario === 'profesor') {
      whereClause.profesor_id = req.user.id
    }
    
    // Filtros opcionales
    if (periodo_id) {
      whereClause.periodo_id = parseInt(periodo_id as string)
    }
    
    if (grupo_id) {
      whereClause.grupo_id = parseInt(grupo_id as string)
    }

    const evaluaciones = await prisma.evaluaciones.findMany({
      where: {
        ...whereClause,
        completada: true
      },
      include: {
        estudiante: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          }
        },
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
            pregunta: {
              include: {
                categoria: true
              }
            }
          }
        }
      },
      orderBy: { fecha_completada: 'desc' }
    })

    // Calcular estadísticas por categoría
    const estadisticas = await prisma.respuestas_evaluacion.groupBy({
      by: ['pregunta_id'],
      where: {
        evaluacion: {
          ...whereClause,
          completada: true
        },
        respuesta_rating: { not: null }
      },
      _avg: {
        respuesta_rating: true
      },
      _count: {
        respuesta_rating: true
      }
    })

    // Obtener detalles de preguntas para las estadísticas
    const preguntaIds = estadisticas.map(stat => stat.pregunta_id)
    const preguntas = await prisma.preguntas_evaluacion.findMany({
      where: { id: { in: preguntaIds } },
      include: { categoria: true }
    })

    const estadisticasConDetalles = estadisticas.map(stat => {
      const pregunta = preguntas.find(p => p.id === stat.pregunta_id)
      return {
        pregunta_id: stat.pregunta_id,
        pregunta_texto: pregunta?.texto_pregunta,
        categoria: pregunta?.categoria,
        promedio: stat._avg.respuesta_rating,
        total_respuestas: stat._count.respuesta_rating
      }
    })

    res.json({
      evaluaciones,
      estadisticas: estadisticasConDetalles,
      total_evaluaciones: evaluaciones.length
    })
  } catch (error) {
    console.error('Error al obtener resultados:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /resultados/estadisticas - Estadísticas agregadas
router.get('/estadisticas', authenticateToken, requireRole(['profesor', 'coordinador', 'admin']), async (req: any, res) => {
  try {
    const { periodo_id, profesor_id } = req.query
    
    let whereClause: any = {
      completada: true
    }
    
    // Si es profesor, solo puede ver sus propios resultados
    if (req.user.tipo_usuario === 'profesor') {
      whereClause.profesor_id = req.user.id
    } else if (profesor_id) {
      whereClause.profesor_id = profesor_id
    }
    
    if (periodo_id) {
      whereClause.periodo_id = parseInt(periodo_id as string)
    }

    // Estadísticas generales
    const estadisticasGenerales = await prisma.evaluaciones.aggregate({
      where: whereClause,
      _avg: {
        calificacion_promedio: true
      },
      _count: {
        id: true
      }
    })

    // Estadísticas por categoría
    const estadisticasPorCategoria = await prisma.respuestas_evaluacion.groupBy({
      by: ['pregunta_id'],
      where: {
        evaluacion: whereClause,
        respuesta_rating: { not: null }
      },
      _avg: {
        respuesta_rating: true
      },
      _count: {
        respuesta_rating: true
      }
    })

    // Obtener categorías
    const preguntaIds = estadisticasPorCategoria.map(stat => stat.pregunta_id)
    const categorias = await prisma.categorias_pregunta.findMany({
      include: {
        preguntas_evaluacion: {
          where: { id: { in: preguntaIds } }
        }
      }
    })

    // Agrupar por categoría
    const estadisticasAgrupadas = categorias.map(categoria => {
      const preguntasCategoria = categoria.preguntas_evaluacion
      const estadisticasCategoria = estadisticasPorCategoria.filter(stat => 
        preguntasCategoria.some(p => p.id === stat.pregunta_id)
      )
      
      const promedioCategoria = estadisticasCategoria.length > 0 
        ? estadisticasCategoria.reduce((sum, stat) => sum + (stat._avg.respuesta_rating || 0), 0) / estadisticasCategoria.length
        : 0

      return {
        categoria_id: categoria.id,
        categoria_nombre: categoria.nombre,
        promedio: Math.round(promedioCategoria * 100) / 100,
        total_respuestas: estadisticasCategoria.reduce((sum, stat) => sum + stat._count.respuesta_rating, 0)
      }
    })

    res.json({
      estadisticas_generales: {
        promedio_general: estadisticasGenerales._avg.calificacion_promedio,
        total_evaluaciones: estadisticasGenerales._count.id
      },
      estadisticas_por_categoria: estadisticasAgrupadas
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router


