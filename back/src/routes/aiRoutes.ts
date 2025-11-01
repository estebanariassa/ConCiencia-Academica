import { Router } from 'express'
import { authenticateToken, requireRole } from '../middleware/auth'
import { AiService } from '../services/aiService'

const router = Router()

// POST /api/ai/summarize
router.post('/summarize', authenticateToken, requireRole(['docente', 'profesor', 'coordinador', 'decano', 'admin']), async (req, res) => {
  try {
    const { texts } = req.body as { texts: string[] }
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array no vacío en "texts"' })
    }
    const result = await AiService.summarizeOpenResponses(texts)
    res.json(result)
  } catch (error) {
    console.error('Error en /api/ai/summarize:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

async function fetchOpenTextsByFilters(filters: any): Promise<string[]> {
  const { SupabaseDB } = await import('../config/supabase-only')
  
  console.log('\n🔍 [AI Routes] ========================================')
  console.log('🔍 [AI Routes] Buscando respuestas abiertas con filtros:', JSON.stringify(filters, null, 2))
  
  if (!filters.profesor_id) {
    console.error('❌ [AI Routes] profesor_id es requerido')
    throw new Error('profesor_id es requerido')
  }

  // CRÍTICO: El profesor_id que recibimos es un usuario_id, necesitamos obtener el id real de profesores
  // Buscar en la tabla profesores donde usuario_id = filters.profesor_id
  console.log(`   🔍 Convertiendo usuario_id (${filters.profesor_id}) a profesor.id...`)
  
  const { data: profesor, error: profError } = await SupabaseDB.supabaseAdmin
    .from('profesores')
    .select('id')
    .eq('usuario_id', filters.profesor_id)
    .eq('activo', true)
    .single()
  
  if (profError || !profesor) {
    console.error('❌ [AI Routes] Error buscando profesor por usuario_id:', profError)
    throw new Error(`No se encontró profesor activo para usuario_id: ${filters.profesor_id}`)
  }
  
  const profesorIdReal = profesor.id
  console.log(`   ✅ Profesor encontrado: id = ${profesorIdReal} (desde usuario_id = ${filters.profesor_id})`)

  // Usar exactamente la lógica del SQL que funciona:
  // SELECT ... FROM evaluaciones e INNER JOIN respuestas_evaluacion re ON re.evaluacion_id = e.id
  // WHERE e.profesor_id = '...' AND re.respuesta_texto IS NOT NULL ...
  
  // Paso 1: Buscar directamente en evaluaciones por profesor_id (ahora usando el id real de profesores)
  let evaluacionesQuery = SupabaseDB.supabaseAdmin
    .from('evaluaciones')
    .select('id')
    .eq('profesor_id', profesorIdReal)
  
  if (filters.periodo_id) {
    evaluacionesQuery = evaluacionesQuery.eq('periodo_id', filters.periodo_id)
    console.log('   ✅ Filtro periodo_id =', filters.periodo_id)
  }
  if (filters.grupo_id) {
    evaluacionesQuery = evaluacionesQuery.eq('grupo_id', filters.grupo_id)
    console.log('   ✅ Filtro grupo_id =', filters.grupo_id)
  }
  
  const { data: evaluaciones, error: evalError } = await evaluacionesQuery
  
  if (evalError) {
    console.error('❌ [AI Routes] Error buscando evaluaciones:', evalError)
    throw evalError
  }
  
  const evaluacionIds = (evaluaciones || []).map((e: any) => e.id)
  console.log(`   ✅ Encontradas ${evaluacionIds.length} evaluaciones para profesor_id = ${profesorIdReal} (usuario_id = ${filters.profesor_id})`)
  
  if (evaluacionIds.length === 0) {
    console.log('   ⚠️ No hay evaluaciones para este profesor')
    return []
  }
  
  console.log(`   ✅ Total de ${evaluacionIds.length} evaluaciones a procesar`)

  // Paso 3: Buscar respuestas usando los IDs de evaluaciones (simulando el INNER JOIN)
  const { data: respuestas, error: respError } = await SupabaseDB.supabaseAdmin
    .from('respuestas_evaluacion')
    .select('id, evaluacion_id, respuesta_texto, respuesta_rating')
    .in('evaluacion_id', evaluacionIds)
    .not('respuesta_texto', 'is', null)
  
  if (respError) {
    console.error('❌ [AI Routes] Error buscando respuestas:', respError)
    throw respError
  }
  
  console.log(`📊 [AI Routes] Encontradas ${respuestas?.length || 0} respuestas con texto (antes de filtrar)`)
  
  // Paso 4: Aplicar filtros exactamente como el SQL:
  // - respuesta_texto IS NOT NULL (ya filtrado)
  // - TRIM(respuesta_texto) != ''
  // - LENGTH(TRIM(respuesta_texto)) >= 3
  const texts: string[] = []
  
  for (const r of respuestas || []) {
    const respuesta = r?.respuesta_texto
    
    if (respuesta) {
      const texto = String(respuesta).trim()
      
      // Aplicar los mismos filtros que el SQL:
      // TRIM(respuesta_texto) != '' Y LENGTH(TRIM(respuesta_texto)) >= 3
      if (texto.length > 0 && texto.length >= 3) {
        texts.push(texto)
        if (texts.length <= 5) {
          console.log(`   📝 Respuesta ${texts.length}: "${texto.substring(0, 60)}${texto.length > 60 ? '...' : ''}"`)
        }
      }
    }
  }
  
  console.log(`✅ [AI Routes] Respuestas válidas encontradas: ${texts.length}`)
  
  // Generar SQL de debug (exactamente como el que funciona)
  // NOTA: El SQL usa el id real de profesores, no el usuario_id
  let sqlWhere = `WHERE 
  e.profesor_id = '${profesorIdReal}'`
  if (filters.periodo_id) {
    sqlWhere += `\n  AND e.periodo_id = ${filters.periodo_id}`
  }
  
  const sqlCommand = `SELECT 
  e.id AS evaluacion_id,
  e.profesor_id,
  re.id AS respuesta_id,
  re.respuesta_texto,
  re.respuesta_rating
FROM evaluaciones e
INNER JOIN respuestas_evaluacion re 
  ON re.evaluacion_id = e.id
${sqlWhere}
  AND re.respuesta_texto IS NOT NULL
  AND TRIM(re.respuesta_texto) != ''
  AND LENGTH(TRIM(re.respuesta_texto)) >= 3
ORDER BY e.id, re.id;`
  
  if (texts.length === 0) {
    console.log('\n⚠️  NO SE ENCONTRARON RESPUESTAS ABIERTAS VÁLIDAS')
    console.log('📋 SQL para verificar en Supabase:')
    console.log(sqlCommand)
  } else {
    console.log('✅ Respuestas encontradas correctamente')
  }
  
  console.log('🔍 [AI Routes] ========================================\n')
  
  return texts
}

// GET /api/ai/summarize/by-professor?profesor_id=...&periodo_id=... (puede ser número o formato YYYY-X)
router.get('/summarize/by-professor', authenticateToken, requireRole(['docente', 'profesor', 'coordinador', 'decano', 'admin']), async (req: any, res) => {
  try {
    const { profesor_id, periodo_id, grupo_id } = req.query
    console.log('📥 [by-professor] Request recibido:', { profesor_id, periodo_id, grupo_id, user: req.user?.id })
    
    if (!profesor_id) {
      console.error('❌ [by-professor] profesor_id es requerido')
      return res.status(400).json({ error: 'profesor_id es requerido' })
    }

    const filters: any = { profesor_id: String(profesor_id) }
    
    // Si periodo_id es un número, usarlo directamente. Si es formato YYYY-X, buscar el periodo_id real
    if (periodo_id) {
      const periodoStr = String(periodo_id)
      if (periodoStr.includes('-')) {
        // Formato YYYY-X, buscar periodo_id desde la base de datos
        console.log(`🔍 [by-professor] Buscando periodo_id para: ${periodoStr}`)
        const { SupabaseDB } = await import('../config/supabase-only')
        const [year, sem] = periodoStr.split('-')
        const { data: periodos, error: periodoError } = await SupabaseDB.supabaseAdmin
          .from('periodos_academicos')
          .select('id, ano, semestre')
          .eq('ano', year)
          .eq('semestre', sem)
          .maybeSingle()
        
        if (periodoError) {
          console.error('❌ [by-professor] Error buscando periodo:', periodoError)
        } else if (periodos?.id) {
          filters.periodo_id = periodos.id
          console.log(`✅ [by-professor] Periodo encontrado: ${periodoStr} → id=${periodos.id}`)
        } else {
          console.warn(`⚠️ [by-professor] Periodo no encontrado: ${periodoStr}`)
        }
      } else {
        filters.periodo_id = Number(periodo_id)
        console.log(`✅ [by-professor] Periodo ID numérico: ${periodo_id}`)
      }
    }
    if (grupo_id) filters.grupo_id = Number(grupo_id)

    // Profesores solo pueden consultarse a sí mismos
    if (req.user?.tipo_usuario === 'profesor' && req.user.id !== String(profesor_id)) {
      console.warn(`⚠️ [by-professor] Usuario ${req.user.id} intentó acceder a profesor ${profesor_id}`)
      return res.status(403).json({ error: 'No autorizado' })
    }

    console.log('🔍 [by-professor] Filtros finales aplicados:', filters)
    const texts = await fetchOpenTextsByFilters(filters)
    
    if (texts.length === 0) {
      console.warn('⚠️ [by-professor] No se encontraron respuestas abiertas')
      
      // Generar SQL para mostrar al usuario (exactamente como el que funciona)
      let sqlWhere = `WHERE 
  e.profesor_id = '${filters.profesor_id}'`
      if (filters.periodo_id) {
        sqlWhere += `\n  AND e.periodo_id = ${filters.periodo_id}`
      }
      
      const sqlCommand = `SELECT 
  e.id AS evaluacion_id,
  e.profesor_id,
  re.id AS respuesta_id,
  re.respuesta_texto,
  re.respuesta_rating
FROM evaluaciones e
INNER JOIN respuestas_evaluacion re 
  ON re.evaluacion_id = e.id
${sqlWhere}
  AND re.respuesta_texto IS NOT NULL
  AND TRIM(re.respuesta_texto) != ''
  AND LENGTH(TRIM(re.respuesta_texto)) >= 3
ORDER BY e.id, re.id;`
      
      return res.json({ 
        textsCount: 0, 
        summary: 'No se encontraron respuestas abiertas para este profesor en el período seleccionado. Verifica en Supabase ejecutando el SQL que aparece en la consola del servidor.',
        topics: [],
        sqlCommand: process.env.NODE_ENV === 'development' ? sqlCommand : undefined
      })
    }
    
    console.log(`🤖 [by-professor] Generando resumen IA con ${texts.length} textos...`)
    const result = await AiService.summarizeOpenResponses(texts)
    console.log(`✅ [by-professor] Resumen generado exitosamente`)
    
    res.json({ textsCount: texts.length, ...result })
  } catch (error: any) {
    console.error('❌ [by-professor] Error:', error)
    console.error('   Stack:', error.stack)
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/ai/summarize/by-career?periodo_id=... (para coordinadores)
// Lógica simplificada:
// 1. Obtener carrera_id del coordinador
// 2. Filtrar evaluaciones donde carrera_id = carrera_id del coordinador
// 3. De esas evaluaciones, obtener respuestas_evaluacion con respuesta_texto válido
router.get('/summarize/by-career', authenticateToken, requireRole(['coordinador', 'decano', 'admin']), async (req: any, res) => {
  try {
    const { periodo_id } = req.query as any
    const { SupabaseDB } = await import('../config/supabase-only')
    const { RoleService } = await import('../services/roleService')
    
    console.log('📥 [by-career] Request recibido:', { userId: req.user?.id, periodo_id })
    
    // Paso 1: Obtener carrera_id del coordinador
    const coordinadorInfo = await RoleService.obtenerCoordinadorPorUsuario(req.user.id)
    
    if (!coordinadorInfo || !coordinadorInfo.carrera_id) {
      console.error('❌ [by-career] No se encontró carrera_id para el coordinador')
      return res.status(400).json({ 
        error: 'No se encontró información de carrera para el coordinador',
        details: 'El usuario no está asociado a una carrera como coordinador'
      })
    }
    
    const carreraId = coordinadorInfo.carrera_id
    console.log(`✅ [by-career] Carrera del coordinador: ${carreraId}`)
    
    // Paso 2: Convertir periodo_id si viene en formato YYYY-X
    let periodoIdNum: number | undefined = undefined
    if (periodo_id) {
      const periodoStr = String(periodo_id)
      if (periodoStr.includes('-')) {
        const [year, sem] = periodoStr.split('-')
        const { data: periodos } = await SupabaseDB.supabaseAdmin
          .from('periodos_academicos')
          .select('id')
          .eq('ano', year)
          .eq('semestre', sem)
          .maybeSingle()
        if (periodos?.id) {
          periodoIdNum = periodos.id
          console.log(`✅ [by-career] Periodo convertido: ${periodoStr} → id=${periodoIdNum}`)
        }
      } else {
        periodoIdNum = Number(periodo_id)
      }
    }
    
    // Paso 3: Filtrar evaluaciones donde carrera_id = carreraId del coordinador
    let evaluacionesQuery = SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select('id')
      .eq('carrera_id', carreraId)
    
    if (periodoIdNum) {
      evaluacionesQuery = evaluacionesQuery.eq('periodo_id', periodoIdNum)
    }
    
    const { data: evaluaciones, error: evalError } = await evaluacionesQuery
    
    if (evalError) {
      console.error('❌ [by-career] Error buscando evaluaciones:', evalError)
      throw evalError
    }
    
    const evaluacionIds = (evaluaciones || []).map((e: any) => e.id)
    console.log(`✅ [by-career] Encontradas ${evaluacionIds.length} evaluaciones de la carrera ${carreraId}`)
    
    if (evaluacionIds.length === 0) {
      return res.json({ 
        textsCount: 0, 
        summary: 'No se encontraron evaluaciones para esta carrera en el período seleccionado.', 
        topics: [] 
      })
    }
    
    // Paso 4: De esas evaluaciones, obtener solo respuestas_evaluacion con respuesta_texto válido
    const { data: respuestas, error: respError } = await SupabaseDB.supabaseAdmin
      .from('respuestas_evaluacion')
      .select('id, evaluacion_id, respuesta_texto')
      .in('evaluacion_id', evaluacionIds)
      .not('respuesta_texto', 'is', null)
    
    if (respError) {
      console.error('❌ [by-career] Error buscando respuestas:', respError)
      throw respError
    }
    
    // Paso 5: Filtrar respuestas válidas (texto no vacío y longitud >= 3)
    const texts: string[] = []
    for (const r of respuestas || []) {
      const texto = String(r.respuesta_texto).trim()
      if (texto.length > 0 && texto.length >= 3) {
        texts.push(texto)
      }
    }
    
    console.log(`✅ [by-career] Encontradas ${texts.length} respuestas válidas (de ${respuestas?.length || 0} respuestas con texto)`)
    
    if (texts.length === 0) {
      return res.json({ 
        textsCount: 0, 
        summary: 'No se encontraron respuestas abiertas válidas para esta carrera.', 
        topics: [] 
      })
    }
    
    // Paso 6: Generar resumen IA
    console.log(`🤖 [by-career] Generando resumen IA con ${texts.length} textos...`)
    const result = await AiService.summarizeOpenResponses(texts)
    console.log(`✅ [by-career] Resumen generado exitosamente`)
    
    res.json({ textsCount: texts.length, ...result })
  } catch (error: any) {
    console.error('❌ [by-career] Error:', error)
    console.error('   Stack:', error.stack)
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/ai/summarize/by-faculty?periodo_id=... (para decanos)
// Obtiene respuestas abiertas de todas las evaluaciones de la facultad (actualmente: Ingeniería)
router.get('/summarize/by-faculty', authenticateToken, requireRole(['decano', 'admin']), async (req: any, res) => {
  try {
    const { periodo_id } = req.query as any
    const { SupabaseDB } = await import('../config/supabase-only')
    
    console.log('📥 [by-faculty] Request recibido:', { userId: req.user?.id, periodo_id })
    
    // Actualmente hardcodeado para "Facultad de Ingeniería"
    // TODO: Obtener facultad_id del decano desde la tabla decanos si existe
    const facultadNombre = 'Ingeniería'
    console.log(`✅ [by-faculty] Usando facultad: ${facultadNombre}`)
    
    // Paso 1: Convertir periodo_id si viene en formato YYYY-X
    let periodoIdNum: number | undefined = undefined
    if (periodo_id) {
      const periodoStr = String(periodo_id)
      if (periodoStr.includes('-')) {
        const [year, sem] = periodoStr.split('-')
        const { data: periodos } = await SupabaseDB.supabaseAdmin
          .from('periodos_academicos')
          .select('id')
          .eq('ano', year)
          .eq('semestre', sem)
          .maybeSingle()
        if (periodos?.id) {
          periodoIdNum = periodos.id
          console.log(`✅ [by-faculty] Periodo convertido: ${periodoStr} → id=${periodoIdNum}`)
        }
      } else {
        periodoIdNum = Number(periodo_id)
      }
    }
    
    // Paso 2: Buscar carreras de la facultad (por ahora, todas las carreras que contengan "Ingeniería" en el nombre)
    // O podríamos buscar todas las carreras si no hay filtro de facultad aún
    const { data: carreras, error: carreraError } = await SupabaseDB.supabaseAdmin
      .from('carreras')
      .select('id')
      // Por ahora obtenemos todas las carreras, pero podríamos filtrar por facultad si existe la relación
      .eq('activo', true)
    
    if (carreraError) {
      console.error('❌ [by-faculty] Error buscando carreras:', carreraError)
      throw carreraError
    }
    
    const carreraIds = (carreras || []).map((c: any) => c.id)
    console.log(`✅ [by-faculty] Encontradas ${carreraIds.length} carreras`)
    
    if (carreraIds.length === 0) {
      return res.json({ 
        textsCount: 0, 
        summary: 'No se encontraron carreras en la facultad.', 
        topics: [] 
      })
    }
    
    // Paso 3: Obtener IDs de profesores de todas las carreras de la facultad
    const { data: profesores, error: profError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id')
      .in('carrera_id', carreraIds)
      .eq('activo', true)
    
    if (profError) {
      console.error('❌ [by-faculty] Error buscando profesores:', profError)
      throw profError
    }
    
    const profesorIds = (profesores || []).map((p: any) => p.id)
    console.log(`✅ [by-faculty] Encontrados ${profesorIds.length} profesores`)
    
    if (profesorIds.length === 0) {
      return res.json({ 
        textsCount: 0, 
        summary: 'No se encontraron profesores en la facultad.', 
        topics: [] 
      })
    }
    
    // Paso 4: Buscar evaluaciones de todos los profesores
    let evaluacionesQuery = SupabaseDB.supabaseAdmin
      .from('evaluaciones')
      .select('id')
      .in('profesor_id', profesorIds)
    
    if (periodoIdNum) {
      evaluacionesQuery = evaluacionesQuery.eq('periodo_id', periodoIdNum)
    }
    
    const { data: evaluaciones, error: evalError } = await evaluacionesQuery
    
    if (evalError) {
      console.error('❌ [by-faculty] Error buscando evaluaciones:', evalError)
      throw evalError
    }
    
    const evaluacionIds = (evaluaciones || []).map((e: any) => e.id)
    console.log(`✅ [by-faculty] Encontradas ${evaluacionIds.length} evaluaciones`)
    
    if (evaluacionIds.length === 0) {
      return res.json({ 
        textsCount: 0, 
        summary: 'No se encontraron evaluaciones para la facultad en el período seleccionado.', 
        topics: [] 
      })
    }
    
    // Paso 5: Buscar respuestas abiertas
    const { data: respuestas, error: respError } = await SupabaseDB.supabaseAdmin
      .from('respuestas_evaluacion')
      .select('id, evaluacion_id, respuesta_texto')
      .in('evaluacion_id', evaluacionIds)
      .not('respuesta_texto', 'is', null)
    
    if (respError) {
      console.error('❌ [by-faculty] Error buscando respuestas:', respError)
      throw respError
    }
    
    // Paso 6: Filtrar respuestas válidas
    const texts: string[] = []
    for (const r of respuestas || []) {
      const texto = String(r.respuesta_texto).trim()
      if (texto.length > 0 && texto.length >= 3) {
        texts.push(texto)
      }
    }
    
    console.log(`✅ [by-faculty] Encontradas ${texts.length} respuestas válidas`)
    
    if (texts.length === 0) {
      return res.json({ 
        textsCount: 0, 
        summary: 'No se encontraron respuestas abiertas válidas para la facultad.', 
        topics: [] 
      })
    }
    
    // Paso 7: Generar resumen IA
    console.log(`🤖 [by-faculty] Generando resumen IA con ${texts.length} textos...`)
    const result = await AiService.summarizeOpenResponses(texts)
    console.log(`✅ [by-faculty] Resumen generado exitosamente`)
    
    res.json({ textsCount: texts.length, ...result })
  } catch (error: any) {
    console.error('❌ [by-faculty] Error:', error)
    console.error('   Stack:', error.stack)
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router



