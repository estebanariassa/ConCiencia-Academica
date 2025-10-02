import { supabase } from './Client'
import type { Teacher, Course, EvaluationAnswer } from '../../types'

export async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user?.id ?? null
}

export async function fetchTeachersWithCourses(): Promise<Teacher[]> {
  // Usa tus tablas: profesores, cursos. Asume FK: cursos.profesor_id -> profesores.id
  // Alias de columnas para mapear a los tipos del front
  const { data, error } = await supabase
    .from('profesores')
    .select(
      [
        'id',
        'nombre:name',
        'departamento',
        'email',
        'cursos:cursos(id,nombre:name,codigo:code,horario:schedule)'
      ].join(',')
    )
    .order('nombre', { ascending: true })

  if (error) throw error

  return (data || []).map((t: any) => ({
    id: String(t.id),
    name: t.name,
    department: t.departamento,
    email: t.email,
    courses: (t.cursos || []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      code: c.code,
      schedule: c.schedule ?? ''
    })) as Course[]
  })) as Teacher[]
}

export async function submitEvaluation(params: {
  teacherId: string
  courseId: string
  studentId: string
  comments?: string
  answers: EvaluationAnswer[]
  overallRating: number
}): Promise<void> {
  const { teacherId, courseId, studentId, comments, answers, overallRating } = params

  // Inserta en tu tabla evaluaciones (asumiendo columnas: profesor_id, curso_id, estudiante_id, comentarios, calificacion_promedio)
  const { data: evalInsert, error: evalErr } = await supabase
    .from('evaluaciones')
    .insert({
      profesor_id: teacherId,
      curso_id: courseId,
      estudiante_id: studentId,
      comentarios: comments ?? null,
      calificacion_promedio: overallRating
    })
    .select('id')
    .single()

  if (evalErr) throw evalErr

  const evaluationId = evalInsert.id

  if (answers.length > 0) {
    // Inserta en respuestas_evaluacion (asumiendo columnas: evaluacion_id, pregunta_id, calificacion, comentario)
    const payload = answers.map((a) => ({
      evaluacion_id: evaluationId,
      pregunta_id: a.questionId,
      calificacion: a.rating,
      comentario: a.comment ?? null
    }))

    const { error: ansErr } = await supabase.from('respuestas_evaluacion').insert(payload)
    if (ansErr) throw ansErr
  }
}


