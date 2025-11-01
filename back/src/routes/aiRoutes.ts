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
  // WHERE e.carrera_id = X AND re.respuesta_texto IS NOT NULL ...
  
  // Obtener carrera_id del profesor para buscar por carrera (más eficiente)
  const { data: profesorInfo, error: profInfoError } = await SupabaseDB.supabaseAdmin
    .from('profesores')
    .select('carrera_id')
    .eq('id', profesorIdReal)
    .single()
  
  if (profInfoError || !profesorInfo) {
    console.error('❌ [AI Routes] Error obteniendo carrera_id del profesor:', profInfoError)
    // Continuar con búsqueda por profesor_id como fallback
  }
  
  const carreraId = profesorInfo?.carrera_id
  console.log(`   ✅ Carrera del profesor: ${carreraId}`)
  
  // Paso 1: Buscar directamente en evaluaciones por carrera_id (más eficiente que profesor_id)
  // Esto busca TODAS las evaluaciones de la carrera, no solo de un profesor
  let evaluacionesQuery = SupabaseDB.supabaseAdmin
    .from('evaluaciones')
    .select('id')
  
  if (carreraId) {
    evaluacionesQuery = evaluacionesQuery.eq('carrera_id', carreraId)
    console.log(`   ✅ Buscando por carrera_id = ${carreraId}`)
  } else {
    // Fallback: buscar por profesor_id si no hay carrera_id
    evaluacionesQuery = evaluacionesQuery.eq('profesor_id', profesorIdReal)
    console.log(`   ⚠️ No hay carrera_id, usando fallback profesor_id = ${profesorIdReal}`)
  }
  
  // IMPORTANTE: Aplicar filtros opcionales SOLO si se proporcionan
  // Si periodo_id no viene, buscar TODAS las evaluaciones de la carrera (como en el SQL que funciona)
  if (filters.periodo_id !== undefined && filters.periodo_id !== null) {
    evaluacionesQuery = evaluacionesQuery.eq('periodo_id', filters.periodo_id)
    console.log('   ✅ Filtro periodo_id =', filters.periodo_id)
  } else {
    console.log('   ℹ️  No se aplicó filtro de periodo_id (buscando todos los períodos)')
  }
  
  if (filters.grupo_id !== undefined && filters.grupo_id !== null) {
    evaluacionesQuery = evaluacionesQuery.eq('grupo_id', filters.grupo_id)
    console.log('   ✅ Filtro grupo_id =', filters.grupo_id)
  }
  
  const { data: evaluaciones, error: evalError } = await evaluacionesQuery
  
  if (evalError) {
    console.error('❌ [AI Routes] Error buscando evaluaciones:', evalError)
    throw evalError
  }
  
  const evaluacionIds = (evaluaciones || []).map((e: any) => e.id)
  console.log(`   ✅ Encontradas ${evaluacionIds.length} evaluaciones ${carreraId ? `de la carrera ${carreraId}` : `para profesor_id = ${profesorIdReal}`}`)
  
  if (evaluacionIds.length === 0) {
    console.log(`   ⚠️ No hay evaluaciones ${carreraId ? `para la carrera ${carreraId}` : 'para este profesor'}${filters.periodo_id ? ` en el período ${filters.periodo_id}` : ''}`)
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
      if (texto.length > 0 && texto.length >= 3) {  // >= 3 coincide con el SQL
        texts.push(texto)
        if (texts.length <= 5) {
          console.log(`   📝 Respuesta ${texts.length}: "${texto.substring(0, 60)}${texto.length > 60 ? '...' : ''}"`)
        }
      }
    }
  }
  
  console.log(`✅ [AI Routes] Respuestas válidas encontradas: ${texts.length}`)
  
  // Generar SQL de debug usando carrera_id (ya obtenido arriba)
  let sqlWhere = `WHERE 
  e.carrera_id = ${carreraId || 'NULL'}`
  if (filters.periodo_id) {
    sqlWhere += `\n  AND e.periodo_id = ${filters.periodo_id}`
  }
  
  const sqlCommand = `SELECT 
  e.id AS evaluacion_id,
  e.carrera_id,
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
    
    // Obtener profesor_id real y carrera_id para el SQL de debug
    const { SupabaseDB } = await import('../config/supabase-only')
    const { data: profesor, error: profError } = await SupabaseDB.supabaseAdmin
      .from('profesores')
      .select('id, carrera_id')
      .eq('usuario_id', String(profesor_id))
      .eq('activo', true)
      .single()
    
    const profesorIdReal = profesor?.id
    const carreraId = profesor?.carrera_id || null
    
    const texts = await fetchOpenTextsByFilters(filters)
    
    if (texts.length === 0) {
      console.warn('⚠️ [by-professor] No se encontraron respuestas abiertas')
      
      // Generar SQL para mostrar al usuario usando carrera_id en lugar de profesor_id
      let sqlWhere = `WHERE 
  e.carrera_id = ${carreraId}`
      if (filters.periodo_id) {
        sqlWhere += `\n  AND e.periodo_id = ${filters.periodo_id}`
      }
      
      const sqlCommand = `SELECT 
  e.id AS evaluacion_id,
  e.carrera_id,
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
    const result = await AiService.summarizeOpenResponses(texts, 'profesor')
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
    
    // Paso 3: Usar la vista SQL que centraliza todos los JOINs y filtros
    // La vista 'vista_respuestas_abiertas_validas' ya tiene todos los filtros aplicados
    // Esto busca TODAS las respuestas válidas de TODOS los profesores de la carrera
    let vistaQuery = SupabaseDB.supabaseAdmin
      .from('vista_respuestas_abiertas_validas')
      .select('respuesta_texto, respuesta_rating, profesor_id, evaluacion_id')
      .eq('carrera_id', carreraId)  // ← Filtro directo por carrera_id
    
    if (periodoIdNum) {
      vistaQuery = vistaQuery.eq('periodo_id', periodoIdNum)
    }
    
    // Obtener todas las respuestas válidas directamente de la vista
    // La vista ya tiene aplicados los filtros: IS NOT NULL, TRIM <> '', LENGTH > 3
    const { data: respuestas, error: respError } = await vistaQuery
    
    if (respError) {
      console.error('❌ [by-career] Error buscando respuestas en la vista:', respError)
      throw respError
    }
    
    console.log(`✅ [by-career] Encontradas ${respuestas?.length || 0} respuestas válidas de la carrera ${carreraId}`)
    
    if (!respuestas || respuestas.length === 0) {
      // Generar SQL de debug que muestra cómo buscar por carrera_id (no por profesor_id)
      let sqlWhere = `WHERE 
  carrera_id = ${carreraId}`
      if (periodoIdNum) {
        sqlWhere += `\n  AND periodo_id = ${periodoIdNum}`
      }
      
      const sqlCommand = `SELECT 
  carrera_id,
  carrera_nombre,
  profesor_id,
  evaluacion_id,
  respuesta_id,
  respuesta_texto,
  respuesta_rating
FROM vista_respuestas_abiertas_validas
${sqlWhere}
ORDER BY evaluacion_id, respuesta_id;`
      
      return res.json({ 
        textsCount: 0, 
        summary: 'No se encontraron respuestas abiertas válidas para esta carrera.', 
        topics: [],
        sqlCommand: process.env.NODE_ENV === 'development' ? sqlCommand : undefined
      })
    }
    
    // La vista ya tiene los filtros aplicados, solo necesitamos extraer los textos
    const texts: string[] = respuestas
      .map((r: any) => String(r.respuesta_texto).trim())
      .filter((texto: string) => texto.length > 0 && texto.length >= 3)  // >= 3 coincide con el SQL
    
    console.log(`✅ [by-career] ${texts.length} respuestas válidas listas para análisis IA`)
    
    // Paso 6: Generar resumen IA con contexto de coordinador (habla en general de todos los profesores)
    console.log(`🤖 [by-career] Generando resumen IA con ${texts.length} textos (contexto: coordinador)...`)
    const result = await AiService.summarizeOpenResponses(texts, 'coordinador')
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
// Lógica simplificada: usar la vista SQL directamente
// La vista ya tiene todos los JOINs y filtros aplicados, solo necesitamos filtrar por periodo_id
router.get('/summarize/by-faculty', authenticateToken, requireRole(['decano', 'admin']), async (req: any, res) => {
  try {
    const { periodo_id } = req.query as any
    const { SupabaseDB } = await import('../config/supabase-only')
    
    console.log('📥 [by-faculty] Request recibido:', { userId: req.user?.id, periodo_id })
    
    // Paso 1: Convertir periodo_id si viene en formato YYYY-X
    let periodoIdNum: number | undefined = undefined
    if (periodo_id) {
      const periodoStr = String(periodo_id)
      if (periodoStr.includes('-')) {
        const [year, sem] = periodoStr.split('-')
        const { data: periodos } = await SupabaseDB.supabaseAdmin
          .from('periodos_academicos')
          .select('id')
          .eq('ano', Number(year))
          .eq('semestre', Number(sem))
          .maybeSingle()
        if (periodos?.id) {
          periodoIdNum = periodos.id
          console.log(`✅ [by-faculty] Periodo convertido: ${periodoStr} → id=${periodoIdNum}`)
        }
      } else {
        periodoIdNum = Number(periodo_id)
      }
    }
    
    // Paso 2: Consultar directamente respuestas_evaluacion (igual que tu SQL)
    // Si hay período, obtener evaluacion_ids primero y filtrar
    let evaluacionIds: string[] | undefined = undefined
    
    if (periodoIdNum) {
      const { data: evaluaciones } = await SupabaseDB.supabaseAdmin
        .from('evaluaciones')
        .select('id')
        .eq('periodo_id', periodoIdNum)
      
      evaluacionIds = (evaluaciones || []).map((e: any) => e.id)
      console.log(`✅ [by-faculty] Filtrando por periodo_id = ${periodoIdNum} (${evaluacionIds.length} evaluaciones)`)
    }
    
    // Consultar respuestas_evaluacion directamente (como tu SQL)
    let query = SupabaseDB.supabaseAdmin
      .from('respuestas_evaluacion')
      .select('respuesta_texto')
      .not('respuesta_texto', 'is', null)
    
    if (evaluacionIds && evaluacionIds.length > 0) {
      query = query.in('evaluacion_id', evaluacionIds)
    }
    
    const { data: respuestas, error: respError } = await query
    
    if (respError) {
      console.error('❌ [by-faculty] Error consultando respuestas:', respError)
      throw respError
    }
    
    // Paso 3: Aplicar filtros de texto exactamente como tu SQL:
    // TRIM(respuesta_texto) <> '' AND LENGTH(TRIM(respuesta_texto)) > 3
    const texts: string[] = (respuestas || [])
      .map((r: any) => String(r.respuesta_texto || '').trim())
      .filter((texto: string) => texto.length > 0 && texto.length > 3)
    
    console.log(`✅ [by-faculty] ${texts.length} respuestas de texto válidas encontradas`)
    
    if (texts.length === 0) {
      let sqlWhere = `WHERE 
  respuesta_texto IS NOT NULL
  AND TRIM(respuesta_texto) <> ''
  AND LENGTH(TRIM(respuesta_texto)) > 3`
      
      if (periodoIdNum) {
        sqlWhere += `\n  AND evaluacion_id IN (SELECT id FROM evaluaciones WHERE periodo_id = ${periodoIdNum})`
      }
      
      const sqlCommand = `SELECT 
  id AS respuesta_id,
  evaluacion_id,
  pregunta_id,
  respuesta_texto,
  respuesta_rating
FROM respuestas_evaluacion
${sqlWhere}
ORDER BY evaluacion_id, id;`
      
      return res.json({ 
        textsCount: 0, 
        summary: 'No se encontraron respuestas abiertas válidas para la facultad en el período seleccionado.', 
        topics: [],
        sqlCommand: process.env.NODE_ENV === 'development' ? sqlCommand : undefined
      })
    }
    
    // Paso 4: Enviar textos directamente a la IA
    console.log(`🤖 [by-faculty] Generando resumen IA con ${texts.length} textos...`)
    const result = await AiService.summarizeOpenResponses(texts, 'decano')
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



