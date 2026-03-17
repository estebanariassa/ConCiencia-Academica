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

export default router
