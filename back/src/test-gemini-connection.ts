import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

async function testGeminiConnection() {
  console.log('🔍 Verificando conexión con Google Gemini API...\n')
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('❌ GOOGLE_GEMINI_API_KEY no está configurada')
    console.log('\n📝 Para configurarla:')
    console.log('   1. Ve a: https://makersuite.google.com/app/apikey')
    console.log('   2. Crea una nueva API key')
    console.log('   3. Añádela en back/.env como:')
    console.log('      GOOGLE_GEMINI_API_KEY=tu_api_key_aqui\n')
    process.exit(1)
  }
  
  console.log('✅ API Key encontrada en .env')
  console.log(`📋 Primeros caracteres: ${apiKey.substring(0, 10)}...`)
  console.log('\n🔄 Intentando conectar con Gemini...\n')
  
  const genAI = new GoogleGenerativeAI(apiKey)
  
  // Probar diferentes modelos
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-pro', 
    'gemini-pro',
    'models/gemini-1.5-flash',
    'models/gemini-pro'
  ]
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Probando modelo: ${modelName}...`)
      const model = genAI.getGenerativeModel({ model: modelName })
      
      const testPrompt = 'Responde solo "OK" si puedes leer esto.'
      const result = await model.generateContent(testPrompt)
      const response = await result.response
      const text = response.text()
      
      console.log(`\n✅ ¡Conexión exitosa con ${modelName}!`)
      console.log(`📝 Respuesta: ${text.trim()}\n`)
      
      // Prueba más realista con resumen
      console.log('🔄 Probando generación de resumen...\n')
      const summaryPrompt = `Resume brevemente estas opiniones en 2 oraciones en español:
- El ritmo de la clase es muy rápido
- Me gustan los ejemplos prácticos
- Falta claridad en algunos temas`
      
      const summaryResult = await model.generateContent(summaryPrompt)
      const summaryResponse = await summaryResult.response
      const summaryText = summaryResponse.text()
      
      console.log('✅ Resumen generado exitosamente:')
      console.log(`\n${summaryText}\n`)
      console.log('🎉 ¡Todo funciona correctamente!')
      console.log(`\n✅ Modelo funcional: ${modelName}`)
      console.log('✅ Puedes usar los endpoints de IA en tu aplicación.\n')
      
      return // Salir si funciona
      
    } catch (error: any) {
      console.log(`   ❌ ${modelName} no disponible: ${error.message?.substring(0, 80)}...`)
      continue
    }
  }
  
  console.log('\n❌ Ningún modelo funcionó. Verifica:')
  console.log('   1. Que tu API key sea válida')
  console.log('   2. Que hayas habilitado la API en Google Cloud Console')
  console.log('   3. Que tu cuenta tenga acceso a Gemini API')
  console.log('\n💡 Visita: https://ai.google.dev/ para más información\n')
  process.exit(1)
}

testGeminiConnection()
