import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'

dotenv.config()

async function diagnoseGemini() {
  console.log('🔍 Diagnóstico de Google Gemini API\n')
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('❌ GOOGLE_GEMINI_API_KEY no configurada\n')
    process.exit(1)
  }
  
  console.log('✅ API Key encontrada')
  console.log(`📋 Formato: ${apiKey.startsWith('AIza') ? 'Correcto (empieza con AIza)' : '⚠️  Formato inusual'}`)
  console.log(`📋 Longitud: ${apiKey.length} caracteres\n`)
  
  // Probar directamente con la API REST
  console.log('🔄 Probando acceso directo a la API...\n')
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: 'Hola' }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    console.log('✅ Conexión exitosa con API REST')
    console.log('📝 Respuesta:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...\n')
    
  } catch (error: any) {
    console.log('❌ Error con API REST directa:')
    if (error.response) {
      console.log(`   Status: ${error.response.status}`)
      console.log(`   Mensaje: ${JSON.stringify(error.response.data)}`)
      
      if (error.response.status === 403) {
        console.log('\n⚠️  Problema: API no habilitada o sin permisos')
        console.log('   Solución:')
        console.log('   1. Ve a: https://console.cloud.google.com/apis/library')
        console.log('   2. Busca "Generative Language API"')
        console.log('   3. Habilita la API para tu proyecto')
        console.log('   4. O crea un nuevo proyecto y habilita la API\n')
      } else if (error.response.status === 404) {
        console.log('\n⚠️  Problema: Modelo no encontrado')
        console.log('   Esto puede indicar que la API no está habilitada\n')
      }
    } else {
      console.log(`   ${error.message}\n`)
    }
  }
  
  // Probar con la librería oficial
  console.log('🔄 Probando con librería @google/generative-ai...\n')
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent('test')
    const response = await result.response
    console.log('✅ Librería funciona')
    console.log(`📝 Respuesta: ${response.text()}\n`)
    
  } catch (error: any) {
    console.log('❌ Error con librería:')
    console.log(`   ${error.message}\n`)
    
    if (error.message?.includes('404')) {
      console.log('💡 Sigue estos pasos para habilitar Gemini:')
      console.log('\n   1. Ve a: https://console.cloud.google.com/')
      console.log('   2. Selecciona o crea un proyecto')
      console.log('   3. Ve a: APIs & Services > Library')
      console.log('   4. Busca: "Generative Language API"')
      console.log('   5. Haz clic en "Enable"')
      console.log('   6. Espera unos minutos y vuelve a probar\n')
      console.log('   O usa la API key desde: https://makersuite.google.com/app/apikey')
      console.log('   (Esa key ya tiene la API habilitada)\n')
    }
  }
}

diagnoseGemini()


