import { Router } from 'express'
import { SupabaseDB } from '../config/supabase-only'
import { authenticateToken } from '../middleware/auth'

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

    // Buscar grupos del curso (sin filtrar por activo ya que la tabla no tiene esa columna)
    const { data: grupos, error: gruposError } = await SupabaseDB.supabaseAdmin
      .from('grupos')
      .select('id, numero_grupo, horario, aula')
      .eq('curso_id', courseId)

    console.log('🔍 Backend: Query grupos result:', { grupos, gruposError });

    if (gruposError) {
      console.error('❌ Backend: Error consultando grupos:', gruposError)
      return res.status(500).json({ error: 'Error consultando grupos', details: gruposError })
    }

    // Para estudiantes, mostrar TODOS los grupos del curso para que puedan elegir
    // (no filtrar por inscripciones, ya que pueden estar evaluando a cualquier grupo del profesor)
    let gruposFiltrados = grupos || []
    
    console.log('🔍 Backend: User type:', user?.tipo_usuario);
    console.log('🔍 Backend: All groups found for course:', grupos);
    
    // Por ahora, devolver todos los grupos del curso sin filtrar
    // Esto permite al estudiante elegir cualquier grupo del profesor para evaluar
    gruposFiltrados = grupos || []
    
    console.log('🔍 Backend: Final groups to return:', gruposFiltrados);

    console.log('✅ Backend: Final response:', gruposFiltrados);
    res.json(gruposFiltrados)
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

    // Obtener todas las evaluaciones del profesor
    const { data: evaluaciones, error: evaluacionesError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select(`
        id,
        calificacion_general,
        fecha_evaluacion,
        curso_id,
        grupo_id,
        estudiante_id,
        cursos!inner(nombre, codigo),
        grupos(numero_grupo)
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
      ? evaluaciones.reduce((sum, evaluacion) => sum + (evaluacion.calificacion_general || 0), 0) / totalEvaluaciones
      : 0

    // Obtener cursos únicos evaluados
    const cursosUnicos = new Set(evaluaciones?.map(e => e.curso_id) || [])
    const totalCursos = cursosUnicos.size

    // Obtener estudiantes únicos que han evaluado
    const estudiantesUnicos = new Set(evaluaciones?.map(e => e.estudiante_id) || [])
    const totalEstudiantes = estudiantesUnicos.size

    // Obtener evaluaciones por curso
    const evaluacionesPorCurso = evaluaciones?.reduce((acc, evaluacion) => {
      const cursoData = evaluacion.cursos as any
      const cursoNombre = cursoData?.nombre || 'Curso desconocido'
      const cursoCodigo = cursoData?.codigo || 'N/A'
      const cursoKey = `${evaluacion.curso_id}-${cursoNombre}`
      if (!acc[cursoKey]) {
        acc[cursoKey] = {
          curso_id: evaluacion.curso_id,
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
      const suma = curso.evaluaciones.reduce((sum: number, evaluacion: any) => sum + (evaluacion.calificacion_general || 0), 0)
      curso.promedio = curso.total > 0 ? Number((suma / curso.total).toFixed(2)) : 0
    })

    // Obtener evaluaciones recientes (últimas 5)
    const evaluacionesRecientes = evaluaciones
      ?.sort((a, b) => new Date(b.fecha_evaluacion).getTime() - new Date(a.fecha_evaluacion).getTime())
      ?.slice(0, 5)
      ?.map(evaluacion => {
        const cursoData = evaluacion.cursos as any
        const grupoData = evaluacion.grupos as any
        
        return {
          id: evaluacion.id,
          curso: cursoData?.nombre || 'Curso desconocido',
          codigo: cursoData?.codigo || 'N/A',
          grupo: grupoData?.numero_grupo || 'N/A',
          calificacion: evaluacion.calificacion_general,
          fecha: evaluacion.fecha_evaluacion
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

    // Construir filtro de fecha basado en el período
    let dateFilter: { gte?: string; lte?: string } = {}
    if (period) {
      const [year, semester] = period.split('-')
      const startDate = `${year}-${semester === '1' ? '01' : '07'}-01`
      const endDate = `${year}-${semester === '1' ? '06' : '12'}-31`
      
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
        calificacion_general,
        fecha_evaluacion,
        curso_id,
        grupo_id,
        estudiante_id,
        cursos!inner(nombre, codigo),
        grupos(numero_grupo)
      `)
      .eq('profesor_id', profesorId)
      .gte('fecha_evaluacion', dateFilter.gte || '2020-01-01')
      .lte('fecha_evaluacion', dateFilter.lte || '2030-12-31')

    console.log('🔍 Backend: Evaluaciones found for period:', evaluaciones?.length || 0);

    if (evaluacionesError) {
      console.error('❌ Backend: Error consultando evaluaciones históricas:', evaluacionesError)
      return res.status(500).json({ error: 'Error consultando evaluaciones históricas', details: evaluacionesError })
    }

    // Calcular estadísticas históricas
    const totalEvaluaciones = evaluaciones?.length || 0
    const calificacionPromedio = totalEvaluaciones > 0 
      ? evaluaciones.reduce((sum, evaluacion) => sum + (evaluacion.calificacion_general || 0), 0) / totalEvaluaciones
      : 0

    // Obtener cursos únicos evaluados en este período
    const cursosUnicos = new Set(evaluaciones?.map(e => e.curso_id) || [])
    const totalCursos = cursosUnicos.size

    // Obtener estudiantes únicos que han evaluado en este período
    const estudiantesUnicos = new Set(evaluaciones?.map(e => e.estudiante_id) || [])
    const totalEstudiantes = estudiantesUnicos.size

    // Obtener evaluaciones por curso para este período
    const evaluacionesPorCurso = evaluaciones?.reduce((acc, evaluacion) => {
      const cursoData = evaluacion.cursos as any
      const cursoNombre = cursoData?.nombre || 'Curso desconocido'
      const cursoCodigo = cursoData?.codigo || 'N/A'
      const cursoKey = `${evaluacion.curso_id}-${cursoNombre}`
      if (!acc[cursoKey]) {
        acc[cursoKey] = {
          curso_id: evaluacion.curso_id,
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
      const suma = curso.evaluaciones.reduce((sum: number, evaluacion: any) => sum + (evaluacion.calificacion_general || 0), 0)
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

// POST /teachers/evaluations - Guardar evaluación de un profesor
router.post('/evaluations', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const {
      teacherId,
      courseId,
      groupId,
      answers,
      overallRating,
      comments
    } = req.body

    console.log('🔍 Backend: Saving evaluation:', {
      teacherId,
      courseId,
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
          responseData.calificacion = answer.rating;
        }

        // Manejar respuestas de texto
        if (answer.textAnswer !== null && answer.textAnswer !== undefined && answer.textAnswer.trim() !== '') {
          responseData.respuesta_texto = answer.textAnswer.trim();
        }

        return responseData;
      }).filter((response: any) => response.calificacion !== undefined || response.respuesta_texto !== undefined);

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

// GET /teachers/test - Endpoint de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Teachers endpoint working', timestamp: new Date().toISOString() })
})

// GET /teachers/by-career/:careerId - Obtener profesores por carrera (para coordinadores)
router.get('/by-career/:careerId', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    const { careerId } = req.params

    console.log('🔍 [/teachers/by-career] Request received', { userId: user?.id, careerId })

    // Verificar que el usuario sea coordinador
    if (!user.roles?.includes('coordinador') && user.tipo_usuario !== 'coordinador') {
      return res.status(403).json({ error: 'Acceso denegado. Solo coordinadores pueden ver esta información.' })
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

    // 2) Intentar traer asignaciones y cursos de estos profesores (si existen) para enriquecer la respuesta
    let asignaciones: any[] = []
    try {
      console.log('🔍 Buscando asignaciones en tabla asignaciones_profesor...')
      const resp = await SupabaseDB.supabaseAdmin
        .from('asignaciones_profesor')
        .select('id, profesor_id, curso_id, activo')
        .in('profesor_id', profesorIds.length ? profesorIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('activo', true)
      asignaciones = resp.data || []
      console.log('🔍 Respuesta de asignaciones_profesor:', resp)
      console.log('🔍 Error de asignaciones_profesor:', resp.error)
    } catch (e) {
      console.error('❌ Error en consulta de asignaciones_profesor:', e)
      // Si falla, continuar sin cursos
      asignaciones = []
    }

    console.log('🔎 Asignaciones cargadas:', asignaciones?.length || 0)
    console.log('🔎 Asignaciones encontradas:', asignaciones?.map(a => ({ profesor_id: a.profesor_id, curso_id: a.curso_id })))

    const cursoIds = Array.from(new Set((asignaciones || []).map((a: any) => a.curso_id).filter(Boolean)))
    console.log('🔍 IDs de cursos extraídos de asignaciones:', cursoIds)
    
    let cursos: any[] = []
    if (cursoIds.length > 0) {
      console.log('🔍 Buscando cursos en tabla cursos...')
      const { data: cursosData, error: cursosErr } = await SupabaseDB.supabaseAdmin
        .from('cursos')
        .select('id, nombre, codigo, carrera_id')
        .in('id', cursoIds)
      console.log('🔍 Respuesta de cursos:', { data: cursosData, error: cursosErr })
      if (!cursosErr) cursos = cursosData || []
      console.log('🔎 Cursos encontrados (sin filtrar por carrera):', cursos?.length || 0)
      console.log('🔎 Cursos encontrados:', cursos?.map(c => ({ id: c.id, nombre: c.nombre, carrera_id: c.carrera_id })))
    } else {
      console.log('⚠️ No hay cursoIds para buscar cursos')
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
      
      const cursosProf = asigns
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
        activo: p.activo,
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
      .select('id, nombre, codigo, activa')
      .eq('activa', true)
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

export default router
