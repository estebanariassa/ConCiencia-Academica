import { GoogleGenerativeAI } from '@google/generative-ai'

export type AiSummaryResult = {
  summary: string
  topics: string[]
  acosoDetectado?: boolean
  mensajeAcoso?: string
}

export type SummaryContext = 'profesor' | 'coordinador' | 'decano'

// Inicializar Gemini API
const genAI = process.env.GOOGLE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  : null

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

const SPANISH_STOPWORDS = new Set<string>([
  'a','acaba','ahi','al','algo','algun','alguna','algunas','alguno','algunos','alla','alli','ambos','ante','antes','aquel','aquella','aquellas','aquello','aquellos','aqui','asi','aun','aunque','bajo','bastante','bien','cabe','cada','casi','cierto','cierta','ciertas','cierto','ciertos','como','con','contra','cual','cuales','cualquier','cualquiera','cualquieras','cuan','cuando','cuanta','cuantas','cuanto','cuantos','de','debe','deben','debido','decir','del','demasiada','demasiadas','demasiado','demasiados','dentro','deprisa','desde','despues','detras','dia','dias','dice','dicen','dicho','dicha','dichas','dichos','donde','dos','el','ella','ellas','ello','ellos','empleais','emplean','emplear','empleo','en','encima','entonces','entre','era','eramos','eran','eras','eres','es','esa','esas','ese','eso','esos','esta','estaba','estaban','estado','estados','estais','estamos','estan','estar','este','esto','estos','estoy','fin','fue','fueron','fui','fuimos','gueno','ha','hace','haceis','hacemos','hacen','hacer','haces','hacia','han','hasta','hay','incluso','intenta','intentais','intentamos','intentan','intentar','intentas','ir','jamas','junto','juntos','la','largo','las','le','les','llegar','lo','los','mas','me','menos','mi','mia','mias','mientras','mio','mios','mis','misma','mismas','mismo','mismos','modo','mucha','muchas','muchisima','muchisimas','muchisimo','muchisimos','mucho','muchos','muy','nada','ni','ningun','ninguna','ningunas','ninguno','ningunos','no','nos','nosotras','nosotros','nuestra','nuestras','nuestro','nuestros','nunca','os','otra','otras','otro','otros','para','parecer','pero','poca','pocas','poco','pocos','podeis','podemos','poder','podria','podriais','podriamos','podrian','podrias','por','por que','porque','primero','puede','pueden','pues','que','querer','quien','quienes','quiza','quizas','sabe','sabeis','sabemos','saben','saber','sabes','se','segun','ser','si','siempre','siendo','sin','sino','so','sobre','sois','solamente','solo','somos','son','soy','su','sus','suya','suyas','suyo','suyos','tal','tales','tambien','tampoco','tan','tanta','tantas','tanto','tantos','te','teneis','tenemos','tener','tengo','tenido','tiene','tienen','toda','todas','todavia','todo','todos','tras','tu','tus','tuya','tuyas','tuyo','tuyos','ultima','ultimas','ultimo','ultimos','un','una','unas','uno','unos','usa','usais','usamos','usan','usar','usas','usted','ustedes','va','vais','valor','vamos','van','varias','varios','vaya','verdad','verdadera','verdadero','vosotras','vosotros','voy','ya','yo'
])

function extractTopKeywords(texts: string[], maxTerms: number = 10): string[] {
  const counts = new Map<string, number>()
  for (const raw of texts) {
    const cleaned = normalizeText(raw)
    const tokens = cleaned
      .replace(/[^a-zA-Z\p{L}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean)

    // unigrams
    for (const t of tokens) {
      if (t.length < 3) continue
      if (SPANISH_STOPWORDS.has(t)) continue
      counts.set(t, (counts.get(t) || 0) + 1)
    }

    // bigrams
    for (let i = 0; i < tokens.length - 1; i++) {
      const a = tokens[i]
      const b = tokens[i + 1]
      if (!a || !b) continue
      if (SPANISH_STOPWORDS.has(a) || SPANISH_STOPWORDS.has(b)) continue
      if (a.length < 3 || b.length < 3) continue
      const bigram = `${a} ${b}`
      counts.set(bigram, (counts.get(bigram) || 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTerms)
    .map(([term]) => term)
}

function generateSmartSummary(responses: string[]): string {
  if (responses.length === 0) return 'No hay respuestas para resumir.'
  
  const total = responses.length
  const positiveWords = ['bueno', 'excelente', 'me gusta', 'útil', 'claro', 'ayuda', 'entender', 'fácil', 'comprender']
  const negativeWords = ['difícil', 'complicado', 'confuso', 'falta', 'mejorar', 'problema', 'malo', 'lento', 'rápido']
  const neutralWords = ['tiempo', 'ejemplo', 'material', 'evaluación', 'clase', 'profesor', 'contenido']
  
  let positiveCount = 0
  let negativeCount = 0
  let mentions: { [key: string]: number } = {}
  
  responses.forEach(r => {
    const lower = normalizeText(r)
    positiveWords.forEach(w => { if (lower.includes(w)) positiveCount++ })
    negativeWords.forEach(w => { if (lower.includes(w)) negativeCount++ })
    neutralWords.forEach(w => { if (lower.includes(w)) mentions[w] = (mentions[w] || 0) + 1 })
  })
  
  const positivePct = Math.round((positiveCount / total) * 100)
  const negativePct = Math.round((negativeCount / total) * 100)
  const topMentions = Object.entries(mentions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k)
  
  let summary = `Se analizaron ${total} respuestas de estudiantes. `
  
  if (positivePct > negativePct && positivePct > 30) {
    summary += `Los comentarios son mayormente positivos (${positivePct}% mencionan aspectos favorables). `
  } else if (negativePct > positivePct && negativePct > 30) {
    summary += `Se identifican áreas de mejora en ${negativePct}% de las respuestas. `
  } else {
    summary += `Las opiniones muestran una mezcla de comentarios positivos y constructivos. `
  }
  
  if (topMentions.length > 0) {
    summary += `Los temas más mencionados incluyen: ${topMentions.join(', ')}.`
  }
  
  return summary
}

export class AiService {
  static async summarizeOpenResponses(responses: string[], context: SummaryContext = 'profesor'): Promise<AiSummaryResult> {
    // Extraer temas por frecuencia local (SIEMPRE funciona, gratis)
    const topics = extractTopKeywords(responses, 10)
    
    // Detectar posibles menciones de acoso
    const acosoKeywords = [
      'acoso', 'harassment', 'hostigamiento', 'abus', 'maltrato', 'intimidación',
      'inapropiado', 'inadecuado', 'abusivo', 'violencia', 'amenaza', 'amenaz',
      'miedo', 'temor', 'inseguro', 'insegura', 'incomodo', 'incómodo', 'disgusto',
      'vergüenza', 'vergüenza', 'humillación', 'humillar', 'denunciar', 'queja grave',
      'comportamiento inapropiado', 'comentario inapropiado', 'tocamiento', 'tocar',
      'agresión', 'agredir', 'ofensa sexual', 'insinuación', 'insinuar'
    ]
    
    let acosoDetectado = false
    let mensajeAcoso = ''
    const textosConAcoso: string[] = []
    
    for (const respuesta of responses) {
      const lowerRespuesta = normalizeText(respuesta)
      for (const keyword of acosoKeywords) {
        if (lowerRespuesta.includes(normalizeText(keyword))) {
          acosoDetectado = true
          textosConAcoso.push(respuesta)
          break
        }
      }
    }
    
    if (acosoDetectado) {
      mensajeAcoso = `⚠️ ALERTA: Se detectaron menciones que podrían referirse a situaciones de acoso o comportamiento inapropiado en ${textosConAcoso.length} respuesta(s). Se recomienda revisar estas respuestas inmediatamente y tomar las acciones correspondientes según los protocolos institucionales.`
      console.warn('🚨 [AI Service] Posible acoso detectado:', textosConAcoso.length, 'respuesta(s)')
    }
    
    // Intentar usar Gemini API si está disponible
    let aiSummary = ''
    if (genAI) {
      try {
        // Usar Gemini 2.5 Flash (más nuevo, rápido y con mejor cuota)
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          generationConfig: { 
            temperature: 0.3,
            maxOutputTokens: 600
          } 
        })
        
        const joined = responses.slice(0, 50).join('\n- ') // Limitar a 50 respuestas para no exceder tokens
        
        // Generar prompt según el contexto
        let contextoPrompt = ''
        if (context === 'coordinador') {
          contextoPrompt = `Eres un asistente experto en análisis de retroalimentación educativa. Estás analizando las opiniones de estudiantes sobre TODOS los profesores de una carrera completa. 

Analiza las siguientes opiniones de estudiantes sobre su experiencia académica con los profesores de la carrera y genera:

1. Un resumen conciso (2-3 oraciones) que capture los puntos más importantes mencionados por los estudiantes sobre los profesores en general de la carrera.
2. Una lista de 5-10 temas o palabras clave más relevantes mencionados por los estudiantes sobre todos los profesores (separados por comas).

IMPORTANTE: 
- Habla en general sobre los profesores de la carrera, no sobre un profesor específico.
- El resumen debe reflejar las opiniones generales sobre todos los profesores.
- Responde SOLO en español y en este formato exacto:
Resumen: [tu resumen aquí]
Temas: [tema1, tema2, tema3, ...]

⚠️ DETECCIÓN DE ACOSO: Si detectas cualquier mención relacionada con acoso, hostigamiento, comportamiento inapropiado, violencia, abuso, intimidación, o cualquier situación que pueda representar un riesgo para los estudiantes, DEBES incluirlo claramente en el resumen con una mención destacada.

Opiniones de estudiantes sobre los profesores de la carrera:
${joined}`
        } else if (context === 'decano') {
          contextoPrompt = `Eres un asistente experto en análisis de retroalimentación educativa. Estás analizando las opiniones de estudiantes sobre TODOS los profesores de una facultad completa. 

Analiza las siguientes opiniones de estudiantes sobre su experiencia académica con los profesores de la facultad y genera:

1. Un resumen conciso (2-3 oraciones) que capture los puntos más importantes mencionados por los estudiantes sobre los profesores en general de la facultad.
2. Una lista de 5-10 temas o palabras clave más relevantes mencionados por los estudiantes sobre todos los profesores (separados por comas).

IMPORTANTE: 
- Habla en general sobre los profesores de la facultad, no sobre profesores específicos.
- El resumen debe reflejar las opiniones generales sobre todos los profesores.
- Responde SOLO en español y en este formato exacto:
Resumen: [tu resumen aquí]
Temas: [tema1, tema2, tema3, ...]

⚠️ DETECCIÓN DE ACOSO: Si detectas cualquier mención relacionada con acoso, hostigamiento, comportamiento inapropiado, violencia, abuso, intimidación, o cualquier situación que pueda representar un riesgo para los estudiantes, DEBES incluirlo claramente en el resumen con una mención destacada.

Opiniones de estudiantes sobre los profesores de la facultad:
${joined}`
        } else {
          // Contexto por defecto: profesor individual
          contextoPrompt = `Eres un asistente experto en análisis de retroalimentación educativa. 

Analiza las siguientes opiniones de estudiantes sobre su experiencia académica y genera:

1. Un resumen conciso (2-3 oraciones) que capture los puntos más importantes mencionados por los estudiantes.
2. Una lista de 5-10 temas o palabras clave más relevantes mencionados (separados por comas).

IMPORTANTE: Responde SOLO en español y en este formato exacto:
Resumen: [tu resumen aquí]
Temas: [tema1, tema2, tema3, ...]

⚠️ DETECCIÓN DE ACOSO: Si detectas cualquier mención relacionada con acoso, hostigamiento, comportamiento inapropiado, violencia, abuso, intimidación, o cualquier situación que pueda representar un riesgo para los estudiantes, DEBES incluirlo claramente en el resumen con una mención destacada.

Opiniones de estudiantes:
${joined}`
        }

        const result = await model.generateContent(contextoPrompt)
        const response = await result.response
        const text = response.text()
        
        // Parsear respuesta de Gemini
        const resumenMatch = text.match(/Resumen:\s*([\s\S]*?)(?=\n\s*Temas:|$)/i)
        const temasMatch = text.match(/Temas:\s*([\s\S]*?)$/i)
        
        if (resumenMatch) {
          aiSummary = resumenMatch[1].trim()
          console.log('✅ Resumen generado por Gemini IA:', aiSummary.substring(0, 100) + '...')
          
          // Si Gemini también devuelve temas, usarlos junto con los extraídos localmente
          if (temasMatch) {
            const temasIA = temasMatch[1]
              .split(/[,;]/)
              .map(t => t.trim())
              .filter(t => t.length > 0)
              .slice(0, 10)
            
            // Combinar temas de IA con temas locales (priorizando IA)
            const combinedTopics = [...new Set([...temasIA, ...topics.slice(0, 5)])].slice(0, 10)
            
            // Agregar mensaje de acoso si se detectó
            if (acosoDetectado && mensajeAcoso) {
              // Incluir el mensaje de acoso en el resumen si no está ya incluido
              if (!aiSummary.includes('acoso') && !aiSummary.includes('Acoso')) {
                aiSummary = `⚠️ ALERTA DE ACOSO: ${mensajeAcoso}\n\n${aiSummary}`
              }
            }
            
            return { 
              summary: aiSummary, 
              topics: combinedTopics,
              acosoDetectado,
              mensajeAcoso: acosoDetectado ? mensajeAcoso : undefined
            }
          }
        } else {
          // Si no viene en formato esperado, usar el texto completo como resumen
          aiSummary = text.trim()
          console.log('✅ Resumen generado por Gemini IA (formato alternativo)')
        }
      } catch (err: any) {
        console.warn('⚠️  Error con Gemini API:', err.message || err)
        console.log('📝 Usando resumen local inteligente como fallback')
      }
    } else {
      console.log('📝 Gemini API no configurada - usando resumen local inteligente')
    }
    
    // Generar resumen inteligente local (siempre funciona como fallback)
    const localSummary = generateSmartSummary(responses)
    
    // Preferir resumen de IA si está disponible, sino usar local
    let summary = aiSummary.trim() || localSummary
    
    // Agregar mensaje de acoso si se detectó y no está en el resumen
    if (acosoDetectado && mensajeAcoso && !summary.includes('acoso') && !summary.includes('Acoso')) {
      summary = `⚠️ ALERTA DE ACOSO: ${mensajeAcoso}\n\n${summary}`
    }
    
    return { 
      summary, 
      topics,
      acosoDetectado,
      mensajeAcoso: acosoDetectado ? mensajeAcoso : undefined
    }
  }
}

export default AiService



