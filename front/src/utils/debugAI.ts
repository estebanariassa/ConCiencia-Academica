import { apiClient } from '../api/client'

/**
 * Función de debug para verificar respuestas abiertas
 * Abre la consola del navegador y ejecuta:
 * import { debugOpenResponses } from './utils/debugAI'
 * debugOpenResponses('profesor_id_aqui', '2025-2')
 */
export async function debugOpenResponses(profesorId?: string, periodoId?: string) {
  try {
    console.log('🔍 Debug: Verificando respuestas abiertas...')
    console.log('📋 Parámetros:', { profesorId, periodoId })
    
    const params: any = {}
    if (profesorId) params.profesor_id = profesorId
    if (periodoId) params.periodo_id = periodoId
    
    const { data } = await apiClient.get('/api/ai/debug-open-responses', { params })
    
    console.log('✅ Resultado del debug:')
    console.log('   Total evaluaciones:', data.totalEvaluaciones)
    console.log('   Filtros usados:', data.filtrosUsados)
    console.log('   Detalles:', data.evaluaciones)
    
    const totalAbiertas = data.evaluaciones?.reduce((sum: number, ev: any) => sum + ev.respuestasAbiertas, 0) || 0
    console.log(`\n📊 Total respuestas abiertas encontradas: ${totalAbiertas}`)
    
    if (totalAbiertas === 0) {
      console.warn('⚠️  No se encontraron respuestas abiertas. Verifica:')
      console.warn('   1. Que haya evaluaciones completadas')
      console.warn('   2. Que las preguntas sean de tipo "abierta", "texto" o "libre"')
      console.warn('   3. Que las respuestas tengan contenido en respuesta_texto')
    }
    
    return data
  } catch (error: any) {
    console.error('❌ Error en debug:', error.response?.data || error.message)
    throw error
  }
}


