import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'

dotenv.config()

async function listAvailableModels() {
  console.log('🔍 Listando modelos disponibles de Gemini...\n')
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  
  if (!apiKey) {
    console.log('❌ GOOGLE_GEMINI_API_KEY no configurada\n')
    process.exit(1)
  }
  
  console.log('✅ API Key encontrada\n')
  
  try {
    // Listar modelos usando la API REST directamente
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    console.log('✅ Modelos disponibles:\n')
    const models = response.data.models || []
    
    if (models.length === 0) {
      console.log('⚠️  No se encontraron modelos disponibles')
    } else {
      models.forEach((model: any) => {
        const name = model.name || 'Sin nombre'
        const displayName = model.displayName || name
        const supportedMethods = model.supportedGenerationMethods || []
        
        console.log(`📦 ${displayName}`)
        console.log(`   Nombre: ${name}`)
        console.log(`   Métodos: ${supportedMethods.join(', ')}`)
        
        if (supportedMethods.includes('generateContent')) {
          console.log(`   ✅ Soporta generateContent`)
        }
        console.log('')
      })
      
      // Probar con el primer modelo que soporte generateContent
      const workingModel = models.find((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent')
      )
      
      if (workingModel) {
        const modelName = workingModel.name.replace('models/', '')
        console.log(`\n🔄 Probando con modelo: ${modelName}...\n`)
        
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: modelName })
        
        const result = await model.generateContent('Responde solo OK')
        const response = await result.response
        const text = response.text()
        
        console.log(`✅ ¡Funciona! Modelo correcto: ${modelName}`)
        console.log(`📝 Respuesta: ${text.trim()}\n`)
        console.log(`💡 Usa este modelo en tu código: "${modelName}"\n`)
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message)
    
    if (error.response?.status === 403) {
      console.log('\n⚠️  Problema: Sin permisos o API no habilitada')
    } else if (error.response?.status === 404) {
      console.log('\n⚠️  Problema: Endpoint no encontrado')
    }
  }
}

listAvailableModels()


