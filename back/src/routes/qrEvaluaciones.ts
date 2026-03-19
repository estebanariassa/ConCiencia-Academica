import { Router } from 'express'
import { randomUUID } from 'crypto'
import { SupabaseDB } from '../config/supabase-only'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * POST /qr-evaluaciones/batch
 * Body: { grupoIds: number[], period?: string, startDate?: string, endDate?: string }
 * Crea un registro en qr_evaluaciones por cada grupo (profesor y curso se resuelven desde asignaciones_profesor y grupos).
 * Solo coordinadores (o admin). Devuelve: { created: { grupoId, token }[] }
 */
router.post('/batch', authenticateToken, async (req: any, res) => {
  try {
    const user = req.user
    if (!user?.roles?.includes('coordinador') && user?.tipo_usuario !== 'coordinador' && user?.tipo_usuario !== 'admin') {
      return res.status(403).json({ error: 'Solo coordinadores o administradores pueden generar QRs en lote.' })
    }

    const { grupoIds } = req.body || {}
    if (!Array.isArray(grupoIds) || grupoIds.length === 0) {
      return res.status(400).json({ error: 'Se requiere grupoIds (array de IDs de grupo).' })
    }

    const ids = grupoIds.map((id: any) => Number(id)).filter((n: number) => Number.isFinite(n))
    if (ids.length === 0) {
      return res.status(400).json({ error: 'grupoIds debe contener números válidos.' })
    }

    // Grupos con curso_id (+ posibles columnas de profesor/asignación según esquema)
    const { data: grupos, error: gruposError } = await SupabaseDB.supabaseAdmin
      .from('grupos')
      .select('id, curso_id, profesor_id, asignacion_profesor_id')
      .in('id', ids)

    // Fallback si el esquema no tiene profesor_id / asignacion_profesor_id
    if (gruposError && (gruposError.code === '42703' || String(gruposError?.message || '').includes('column'))) {
      const respFallback = await SupabaseDB.supabaseAdmin
        .from('grupos')
        .select('id, curso_id')
        .in('id', ids)
      if (respFallback.error) {
        console.error('Error grupos en batch (fallback):', respFallback.error)
        return res.status(500).json({ error: 'Error obteniendo grupos', details: respFallback.error.message })
      }
      // @ts-ignore
      ;(respFallback as any).data && (gruposError as any) // noop, solo para mantener estructura mental
      // @ts-ignore
      ;(grupos as any) // noop
      // usaremos más abajo el resultado del fallback
      // (nota: para simplicidad, reasignamos con una variable)
      // eslint-disable-next-line no-inner-declarations
      const gruposListFallback = respFallback.data || []
      // Reemplazar el resultado original
      // @ts-ignore
      ;(req as any).__gruposListFallback = gruposListFallback
    } else if (gruposError) {
      console.error('Error grupos en batch:', gruposError)
      return res.status(500).json({ error: 'Error obteniendo grupos', details: gruposError.message })
    }

    // Tomar grupos desde fallback si aplica
    // @ts-ignore
    const gruposList = ((req as any).__gruposListFallback as any[]) || (grupos || [])
    const grupoById = new Map(gruposList.map((g: any) => [g.id, g]))

    // Asignaciones profesor por grupo (tabla preferida) con fallback a cursos_profesor
    let asignaciones: any[] = []
    let asigError: any = null
    try {
      const respA = await SupabaseDB.supabaseAdmin
        .from('asignaciones_profesor')
        .select('id, grupo_id, profesor_id, curso_id')
        .in('grupo_id', ids)
        .eq('activa', true)
      asignaciones = respA.data || []
      asigError = respA.error || null
    } catch (e) {
      asigError = e
    }
    if (asigError) {
      console.warn('Fallo asignaciones_profesor en batch; intentando cursos_profesor. Detalle:', asigError)
      const respB = await SupabaseDB.supabaseAdmin
        .from('cursos_profesor')
        .select('id, grupo_id, profesor_id, curso_id')
        .in('grupo_id', ids)
      if (respB.error) {
        console.error('Error cursos_profesor en batch:', respB.error)
        return res.status(500).json({ error: 'Error obteniendo asignaciones', details: respB.error.message })
      }
      asignaciones = respB.data || []
    }

    const asignacionByGrupoId = new Map<number, any>()
    ;(asignaciones || []).forEach((a: any) => {
      asignacionByGrupoId.set(Number(a.grupo_id), a)
    })

    const created: { grupoId: number; token: string }[] = []
    const skipped: { grupoId: number; reason: string }[] = []
    const periodoId = req.body?.periodo_id != null ? Number(req.body.periodo_id) : null

    for (const grupoId of ids) {
      const grupo = grupoById.get(grupoId)
      if (!grupo) continue
      const asig = asignacionByGrupoId.get(grupoId)
      // Resolver profesorId: asignación por grupo > grupo.profesor_id > asignacion_profesor_id
      let profesorId = asig?.profesor_id ?? (grupo as any)?.profesor_id ?? null
      const cursoId = Number(grupo.curso_id ?? asig?.curso_id ?? 0)
      if (!cursoId) continue

      // Si el esquema tiene asignacion_profesor_id, intentar resolverlo
      if (!profesorId && (grupo as any)?.asignacion_profesor_id) {
        const { data: asgRow, error: asgErr } = await SupabaseDB.supabaseAdmin
          .from('asignaciones_profesor')
          .select('id, profesor_id')
          .eq('id', (grupo as any).asignacion_profesor_id)
          .maybeSingle()
        if (!asgErr && asgRow?.profesor_id) {
          profesorId = asgRow.profesor_id
        }
      }

      if (!profesorId) {
        skipped.push({ grupoId, reason: 'No se pudo resolver profesor_id para este grupo (sin asignación).' })
        continue
      }

      const token = randomUUID()

      const row: any = {
        token,
        profesor_id: profesorId,
        curso_id: cursoId,
        grupo_id: grupoId,
        activo: true
      }
      if (periodoId != null && Number.isFinite(periodoId)) {
        row.periodo_id = periodoId
      }

      const { error: insertError } = await SupabaseDB.supabaseAdmin
        .from('qr_evaluaciones')
        .insert([row])

      if (insertError) {
        console.error('Error insert qr_evaluaciones para grupo', grupoId, insertError)
        continue
      }
      created.push({ grupoId, token })
    }

    res.status(201).json({ created, skipped })
  } catch (error) {
    console.error('Error POST /qr-evaluaciones/batch:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

/**
 * GET /qr-evaluaciones/:token
 * Resuelve un token y devuelve { profesorId, materiaId/cursoId, grupoId, periodoId } o 404.
 */
router.get('/:token', async (req: any, res) => {
  try {
    const { token } = req.params
    if (!token) {
      return res.status(400).json({ error: 'Token requerido.' })
    }

    const { data: row, error } = await SupabaseDB.supabaseAdmin
      .from('qr_evaluaciones')
      .select(`
        id,
        token,
        profesor_id,
        curso_id,
        grupo_id,
        periodo_id,
        profesor:profesores(
          id,
          usuario:usuarios(
            nombre,
            apellido
          )
        ),
        curso:cursos(
          id,
          nombre,
          codigo
        ),
        grupo:grupos(
          id,
          numero_grupo,
          horario,
          aula
        )
      `)
      .eq('token', token)
      .eq('activo', true)
      .maybeSingle()

    if (error) {
      console.error('Error GET qr_evaluaciones por token:', error)
      return res.status(500).json({ error: 'Error al resolver el token.' })
    }

    if (!row) {
      return res.status(404).json({ error: 'QR inválido o expirado.' })
    }

    const profesorNombre = `${row.profesor?.usuario?.nombre || ''} ${row.profesor?.usuario?.apellido || ''}`.trim()
    res.json({
      profesorId: row.profesor_id,
      cursoId: row.curso_id,
      materiaId: row.curso_id,
      grupoId: row.grupo_id,
      periodoId: row.periodo_id ?? null,
      profesorNombre: profesorNombre || null,
      cursoNombre: row.curso?.nombre ?? null,
      cursoCodigo: row.curso?.codigo ?? null,
      grupoNumero: row.grupo?.numero_grupo ?? null,
      grupoHorario: row.grupo?.horario ?? null,
      grupoAula: row.grupo?.aula ?? null
    })
  } catch (error) {
    console.error('Error GET /qr-evaluaciones/:token:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
