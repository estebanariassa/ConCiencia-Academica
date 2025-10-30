import { Router } from 'express'
import { z } from 'zod'
import { SupabaseDB } from '../config/supabase-only'
import { authenticateToken } from '../middleware/auth'
import jwt from 'jsonwebtoken'
import { EvaluationRequest, EvaluationResponse } from '../types/evaluationTypes'

const router = Router()

// GET /teachers - Obtener profesores con sus cursos
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    // Si es estudiante, limitar a sus inscripciones activas
    let gruposDeEstudiante: any[] = []
    let profesorIdsFiltro: string[] | null = null
    if (user?.tipo_usuario === 'estudiante') {
      // Mapear usuario -> estudiante.id
      const { data: estudiante, error: estudianteError } = await SupabaseDB.supabaseAdmin
        .from('estudiantes')
        .select('id')
        .eq('usuario_id', user.id)
        .single()

      if (estudianteError) {
        console.error('Error obteniendo estudiante por usuario:', estudianteError)
        return res.status(500).json({ error: 'DB estudiantes', details: estudianteError })
      }
      if (!estudiante) {
        // El usuario no tiene registro en estudiantes; no hay profesores que mostrar
        return res.json([])
      }

      const { data: inscripciones, error: inscError } = await SupabaseDB.supabaseAdmin
        .from('inscripciones')
        .select('grupo_id')
        .eq('estudiante_id', estudiante.id)
        .eq('activa', true)

      if (inscError) {
        console.error('Error consultando inscripciones:', inscError)
        return res.status(500).json({ error: 'DB inscripciones', details: inscError })
      }

      const grupoIds = Array.from(new Set((inscripciones || []).map((i: any) => i.grupo_id).filter(Boolean)))
      if (grupoIds.length > 0) {
        // Algunos esquemas usan 'asignacion_profesor_id' en lugar de 'profesor_id'
        // Algunos esquemas no tienen profesor_id/asignacion_profesor_id en grupos. Intentar con ambos y hacer fallback.
        let gruposDeConsulta: any[] = []
        let gruposError: any = null
        try {
          const respGrupos = await SupabaseDB.supabaseAdmin
            .from('grupos')
            .select('id, curso_id, profesor_id, asignacion_profesor_id')
            .in('id', grupoIds)
          gruposDeConsulta = respGrupos.data || []
          gruposError = respGrupos.error || null
        } catch (e) {
          gruposError = e
        }

        // Fallback cuando alguna de las columnas no existe
        if (gruposError && (gruposError.code === '42703' || String(gruposError?.message || '').includes('column') )) {
          try {
            const respGruposFallback = await SupabaseDB.supabaseAdmin
              .from('grupos')
              .select('id, curso_id')
              .in('id', grupoIds)
            gruposDeConsulta = respGruposFallback.data || []
            gruposError = respGruposFallback.error || null
          } catch (e2) {
            gruposError = e2
          }
        }

        if (gruposError) {
          console.error('Error consultando grupos:', gruposError)
          return res.status(500).json({ error: 'DB grupos', details: gruposError })
        }
        gruposDeEstudiante = gruposDeConsulta || []

        // Si los grupos no traen profesor, resolver mediante asignaciones por grupo
        const necesitaResolverProfesor = gruposDeEstudiante.some((g: any) => !g.profesor_id)
        if (necesitaResolverProfesor && grupoIds.length > 0) {
          let asignacionesPorGrupo: any[] = []
          let asignErr: any = null
          try {
            const respA = await SupabaseDB.supabaseAdmin
              .from('asignaciones_profesor')
              .select('id, grupo_id, profesor_id, curso_id')
              .in('grupo_id', grupoIds)
            asignacionesPorGrupo = respA.data || []
            asignErr = respA.error || null
          } catch (e) {
            asignErr = e
          }

          if (asignErr) {
            // Fallback a cursos_profesor
            try {
              const respB = await SupabaseDB.supabaseAdmin
                .from('cursos_profesor')
                .select('id, grupo_id, profesor_id, curso_id')
                .in('grupo_id', grupoIds)
              asignacionesPorGrupo = respB.data || []
              asignErr = respB.error || null
            } catch (e2) {
              asignErr = e2
            }
          }

          if (!asignErr && asignacionesPorGrupo.length > 0) {
            const asigByGrupo = new Map(asignacionesPorGrupo.map((a: any) => [a.grupo_id, a]))
            gruposDeEstudiante = gruposDeEstudiante.map((g: any) => {
              const a = asigByGrupo.get(g.id)
              if (a) {
                return { ...g, profesor_id: a.profesor_id, curso_id: g.curso_id || a.curso_id }
              }
              return g
            })
          }
        }

        // Si no hay profesor_id directo, resolverlo via asignaciones_profesor
        const asignacionIds = Array.from(new Set(gruposDeEstudiante.map((g: any) => g.asignacion_profesor_id).filter(Boolean)))
        let asignacionById = new Map<string, any>()
        if (asignacionIds.length > 0) {
          const { data: asigns, error: asgErr } = await SupabaseDB.supabaseAdmin
            .from('asignaciones_profesor')
            .select('id, profesor_id, curso_id')
            .in('id', asignacionIds)
          if (asgErr) {
            console.error('Error consultando asignaciones para grupos:', asgErr)
            return res.status(500).json({ error: 'DB asignaciones_profesor', details: asgErr })
          }
          asignacionById = new Map((asigns || []).map((a: any) => [a.id, a]))
        }

        gruposDeEstudiante = gruposDeEstudiante.map((g: any) => {
          if (!g.profesor_id && g.asignacion_profesor_id) {
            const a = asignacionById.get(g.asignacion_profesor_id)
            if (a) {
              return { ...g, profesor_id: a.profesor_id, curso_id: g.curso_id || a.curso_id }
            }
          }
          return g
        })

        profesorIdsFiltro = Array.from(new Set(gruposDeEstudiante.map((g: any) => g.profesor_id).filter(Boolean)))
      } else {
        // Sin inscripciones => devolver lista vacía
        return res.json([])
      }
    }
    // 1) Traer profesores + usuario relacionado (sin joins adicionales)
    let queryProfes = SupabaseDB.supabaseAdmin
      .from('profesores')
      .select(`
        *,
        usuario:usuarios(
          id,
          nombre,
          apellido,
          email,
          activo
        )
      `)
      .eq('activo', true)

    if (profesorIdsFiltro && profesorIdsFiltro.length > 0) {
      queryProfes = queryProfes.in('id', profesorIdsFiltro)
    }

    const { data: profesores, error: profesoresError } = await queryProfes

    if (profesoresError) {
      console.error('Error consultando profesores:', profesoresError)
      return res.status(500).json({ error: 'DB profesores', details: profesoresError })
    }

    const profesorIds = (profesores || []).map((p: any) => p.id)

    // 2) Traer asignaciones y cursos por separado y combinarlos
    // Intento 1: tabla asignaciones_profesor (nombre preferido)
    let asignaciones: any[] = []
    let asignacionesError: any = null
    try {
      const resp = await SupabaseDB.supabaseAdmin
        .from('asignaciones_profesor')
        .select('*')
        .in('profesor_id', profesorIds.length ? profesorIds : ['00000000-0000-0000-0000-000000000000'])
      asignaciones = resp.data || []
      asignacionesError = resp.error || null
    } catch (e) {
      asignacionesError = e
    }

    // Fallback: algunas bases usan cursos_profesor con mismas columnas clave
    if (asignacionesError) {
      console.warn('Fallo con asignaciones_profesor; intentando cursos_profesor. Detalle:', asignacionesError)
      try {
        const respFallback = await SupabaseDB.supabaseAdmin
          .from('cursos_profesor')
          .select('*')
          .in('profesor_id', profesorIds.length ? profesorIds : ['00000000-0000-0000-0000-000000000000'])
        asignaciones = respFallback.data || []
        asignacionesError = respFallback.error || null
      } catch (e2) {
        asignacionesError = e2
      }
    }

    if (asignacionesError) {
      console.error('Error consultando asignaciones (ambos nombres):', asignacionesError)
      return res.status(500).json({ error: 'DB asignaciones', details: asignacionesError })
    }

    // Normalizar posibles variantes de nombres de columnas
    asignaciones = (asignaciones || []).map((a: any) => ({
      ...a,
      profesor_id: a.profesor_id ?? a.docente_id ?? a.teacher_id ?? a.profesor ?? null,
      curso_id: Number(a.curso_id ?? a.id_curso ?? a.course_id ?? a.curso ?? null)
    }))

    // Traer grupos para mapearlos por curso y profesor (para usuarios no-estudiante)
    const grupoIdsAsignados = Array.from(new Set((asignaciones || []).map((a: any) => a.grupo_id).filter(Boolean)))
    let gruposPorAsignaciones: any[] = []
    if (grupoIdsAsignados.length > 0) {
      const { data: gruposAll, error: gruposAllError } = await SupabaseDB.supabaseAdmin
        .from('grupos')
        .select('id, curso_id, numero_grupo, horario, aula')
        .in('id', grupoIdsAsignados)
      if (gruposAllError) {
        console.warn('Advertencia: no se pudieron cargar grupos por asignaciones:', gruposAllError)
      } else {
        gruposPorAsignaciones = gruposAll || []
      }
    }

    let cursos: any[] = []
    let tieneCarreraId = true

    // 3) Traer carreras para mapear departamento (según carrera_id)
    let carreras: any[] = []
    if (tieneCarreraId) {
      const carreraIds = Array.from(
        new Set(cursos.map((c: any) => c.carrera_id).filter((id: any) => id !== null && id !== undefined))
      )
      if (carreraIds.length > 0) {
        const { data: carrerasData, error: carrerasError } = await SupabaseDB.supabaseAdmin
          .from('carreras')
          .select('id, nombre')
          .in('id', carreraIds)
        if (carrerasError) {
          console.error('Error consultando carreras:', carrerasError)
          return res.status(500).json({ error: 'DB carreras', details: carrerasError })
        }
        carreras = carrerasData || []
      }
    }

    const cursoIds = Array.from(new Set((asignaciones || []).map((a: any) => a.curso_id).filter((id: any) => id !== null && id !== undefined)))
    console.log('🔍 Curso IDs from asignaciones:', cursoIds);
    
    if (cursoIds.length > 0 && cursos.length === 0) {
      // Cargar cursos solo con las columnas seguras si aún no se han cargado
      try {
        const respCursos = await SupabaseDB.supabaseAdmin
          .from('cursos')
          .select('id, nombre, codigo, creditos, descripcion')
          .in('id', cursoIds)
        cursos = respCursos.data || []
        console.log('🔍 Cursos loaded:', cursos);
      } catch (e) {
        console.warn('No fue posible cargar cursos por ids:', e)
      }
    }
    const cursoById = new Map((cursos || []).map((c: any) => [c.id, c]))
    const carreraById = new Map((carreras || []).map((c: any) => [c.id, c]))
    const asignacionesByProfesor = new Map<string, any[]>()
    // Índice para resolver curso por grupo
    const cursoIdByGrupoId = new Map<number, number>()
    gruposPorAsignaciones.forEach((g: any) => {
      if (g && g.id != null) cursoIdByGrupoId.set(Number(g.id), Number(g.curso_id))
    })

    ;(asignaciones || []).forEach((a: any) => {
      // Completar curso_id desde grupo si no viene en la fila
      const resolvedCursoId = Number(a.curso_id ?? cursoIdByGrupoId.get(Number(a.grupo_id)))
      a.curso_id = Number.isFinite(resolvedCursoId) ? resolvedCursoId : undefined
      const list = asignacionesByProfesor.get(a.profesor_id) || []
      list.push(a)
      asignacionesByProfesor.set(a.profesor_id, list)
    })

    // Indexar grupos por profesor y curso usando asignaciones
    const gruposByProfesorCurso = new Map<string, any[]>()
    asignaciones.forEach((a: any) => {
      const grupo = gruposPorAsignaciones.find((g: any) => g.id === a.grupo_id)
      if (grupo) {
        const key = `${a.profesor_id}:${Number(a.curso_id)}`
        const list = gruposByProfesorCurso.get(key) || []
        list.push(grupo)
        gruposByProfesorCurso.set(key, list)
      }
    })

    const teachers = (profesores || []).map((profesor: any) => {
      const nombre = profesor.usuario?.nombre || ''
      const apellido = profesor.usuario?.apellido || ''
      const email = profesor.usuario?.email || ''
      const asignacionesDeProfesor = asignacionesByProfesor.get(profesor.id) || []
      
      console.log(`🔍 Processing profesor ${nombre} ${apellido} (${profesor.id})`);
      console.log(`🔍 Asignaciones:`, asignacionesDeProfesor);
      
      const courses = asignacionesDeProfesor.map((a: any) => {
        const c = cursoById.get(a.curso_id)
        console.log(`🔍 Course for curso_id ${a.curso_id}:`, c);
        return c
          ? {
              id: c.id,
              name: c.nombre,
              code: c.codigo,
              credits: c.creditos,
              description: c.descripcion,
              schedule: 'Por definir',
              carreraId: c.carrera_id,
              department: (profesor.departamento || carreraById.get(c.carrera_id)?.nombre || 'Sin departamento'),
              groups: (() => {
                if (user?.tipo_usuario === 'estudiante') {
                  return gruposDeEstudiante
                    .filter((g: any) => g.profesor_id === profesor.id && Number(g.curso_id) === Number(c.id))
                    .map((g: any) => ({ id: g.id, numero: g.numero_grupo }))
                }
                const key = `${profesor.id}:${Number(c.id)}`
                const gs = gruposByProfesorCurso.get(key) || []
                return gs.map((g: any) => ({ id: g.id, numero: g.numero_grupo }))
              })()
            }
          : null
      }).filter(Boolean)

      console.log(`✅ Final courses for ${nombre}:`, courses);

      return {
        id: profesor.id,
        name: `${nombre} ${apellido}`.trim(),
        email,
        department: (profesor.departamento || (courses.length > 0 ? (courses[0] as any).department : 'Sin departamento')),
        courses
      }
    })

    res.json(teachers)
  } catch (error) {
    console.error('Error al obtener profesores:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/:profesorId/courses/:courseId/groups - Obtener grupos de un curso específico
router.get('/:profesorId/courses/:courseId/groups', authenticateToken, async (req: any, res) => {
  try {
    const { profesorId, courseId } = req.params
    const user = req.user

    console.log('🔍 Backend: Getting groups for profesorId:', profesorId, 'courseId:', courseId);
    console.log('🔍 Backend: User type:', user?.tipo_usuario);

    // Verificar que el profesor existe y está activo
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .eq('id', profesorId)
      .eq('activo', true)
      .single()

    if (profesorError || !profesor) {
      console.log('❌ Backend: Profesor not found:', profesorError);
      return res.status(404).json({ error: 'Profesor no encontrado' })
    }

    console.log('✅ Backend: Profesor found:', profesor);

    // Buscar grupos del curso Y del profesor específico
    const numericCourseId = Number(courseId)
    // Buscar primero en asignaciones_profesor (es la fuente que relaciona profesor-curso-grupo)
    const { data: asigns, error: asignsErr } = await SupabaseDB.supabaseAdmin
      .from('asignaciones_profesor')
      .select('id, profesor_id, curso_id, grupo_id, activa')
      .eq('profesor_id', profesorId)
      .eq('curso_id', isNaN(numericCourseId) ? courseId : numericCourseId)
      .eq('activa', true)
    if (asignsErr) {
      console.error('❌ Backend: Error consultando asignaciones_profesor:', asignsErr)
      return res.status(500).json({ error: 'Error consultando asignaciones', details: asignsErr })
    }
    let gruposFinal: any[] = []
    if (Array.isArray(asigns) && asigns.length > 0) {
      const grupoIds = Array.from(new Set((asigns || []).map((a: any) => a.grupo_id).filter(Boolean)))
      console.log('🔍 grupoIds desde asignaciones_profesor:', grupoIds)
      if (grupoIds.length > 0) {
        const { data: gruposPorAsign, error: gruposAsignErr } = await SupabaseDB.supabaseAdmin
          .from('grupos')
          .select('id, numero_grupo, horario, aula, curso_id')
          .in('id', grupoIds)
        if (gruposAsignErr) {
          console.error('❌ Backend: Error consultando grupos por ids:', gruposAsignErr)
          return res.status(500).json({ error: 'Error consultando grupos', details: gruposAsignErr })
        }
        gruposFinal = gruposPorAsign || []
      }
    }

    if (!gruposFinal || gruposFinal.length === 0) {
      // Intentar también por usuario_id si el esquema de grupos usa usuario_id en profesor_id
      console.log('⚠️ No hay grupos por profesor_id (profesores.id). Intentando por usuario_id del profesor...')
      const { data: profRow, error: profErr } = await SupabaseDB.supabaseAdmin
        .from('profesores')
        .select('usuario_id')
        .eq('id', profesorId)
        .single()
      if (!profErr && profRow?.usuario_id) {
        const { data: gruposPorUsuario, error: gruposUsuarioErr } = await SupabaseDB.supabaseAdmin
          .from('grupos')
          .select('id, numero_grupo, horario, aula, curso_id, profesor_id')
          .eq('curso_id', isNaN(numericCourseId) ? courseId : numericCourseId)
          .eq('profesor_id', profRow.usuario_id)
        if (!gruposUsuarioErr && gruposPorUsuario?.length) {
          console.log('✅ Encontrados grupos usando usuario_id del profesor')
          gruposFinal = gruposPorUsuario
        }
      }
    }

    if (!gruposFinal || gruposFinal.length === 0) {
      console.log('⚠️ No hay grupos para el profesor en este curso. Buscando grupos del curso en general...')
      const { data: gruposPorCurso, error: gruposCursoError } = await SupabaseDB.supabaseAdmin
        .from('grupos')
        .select('id, numero_grupo, horario, aula, curso_id')
        .eq('curso_id', isNaN(numericCourseId) ? courseId : numericCourseId)
      if (gruposCursoError) {
        console.error('❌ Backend: Error consultando grupos por curso:', gruposCursoError)
        return res.status(500).json({ error: 'Error consultando grupos del curso', details: gruposCursoError })
      }
      gruposFinal = gruposPorCurso || []
    }

    console.log('🔍 Backend: Final groups to return:', gruposFinal);
    res.json(gruposFinal)
  } catch (error) {
    console.error('❌ Backend: Error al obtener grupos del curso:', error)
    console.error('❌ Backend: Error stack:', (error as any)?.stack)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/:profesorId/stats - Obtener estadísticas de evaluaciones del profesor
router.get('/:profesorId/stats', authenticateToken, async (req: any, res) => {
  try {
    const { profesorId } = req.params
    const user = req.user

    console.log('🔍 Backend: Getting stats for profesorId:', profesorId);

    // Verificar que el profesor existe y está activo
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .eq('id', profesorId)
      .eq('activo', true)
      .single()

    if (profesorError || !profesor) {
      console.log('❌ Backend: Profesor not found:', profesorError);
      return res.status(404).json({ error: 'Profesor no encontrado' })
    }

    console.log('✅ Backend: Profesor found:', profesor);

    // Obtener todas las evaluaciones del profesor (sin joins directos)
    const { data: evaluaciones, error: evaluacionesError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select(`
        id,
        calificacion_promedio,
        fecha_creacion,
        grupo_id,
        estudiante_id
      `)
      .eq('profesor_id', profesorId)

    console.log('🔍 Backend: Evaluaciones found:', evaluaciones?.length || 0);

    if (evaluacionesError) {
      console.error('❌ Backend: Error consultando evaluaciones:', evaluacionesError)
      return res.status(500).json({ error: 'Error consultando evaluaciones', details: evaluacionesError })
    }

    // Calcular estadísticas
    const totalEvaluaciones = evaluaciones?.length || 0
    const calificacionPromedio = totalEvaluaciones > 0 
      ? evaluaciones.reduce((sum, evaluacion) => sum + (evaluacion.calificacion_promedio || 0), 0) / totalEvaluaciones
      : 0

    // Mapear grupo -> curso y obtener info de curso
    const evalsArrayStats: any[] = Array.isArray(evaluaciones) ? (evaluaciones as any[]) : []
    const gruposIdsStats = Array.from(new Set(evalsArrayStats.map((e: any) => e.grupo_id).filter(Boolean)))
    const { data: gruposStats } = await SupabaseDB.supabaseAdmin
      .from('grupos')
      .select('id, curso_id, numero_grupo')
      .in('id', gruposIdsStats.length ? gruposIdsStats : [-1])
    const grupoToCursoStats: any = {}
    ;(Array.isArray(gruposStats) ? gruposStats : []).forEach((g: any) => { grupoToCursoStats[g.id] = g.curso_id })

    const cursoIdsStats = Array.from(new Set(((Array.isArray(gruposStats) ? gruposStats : []).map((g: any) => g.curso_id)).filter(Boolean)))
    const { data: cursosStats } = await SupabaseDB.supabaseAdmin
      .from('cursos')
      .select('id,nombre,codigo')
      .in('id', cursoIdsStats.length ? cursoIdsStats : [-1])
    const cursoInfoStats: any = {}
    ;(Array.isArray(cursosStats) ? cursosStats : []).forEach((c: any) => { cursoInfoStats[c.id] = c })

    // Obtener cursos únicos evaluados
    const cursosUnicos = new Set(evalsArrayStats.map((e: any) => grupoToCursoStats[e.grupo_id]).filter(Boolean))
    const totalCursos = cursosUnicos.size

    // Obtener estudiantes únicos que han evaluado
    const estudiantesUnicos = new Set(evaluaciones?.map(e => e.estudiante_id) || [])
    const totalEstudiantes = estudiantesUnicos.size

    // Obtener evaluaciones por curso
    const evaluacionesPorCurso = evalsArrayStats?.reduce((acc: any, evaluacion: any) => {
      const cursoId = grupoToCursoStats[evaluacion.grupo_id]
      const cursoData = cursoInfoStats[cursoId] as any
      const cursoNombre = cursoData?.nombre || 'Curso desconocido'
      const cursoCodigo = cursoData?.codigo || 'N/A'
      const cursoKey = `${cursoId}-${cursoNombre}`
      if (!acc[cursoKey]) {
        acc[cursoKey] = {
          curso_id: cursoId,
          nombre: cursoNombre,
          codigo: cursoCodigo,
          total: 0,
          promedio: 0,
          evaluaciones: []
        }
      }
      acc[cursoKey].total++
      acc[cursoKey].evaluaciones.push(evaluacion)
      return acc
    }, {} as any) || {}

    // Calcular promedios por curso
    Object.values(evaluacionesPorCurso).forEach((curso: any) => {
      const suma = curso.evaluaciones.reduce((sum: number, evaluacion: any) => sum + (evaluacion.calificacion_promedio || 0), 0)
      curso.promedio = curso.total > 0 ? Number((suma / curso.total).toFixed(2)) : 0
    })

    // Obtener evaluaciones recientes (últimas 5)
    const evaluacionesRecientes = evalsArrayStats
      ?.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
      ?.slice(0, 5)
      ?.map(evaluacion => {
        const cursoId = grupoToCursoStats[evaluacion.grupo_id]
        const cursoData = cursoInfoStats[cursoId] as any
        
        return {
          id: evaluacion.id,
          curso: cursoData?.nombre || 'Curso desconocido',
          codigo: cursoData?.codigo || 'N/A',
          grupo: '-',
          calificacion: evaluacion.calificacion_promedio,
          fecha: evaluacion.fecha_creacion
        }
      }) || []

    const stats = {
      totalEvaluaciones,
      calificacionPromedio: Number(calificacionPromedio.toFixed(2)),
      totalCursos,
      totalEstudiantes,
      evaluacionesPorCurso: Object.values(evaluacionesPorCurso),
      evaluacionesRecientes
    }

    console.log('✅ Backend: Stats calculated:', stats);
    res.json(stats)
  } catch (error) {
    console.error('❌ Backend: Error al obtener estadísticas del profesor:', error)
    console.error('❌ Backend: Error stack:', (error as any)?.stack)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/:profesorId/stats/historical - Obtener estadísticas históricas del profesor
router.get('/:profesorId/stats/historical', authenticateToken, async (req: any, res) => {
  try {
    const { profesorId } = req.params
    const { period } = req.query // Ejemplo: ?period=2023-1, 2023-2, 2024-1, etc.
    const user = req.user

    console.log('🔍 Backend: Getting historical stats for profesorId:', profesorId, 'period:', period);

    // Debug: Verificar si el profesor existe (con o sin filtro activo)
    const { data: profesorDebug, error: debugError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id, activo, usuario_id')
      .eq('id', profesorId)
      .single()

    console.log('🔍 Backend: Debug profesor query result:', { profesorDebug, debugError });

    // Verificar que el profesor existe
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .eq('id', profesorId)
      .single()

    if (profesorError || !profesor) {
      console.log('❌ Backend: Profesor not found, returning mock data:', profesorError);
      
      // Construir filtro de fecha para los datos mock
      let mockDateFilter: { gte?: string; lte?: string } = {}
      if (period) {
        const [year, semester] = period.split('-')
        const startDate = `${year}-${semester === '1' ? '01' : '07'}-01`
        const endDate = `${year}-${semester === '1' ? '06' : '12'}-31`
        
        mockDateFilter = {
          gte: startDate,
          lte: endDate
        }
      }
      
      // Retornar datos de ejemplo si el profesor no existe
      const mockHistoricalStats = {
        period: period || 'all',
        totalEvaluaciones: 0,
        calificacionPromedio: 0,
        totalCursos: 0,
        totalEstudiantes: 0,
        evaluacionesPorCurso: [],
        dateRange: period ? {
          start: mockDateFilter.gte,
          end: mockDateFilter.lte
        } : null,
        isMockData: true,
        debug: { 
          profesorId, 
          debugResult: profesorDebug,
          debugError: debugError 
        }
      };
      
      console.log('✅ Backend: Returning mock historical stats:', mockHistoricalStats);
      return res.json(mockHistoricalStats);
    }

    console.log('✅ Backend: Profesor found:', profesor);

    // Construir filtro de fecha basado en el período
    let dateFilter: { gte?: string; lte?: string } = {}
    if (period) {
      const [year, semester] = period.split('-')
      const startDate = `${year}-${semester === '1' ? '01' : '07'}-01`
      const endDate = `${year}-${semester === '1' ? '06-30' : '12-31'}`
      
      dateFilter = {
        gte: startDate,
        lte: endDate
      }
      console.log('🔍 Backend: Date filter:', dateFilter);
    }

    // Obtener evaluaciones del profesor con filtro de período
    const { data: evaluaciones, error: evaluacionesError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select(`
        id,
        calificacion_promedio,
        fecha_creacion,
        grupo_id,
        estudiante_id
      `)
      .eq('profesor_id', profesorId)
      .gte('fecha_creacion', dateFilter.gte || '2020-01-01')
      .lte('fecha_creacion', dateFilter.lte || '2030-12-31')

    console.log('🔍 Backend: Evaluaciones found for period:', evaluaciones?.length || 0);

    if (evaluacionesError) {
      console.error('❌ Backend: Error consultando evaluaciones históricas:', evaluacionesError)
      return res.status(500).json({ error: 'Error consultando evaluaciones históricas', details: evaluacionesError })
    }

    // Calcular estadísticas históricas
    const totalEvaluaciones = evaluaciones?.length || 0
    const calificacionPromedio = totalEvaluaciones > 0 
      ? evaluaciones.reduce((sum, evaluacion) => sum + (evaluacion.calificacion_promedio || 0), 0) / totalEvaluaciones
      : 0

    // Obtener estudiantes únicos que han evaluado en este período
    const estudiantesUnicos = new Set(evaluaciones?.map(e => e.estudiante_id) || [])
    const totalEstudiantes = estudiantesUnicos.size

    // Obtener evaluaciones por curso para este período
    // Mapear grupo_id -> curso_id y luego curso info
    const gruposIds = Array.from(new Set(((evaluaciones as any[]) || []).map((e: any) => e.grupo_id).filter(Boolean)))
    const { data: gruposInfo } = await SupabaseDB.supabaseAdmin
      .from('grupos')
      .select('id, curso_id, numero_grupo')
      .in('id', gruposIds.length ? gruposIds : [-1])

    const grupoIdToCursoId: any = {}
    ;(Array.isArray(gruposInfo) ? gruposInfo : []).forEach((g: any) => { grupoIdToCursoId[g.id] = g.curso_id })

    const cursoIds = Array.from(new Set(((Array.isArray(gruposInfo) ? gruposInfo : []).map((g: any) => g.curso_id)).filter(Boolean)))
    const { data: cursosInfo } = await SupabaseDB.supabaseAdmin
      .from('cursos')
      .select('id,nombre,codigo')
      .in('id', cursoIds.length ? cursoIds : [-1])

    const cursoIdToInfo: any = {}
    ;(cursosInfo || []).forEach((c: any) => { cursoIdToInfo[c.id] = c })

    // Cursos únicos una vez construido el mapa
    const cursosUnicos = new Set(((evaluaciones as any[]) || []).map((e: any) => grupoIdToCursoId[e.grupo_id]).filter(Boolean))
    const totalCursos = cursosUnicos.size

    const evaluacionesPorCurso = evaluaciones?.reduce((acc, evaluacion) => {
      const cursoId = grupoIdToCursoId[evaluacion.grupo_id]
      const cursoData = cursoIdToInfo[cursoId] as any
      const cursoNombre = cursoData?.nombre || 'Curso desconocido'
      const cursoCodigo = cursoData?.codigo || 'N/A'
      const cursoKey = `${cursoId}-${cursoNombre}`
      if (!acc[cursoKey]) {
        acc[cursoKey] = {
          curso_id: cursoId,
          nombre: cursoNombre,
          codigo: cursoCodigo,
          total: 0,
          promedio: 0,
          evaluaciones: []
        }
      }
      acc[cursoKey].total++
      acc[cursoKey].evaluaciones.push(evaluacion)
      return acc
    }, {} as any) || {}

    // Calcular promedios por curso
    Object.values(evaluacionesPorCurso).forEach((curso: any) => {
      const suma = curso.evaluaciones.reduce((sum: number, evaluacion: any) => sum + (evaluacion.calificacion_promedio || 0), 0)
      curso.promedio = curso.total > 0 ? Number((suma / curso.total).toFixed(2)) : 0
    })

    const historicalStats = {
      period: period || 'all',
      totalEvaluaciones,
      calificacionPromedio: Number(calificacionPromedio.toFixed(2)),
      totalCursos,
      totalEstudiantes,
      evaluacionesPorCurso: Object.values(evaluacionesPorCurso),
      dateRange: period ? {
        start: dateFilter.gte,
        end: dateFilter.lte
      } : null
    }

    console.log('✅ Backend: Historical stats calculated:', historicalStats);
    res.json(historicalStats)
  } catch (error) {
    console.error('❌ Backend: Error al obtener estadísticas históricas del profesor:', error)
    console.error('❌ Backend: Error stack:', (error as any)?.stack)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// Schema de validación para evaluaciones
const evaluationSchema = z.object({
  teacherId: z.string().uuid('ID de profesor inválido'),
  courseId: z.union([
    z.string().uuid('ID de curso inválido (UUID)'),
    z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive('ID de curso inválido (número)'))
  ]),
  groupId: z.string().optional(),
  answers: z.array(z.object({
    questionId: z.number().int().positive('ID de pregunta inválido'),
    rating: z.number().int().min(1).max(5).nullable().optional(),
    textAnswer: z.string().nullable().optional(),
    selectedOption: z.string().nullable().optional()
  })).min(1, 'Debe haber al menos una respuesta'),
  overallRating: z.number().min(1).max(5, 'Calificación promedio debe estar entre 1 y 5'),
  comments: z.string().optional()
})

// POST /teachers/evaluations - Guardar evaluación de un profesor
router.post('/evaluations', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    
    // Validar datos de entrada
    const validatedData = evaluationSchema.parse(req.body)
    const {
      teacherId,
      courseId,
      groupId,
      answers,
      overallRating,
      comments
    } = validatedData

    // Asegurar que courseId sea un número para las consultas de BD
    const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId

    console.log('🔍 Backend: Saving evaluation:', {
      teacherId,
      courseId: numericCourseId,
      groupId,
      studentId: user.id,
      userType: user.tipo_usuario,
      overallRating,
      answersCount: answers?.length || 0
    });

    // Verificar que el usuario es un estudiante
    if (user.tipo_usuario !== 'estudiante') {
      console.log('❌ Backend: User is not a student:', user.tipo_usuario);
      return res.status(403).json({ error: 'Solo los estudiantes pueden realizar evaluaciones' })
    }

    // Obtener el ID del estudiante
    console.log('🔍 Backend: Looking for student with usuario_id:', user.id);
    const { data: estudiante, error: estudianteError } = await SupabaseDB.supabaseAdmin
      .from('estudiantes')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (estudianteError) {
      console.log('❌ Backend: Error finding student:', estudianteError);
      return res.status(404).json({ error: 'Error al buscar el estudiante', details: estudianteError.message })
    }

    if (!estudiante) {
      console.log('❌ Backend: Student not found for user:', user.id);
      return res.status(404).json({ error: 'Estudiante no encontrado' })
    }

    console.log('✅ Backend: Estudiante found:', estudiante);

    // Verificar que no haya una evaluación previa para este profesor y grupo
    const { data: existingEvaluation, error: existingError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select('id')
      .eq('profesor_id', teacherId)
      .eq('estudiante_id', estudiante.id)
      .eq('grupo_id', groupId || 1)
      .eq('periodo_id', 1)
      .maybeSingle()

    if (existingEvaluation) {
      console.log('❌ Backend: Evaluation already exists');
      return res.status(409).json({ error: 'Ya has evaluado a este profesor para este curso y grupo' })
    }

    // Crear la evaluación principal
    const evaluationData: any = {
      profesor_id: teacherId,
      estudiante_id: estudiante.id,
      grupo_id: groupId || 1, // Usar grupo_id por defecto si no se proporciona
      periodo_id: 1, // Usar periodo_id por defecto (2025-2)
      completada: true,
      comentarios: comments || null,
      calificacion_promedio: overallRating,
      fecha_completada: new Date().toISOString()
    }

    console.log('🔍 Backend: Inserting evaluation with data:', evaluationData);
    const { data: evaluacion, error: evaluacionError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .insert(evaluationData)
      .select('id')
      .single()

    if (evaluacionError) {
      console.error('❌ Backend: Error creating evaluation:', evaluacionError);
      console.error('❌ Backend: Evaluation data that failed:', evaluationData);
      return res.status(500).json({ error: 'Error al guardar la evaluación', details: evaluacionError.message })
    }

    console.log('✅ Backend: Evaluation created:', evaluacion);

    // Guardar las respuestas individuales si existen
    if (answers && answers.length > 0) {
      const respuestasData = answers.map((answer: any) => {
        const responseData: any = {
          evaluacion_id: evaluacion.id,
          pregunta_id: answer.questionId
        };

        // Manejar respuestas de rating
        if (answer.rating !== null && answer.rating !== undefined) {
          responseData.respuesta_rating = answer.rating;
        }

        // Manejar respuestas de texto
        if (answer.textAnswer !== null && answer.textAnswer !== undefined && answer.textAnswer.trim() !== '') {
          responseData.respuesta_texto = answer.textAnswer.trim();
        }

        // Manejar respuestas de opción múltiple
        if (answer.selectedOption !== null && answer.selectedOption !== undefined) {
          responseData.respuesta_opcion = answer.selectedOption;
        }

        return responseData;
      }).filter((response: any) => response.respuesta_rating !== undefined || response.respuesta_texto !== undefined || response.respuesta_opcion !== undefined);

      if (respuestasData.length > 0) {
        const { error: respuestasError } = await SupabaseDB.supabaseAdmin
          .from('respuestas_evaluacion')
          .insert(respuestasData)

        if (respuestasError) {
          console.error('❌ Backend: Error saving answers:', respuestasError);
          // No fallar la operación completa si solo fallan las respuestas individuales
        } else {
          console.log('✅ Backend: Answers saved successfully:', respuestasData.length, 'responses');
        }
      }
    }

    console.log('✅ Backend: Evaluation saved successfully');
    res.json({ 
      success: true, 
      message: 'Evaluación guardada exitosamente',
      evaluationId: evaluacion.id
    })
  } catch (error) {
    // Manejo específico de errores de validación Zod
    if (error instanceof z.ZodError) {
      console.log('❌ Backend: Validation error:', error.errors);
      return res.status(400).json({ 
        error: 'Datos de evaluación inválidos', 
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }
    
    console.error('❌ Backend: Error al guardar evaluación:', error)
    console.error('❌ Backend: Error stack:', (error as any)?.stack)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/evaluation-questions/:courseId - Obtener preguntas de evaluación por curso (basado en código del curso)
router.get('/evaluation-questions/:courseId', authenticateToken, async (req: any, res) => {
  try {
    const { courseId } = req.params
    const user = req.user

    console.log('🔍 Backend: Getting evaluation questions for courseId:', courseId);

    // Verificar que el usuario es un estudiante
    if (user.tipo_usuario !== 'estudiante') {
      return res.status(403).json({ error: 'Solo los estudiantes pueden acceder a las preguntas de evaluación' })
    }

    // Obtener información del curso para determinar la carrera
    const { data: curso, error: cursoError } = await SupabaseDB.supabaseAdmin
      .from('cursos')
      .select('id, codigo, nombre')
      .eq('id', courseId)
      .single()

    if (cursoError || !curso) {
      console.log('❌ Backend: Curso not found:', cursoError);
      return res.status(404).json({ error: 'Curso no encontrado' })
    }

    console.log('✅ Backend: Curso found:', curso);

    // Determinar la carrera basada en el código del curso
    const codigoCurso = curso.codigo || '';
    const prefijo = codigoCurso.split('-')[0] || '';
    
    let carreraId: string | null = '1'; // Default a Sistemas
    
    switch (prefijo.toUpperCase()) {
      case 'SIS':
        carreraId = '1'; // Ingeniería de Sistemas
        break;
      case 'CIV':
        carreraId = '2'; // Ingeniería Civil
        break;
      case 'AMB':
        carreraId = '3'; // Ingeniería Ambiental
        break;
      case 'ENE':
        carreraId = '4'; // Ingeniería de Energías
        break;
      case 'TEL':
        carreraId = '5'; // Ingeniería en Telecomunicaciones
        break;
      case 'FIN':
        carreraId = '6'; // Ingeniería Financiera
        break;
      case 'IND':
        carreraId = '7'; // Ingeniería Industrial
        break;
      default:
        // Para cursos que no tienen prefijo específico, usar preguntas generales (tronco común)
        carreraId = null;
        break;
    }

    console.log('🔍 Backend: Course code:', codigoCurso, '-> Career ID:', carreraId);

    // Obtener preguntas específicas de la base de datos para esta carrera
    let query = SupabaseDB.supabaseAdmin
      .from('preguntas_evaluacion')
      .select(`
        id,
        texto_pregunta,
        tipo_pregunta,
        opciones,
        orden,
        categoria:categorias_pregunta(nombre)
      `)
      .eq('activa', true)
      .order('orden', { ascending: true });

    if (carreraId) {
      query = query.eq('id_carrera', parseInt(carreraId));
    } else {
      query = query.is('id_carrera', null);
    }

    const { data: preguntasDB, error: preguntasError } = await query;

    if (preguntasError) {
      console.error('❌ Backend: Error obteniendo preguntas de la DB:', preguntasError);
      return res.status(500).json({ error: 'Error obteniendo preguntas de evaluación' })
    }

    // Si no hay preguntas específicas para esta carrera, obtener preguntas generales (sin carrera_id)
    let questions = preguntasDB || [];
    
    if (questions.length === 0 && carreraId) {
      console.log('⚠️ Backend: No hay preguntas específicas para carrera', carreraId, ', obteniendo preguntas generales...');
      
      const { data: preguntasGenerales, error: preguntasGeneralesError } = await SupabaseDB.supabaseAdmin
        .from('preguntas_evaluacion')
        .select(`
          id,
          texto_pregunta,
          tipo_pregunta,
          opciones,
          orden,
          categoria:categorias_pregunta(nombre)
        `)
        .is('id_carrera', null)
        .eq('activa', true)
        .order('orden', { ascending: true })

      if (preguntasGeneralesError) {
        console.error('❌ Backend: Error obteniendo preguntas generales:', preguntasGeneralesError);
        return res.status(500).json({ error: 'Error obteniendo preguntas de evaluación' })
      }

      questions = preguntasGenerales || [];
    }

    // Transformar las preguntas al formato esperado por el frontend
    const questionsFormatted = questions.map((pregunta: any) => ({
      id: pregunta.id.toString(),
      category: pregunta.categoria?.nombre || 'General',
      question: pregunta.texto_pregunta,
      type: pregunta.tipo_pregunta,
      options: pregunta.opciones
    }))

    console.log('✅ Backend: Questions found for course:', curso.nombre, 'Career ID:', carreraId, 'Count:', questionsFormatted.length);

    res.json({
      courseId: parseInt(courseId),
      courseCode: curso.codigo,
      courseName: curso.nombre,
      carreraId: carreraId ? parseInt(carreraId) : null,
      questions: questionsFormatted
    })

  } catch (error) {
    console.error('❌ Backend: Error getting evaluation questions:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/student-info - Obtener información del estudiante actual
router.get('/student-info', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    console.log('🔍 Backend: Getting student info for user:', user.id);

    // Verificar que el usuario es un estudiante
    if (user.tipo_usuario !== 'estudiante') {
      return res.status(403).json({ error: 'Solo los estudiantes pueden acceder a esta información' })
    }

    // Obtener información del estudiante
    const { data: estudiante, error: estudianteError } = await SupabaseDB.supabaseAdmin
      .from('estudiantes')
      .select(`
        id,
        carrera_id,
        carrera:carreras(id, nombre)
      `)
      .eq('usuario_id', user.id)
      .single()

    if (estudianteError || !estudiante) {
      console.log('❌ Backend: Estudiante not found:', estudianteError);
      return res.status(404).json({ error: 'Estudiante no encontrado' })
    }

    console.log('✅ Backend: Estudiante found:', estudiante);

    res.json({
      estudianteId: estudiante.id,
      carreraId: estudiante.carrera_id,
      carrera: estudiante.carrera
    })

  } catch (error) {
    console.error('❌ Backend: Error getting student info:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/teacher-info - Obtener información del profesor actual
router.get('/teacher-info', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    console.log('🔍 Backend: Getting teacher info for user:', user.id);
    console.log('🔍 Backend: User type:', user.tipo_usuario);

    // Verificar que el usuario es un profesor o coordinador (que puede ser profesor también)
    const canAccessAsTeacher = user.tipo_usuario === 'profesor' || 
                               user.tipo_usuario === 'docente' ||
                               user.tipo_usuario === 'coordinador';
    
    if (!canAccessAsTeacher) {
      return res.status(403).json({ error: 'Solo los profesores y coordinadores pueden acceder a esta información' })
    }

    // Obtener información del profesor
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select(`
        id,
        carrera_id,
        carrera:carreras(id, nombre)
      `)
      .eq('usuario_id', user.id)
      .single()

    if (profesorError || !profesor) {
      console.log('❌ Backend: Profesor not found:', profesorError);
      return res.status(404).json({ error: 'Profesor no encontrado' })
    }

    console.log('✅ Backend: Profesor found:', profesor);

    res.json({
      profesorId: profesor.id,
      carreraId: profesor.carrera_id,
      carrera: profesor.carrera
    })

  } catch (error) {
    console.error('❌ Backend: Error getting teacher info:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/survey-by-career/:careerId - Obtener encuesta por carrera
router.get('/survey-by-career/:careerId', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { careerId } = req.params

    console.log('🔍 Backend: Getting survey for career:', careerId, 'for user:', user.id);

    // Verificar que el usuario es un profesor o coordinador (que puede ser profesor también)
    const canAccessAsTeacher = user.tipo_usuario === 'profesor' || 
                               user.tipo_usuario === 'docente' ||
                               user.tipo_usuario === 'coordinador';
    
    if (!canAccessAsTeacher) {
      return res.status(403).json({ error: 'Solo los profesores y coordinadores pueden acceder a esta información' })
    }

    // Obtener preguntas de la encuesta para la carrera específica
    let query = SupabaseDB.supabaseAdmin
      .from('preguntas_evaluacion')
      .select(`
        id,
        texto_pregunta,
        tipo_pregunta,
        opciones,
        orden,
        categoria:categorias_pregunta(nombre)
      `)
      .eq('activa', true)
      .order('orden', { ascending: true });

    if (careerId && careerId !== 'null') {
      query = query.eq('id_carrera', parseInt(careerId));
    } else {
      query = query.is('id_carrera', null);
    }

    const { data: preguntasDB, error: preguntasError } = await query;

    if (preguntasError) {
      console.error('❌ Backend: Error obteniendo preguntas de la DB:', preguntasError);
      return res.status(500).json({ error: 'Error obteniendo preguntas de evaluación' })
    }

    // Si no hay preguntas específicas para esta carrera, obtener preguntas generales
    let questions = preguntasDB || [];
    
    if (questions.length === 0 && careerId && careerId !== 'null') {
      console.log('⚠️ Backend: No hay preguntas específicas para carrera', careerId, ', obteniendo preguntas generales...');
      
      const { data: preguntasGenerales, error: preguntasGeneralesError } = await SupabaseDB.supabaseAdmin
        .from('preguntas_evaluacion')
        .select(`
          id,
          texto_pregunta,
          tipo_pregunta,
          opciones,
          orden,
          categoria:categorias_pregunta(nombre)
        `)
        .is('id_carrera', null)
        .eq('activa', true)
        .order('orden', { ascending: true })

      if (preguntasGeneralesError) {
        console.error('❌ Backend: Error obteniendo preguntas generales:', preguntasGeneralesError);
        return res.status(500).json({ error: 'Error obteniendo preguntas de evaluación' })
      }

      questions = preguntasGenerales || [];
    }

    // Obtener información de la carrera
    let carreraInfo = null;
    if (careerId && careerId !== 'null') {
      const { data: carreraData, error: carreraError } = await SupabaseDB.supabaseAdmin
        .from('carreras')
        .select('id, nombre')
        .eq('id', careerId)
        .single()

      if (!carreraError && carreraData) {
        carreraInfo = carreraData;
      }
    }

    // Transformar las preguntas al formato esperado por el frontend
    const questionsFormatted = questions.map((pregunta: any) => ({
      id: pregunta.id.toString(),
      category: pregunta.categoria?.nombre || 'General',
      question: pregunta.texto_pregunta,
      type: pregunta.tipo_pregunta,
      options: pregunta.opciones
    }))

    console.log('✅ Backend: Survey questions found for career:', careerId, 'Count:', questionsFormatted.length);

    res.json({
      careerId: careerId ? parseInt(careerId) : null,
      career: carreraInfo,
      questions: questionsFormatted
    })

  } catch (error) {
    console.error('❌ Backend: Error getting survey by career:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/test - Endpoint de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Teachers endpoint working', timestamp: new Date().toISOString() })
})

// GET /teachers/debug-user - Endpoint de debug para verificar información del usuario
router.get('/debug-user', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    console.log('🔍 Debug: User info from token:', user);

    // Buscar información completa del usuario
    const { data: usuarioCompleto, error: usuarioError } = await SupabaseDB.supabaseAdmin
      .from('usuarios')
      .select(`
        id,
        nombre,
        apellido,
        email,
        tipo_usuario,
        activo
      `)
      .eq('id', user.id)
      .single()

    if (usuarioError) {
      console.log('❌ Debug: Error getting user:', usuarioError);
      return res.status(500).json({ error: 'Error obteniendo usuario', details: usuarioError })
    }

    // Buscar si es profesor
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select(`
        id,
        usuario_id,
        carrera_id,
            activa,
        carrera:carreras(id, nombre)
      `)
      .eq('usuario_id', user.id)
      .single()

    console.log('🔍 Debug: Profesor info:', profesor, 'Error:', profesorError);

    res.json({
      userFromToken: user,
      usuarioCompleto,
      profesor: profesor || null,
      profesorError: profesorError || null
    })

  } catch (error) {
    console.error('❌ Debug: Error:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/debug-auth - Endpoint de debug para verificar autenticación
router.get('/debug-auth', async (req: any, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    console.log('🔍 Debug Auth: Auth header:', authHeader);
    console.log('🔍 Debug Auth: Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        authHeader: authHeader,
        hasToken: false
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      console.log('🔍 Debug Auth: Decoded token:', decoded);

      // Buscar usuario directamente
      const { data: user, error: userError } = await SupabaseDB.supabaseAdmin
        .from('usuarios')
        .select(`
          id,
          nombre,
          apellido,
          email,
          tipo_usuario,
          activo
        `)
        .eq('id', decoded.userId)
        .single()

      console.log('🔍 Debug Auth: User from DB:', user, 'Error:', userError);

      res.json({
        tokenPresent: true,
        decodedToken: decoded,
        userFromDB: user,
        userError: userError,
        authHeader: authHeader
      })

    } catch (jwtError) {
      console.log('❌ Debug Auth: JWT Error:', jwtError);
      res.status(401).json({ 
        error: 'Invalid token',
        jwtError: jwtError,
        token: token
      })
    }

  } catch (error) {
    console.error('❌ Debug Auth: Error:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/by-career/:careerId - Obtener profesores por carrera (para coordinadores)
router.get('/by-career/:careerId', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { careerId } = req.params

    console.log('🔍 [/teachers/by-career] Request received', { userId: user?.id, careerId })

    // Verificar que el usuario sea coordinador o decano
    if (!user.roles?.includes('coordinador') && !user.roles?.includes('decano') && user.tipo_usuario !== 'coordinador') {
      return res.status(403).json({ error: 'Acceso denegado. Solo coordinadores y decanos pueden ver esta información.' })
    }

    // 1) Traer profesores activos de la carrera directamente por columna profesores.carrera_id
    const { data: profesBase, error: profesErr } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select(`
        id,
        usuario_id,
        activo,
        codigo_profesor,
        carrera_id,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email,
          activo
        )
      `)
      .eq('activo', true)
      .eq('usuarios.activo', true)
      .eq('carrera_id', careerId)

    if (profesErr) {
      console.error('Error consultando profesores por carrera_id:', profesErr)
      return res.status(500).json({ error: 'Error obteniendo profesores por carrera', details: profesErr })
    }

    console.log(`🔎 Profesores base encontrados para carrera ${careerId}:`, profesBase?.length || 0)
    console.log('🔍 Profesores encontrados:', profesBase?.map((p: any) => ({
      id: p.id,
      nombre: p.usuarios?.nombre,
      apellido: p.usuarios?.apellido,
      carrera_id: p.carrera_id
    })))

    const profesorIds = (profesBase || []).map((p: any) => p.id)
    console.log('🔍 IDs de profesores para buscar asignaciones:', profesorIds)

    // 2) Buscar asignaciones por profesor_id en la tabla correcta
    let asignaciones: any[] = []
    try {
      console.log('🔍 Buscando asignaciones por profesor_id:', profesorIds)
      
      // Intentar primero con asignaciones_profesor
      let resp = await SupabaseDB.supabaseAdmin
        .from('asignaciones_profesor')
        .select('id, profesor_id, curso_id, activa')
        .in('profesor_id', profesorIds.length ? profesorIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('activa', true)
      
      console.log('🔍 Respuesta de asignaciones_profesor:', resp)
      
      if (resp.error || !resp.data || resp.data.length === 0) {
        console.log('🔍 No hay datos en asignaciones_profesor para estos profesores')
        asignaciones = []
      } else {
        asignaciones = resp.data.map((item: any) => ({
          ...item,
          periodo_academico: null, // asignaciones_profesor no tiene periodo_academico
          activa: true
        }))
      }
      
      console.log('🔍 Error de asignaciones:', resp.error)
    } catch (e) {
      console.error('❌ Error en consulta de asignaciones:', e)
      // Si falla, continuar sin cursos
      asignaciones = []
    }

    console.log('🔎 Asignaciones cargadas:', asignaciones?.length || 0)
    console.log('🔎 Asignaciones encontradas:', asignaciones?.map(a => ({ profesor_id: a.profesor_id, curso_id: a.curso_id })))

    const cursoIds = Array.from(new Set((asignaciones || []).map((a: any) => a.curso_id).filter(Boolean)))
    console.log('🔍 IDs de cursos extraídos de asignaciones:', cursoIds)
    
    let cursos: any[] = []
    if (cursoIds.length > 0) {
      console.log('🔍 Buscando cursos específicos de asignaciones...')
      const { data: cursosData, error: cursosErr } = await SupabaseDB.supabaseAdmin
        .from('cursos')
        .select('id, nombre, codigo, carrera_id')
        .in('id', cursoIds)
      console.log('🔍 Respuesta de cursos específicos:', { data: cursosData, error: cursosErr })
      if (!cursosErr) cursos = cursosData || []
      console.log('🔎 Cursos encontrados de asignaciones:', cursos?.length || 0)
      console.log('🔎 Cursos encontrados:', cursos?.map(c => ({ id: c.id, nombre: c.nombre, carrera_id: c.carrera_id })))
    } else {
      console.log('⚠️ No hay cursoIds de asignaciones; no se cargarán cursos adicionales. Se mostrará vacío para no exponer materias no asignadas.')
      cursos = []
    }
    console.log('🔎 Cursos filtrados por carrera cargados:', cursos?.length || 0)
    const cursoById = new Map((cursos || []).map((c: any) => [c.id, c]))

    // Cargar nombre de la carrera para enriquecer "department"
    let carreraNombre: string | null = null
    try {
      const { data: carreraData } = await SupabaseDB.supabaseAdmin
        .from('carreras')
        .select('id,nombre')
        .eq('id', careerId)
        .single()
      carreraNombre = carreraData?.nombre || null
    } catch {}

    const asignacionesByProfesor = new Map<string, any[]>()
    ;(asignaciones || []).forEach((a: any) => {
      const list = asignacionesByProfesor.get(a.profesor_id) || []
      list.push(a)
      asignacionesByProfesor.set(a.profesor_id, list)
    })

    const result = (profesBase || []).map((p: any) => {
      const asigns = asignacionesByProfesor.get(p.id) || []
      console.log(`🔍 DEBUG: Profesor ${p.id} (${p.usuarios?.nombre}) - asignaciones:`, asigns)
      
      // Obtener cursos de las asignaciones
      const cursosDeAsignaciones = asigns
        .map((a: any) => {
          const curso = cursoById.get(a.curso_id)
          console.log(`🔍 DEBUG: curso_id: ${a.curso_id}, curso encontrado:`, curso)
          if (curso) {
            return {
              ...curso,
              // TODO: Agregar calificación promedio cuando se implemente la funcionalidad
              calificacion_promedio: null
            }
          }
          return null
        })
        .filter(Boolean)
      
      // Mostrar únicamente cursos provenientes de asignaciones; si no hay, lista vacía
      const cursosProf = cursosDeAsignaciones
      
      console.log(`🔍 DEBUG: cursosProf final para ${p.usuarios?.nombre}:`, cursosProf)
      return {
        id: p.id,
        usuario_id: p.usuario_id,
        codigo_profesor: p.codigo_profesor || null,
        carrera_id: p.carrera_id,
        carrera_nombre: carreraNombre,
        nombre: p.usuarios?.nombre || '',
        apellido: p.usuarios?.apellido || '',
        email: p.usuarios?.email || '',
        activa: p.activo,
        cursos: cursosProf
      }
    })

    console.log(`✅ Respuesta profesores por carrera ${careerId}:`, { profesores: result.length })
    res.json(result)
  } catch (error) {
    console.error('❌ Error en /teachers/by-career:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/professor-subjects - Obtener materias específicas de cada profesor
router.get('/professor-subjects', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    console.log('🔍 [/teachers/professor-subjects] Request received', { userId: user?.id })

    // Verificar que el usuario sea decano
    if (!user.roles?.includes('decano')) {
      return res.status(403).json({ error: 'Acceso denegado. Solo el decano puede ver las materias de los profesores.' })
    }

    // Obtener todas las carreras activas (excluyendo tronco común)
    const { data: carreras, error: carrerasError } = await SupabaseDB.supabaseAdmin
      .from('carreras')
      .select('id, nombre')
      .eq('activa', true)
      .not('nombre', 'ilike', '%tronco común%')
      .not('nombre', 'ilike', '%tronco comun%')
      .order('nombre')

    if (carrerasError) {
      console.error('Error consultando carreras:', carrerasError)
      return res.status(500).json({ error: 'Error obteniendo carreras', details: carrerasError })
    }

    // Obtener profesores de cada carrera con sus materias específicas
    const profesoresPorCarrera: {[key: string]: any[]} = {}
    
    for (const carrera of carreras) {
      const { data: profesores, error: profesoresError } = await SupabaseDB.supabaseAdmin
        .from('profesores')
        .select(`
          id,
          usuario_id,
          activo,
          codigo_profesor,
          carrera_id,
          usuarios:usuarios(
            id,
            nombre,
            apellido,
            email,
            activo
          ),
          asignaciones_profesor:asignaciones_profesor(
            curso_id,
            activa,
            cursos:cursos(
              id,
              nombre,
              codigo,
              creditos,
              activo
            )
          )
        `)
        .eq('activo', true)
        .eq('usuarios.activo', true)
        .eq('carrera_id', carrera.id)
        .eq('asignaciones_profesor.activa', true)

      if (profesoresError) {
        console.error(`Error consultando profesores para carrera ${carrera.id}:`, profesoresError)
        profesoresPorCarrera[carrera.id] = []
      } else {
        // Mapear profesores con sus materias específicas
        const profesoresConMaterias = (profesores || []).map((p: any) => ({
          id: p.id,
          usuario_id: p.usuario_id,
          codigo_profesor: p.codigo_profesor || null,
          carrera_id: p.carrera_id,
          carrera_nombre: carrera.nombre,
          nombre: p.usuarios?.nombre || '',
          apellido: p.usuarios?.apellido || '',
          email: p.usuarios?.email || '',
          activo: p.activo,
          materias_asignadas: (p.asignaciones_profesor || [])
            .filter((asig: any) => asig.cursos && asig.cursos.activo)
            .map((asig: any) => ({
              id: asig.cursos.id,
              nombre: asig.cursos.nombre,
              codigo: asig.cursos.codigo,
              creditos: asig.cursos.creditos
            })),
          total_materias_asignadas: (p.asignaciones_profesor || [])
            .filter((asig: any) => asig.cursos && asig.cursos.activo).length
        }))

        profesoresPorCarrera[carrera.id] = profesoresConMaterias
      }
    }

    const result = {
      carreras: carreras.map(c => ({
        id: c.id,
        nombre: c.nombre,
        total_profesores: profesoresPorCarrera[c.id]?.length || 0
      })),
      profesores_por_carrera: profesoresPorCarrera,
      total_profesores: Object.values(profesoresPorCarrera).flat().length
    }

    console.log(`✅ Respuesta materias específicas de profesores:`, { 
      carreras: result.carreras.length, 
      total_profesores: result.total_profesores 
    })
    res.json(result)
  } catch (error) {
    console.error('❌ Error en /teachers/professor-subjects:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/career-subjects - Obtener materias de cada carrera
router.get('/career-subjects', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    console.log('🔍 [/teachers/career-subjects] Request received', { userId: user?.id })

    // Verificar que el usuario sea decano
    if (!user.roles?.includes('decano')) {
      return res.status(403).json({ error: 'Acceso denegado. Solo el decano puede ver las materias de las carreras.' })
    }

    // Obtener todas las carreras activas (excluyendo tronco común)
    const { data: carreras, error: carrerasError } = await SupabaseDB.supabaseAdmin
      .from('carreras')
      .select('id, nombre')
      .eq('activa', true)
      .not('nombre', 'ilike', '%tronco común%')
      .not('nombre', 'ilike', '%tronco comun%')
      .order('nombre')

    if (carrerasError) {
      console.error('Error consultando carreras:', carrerasError)
      return res.status(500).json({ error: 'Error obteniendo carreras', details: carrerasError })
    }

    // Obtener materias de cada carrera
    const materiasPorCarrera: {[key: string]: any[]} = {}
    
    for (const carrera of carreras) {
      const { data: cursos, error: cursosError } = await SupabaseDB.supabaseAdmin
        .from('cursos')
        .select(`
          id,
          nombre,
          codigo,
          creditos,
          descripcion,
          activo
        `)
        .eq('carrera_id', carrera.id)
        .eq('activo', true)
        .order('nombre')

      if (cursosError) {
        console.error(`Error consultando cursos para carrera ${carrera.id}:`, cursosError)
        materiasPorCarrera[carrera.id] = []
      } else {
        materiasPorCarrera[carrera.id] = cursos || []
      }
    }

    const result = {
      carreras: carreras.map(c => ({
        id: c.id,
        nombre: c.nombre,
        total_materias: materiasPorCarrera[c.id]?.length || 0
      })),
      materias_por_carrera: materiasPorCarrera,
      total_materias: Object.values(materiasPorCarrera).flat().length
    }

    console.log(`✅ Respuesta materias por carrera:`, { 
      carreras: result.carreras.length, 
      total_materias: result.total_materias 
    })
    res.json(result)
  } catch (error) {
    console.error('❌ Error en /teachers/career-subjects:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/detailed-faculty - Obtener profesores con información detallada (materias, etc.)
router.get('/detailed-faculty', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    console.log('🔍 [/teachers/detailed-faculty] Request received', { userId: user?.id })

    // Verificar que el usuario sea decano
    if (!user.roles?.includes('decano')) {
      return res.status(403).json({ error: 'Acceso denegado. Solo el decano puede ver todos los profesores de la facultad.' })
    }

    // Obtener todas las carreras activas (excluyendo tronco común)
    const { data: carreras, error: carrerasError } = await SupabaseDB.supabaseAdmin
      .from('carreras')
      .select('id, nombre')
      .eq('activa', true)
      .not('nombre', 'ilike', '%tronco común%')
      .not('nombre', 'ilike', '%tronco comun%')
      .order('nombre')

    if (carrerasError) {
      console.error('Error consultando carreras:', carrerasError)
      return res.status(500).json({ error: 'Error obteniendo carreras', details: carrerasError })
    }

    // Obtener profesores de cada carrera con información detallada
    const profesoresPorCarrera: {[key: string]: any[]} = {}
    
    for (const carrera of carreras) {
      const { data: profesores, error: profesoresError } = await SupabaseDB.supabaseAdmin
        .from('profesores')
        .select(`
          id,
          usuario_id,
          activa,
          codigo_profesor,
          carrera_id,
          usuarios:usuarios(
            id,
            nombre,
            apellido,
            email,
            activo
          )
        `)
        .eq('activo', true)
        .eq('usuarios.activo', true)
        .eq('carrera_id', carrera.id)

      if (profesoresError) {
        console.error(`Error consultando profesores para carrera ${carrera.id}:`, profesoresError)
        profesoresPorCarrera[carrera.id] = []
      } else {
        // Obtener cursos de la carrera
        const { data: cursosCarrera, error: cursosError } = await SupabaseDB.supabaseAdmin
          .from('cursos')
          .select(`
            id,
            nombre,
            codigo,
            creditos,
            activo
          `)
          .eq('carrera_id', carrera.id)
          .eq('activo', true)

        if (cursosError) {
          console.warn(`Error obteniendo cursos para carrera ${carrera.id}:`, cursosError)
        }

        // Mapear profesores con información de la carrera
        const profesoresConMaterias = (profesores || []).map((p: any) => ({
          id: p.id,
          usuario_id: p.usuario_id,
          codigo_profesor: p.codigo_profesor || null,
          carrera_id: p.carrera_id,
          carrera_nombre: carrera.nombre,
          nombre: p.usuarios?.nombre || '',
          apellido: p.usuarios?.apellido || '',
          email: p.usuarios?.email || '',
          activo: p.activo,
          materias_carrera: cursosCarrera || [],
          total_materias_carrera: cursosCarrera?.length || 0
        }))

        profesoresPorCarrera[carrera.id] = profesoresConMaterias
      }
    }

    const result = {
      carreras: carreras.map(c => ({
        id: c.id,
        nombre: c.nombre,
        total_profesores: profesoresPorCarrera[c.id]?.length || 0
      })),
      profesores_por_carrera: profesoresPorCarrera,
      total_profesores: Object.values(profesoresPorCarrera).flat().length
    }

    console.log(`✅ Respuesta profesores detallados de la facultad:`, { 
      carreras: result.carreras.length, 
      total_profesores: result.total_profesores 
    })
    res.json(result)
  } catch (error) {
    console.error('❌ Error en /teachers/detailed-faculty:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/faculty - Obtener TODOS los profesores de la facultad organizados por carrera (solo para decanos)
router.get('/faculty', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    console.log('🔍 [/teachers/faculty] Request received', { userId: user?.id })

    // Verificar que el usuario sea decano
    if (!user.roles?.includes('decano')) {
      return res.status(403).json({ error: 'Acceso denegado. Solo el decano puede ver todos los profesores de la facultad.' })
    }

    // Obtener todas las carreras activas (excluyendo tronco común)
    const { data: carreras, error: carrerasError } = await SupabaseDB.supabaseAdmin
      .from('carreras')
      .select('id, nombre')
      .eq('activo', true)
      .eq('activa', true)
      .not('nombre', 'ilike', '%tronco común%')
      .not('nombre', 'ilike', '%tronco comun%')
      .order('nombre')

    if (carrerasError) {
      console.error('Error consultando carreras:', carrerasError)
      return res.status(500).json({ error: 'Error obteniendo carreras', details: carrerasError })
    }

    // Obtener profesores de cada carrera
    const profesoresPorCarrera: {[key: string]: any[]} = {}
    
    for (const carrera of carreras) {
      const { data: profesores, error: profesoresError } = await SupabaseDB.supabaseAdmin
        .from('profesores')
        .select(`
          id,
          usuario_id,
          activa,
          codigo_profesor,
          carrera_id,
          usuarios:usuarios(
            id,
            nombre,
            apellido,
            email,
            activo
          )
        `)
        .eq('activo', true)
        .eq('usuarios.activo', true)
        .eq('carrera_id', carrera.id)

      if (profesoresError) {
        console.error(`Error consultando profesores para carrera ${carrera.id}:`, profesoresError)
        profesoresPorCarrera[carrera.id] = []
      } else {
        profesoresPorCarrera[carrera.id] = (profesores || []).map((p: any) => ({
          id: p.id,
          usuario_id: p.usuario_id,
          codigo_profesor: p.codigo_profesor || null,
          carrera_id: p.carrera_id,
          carrera_nombre: carrera.nombre,
          departamento: 'Sin departamento', // Campo fijo ya que no existe en la tabla
          nombre: p.usuarios?.nombre || '',
          apellido: p.usuarios?.apellido || '',
          email: p.usuarios?.email || '',
          activo: p.activo
        }))
      }
    }

    const result = {
      carreras: carreras.map(c => ({
        id: c.id,
        nombre: c.nombre,
        total_profesores: profesoresPorCarrera[c.id]?.length || 0
      })),
      profesores_por_carrera: profesoresPorCarrera,
      total_profesores: Object.values(profesoresPorCarrera).flat().length
    }

    console.log(`✅ Respuesta profesores de la facultad:`, { 
      carreras: result.carreras.length, 
      total_profesores: result.total_profesores 
    })
    res.json(result)
  } catch (error) {
    console.error('❌ Error en /teachers/faculty:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/all - Obtener TODOS los profesores de la facultad (solo para decanos)
router.get('/all', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    console.log('🔍 [/teachers/all] Request received', { userId: user?.id })

    // Verificar que el usuario sea decano
    if (!user.roles?.includes('decano')) {
      return res.status(403).json({ error: 'Acceso denegado. Solo el decano puede ver todos los profesores de la facultad.' })
    }

    // Obtener TODOS los profesores activos de la facultad
    const { data: profesBase, error: profesErr } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select(`
        id,
        usuario_id,
            activa,
        codigo_profesor,
        carrera_id,
        departamento,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email,
          activo
        ),
        carreras:carreras(
          id,
          nombre
        )
      `)
      .eq('activo', true)
      .eq('usuarios.activo', true)

    if (profesErr) {
      console.error('Error consultando todos los profesores:', profesErr)
      return res.status(500).json({ error: 'Error obteniendo profesores', details: profesErr })
    }

    console.log(`🔎 Total profesores encontrados en la facultad:`, profesBase?.length || 0)

    // Obtener todas las carreras para mostrar información completa
    const { data: carreras, error: carrerasError } = await SupabaseDB.supabaseAdmin
      .from('carreras')
      .select('id, nombre')
      .eq('activo', true)

    if (carrerasError) {
      console.warn('Error obteniendo carreras:', carrerasError)
    }

    const carreraById = new Map()
    ;(carreras || []).forEach((c: any) => {
      carreraById.set(c.id, c)
    })

    const result = (profesBase || []).map((p: any) => {
      const carrera = carreraById.get(p.carrera_id)
      return {
        id: p.id,
        usuario_id: p.usuario_id,
        codigo_profesor: p.codigo_profesor || null,
        carrera_id: p.carrera_id,
        carrera_nombre: carrera?.nombre || 'Sin carrera asignada',
        departamento: p.departamento || 'Sin departamento',
        nombre: p.usuarios?.nombre || '',
        apellido: p.usuarios?.apellido || '',
        email: p.usuarios?.email || '',
        activo: p.activo
      }
    })

    console.log(`✅ Respuesta todos los profesores de la facultad:`, { profesores: result.length })
    res.json(result)
  } catch (error) {
    console.error('❌ Error en /teachers/all:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Endpoint de debug para verificar grupos de un curso
router.get('/debug-groups/:profesorId/:courseId', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { profesorId, courseId } = req.params

    console.log('🔍 [DEBUG GROUPS] Verificando grupos para profesor:', profesorId, 'curso:', courseId)

    // 1. Verificar que el profesor existe
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id, usuario_id, carrera_id')
      .eq('id', profesorId)
      .eq('activo', true)

    if (profesorError) {
      console.error('Error consultando profesor:', profesorError)
      return res.status(500).json({ error: 'Error consultando profesor' })
    }

    console.log('🔍 [DEBUG GROUPS] Profesor encontrado:', profesor)

    // 2. Verificar que el curso existe
    const { data: curso, error: cursoError } = await SupabaseDB.supabaseAdmin
      .from('cursos')
      .select('id, nombre, codigo, carrera_id')
      .eq('id', courseId)

    if (cursoError) {
      console.error('Error consultando curso:', cursoError)
      return res.status(500).json({ error: 'Error consultando curso' })
    }

    console.log('🔍 [DEBUG GROUPS] Curso encontrado:', curso)

    // 3. Verificar asignaciones del profesor para este curso
    const { data: asignaciones, error: asignacionesError } = await SupabaseDB.supabaseAdmin
      .from('asignaciones_profesor')
      .select('id, profesor_id, curso_id, activa')
      .eq('profesor_id', profesorId)
      .eq('curso_id', courseId)

    if (asignacionesError) {
      console.error('Error consultando asignaciones:', asignacionesError)
    }

    console.log('🔍 [DEBUG GROUPS] Asignaciones del profesor para este curso:', asignaciones)

    // 4. Traer grupos por curso_id (la tabla grupos no tiene profesor_id)
    const { data: grupos, error: gruposError } = await SupabaseDB.supabaseAdmin
      .from('grupos')
      .select('id, numero_grupo, horario, aula, curso_id')
      .eq('curso_id', courseId)

    if (gruposError) {
      console.error('Error consultando grupos:', gruposError)
      return res.status(500).json({ error: 'Error consultando grupos' })
    }

    console.log('🔍 [DEBUG GROUPS] Grupos por curso encontrados:', grupos)

    // 5. Verificar si hay grupos en general (para debug)
    const { data: todosLosGrupos, error: todosLosGruposError } = await SupabaseDB.supabaseAdmin
      .from('grupos')
      .select('id, numero_grupo, curso_id, profesor_id')
      .limit(10)

    if (todosLosGruposError) {
      console.error('Error consultando todos los grupos:', todosLosGruposError)
    }

    console.log('🔍 [DEBUG GROUPS] Muestra de todos los grupos:', todosLosGrupos)

    res.json({
      profesor: profesor || null,
      curso: curso || null,
      grupos: grupos || [],
      asignaciones: asignaciones || [],
      todosLosGrupos: todosLosGrupos || [],
      summary: {
        profesorExiste: !!profesor,
        cursoExiste: !!curso,
        gruposEncontrados: grupos?.length || 0,
        asignacionesEncontradas: asignaciones?.length || 0,
        totalGruposEnDB: todosLosGrupos?.length || 0
      }
    })
  } catch (error) {
    console.error('❌ Error en debug groups:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Endpoint de debug para verificar asignaciones de profesores
router.get('/debug-assignments/:careerId', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { careerId } = req.params

    console.log('🔍 [DEBUG] Verificando asignaciones para carrera:', careerId)

    // 1. Verificar profesores de la carrera
    const { data: profesores, error: profError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select(`
        id,
        usuario_id,
        carrera_id,
        usuarios:usuarios(nombre, apellido, email)
      `)
      .eq('carrera_id', careerId)
      .eq('activo', true)

    if (profError) {
      console.error('Error consultando profesores:', profError)
      return res.status(500).json({ error: 'Error consultando profesores' })
    }

    console.log('🔍 [DEBUG] Profesores encontrados:', profesores?.length || 0)

    // 2. Verificar asignaciones por profesor_id
    const profesorIds = profesores?.map((p: any) => p.id) || []
    console.log('🔍 [DEBUG] IDs de profesores para buscar asignaciones:', profesorIds)
    
    const { data: asignaciones, error: asigError } = await SupabaseDB.supabaseAdmin
      .from('asignaciones_profesor')
      .select(`
        id,
        profesor_id,
        curso_id,
        activa,
        cursos:cursos(id, nombre, codigo, carrera_id)
      `)
      .in('profesor_id', profesorIds.length > 0 ? profesorIds : ['00000000-0000-0000-0000-000000000000'])

    if (asigError) {
      console.error('Error consultando asignaciones:', asigError)
      return res.status(500).json({ error: 'Error consultando asignaciones' })
    }

    console.log('🔍 [DEBUG] Asignaciones encontradas:', asignaciones?.length || 0)

    // 3. Verificar cursos de la carrera
    const { data: cursos, error: cursosError } = await SupabaseDB.supabaseAdmin
      .from('cursos')
      .select(`
        id,
        nombre,
        codigo,
        carrera_id
      `)
      .eq('carrera_id', careerId)

    if (cursosError) {
      console.error('Error consultando cursos:', cursosError)
      return res.status(500).json({ error: 'Error consultando cursos' })
    }

    console.log('🔍 [DEBUG] Cursos de la carrera encontrados:', cursos?.length || 0)

    res.json({
      profesores: profesores || [],
      asignaciones: asignaciones || [],
      cursos: cursos || [],
      summary: {
        totalProfesores: profesores?.length || 0,
        totalAsignaciones: asignaciones?.length || 0,
        totalCursos: cursos?.length || 0
      }
    })
  } catch (error) {
    console.error('❌ Error en debug assignments:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Endpoint para obtener calificación promedio de un profesor en un curso específico
router.get('/course-rating/:professorId/:courseId', async (req, res) => {
  try {
    const { professorId, courseId } = req.params
    
    console.log(`🔍 Obteniendo calificación promedio para profesor ${professorId} en curso ${courseId}`)
    
    // Buscar evaluaciones del profesor en el curso específico
    const { data: evaluaciones, error: evalError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select(`
        id,
        respuestas_evaluacion (
          pregunta_id,
          respuesta,
          preguntas (
            tipo_pregunta
          )
        )
      `)
      .eq('profesor_id', professorId)
      .eq('curso_id', courseId)
      .eq('estado', 'completada')
    
    if (evalError) {
      console.error('❌ Error obteniendo evaluaciones:', evalError)
      return res.status(500).json({ error: 'Error obteniendo evaluaciones' })
    }
    
    console.log(`🔍 Evaluaciones encontradas: ${evaluaciones?.length || 0}`)
    
    if (!evaluaciones || evaluaciones.length === 0) {
      return res.json({
        promedio: null,
        total_respuestas: 0,
        mensaje: 'No hay evaluaciones completadas para este curso'
      })
    }
    
    // Calcular promedio de respuestas numéricas (Likert scale)
    let sumaTotal = 0
    let cantidadRespuestas = 0
    
    evaluaciones.forEach(evaluacion => {
      evaluacion.respuestas_evaluacion?.forEach((respuesta: any) => {
        if (respuesta.preguntas?.tipo_pregunta === 'likert' && !isNaN(parseInt(respuesta.respuesta))) {
          sumaTotal += parseInt(respuesta.respuesta)
          cantidadRespuestas++
        }
      })
    })
    
    const promedio = cantidadRespuestas > 0 ? (sumaTotal / cantidadRespuestas).toFixed(2) : null
    
    console.log(`✅ Calificación promedio calculada: ${promedio} (${cantidadRespuestas} respuestas)`)
    
    res.json({
      promedio: promedio ? parseFloat(promedio) : null,
      total_respuestas: cantidadRespuestas,
      total_evaluaciones: evaluaciones.length
    })
    
  } catch (error) {
    console.error('❌ Error en /teachers/course-rating:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/careers - Obtener carreras disponibles (para coordinadores)
router.get('/careers', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    // Verificar que el usuario sea coordinador
    if (!user.roles?.includes('coordinador') && user.tipo_usuario !== 'coordinador') {
      return res.status(403).json({ error: 'Acceso denegado. Solo coordinadores pueden ver esta información.' })
    }

    // Obtener carreras
    const { data: carreras, error } = await SupabaseDB.supabaseAdmin
      .from('carreras')
      .select('id, nombre, codigo, activo')
      .eq('activo', true)
      .order('nombre')

    if (error) {
      console.error('Error obteniendo carreras:', error)
      return res.status(500).json({ error: 'Error obteniendo carreras', details: error })
    }

    console.log(`✅ Carreras obtenidas:`, carreras?.length)
    res.json(carreras || [])

  } catch (error) {
    console.error('Error en /teachers/careers:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/:teacherId/courses - Obtener cursos de un profesor específico
router.get('/:teacherId/courses', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { teacherId } = req.params

    console.log('🔍 [/teachers/:teacherId/courses] Request received', { userId: user?.id, teacherId })

    // Verificar que el usuario sea el mismo profesor o un coordinador
    const isOwnProfile = user.id === teacherId
    const isCoordinator = user.roles?.includes('coordinador') || user.tipo_usuario === 'coordinador'
    
    if (!isOwnProfile && !isCoordinator) {
      return res.status(403).json({ error: 'Acceso denegado. Solo puedes ver tus propios cursos.' })
    }

    // Primero obtener el profesor_id desde el usuario_id
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .eq('usuario_id', teacherId)
      .eq('activo', true)
      .single()

    if (profesorError) {
      console.error('Error obteniendo profesor por usuario_id:', profesorError)
      return res.status(500).json({ error: 'Error obteniendo información del profesor', details: profesorError })
    }

    if (!profesor) {
      console.log('⚠️ No se encontró profesor activo para usuario_id:', teacherId)
      return res.json([]) // Retornar array vacío si no es profesor
    }

    console.log('🔍 Profesor encontrado:', profesor.id)

    // Obtener asignaciones del profesor con información de cursos
    const { data: asignaciones, error: asignError } = await SupabaseDB.supabaseAdmin
      .from('asignaciones_profesor')
      .select(`
        id,
        profesor_id,
        curso_id,
            activa,
        cursos:cursos(
          id,
          nombre,
          codigo,
          creditos,
          descripcion,
          activo,
          carrera_id,
          carreras:carreras(
            id,
            nombre,
            codigo
          )
        )
      `)
      .eq('profesor_id', profesor.id)
      .eq('activa', true)

    if (asignError) {
      console.error('Error consultando asignaciones del profesor:', asignError)
      return res.status(500).json({ error: 'Error obteniendo cursos del profesor', details: asignError })
    }

    // Filtrar solo cursos activos y formatear respuesta
    const cursos = (asignaciones || [])
      .filter((asig: any) => asig.cursos && asig.cursos.activo)
      .map((asig: any) => ({
        id: asig.cursos.id,
        nombre: asig.cursos.nombre,
        codigo: asig.cursos.codigo,
        creditos: asig.cursos.creditos,
        descripcion: asig.cursos.descripcion,
        carrera_id: asig.cursos.carrera_id,
        carrera: asig.cursos.carreras
      }))

    console.log(`✅ Cursos encontrados para profesor ${profesor.id} (usuario ${teacherId}):`, cursos.length)
    res.json(cursos)

  } catch (error) {
    console.error('❌ Error en /teachers/:teacherId/courses:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/career-results/all - Obtener resultados para todas las carreras
router.get('/career-results/all', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user

    // Verificar que el usuario sea decano
    if (!user.roles?.includes('decano')) {
      return res.status(403).json({ error: 'Acceso denegado. Solo decanos pueden acceder a estos resultados.' })
    }

    console.log('🔍 Obteniendo resultados para todas las carreras...')

    // Obtener todas las carreras activas (excluyendo tronco común)
    const { data: carreras, error: carrerasError } = await SupabaseDB.supabaseAdmin
      .from('carreras')
      .select(`
        id,
        nombre,
        codigo,
        activo
      `)
      .eq('activa', true)
      .not('nombre', 'ilike', '%tronco común%')
      .not('nombre', 'ilike', '%tronco comun%')
      .eq('activo', true)

    if (carrerasError) {
      console.error('❌ Error obteniendo carreras:', carrerasError)
      return res.status(500).json({ error: 'Error obteniendo carreras', details: carrerasError })
    }

    // Obtener estadísticas generales de evaluaciones
    const { data: evaluacionesGenerales, error: evalError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select(`
        id,
        calificacion_promedio,
        fecha_creacion,
        grupos:grupos(
          curso_id,
          cursos:cursos(
            carrera_id,
            carreras:carreras(
              id,
              nombre
            )
          )
        )
      `)

    if (evalError) {
      console.error('❌ Error obteniendo evaluaciones generales:', evalError)
      return res.status(500).json({ error: 'Error obteniendo evaluaciones', details: evalError })
    }

    // Procesar datos por carrera
    const resultadosPorCarrera = carreras.map(carrera => {
      // TODO: Corregir consulta SQL para evitar errores de TypeScript
      const evaluacionesCarrera: any[] = [] // evaluacionesGenerales?.filter(evaluacion => 
        // evaluacion.grupos?.cursos?.carrera_id === carrera.id
      // ) || []

      const calificaciones = evaluacionesCarrera.map(evaluacion => evaluacion.calificacion_promedio).filter(c => c !== null)
      const promedioCarrera = calificaciones.length > 0 
        ? calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length 
        : 0

      return {
        carrera_id: carrera.id,
        carrera_nombre: carrera.nombre,
        carrera_codigo: carrera.codigo,
        total_evaluaciones: evaluacionesCarrera.length,
        calificacion_promedio: promedioCarrera,
        profesores_evaluados: 0, // TODO: Corregir consulta SQL
        ultima_evaluacion: evaluacionesCarrera.length > 0 
          ? Math.max(...evaluacionesCarrera.map(evaluacion => new Date(evaluacion.fecha_creacion).getTime()))
          : null
      }
    })

    // Estadísticas generales
    const totalEvaluaciones = evaluacionesGenerales?.length || 0
    const calificacionesGenerales = evaluacionesGenerales?.map(evaluacion => evaluacion.calificacion_promedio).filter(c => c !== null) || []
    const promedioGeneral = calificacionesGenerales.length > 0 
      ? calificacionesGenerales.reduce((sum, cal) => sum + cal, 0) / calificacionesGenerales.length 
      : 0

    const resultado = {
      periodo: '2025-2', // TODO: Hacer dinámico
      estadisticas_generales: {
        total_carreras: carreras.length,
        total_evaluaciones: totalEvaluaciones,
        promedio_general: promedioGeneral,
        carreras_con_evaluaciones: resultadosPorCarrera.filter(r => r.total_evaluaciones > 0).length
      },
      resultados_por_carrera: resultadosPorCarrera,
      fecha_generacion: new Date().toISOString()
    }

    console.log('✅ Resultados globales generados:', resultado.estadisticas_generales)
    res.json(resultado)

  } catch (error) {
    console.error('❌ Error en /teachers/career-results/all:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/career-results/:careerId - Obtener resultados para una carrera específica
router.get('/career-results/:careerId', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { careerId } = req.params

    // Verificar que el usuario sea decano
    if (!user.roles?.includes('decano')) {
      return res.status(403).json({ error: 'Acceso denegado. Solo decanos pueden acceder a estos resultados.' })
    }

    console.log(`🔍 Obteniendo resultados para carrera ${careerId}...`)

    // Obtener información de la carrera
    const { data: carrera, error: carreraError } = await SupabaseDB.supabaseAdmin
      .from('carreras')
      .select(`
        id,
        nombre,
        codigo,
            activa,
        descripcion
      `)
      .eq('id', careerId)
      .single()

    if (carreraError) {
      console.error('❌ Error obteniendo carrera:', carreraError)
      return res.status(404).json({ error: 'Carrera no encontrada', details: carreraError })
    }

    // Obtener profesores de la carrera
    const { data: profesores, error: profesoresError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select(`
        id,
        usuario_id,
        codigo_profesor,
        activa,
        carrera_id,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email
        )
      `)
      .eq('activo', true)

    if (profesoresError) {
      console.error('❌ Error obteniendo profesores:', profesoresError)
      return res.status(500).json({ error: 'Error obteniendo profesores', details: profesoresError })
    }

    // Obtener evaluaciones de la carrera
    const { data: evaluaciones, error: evaluacionesError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select(`
        id,
        calificacion_promedio,
        fecha_creacion,
        comentarios,
        profesor_id,
        grupos:grupos(
          curso_id,
          cursos:cursos(
            id,
            nombre,
            codigo,
            carrera_id,
            carreras:carreras(
              id,
              nombre
            )
          )
        )
      `)
      .eq('grupos.cursos.carrera_id', careerId)

    if (evaluacionesError) {
      console.error('❌ Error obteniendo evaluaciones:', evaluacionesError)
      return res.status(500).json({ error: 'Error obteniendo evaluaciones', details: evaluacionesError })
    }

    // Procesar datos por profesor
    const profesoresConResultados = profesores.map(profesor => {
      const evaluacionesProfesor = evaluaciones?.filter(evaluacion => 
        evaluacion.profesor_id === profesor.id
      ) || []

      const calificaciones = evaluacionesProfesor.map(evaluacion => evaluacion.calificacion_promedio).filter(c => c !== null)
      const promedioProfesor = calificaciones.length > 0 
        ? calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length 
        : 0

      // TODO: Corregir consulta SQL para evitar errores de TypeScript
      const cursosEvaluados: any[] = [] // evaluacionesProfesor.map(evaluacion => ({
        // curso_id: evaluacion.grupos?.cursos?.id,
        // curso_nombre: evaluacion.grupos?.cursos?.nombre,
        // curso_codigo: evaluacion.grupos?.cursos?.codigo,
        // calificacion: evaluacion.calificacion_promedio,
        // fecha_evaluacion: evaluacion.fecha_creacion
      // }))

      return {
        profesor_id: profesor.id,
        profesor_nombre: 'Profesor', // TODO: Corregir consulta SQL
        profesor_email: 'email@ejemplo.com', // TODO: Corregir consulta SQL
        total_evaluaciones: evaluacionesProfesor.length,
        calificacion_promedio: promedioProfesor,
        cursos_evaluados: cursosEvaluados,
        ultima_evaluacion: evaluacionesProfesor.length > 0 
          ? Math.max(...evaluacionesProfesor.map(evaluacion => new Date(evaluacion.fecha_creacion).getTime()))
          : null
      }
    })

    // Estadísticas de la carrera
    const totalEvaluaciones = evaluaciones?.length || 0
    const calificacionesGenerales = evaluaciones?.map(evaluacion => evaluacion.calificacion_promedio).filter(c => c !== null) || []
    const promedioGeneral = calificacionesGenerales.length > 0 
      ? calificacionesGenerales.reduce((sum, cal) => sum + cal, 0) / calificacionesGenerales.length 
      : 0

    const resultado = {
      carrera: {
        id: carrera.id,
        nombre: carrera.nombre,
        codigo: carrera.codigo,
        descripcion: carrera.descripcion,
        activa: carrera.activa
      },
      periodo: '2025-2', // TODO: Hacer dinámico
      estadisticas_carrera: {
        total_profesores: profesores.length,
        profesores_evaluados: profesoresConResultados.filter(p => p.total_evaluaciones > 0).length,
        total_evaluaciones: totalEvaluaciones,
        promedio_general: promedioGeneral,
        cursos_evaluados: 0 // TODO: Corregir consulta SQL
      },
      profesores: profesoresConResultados,
      fecha_generacion: new Date().toISOString()
    }

    console.log(`✅ Resultados de carrera ${carrera.nombre} generados:`, resultado.estadisticas_carrera)
    res.json(resultado)

  } catch (error) {
    console.error('❌ Error en /teachers/career-results/:careerId:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /teachers/student-stats - Obtener estadísticas del estudiante
router.get('/student-stats', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    
    console.log('🔍 Backend: Getting student stats for user:', user.id);

    // Verificar que el usuario es un estudiante
    if (user.tipo_usuario !== 'estudiante') {
      return res.status(403).json({ error: 'Solo los estudiantes pueden acceder a estas estadísticas' })
    }

    // Obtener el ID del estudiante
    const { data: estudiante, error: estudianteError } = await SupabaseDB.supabaseAdmin
      .from('estudiantes')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (estudianteError || !estudiante) {
      console.log('❌ Backend: Error finding student:', estudianteError);
      return res.status(404).json({ error: 'Estudiante no encontrado' })
    }

    console.log('✅ Backend: Estudiante found:', estudiante);

    // Obtener evaluaciones completadas
    const { data: evaluacionesCompletadas, error: completadasError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select('id, calificacion_promedio')
      .eq('estudiante_id', estudiante.id)
      .eq('completada', true)

    if (completadasError) {
      console.log('❌ Backend: Error getting completed evaluations:', completadasError);
    }

    // Obtener materias matriculadas (grupos donde está inscrito)
    const { data: materiasMatriculadas, error: materiasError } = await SupabaseDB.supabaseAdmin
      .from('inscripciones')
      .select(`
        id,
        grupo:grupos(
          id,
          numero_grupo,
          curso:cursos(
            id,
            nombre,
            codigo
          )
        )
      `)
      .eq('estudiante_id', estudiante.id)
      .eq('activa', true)

    if (materiasError) {
      console.log('❌ Backend: Error getting enrolled subjects:', materiasError);
    }

    // Calcular promedio general
    const promedioGeneral = evaluacionesCompletadas && evaluacionesCompletadas.length > 0
      ? evaluacionesCompletadas.reduce((sum, e) => sum + (e.calificacion_promedio || 0), 0) / evaluacionesCompletadas.length
      : 0

    // Calcular estadísticas según la lógica correcta:
    // 1. Materias matriculadas = contar inscripciones activas
    // 2. Evaluaciones completadas = contar evaluaciones completadas
    // 3. Evaluaciones pendientes = materias matriculadas - evaluaciones completadas
    const materiasMatriculadasCount = materiasMatriculadas?.length || 0
    const evaluacionesCompletadasCount = evaluacionesCompletadas?.length || 0
    const evaluacionesPendientesCount = materiasMatriculadasCount - evaluacionesCompletadasCount

    const stats = {
      evaluacionesCompletadas: evaluacionesCompletadasCount,
      evaluacionesPendientes: Math.max(0, evaluacionesPendientesCount), // No puede ser negativo
      materiasMatriculadas: materiasMatriculadasCount,
      promedioGeneral: Number(promedioGeneral.toFixed(2)),
      progresoGeneral: materiasMatriculadasCount > 0 
        ? Math.round((evaluacionesCompletadasCount / materiasMatriculadasCount) * 100)
        : 0
    }

    console.log('✅ Backend: Student stats calculated:', {
      materiasMatriculadasCount,
      evaluacionesCompletadasCount,
      evaluacionesPendientesCount,
      promedioGeneral,
      progresoGeneral: materiasMatriculadasCount > 0 
        ? Math.round((evaluacionesCompletadasCount / materiasMatriculadasCount) * 100)
        : 0,
      stats
    });

    res.json(stats)
  } catch (error) {
    console.error('❌ Backend: Error getting student stats:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/student-enrolled-subjects - Obtener materias matriculadas del estudiante
router.get('/student-enrolled-subjects', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    
    console.log('🔍 Backend: Getting enrolled subjects for user:', user.id);

    // Verificar que el usuario es un estudiante
    if (user.tipo_usuario !== 'estudiante') {
      return res.status(403).json({ error: 'Solo los estudiantes pueden acceder a esta información' })
    }

    // Obtener el ID del estudiante
    const { data: estudiante, error: estudianteError } = await SupabaseDB.supabaseAdmin
      .from('estudiantes')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (estudianteError || !estudiante) {
      console.log('❌ Backend: Error finding student:', estudianteError);
      return res.status(404).json({ error: 'Estudiante no encontrado' })
    }

    // Obtener materias matriculadas con información detallada
    const { data: inscripciones, error: inscripcionesError } = await SupabaseDB.supabaseAdmin
      .from('inscripciones')
      .select(`
        id,
        fecha_inscripcion,
        grupo:grupos(
          id,
          numero_grupo,
          horario,
          aula,
          curso:cursos(
            id,
            nombre,
            codigo,
            creditos
          ),
          asignaciones_profesor:asignaciones_profesor(
            profesor:profesores(
              id,
              usuario:usuarios(
                nombre,
                apellido
              )
            )
          ),
          periodo:periodos_academicos(
            id,
            nombre,
            codigo
          )
        )
      `)
      .eq('estudiante_id', estudiante.id)
      .eq('activa', true)
      .order('fecha_inscripcion', { ascending: false })

    if (inscripcionesError) {
      console.log('❌ Backend: Error getting enrollments:', inscripcionesError);
      return res.status(500).json({ error: 'Error al obtener materias matriculadas', details: inscripcionesError.message })
    }

    // Formatear los datos
    const materiasMatriculadas = inscripciones?.map((inscripcion: any) => ({
      id: inscripcion.id,
      fechaInscripcion: inscripcion.fecha_inscripcion,
      grupo: {
        id: inscripcion.grupo?.id,
        numeroGrupo: inscripcion.grupo?.numero_grupo,
        horario: inscripcion.grupo?.horario,
        aula: inscripcion.grupo?.aula,
        curso: {
          id: inscripcion.grupo?.curso?.id,
          nombre: inscripcion.grupo?.curso?.nombre,
          codigo: inscripcion.grupo?.curso?.codigo,
          creditos: inscripcion.grupo?.curso?.creditos
        },
        profesor: {
          id: inscripcion.grupo?.asignaciones_profesor?.[0]?.profesor?.id,
          nombre: `${inscripcion.grupo?.asignaciones_profesor?.[0]?.profesor?.usuario?.nombre || ''} ${inscripcion.grupo?.asignaciones_profesor?.[0]?.profesor?.usuario?.apellido || ''}`.trim()
        },
        periodo: {
          id: inscripcion.grupo?.periodo?.id,
          nombre: inscripcion.grupo?.periodo?.nombre,
          codigo: inscripcion.grupo?.periodo?.codigo
        }
      }
    })).filter((materia: any) => materia.grupo?.curso?.id) || []

    console.log('✅ Backend: Enrolled subjects found:', materiasMatriculadas.length);

    res.json({
      materiasMatriculadas,
      total: materiasMatriculadas.length
    })
  } catch (error) {
    console.error('❌ Backend: Error getting enrolled subjects:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/teacher-stats - Obtener estadísticas del profesor
router.get('/teacher-stats/:teacherId', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { teacherId } = req.params
    
    console.log('🔍 Backend: Getting teacher stats for teacher ID:', teacherId);

    // Verificar que el usuario es un profesor
    if (user.tipo_usuario !== 'profesor') {
      return res.status(403).json({ error: 'Solo los profesores pueden acceder a estas estadísticas' })
    }

    // Obtener el ID del profesor
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .eq('id', teacherId)
      .single()

    if (profesorError || !profesor) {
      console.log('❌ Backend: Error finding teacher, returning mock data:', profesorError);
      
      // Retornar datos de ejemplo si el profesor no existe
      const mockStats = {
        calificacionPromedio: 0,
        totalEvaluaciones: 0,
        cursosImpartidos: 0,
        evaluacionesPorCurso: [],
        isMockData: true,
        debug: { 
          teacherId, 
          error: profesorError 
        }
      };
      
      console.log('✅ Backend: Returning mock teacher stats:', mockStats);
      return res.json(mockStats);
    }

    console.log('✅ Backend: Profesor found:', profesor);

    // Obtener evaluaciones completadas del profesor
    const { data: evaluacionesCompletadas, error: completadasError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select('id, calificacion_promedio')
      .eq('profesor_id', profesor.id)
      .eq('completada', true)

    if (completadasError) {
      console.log('❌ Backend: Error getting completed evaluations:', completadasError);
    }

    // Obtener cursos impartidos por el profesor
    const { data: cursosImpartidos, error: cursosError } = await SupabaseDB.supabaseAdmin
      .from('asignaciones_profesor')
      .select(`
        id,
        curso:cursos(
          id,
          nombre,
          codigo
        )
      `)
      .eq('profesor_id', profesor.id)
      .eq('activa', true)

    if (cursosError) {
      console.log('❌ Backend: Error getting teacher courses:', cursosError);
    }

    // Calcular promedio general
    const promedioGeneral = evaluacionesCompletadas && evaluacionesCompletadas.length > 0
      ? evaluacionesCompletadas.reduce((sum, e) => sum + (e.calificacion_promedio || 0), 0) / evaluacionesCompletadas.length
      : 0

    // Obtener evaluaciones por curso
    const evaluacionesPorCurso = cursosImpartidos?.map((asignacion: any) => {
      const evaluacionesDelCurso = evaluacionesCompletadas?.filter((e: any) => 
        // Aquí necesitaríamos una relación para obtener el curso de cada evaluación
        // Por ahora usamos datos básicos
        true
      ) || []

      return {
        curso_id: asignacion.curso?.id,
        nombre: asignacion.curso?.nombre,
        codigo: asignacion.curso?.codigo,
        total: evaluacionesDelCurso.length,
        promedio: evaluacionesDelCurso.length > 0 
          ? evaluacionesDelCurso.reduce((sum: number, e: any) => sum + (e.calificacion_promedio || 0), 0) / evaluacionesDelCurso.length
          : 0
      }
    }) || []

    const stats = {
      calificacionPromedio: Number(promedioGeneral.toFixed(2)),
      totalEvaluaciones: evaluacionesCompletadas?.length || 0,
      cursosImpartidos: cursosImpartidos?.length || 0,
      evaluacionesPorCurso: evaluacionesPorCurso
    }

    console.log('✅ Backend: Teacher stats calculated:', stats);

    res.json(stats)
  } catch (error) {
    console.error('❌ Backend: Error getting teacher stats:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/teacher-courses - Obtener cursos del profesor
router.get('/teacher-courses/:teacherId', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { teacherId } = req.params
    
    console.log('🔍 Backend: Getting teacher courses for teacher ID:', teacherId);

    // Verificar que el usuario es un profesor
    if (user.tipo_usuario !== 'profesor') {
      return res.status(403).json({ error: 'Solo los profesores pueden acceder a estos datos' })
    }

    // Obtener cursos del profesor con información detallada
    const { data: cursos, error: cursosError } = await SupabaseDB.supabaseAdmin
      .from('asignaciones_profesor')
      .select(`
        id,
        curso:cursos(
          id,
          nombre,
          codigo,
          creditos
        ),
        grupo:grupos(
          id,
          numero_grupo,
          horario,
          aula,
          periodo:periodos_academicos(
            id,
            nombre,
            codigo
          )
        )
      `)
      .eq('profesor_id', teacherId)
      .eq('activa', true)

    if (cursosError) {
      console.log('❌ Backend: Error getting teacher courses:', cursosError);
      return res.status(500).json({ error: 'Error al obtener cursos del profesor', details: cursosError.message })
    }

    // Formatear los datos
    const cursosFormateados = cursos?.map((asignacion: any) => ({
      id: asignacion.id,
      curso: {
        id: asignacion.curso?.id,
        nombre: asignacion.curso?.nombre,
        codigo: asignacion.curso?.codigo,
        creditos: asignacion.curso?.creditos
      },
      grupo: {
        id: asignacion.grupo?.id,
        numeroGrupo: asignacion.grupo?.numero_grupo,
        horario: asignacion.grupo?.horario,
        aula: asignacion.grupo?.aula,
        periodo: {
          id: asignacion.grupo?.periodo?.id,
          nombre: asignacion.grupo?.periodo?.nombre,
          codigo: asignacion.grupo?.periodo?.codigo
        }
      }
    })).filter((curso: any) => curso.curso?.id) || []

    console.log('✅ Backend: Teacher courses found:', cursosFormateados.length);

    res.json(cursosFormateados)
  } catch (error) {
    console.error('❌ Backend: Error getting teacher courses:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/teacher-id - Obtener ID del profesor desde el usuario autenticado
router.get('/teacher-id', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    
    console.log('🔍 Backend: Getting teacher ID for user:', user.id);

    // Verificar que el usuario es un profesor
    if (user.tipo_usuario !== 'profesor') {
      return res.status(403).json({ error: 'Solo los profesores pueden acceder a este endpoint' })
    }

    // Obtener el ID del profesor
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (profesorError || !profesor) {
      console.log('❌ Backend: Error finding teacher:', profesorError);
      return res.status(404).json({ error: 'Profesor no encontrado' })
    }

    console.log('✅ Backend: Teacher ID found:', profesor.id);

    res.json({ teacherId: profesor.id })
  } catch (error) {
    console.error('❌ Backend: Error getting teacher ID:', error)
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/period-stats?period=YYYY-1|YYYY-2 - Estadísticas filtradas por período (cards y tablas)
router.get('/period-stats', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { period } = req.query

    if (user.tipo_usuario !== 'profesor') {
      return res.status(403).json({ error: 'Solo los profesores pueden acceder a estas estadísticas' })
    }

    // Obtener ID del profesor por usuario autenticado
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (profesorError || !profesor) {
      return res.status(404).json({ error: 'Profesor no encontrado' })
    }

    // Rango de fechas del período
    let dateFilter: { gte?: string; lte?: string } = {}
    if (period) {
      const [year, semester] = String(period).split('-')
      const startDate = `${year}-${semester === '1' ? '01' : '07'}-01`
      const endDate = `${year}-${semester === '1' ? '06-30' : '12-31'}`
      dateFilter = { gte: startDate, lte: endDate }
    }

    // Evaluaciones del período para este profesor
    const { data: evaluaciones, error: evaluacionesError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select('id, calificacion_promedio, fecha_creacion, grupo_id')
      .eq('profesor_id', profesor.id)
      .eq('completada', true)
      .gte('fecha_creacion', dateFilter.gte || '2020-01-01')
      .lte('fecha_creacion', dateFilter.lte || '2030-12-31')

    if (evaluacionesError) {
      return res.status(500).json({ error: 'Error consultando evaluaciones del período', details: evaluacionesError })
    }

    const totalEvaluaciones = evaluaciones?.length || 0
    const calificacionPromedio = totalEvaluaciones > 0
      ? ((evaluaciones as any[]) || []).reduce((sum: number, e: any) => sum + (e.calificacion_promedio || 0), 0) / totalEvaluaciones
      : 0

    // Obtener info de cursos via grupos
    const evalsArray: any[] = Array.isArray(evaluaciones) ? (evaluaciones as any[]) : []
    const gruposIds = Array.from(new Set(evalsArray.map((e: any) => e.grupo_id).filter(Boolean)))
    const { data: periodGrupos } = await SupabaseDB.supabaseAdmin
      .from('grupos')
      .select('id, curso_id')
      .in('id', gruposIds.length ? gruposIds : [-1])
    const grupoToCurso: any = {}
    ;(Array.isArray(periodGrupos) ? periodGrupos : []).forEach((g: any) => { grupoToCurso[g.id] = g.curso_id })

    const periodCursoIds = Array.from(new Set(((Array.isArray(periodGrupos) ? periodGrupos : []).map((g: any) => g.curso_id)).filter(Boolean)))
    const { data: periodCursos } = await SupabaseDB.supabaseAdmin
      .from('cursos')
      .select('id,nombre,codigo')
      .in('id', periodCursoIds.length ? periodCursoIds : [-1])
    const periodCursoMap: any = {}
    const periodCursosArray: any[] = Array.isArray(periodCursos) ? periodCursos as any[] : []
    periodCursosArray.forEach((c: any) => { periodCursoMap[c.id] = c })

    const evaluacionesPorCursoMap: any = {}
    evalsArray.forEach((e: any) => {
      const cursoId = grupoToCurso[e.grupo_id]
      const nombre = periodCursoMap[cursoId]?.nombre || 'Curso'
      const key = `${cursoId}-${nombre}`
      if (!evaluacionesPorCursoMap[key]) {
        evaluacionesPorCursoMap[key] = {
          curso_id: cursoId,
          nombre,
          codigo: periodCursoMap[cursoId]?.codigo || 'N/A',
          total: 0,
          promedio: 0,
          _sum: 0,
        }
      }
      evaluacionesPorCursoMap[key].total += 1
      evaluacionesPorCursoMap[key]._sum += (e.calificacion_promedio || 0)
    })

    const evaluacionesPorCurso: any[] = []
    for (const key in evaluacionesPorCursoMap) {
      const c = evaluacionesPorCursoMap[key]
      evaluacionesPorCurso.push({
        curso_id: c.curso_id,
        nombre: c.nombre,
        codigo: c.codigo,
        total: c.total,
        promedio: c.total > 0 ? Number((c._sum / c.total).toFixed(2)) : 0,
      })
    }

    // Cursos impartidos activos (no necesariamente filtrados por periodo)
    const { data: cursosImpartidos } = await SupabaseDB.supabaseAdmin
      .from('asignaciones_profesor')
      .select('id')
      .eq('profesor_id', profesor.id)
      .eq('activa', true)

    const stats = {
      totalEvaluaciones,
      calificacionPromedio: Number(calificacionPromedio.toFixed(2)),
      totalCursos: cursosImpartidos?.length || 0,
      evaluacionesPorCurso,
      period: period || 'all'
    }

    return res.json(stats)
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/period-category-stats?period=YYYY-X&courseId=NN
// Promedios por categoría a partir de respuestas_evaluacion
router.get('/period-category-stats', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { period, courseId } = req.query

    if (user.tipo_usuario !== 'profesor') {
      return res.status(403).json({ error: 'Solo los profesores pueden acceder a estas estadísticas' })
    }

    // 1) Profesor
    const { data: profesor, error: profesorError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .eq('usuario_id', user.id)
      .single()
    if (profesorError || !profesor) {
      return res.status(404).json({ error: 'Profesor no encontrado' })
    }

    // 2) Rango de fechas del período
    let dateFilter: { gte?: string; lte?: string } = {}
    if (period) {
      const [year, semester] = String(period).split('-')
      const startDate = `${year}-${semester === '1' ? '01' : '07'}-01`
      const endDate = `${year}-${semester === '1' ? '06-30' : '12-31'}`
      dateFilter = { gte: startDate, lte: endDate }
    }

    // 3) Evaluaciones del período del profesor
    const { data: evaluaciones, error: evalError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select('id, grupo_id, fecha_creacion')
      .eq('profesor_id', profesor.id)
      .eq('completada', true)
      .gte('fecha_creacion', dateFilter.gte || '2020-01-01')
      .lte('fecha_creacion', dateFilter.lte || '2030-12-31')
    if (evalError) {
      return res.status(500).json({ error: 'Error obteniendo evaluaciones', details: evalError })
    }

    let evalsArray: any[] = Array.isArray(evaluaciones) ? evaluaciones as any[] : []

    // 3.1) Si viene courseId, filtrar las evaluaciones por curso vía grupo_id -> grupos.curso_id
    if (courseId && evalsArray.length > 0) {
      const grupoIds = Array.from(new Set(evalsArray.map((e: any) => e.grupo_id).filter(Boolean)))
      const { data: grupos } = await SupabaseDB.supabaseAdmin
        .from('grupos')
        .select('id, curso_id')
        .in('id', grupoIds.length ? grupoIds : [-1])
      const grupoToCurso: any = {}
      ;(Array.isArray(grupos) ? grupos : []).forEach((g: any) => { grupoToCurso[g.id] = g.curso_id })
      evalsArray = evalsArray.filter((e: any) => String(grupoToCurso[e.grupo_id]) === String(courseId))
    }

    const evaluacionIds = Array.from(new Set(evalsArray.map((e: any) => e.id)))
    if (evaluacionIds.length === 0) {
      return res.json([])
    }

    // 4) Respuestas por evaluación (valor por pregunta)
    const { data: respuestas, error: respError } = await SupabaseDB.supabaseAdmin
      .from('respuestas_evaluacion')
      .select('evaluacion_id, pregunta_id, valor')
      .in('evaluacion_id', evaluacionIds)
    if (respError) {
      return res.status(500).json({ error: 'Error obteniendo respuestas', details: respError })
    }

    const preguntaIds = Array.from(new Set(((respuestas as any[]) || []).map((r: any) => r.pregunta_id)))
    if (preguntaIds.length === 0) {
      return res.json([])
    }

    // 5) Mapeo pregunta -> categoria_id
    const { data: catPreg, error: catPregError } = await SupabaseDB.supabaseAdmin
      .from('categorias_preguntas')
      .select('id, categoria_id')
      .in('id', preguntaIds)
    if (catPregError) {
      return res.status(500).json({ error: 'Error obteniendo categorías de preguntas', details: catPregError })
    }
    const preguntaToCategoria: any = {}
    ;(Array.isArray(catPreg) ? catPreg : []).forEach((cp: any) => { preguntaToCategoria[cp.id] = cp.categoria_id })

    // 6) Info de categorías
    const categoriaIds = Array.from(new Set(((catPreg as any[]) || []).map((cp: any) => cp.categoria_id).filter(Boolean)))
    const { data: categorias } = await SupabaseDB.supabaseAdmin
      .from('categorias')
      .select('id, nombre')
      .in('id', categoriaIds.length ? categoriaIds : [-1])
    const categoriaInfo: any = {}
    ;(Array.isArray(categorias) ? categorias : []).forEach((c: any) => { categoriaInfo[c.id] = c.nombre })

    // 7) Agregar promedios por categoría
    const acumulado: any = {}
    ;(Array.isArray(respuestas) ? respuestas as any[] : []).forEach((r: any) => {
      const catId = preguntaToCategoria[r.pregunta_id]
      if (!catId) return
      if (!acumulado[catId]) acumulado[catId] = { sum: 0, count: 0 }
      acumulado[catId].sum += (r.valor || 0)
      acumulado[catId].count += 1
    })

    const result = Object.keys(acumulado).map((catId: any) => ({
      categoriaId: Number(catId),
      nombre: categoriaInfo[catId] || `Categoría ${catId}`,
      promedio: acumulado[catId].count > 0 ? Number((acumulado[catId].sum / acumulado[catId].count).toFixed(2)) : 0
    }))

    return res.json(result)
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

// GET /teachers/debug-professors - Endpoint temporal para debug
router.get('/debug-professors', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    console.log('🔍 Debug: User info:', { id: user.id, tipo: user.tipo_usuario });
    
    // Obtener todos los profesores
    const { data: todosProfesores, error: todosError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id, activo, usuario_id, usuario:usuarios(nombre, apellido, email)')
      .limit(10)
    
    console.log('🔍 Debug: Todos los profesores:', { todosProfesores, todosError });
    
    // Buscar el profesor específico que está fallando
    const { data: profesorEspecifico, error: profError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id, activo, usuario_id, usuario:usuarios(nombre, apellido, email)')
      .eq('id', '8c1f98db-6722-4aac-ad68-2a368b6324d4')
      .single()
    
    console.log('🔍 Debug: Profesor específico:', { profesorEspecifico, profError });
    
    res.json({
      user: { id: user.id, tipo: user.tipo_usuario },
      todosProfesores: todosProfesores || [],
      profesorEspecifico: profesorEspecifico || null,
      error: profError
    })
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: (error as any)?.message || String(error) })
  }
})

export default router
