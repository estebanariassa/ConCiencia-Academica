import { Router } from 'express'
import { SupabaseDB } from '../config/supabase-only'
import { authenticateToken } from '../middleware/auth'
import { RoleService } from '../services/roleService'

const router = Router()

/**
 * GET /coordinador/cursos-con-profesor
 * Lista grupos/cursos de la carrera del coordinador con nombre del profesor.
 * Solo coordinadores. Devuelve: { id, cursoNombre, cursoCodigo, grupo, profesorNombre }
 * (id = grupo.id para usar en batch de QRs)
 */
router.get('/cursos-con-profesor', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    if (!user?.roles?.includes('coordinador') && user?.tipo_usuario !== 'coordinador') {
      return res.status(403).json({ error: 'Solo coordinadores pueden acceder a esta información.' })
    }

    const coordinador = await RoleService.obtenerCoordinadorPorUsuario(user.id)
    if (!coordinador?.carrera_id) {
      return res.status(400).json({
        error: 'No se encontró carrera asociada al coordinador',
        details: 'El coordinador debe tener una carrera asignada.'
      })
    }

    const carreraId = coordinador.carrera_id

    // Cursos de la carrera
    const { data: cursos, error: cursosError } = await SupabaseDB.supabaseAdmin
      .from('cursos')
      .select('id, nombre, codigo')
      .eq('carrera_id', carreraId)
      .eq('activo', true)

    if (cursosError) {
      console.error('Error cursos por carrera:', cursosError)
      return res.status(500).json({ error: 'Error obteniendo cursos', details: cursosError.message })
    }

    const cursoIds = (cursos || []).map((c: any) => c.id).filter(Boolean)
    if (cursoIds.length === 0) {
      return res.json([])
    }

    // Grupos de esos cursos
    const { data: grupos, error: gruposError } = await SupabaseDB.supabaseAdmin
      .from('grupos')
      .select('id, curso_id, numero_grupo')
      .in('curso_id', cursoIds)
      .eq('activo', true)

    if (gruposError) {
      console.error('Error grupos:', gruposError)
      return res.status(500).json({ error: 'Error obteniendo grupos', details: gruposError.message })
    }

    const gruposList = grupos || []
    if (gruposList.length === 0) {
      return res.json([])
    }

    const grupoIds = gruposList.map((g: any) => g.id)
    const cursoById = new Map((cursos || []).map((c: any) => [c.id, c]))

    // Resolver profesor por grupo: asignaciones_profesor
    const { data: asignaciones, error: asigError } = await SupabaseDB.supabaseAdmin
      .from('asignaciones_profesor')
      .select('id, grupo_id, profesor_id, curso_id')
      .in('grupo_id', grupoIds)
      .eq('activa', true)

    if (asigError) {
      console.error('Error asignaciones_profesor:', asigError)
      return res.status(500).json({ error: 'Error obteniendo asignaciones', details: asigError.message })
    }

    const asignacionByGrupoId = new Map<number, any>()
    ;(asignaciones || []).forEach((a: any) => {
      asignacionByGrupoId.set(Number(a.grupo_id), a)
    })

    const profesorIds = Array.from(new Set((asignaciones || []).map((a: any) => a.profesor_id).filter(Boolean)))
    if (profesorIds.length === 0) {
      // Grupos sin asignación: devolver con profesor "Sin asignar"
      const result = gruposList.map((g: any) => {
        const curso = cursoById.get(g.curso_id)
        return {
          id: g.id,
          cursoNombre: curso?.nombre ?? 'Curso',
          cursoCodigo: curso?.codigo ?? '',
          grupo: String(g.numero_grupo ?? g.id),
          profesorNombre: 'Sin asignar'
        }
      })
      return res.json(result)
    }

    const { data: profesores, error: profError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id, usuario:usuarios(nombre, apellido)')
      .in('id', profesorIds)

    if (profError) {
      console.error('Error profesores:', profError)
    }

    const profesorById = new Map<string, string>()
    ;(profesores || []).forEach((p: any) => {
      const nombre = [p.usuario?.nombre, p.usuario?.apellido].filter(Boolean).join(' ').trim() || 'Docente'
      profesorById.set(p.id, nombre)
    })

    const result = gruposList.map((g: any) => {
      const curso = cursoById.get(g.curso_id)
      const asig = asignacionByGrupoId.get(g.id)
      const profesorNombre = asig ? (profesorById.get(asig.profesor_id) || 'Docente') : 'Sin asignar'
      return {
        id: g.id,
        cursoNombre: curso?.nombre ?? 'Curso',
        cursoCodigo: curso?.codigo ?? '',
        grupo: String(g.numero_grupo ?? g.id),
        profesorNombre
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Error GET /coordinador/cursos-con-profesor:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

/**
 * GET /coordinador/dashboard-summary
 * Resumen del dashboard del coordinador + listado paginado de docentes de su carrera.
 * Query:
 * - page: number (default 1)
 * - pageSize: number (default 8, max 50)
 * - search: string (opcional, filtra por nombre/apellido/email)
 */
router.get('/dashboard-summary', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    if (!user?.roles?.includes('coordinador') && user?.tipo_usuario !== 'coordinador') {
      return res.status(403).json({ error: 'Solo coordinadores pueden acceder a esta información.' })
    }

    const coordinador = await RoleService.obtenerCoordinadorPorUsuario(user.id)
    if (!coordinador?.carrera_id) {
      return res.status(400).json({
        error: 'No se encontró carrera asociada al coordinador',
        details: 'El coordinador debe tener una carrera asignada.'
      })
    }

    const carreraId = Number(coordinador.carrera_id)
    const page = Math.max(1, Number(req.query?.page || 1))
    const pageSize = Math.min(50, Math.max(1, Number(req.query?.pageSize || 8)))
    const search = String(req.query?.search || '').trim().toLowerCase()

    const { data: cursos, error: cursosError } = await SupabaseDB.supabaseAdmin
      .from('cursos')
      .select('id')
      .eq('carrera_id', carreraId)
      .eq('activo', true)

    if (cursosError) {
      console.error('Error obteniendo cursos por carrera:', cursosError)
      return res.status(500).json({ error: 'Error obteniendo cursos', details: cursosError.message })
    }

    const totalCursos = (cursos || []).length

    const { data: profesores, error: profesoresError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id, usuario_id, activo')
      .eq('carrera_id', carreraId)
      .eq('activo', true)

    if (profesoresError) {
      console.error('Error obteniendo profesores por carrera:', profesoresError)
      return res.status(500).json({ error: 'Error obteniendo profesores', details: profesoresError.message })
    }

    const profesoresList = profesores || []
    const totalProfesores = profesoresList.length
    const profesorIds = profesoresList.map((p: any) => p.id).filter(Boolean)

    if (profesorIds.length === 0) {
      return res.json({
        stats: {
          totalProfesores: 0,
          totalCursos,
          promedioEvaluaciones: 0,
          profesoresEnRiesgo: 0,
          totalEvaluaciones: 0
        },
        teachers: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 }
      })
    }

    const usuarioIds = profesoresList.map((p: any) => p.usuario_id).filter(Boolean)
    const { data: usuarios, error: usuariosError } = await SupabaseDB.supabaseAdmin
      .from('usuarios')
      .select('id, nombre, apellido, email')
      .in('id', usuarioIds)

    if (usuariosError) {
      console.error('Error obteniendo usuarios de profesores:', usuariosError)
      return res.status(500).json({ error: 'Error obteniendo usuarios', details: usuariosError.message })
    }

    const usuarioById = new Map<string, any>()
    ;(usuarios || []).forEach((u: any) => {
      usuarioById.set(String(u.id), u)
    })

    const { data: evaluaciones, error: evaluacionesError } = await SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select('profesor_id, calificacion_promedio, completada')
      .in('profesor_id', profesorIds)
      .eq('completada', true)

    if (evaluacionesError) {
      console.error('Error obteniendo evaluaciones de profesores:', evaluacionesError)
      return res.status(500).json({ error: 'Error obteniendo evaluaciones', details: evaluacionesError.message })
    }

    const aggByProfesor = new Map<string, { total: number; suma: number }>()
    let totalEvaluaciones = 0
    let sumaGlobal = 0
    ;(evaluaciones || []).forEach((e: any) => {
      const pid = String(e.profesor_id || '')
      const cal = Number(e.calificacion_promedio || 0)
      if (!pid || !Number.isFinite(cal) || cal <= 0) return
      const prev = aggByProfesor.get(pid) || { total: 0, suma: 0 }
      prev.total += 1
      prev.suma += cal
      aggByProfesor.set(pid, prev)

      totalEvaluaciones += 1
      sumaGlobal += cal
    })

    const merged = profesoresList.map((p: any) => {
      const u = usuarioById.get(String(p.usuario_id))
      const agg = aggByProfesor.get(String(p.id)) || { total: 0, suma: 0 }
      const promedio = agg.total > 0 ? Number((agg.suma / agg.total).toFixed(2)) : 0
      const nombreCompleto = `${u?.nombre || ''} ${u?.apellido || ''}`.trim() || 'Docente'
      return {
        profesorId: p.id,
        nombre: nombreCompleto,
        email: u?.email || '',
        totalEvaluaciones: agg.total,
        promedio
      }
    })

    const filtered = !search
      ? merged
      : merged.filter((t: any) =>
          `${t.nombre} ${t.email}`.toLowerCase().includes(search)
        )

    filtered.sort((a: any, b: any) => {
      if (a.promedio === 0 && b.promedio !== 0) return 1
      if (a.promedio !== 0 && b.promedio === 0) return -1
      if (a.promedio !== b.promedio) return a.promedio - b.promedio
      return String(a.nombre).localeCompare(String(b.nombre), 'es')
    })

    const total = filtered.length
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages)
    const from = (safePage - 1) * pageSize
    const to = from + pageSize
    const paged = filtered.slice(from, to)

    const profesoresEnRiesgo = merged.filter((t: any) => t.totalEvaluaciones > 0 && t.promedio < 4).length
    const promedioEvaluaciones = totalEvaluaciones > 0 ? Number((sumaGlobal / totalEvaluaciones).toFixed(2)) : 0

    res.json({
      stats: {
        totalProfesores,
        totalCursos,
        promedioEvaluaciones,
        profesoresEnRiesgo,
        totalEvaluaciones
      },
      teachers: paged,
      pagination: {
        page: safePage,
        pageSize,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error GET /coordinador/dashboard-summary:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

/**
 * GET /coordinador/reports-overview
 * Reportes del coordinador para su carrera:
 * - cards de resumen
 * - distribución de calificaciones
 * - promedios por categoría
 * - tendencia por periodos recientes
 */
router.get('/reports-overview', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    if (!user?.roles?.includes('coordinador') && user?.tipo_usuario !== 'coordinador') {
      return res.status(403).json({ error: 'Solo coordinadores pueden acceder a esta información.' })
    }

    const coordinador = await RoleService.obtenerCoordinadorPorUsuario(user.id)
    if (!coordinador?.carrera_id) {
      return res.status(400).json({
        error: 'No se encontró carrera asociada al coordinador',
        details: 'El coordinador debe tener una carrera asignada.'
      })
    }

    const carreraId = Number(coordinador.carrera_id)
    const period = String(req.query?.period || '').trim()
    const [periodYearStr, periodSemesterStr] = period.split('-')
    const year = Number(periodYearStr)
    const semester = Number(periodSemesterStr)
    const hasValidPeriod = Number.isFinite(year) && Number.isFinite(semester) && (semester === 1 || semester === 2)
    const dateStart = hasValidPeriod ? `${year}-${semester === 1 ? '01' : '07'}-01` : '2020-01-01'
    const dateEnd = hasValidPeriod ? `${year}-${semester === 1 ? '06-30' : '12-31'}` : '2030-12-31'
    let periodId: number | null = null
    if (hasValidPeriod) {
      const { data: periodRow } = await SupabaseDB.supabaseAdmin
        .from('periodos_academicos')
        .select('id')
        .eq('ano', year)
        .eq('semestre', semester)
        .maybeSingle()
      periodId = periodRow?.id ? Number(periodRow.id) : null
    }

    const { data: profesores, error: profesoresError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .eq('carrera_id', carreraId)
      .eq('activo', true)

    if (profesoresError) {
      console.error('Error obteniendo profesores de carrera para reportes:', profesoresError)
      return res.status(500).json({ error: 'Error obteniendo profesores', details: profesoresError.message })
    }

    const profesorIds = (profesores || []).map((p: any) => p.id).filter(Boolean)
    if (profesorIds.length === 0) {
      return res.json({
        summary: {
          totalEvaluaciones: 0,
          calificacionPromedio: 0,
          tasaRespuesta: 0,
          docentesEvaluados: 0,
          cursosEvaluados: 0,
          estudiantesRespondieron: 0
        },
        categoryStats: [],
        trend: [],
        distribution: []
      })
    }

    let evalsArray: any[] = []
    let filterSource: 'periodo_id' | 'fecha_creacion' | 'sin_filtro' = 'sin_filtro'

    // 1) Prioridad: periodo_id explícito (ej: periodo_id = 2)
    if (periodId != null) {
      const { data: evalsByPeriod, error: evalPeriodError } = await SupabaseDB.supabaseAdmin
        .from('evaluaciones')
        .select('id, profesor_id, calificacion_promedio, grupo_id, estudiante_id, fecha_creacion')
        .in('profesor_id', profesorIds)
        .eq('completada', true)
        .eq('periodo_id', periodId)
      if (evalPeriodError) {
        console.error('Error obteniendo evaluaciones por periodo_id:', evalPeriodError)
        return res.status(500).json({ error: 'Error obteniendo evaluaciones por período', details: evalPeriodError.message })
      }
      evalsArray = Array.isArray(evalsByPeriod) ? evalsByPeriod : []
      filterSource = 'periodo_id'
    }

    // 2) Fallback por fechas si periodo_id no encontró datos o no existe mapeo
    if (evalsArray.length === 0) {
      const { data: evalsByDate, error: evalDateError } = await SupabaseDB.supabaseAdmin
        .from('evaluaciones')
        .select('id, profesor_id, calificacion_promedio, grupo_id, estudiante_id, fecha_creacion')
        .in('profesor_id', profesorIds)
        .eq('completada', true)
        .gte('fecha_creacion', dateStart)
        .lte('fecha_creacion', dateEnd)
      if (evalDateError) {
        console.error('Error obteniendo evaluaciones por fecha:', evalDateError)
        return res.status(500).json({ error: 'Error obteniendo evaluaciones por fecha', details: evalDateError.message })
      }
      evalsArray = Array.isArray(evalsByDate) ? evalsByDate : []
      filterSource = 'fecha_creacion'
    }

    console.log('📊 [reports-overview] filtros:', {
      carreraId,
      period,
      periodId,
      dateStart,
      dateEnd,
      profesorCount: profesorIds.length,
      evaluacionesCount: evalsArray.length,
      filterSource
    })
    const totalEvaluaciones = evalsArray.length
    const calificacionPromedio = totalEvaluaciones > 0
      ? Number((evalsArray.reduce((sum: number, e: any) => sum + Number(e.calificacion_promedio || 0), 0) / totalEvaluaciones).toFixed(2))
      : 0

    const docentesEvaluados = new Set(evalsArray.map((e: any) => e.profesor_id).filter(Boolean)).size
    const estudiantesRespondieron = new Set(evalsArray.map((e: any) => e.estudiante_id).filter(Boolean)).size

    const gruposIds = Array.from(new Set(evalsArray.map((e: any) => e.grupo_id).filter(Boolean)))
    const { data: grupos } = await SupabaseDB.supabaseAdmin
      .from('grupos')
      .select('id, curso_id')
      .in('id', gruposIds.length ? gruposIds : [-1])
    const gruposArray = Array.isArray(grupos) ? grupos : []
    const cursosEvaluados = new Set(gruposArray.map((g: any) => g.curso_id).filter(Boolean)).size
    const groupToCourseId = new Map<number, number>()
    gruposArray.forEach((g: any) => {
      groupToCourseId.set(Number(g.id), Number(g.curso_id))
    })

    const buckets = [
      { name: '5 Estrellas', value: 0, color: '#10B981' },
      { name: '4 Estrellas', value: 0, color: '#3B82F6' },
      { name: '3 Estrellas', value: 0, color: '#F59E0B' },
      { name: '2 Estrellas', value: 0, color: '#EF4444' },
      { name: '1 Estrella', value: 0, color: '#6B7280' }
    ]
    evalsArray.forEach((e: any) => {
      const value = Number(e.calificacion_promedio || 0)
      if (!Number.isFinite(value) || value <= 0) return
      const rounded = Math.max(1, Math.min(5, Math.round(value)))
      const index = 5 - rounded
      buckets[index].value += 1
    })
    const distribution = buckets.filter((b) => b.value > 0)

    // Métricas alternativas para visualización cuando no hay categorías válidas
    const teacherAgg = new Map<string, { sum: number; count: number }>()
    evalsArray.forEach((e: any) => {
      const pid = String(e.profesor_id || '')
      const rating = Number(e.calificacion_promedio || 0)
      if (!pid || !Number.isFinite(rating) || rating <= 0) return
      const prev = teacherAgg.get(pid) || { sum: 0, count: 0 }
      prev.sum += rating
      prev.count += 1
      teacherAgg.set(pid, prev)
    })

    const teacherIds = Array.from(teacherAgg.keys())
    const { data: teacherRows } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id, usuario:usuarios(nombre, apellido)')
      .in('id', teacherIds.length ? teacherIds : ['-1'])
    const teacherNameById = new Map<string, string>()
    ;(Array.isArray(teacherRows) ? teacherRows : []).forEach((t: any) => {
      const nombre = `${t?.usuario?.nombre || ''} ${t?.usuario?.apellido || ''}`.trim() || `Docente ${t.id}`
      teacherNameById.set(String(t.id), nombre)
    })

    const teacherAverages = Array.from(teacherAgg.entries())
      .map(([profesorId, values]) => ({
        profesorId,
        nombre: teacherNameById.get(profesorId) || `Docente ${profesorId}`,
        promedio: values.count > 0 ? Number((values.sum / values.count).toFixed(2)) : 0,
        totalEvaluaciones: values.count
      }))
      .filter((t) => t.promedio > 0)
      .sort((a, b) => b.promedio - a.promedio)

    const courseIds = Array.from(new Set(gruposArray.map((g: any) => g.curso_id).filter(Boolean)))
    const { data: courseRows } = await SupabaseDB.supabaseAdmin
      .from('cursos')
      .select('id, nombre, codigo')
      .in('id', courseIds.length ? courseIds : [-1])
    const courseNameById = new Map<number, string>()
    ;(Array.isArray(courseRows) ? courseRows : []).forEach((c: any) => {
      courseNameById.set(Number(c.id), `${c.codigo ? `${c.codigo} - ` : ''}${c.nombre || `Curso ${c.id}`}`)
    })

    const courseAgg = new Map<number, { sum: number; count: number }>()
    evalsArray.forEach((e: any) => {
      const gid = Number(e.grupo_id || 0)
      const courseId = groupToCourseId.get(gid)
      const rating = Number(e.calificacion_promedio || 0)
      if (!courseId || !Number.isFinite(rating) || rating <= 0) return
      const prev = courseAgg.get(courseId) || { sum: 0, count: 0 }
      prev.sum += rating
      prev.count += 1
      courseAgg.set(courseId, prev)
    })

    const courseAverages = Array.from(courseAgg.entries())
      .map(([cursoId, values]) => ({
        cursoId,
        nombre: courseNameById.get(cursoId) || `Curso ${cursoId}`,
        promedio: values.count > 0 ? Number((values.sum / values.count).toFixed(2)) : 0,
        totalEvaluaciones: values.count
      }))
      .filter((c) => c.promedio > 0)
      .sort((a, b) => b.promedio - a.promedio)

    const buildCategoryStats = async (evals: any[]) => {
      if (!Array.isArray(evals) || !evals.length) {
        return [] as Array<{ categoriaId: string; nombre: string; promedio: number }>
      }
      const ids = evals.map((e: any) => e.id).filter(Boolean)
      if (!ids.length) {
        return [] as Array<{ categoriaId: string; nombre: string; promedio: number }>
      }
      const chunkArray = <T,>(arr: T[], size: number): T[][] => {
        const out: T[][] = []
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
        return out
      }
      const evaluacionToProfesor = new Map<string, string>()
      evals.forEach((e: any) => {
        evaluacionToProfesor.set(String(e.id), String(e.profesor_id || ''))
      })

      let respuestasArray: any[] = []
      {
        const idChunks = chunkArray(ids, 150)
        for (const chunk of idChunks) {
          const { data, error } = await SupabaseDB.supabaseAdmin
            .from('respuestas_evaluacion')
            .select('evaluacion_id, pregunta_id, respuesta_rating')
            .in('evaluacion_id', chunk)
          if (!error) {
            respuestasArray.push(...(Array.isArray(data) ? data : []))
          } else {
            const fallback = await SupabaseDB.supabaseAdmin
              .from('respuestas_evaluacion')
              .select('evaluacion_id, pregunta_id, valor')
              .in('evaluacion_id', chunk)
            if (!fallback.error) {
              respuestasArray.push(...(Array.isArray(fallback.data) ? fallback.data : []))
            }
          }
        }
      }

      const preguntaIds = Array.from(new Set(respuestasArray.map((r: any) => String(r.pregunta_id)).filter(Boolean)))
      if (!preguntaIds.length) return []

      let preguntas: any[] = []
      for (const chunk of chunkArray(preguntaIds, 200)) {
        const { data } = await SupabaseDB.supabaseAdmin
          .from('preguntas_evaluacion')
          .select('id, categoria_id')
          .in('id', chunk)
        preguntas.push(...(Array.isArray(data) ? data : []))
      }

      const preguntaToCategoria = new Map<string, string>()
      ;(Array.isArray(preguntas) ? preguntas : []).forEach((p: any) => {
        if (p?.id == null || p?.categoria_id == null) return
        preguntaToCategoria.set(String(p.id), String(p.categoria_id))
      })

      const categoriaIds = Array.from(
        new Set((Array.isArray(preguntas) ? preguntas : []).map((p: any) => String(p.categoria_id)).filter(Boolean))
      )
      let categorias: any[] = []
      for (const chunk of chunkArray(categoriaIds.length ? categoriaIds : ['-1'], 200)) {
        const { data } = await SupabaseDB.supabaseAdmin
          .from('categorias_pregunta')
          .select('id, nombre')
          .in('id', chunk)
        categorias.push(...(Array.isArray(data) ? data : []))
      }
      const categoriaNameById = new Map<string, string>()
      ;(Array.isArray(categorias) ? categorias : []).forEach((c: any) => {
        categoriaNameById.set(String(c.id), String(c.nombre || `Categoría ${c.id}`))
      })

      // Igual que en individual, pero primero calcula promedio por docente y categoría,
      // luego promedia esos resultados para obtener la vista global del coordinador.
      const teacherCategoryAcc = new Map<string, { sum: number; count: number }>()
      respuestasArray.forEach((r: any) => {
        const catId = preguntaToCategoria.get(String(r.pregunta_id))
        if (!catId) return
        const profesorId = evaluacionToProfesor.get(String(r.evaluacion_id))
        if (!profesorId) return
        const rating = Number(r.respuesta_rating ?? r.valor ?? 0)
        if (!Number.isFinite(rating) || rating <= 0) return
        const key = `${profesorId}::${catId}`
        const prev = teacherCategoryAcc.get(key) || { sum: 0, count: 0 }
        prev.sum += rating
        prev.count += 1
        teacherCategoryAcc.set(key, prev)
      })

      const categoryTeacherMeans = new Map<string, { sumMeans: number; teachers: number }>()
      teacherCategoryAcc.forEach((values, key) => {
        const parts = key.split('::')
        const catIdStr = parts[1]
        const categoriaId = String(catIdStr || '')
        if (!categoriaId || values.count <= 0) return
        const teacherMean = values.sum / values.count
        const prev = categoryTeacherMeans.get(categoriaId) || { sumMeans: 0, teachers: 0 }
        prev.sumMeans += teacherMean
        prev.teachers += 1
        categoryTeacherMeans.set(categoriaId, prev)
      })

      return Array.from(categoryTeacherMeans.entries())
        .map(([categoriaId, values]) => ({
          categoriaId,
          nombre: categoriaNameById.get(categoriaId) || `Categoría ${categoriaId}`,
          promedio: values.teachers > 0 ? Number((values.sumMeans / values.teachers).toFixed(2)) : 0
        }))
        .filter((c) => c.promedio > 0)
        .sort((a, b) => b.promedio - a.promedio)
    }

    let categoryStats: Array<{ categoriaId: string; nombre: string; promedio: number }> = await buildCategoryStats(evalsArray)

    // Fallback solicitado: si en el período no hay datos por categoría,
    // usar el promedio histórico de TODAS las evaluaciones de todos los docentes de la carrera.
    if (categoryStats.length === 0) {
      const { data: allCareerEvaluations } = await SupabaseDB.supabaseAdmin
        .from('evaluaciones')
        .select('id, profesor_id')
        .in('profesor_id', profesorIds)
        .eq('completada', true)
      categoryStats = await buildCategoryStats(Array.isArray(allCareerEvaluations) ? allCareerEvaluations : [])
    }
    console.log('📊 [reports-overview] category pipeline:', {
      evaluacionesCount: evalsArray.length,
      categoryStatsCount: categoryStats.length
    })

    const resolvePeriodWindow = (periodValue: string) => {
      const [yStr, sStr] = periodValue.split('-')
      const y = Number(yStr)
      const s = Number(sStr)
      if (!Number.isFinite(y) || !Number.isFinite(s) || (s !== 1 && s !== 2)) {
        return { start: '2020-01-01', end: '2030-12-31' }
      }
      return {
        start: `${y}-${s === 1 ? '01' : '07'}-01`,
        end: `${y}-${s === 1 ? '06-30' : '12-31'}`
      }
    }

    const trendPeriods: string[] = []
    const minTrendYear = 2025
    const minTrendSemester = 1
    if (hasValidPeriod) {
      let y = minTrendYear
      let s = minTrendSemester
      while (y < year || (y === year && s <= semester)) {
        trendPeriods.push(`${y}-${s}`)
        if (s === 1) {
          s = 2
        } else {
          y += 1
          s = 1
        }
      }
    } else {
      trendPeriods.push('2025-1', '2025-2', '2026-1', '2026-2')
    }

    const trend = await Promise.all(trendPeriods.map(async (p) => {
      const window = resolvePeriodWindow(p)
      const { data } = await SupabaseDB.supabaseAdmin
        .from('evaluaciones')
        .select('calificacion_promedio')
        .in('profesor_id', profesorIds)
        .eq('completada', true)
        .gte('fecha_creacion', window.start)
        .lte('fecha_creacion', window.end)
      const arr = Array.isArray(data) ? data : []
      const total = arr.length
      const rating = total > 0
        ? Number((arr.reduce((sum: number, e: any) => sum + Number(e.calificacion_promedio || 0), 0) / total).toFixed(2))
        : 0
      return { period: p, rating, totalEvaluations: total }
    }))

    return res.json({
      summary: {
        totalEvaluaciones,
        calificacionPromedio,
        tasaRespuesta: 0,
        docentesEvaluados,
        cursosEvaluados,
        estudiantesRespondieron
      },
      categoryStats,
      teacherAverages,
      courseAverages,
      debug: process.env.NODE_ENV === 'development' ? {
        period,
        periodId,
        filterSource,
        evaluacionesCount: evalsArray.length
      } : undefined,
      trend,
      distribution
    })
  } catch (error) {
    console.error('Error GET /coordinador/reports-overview:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
