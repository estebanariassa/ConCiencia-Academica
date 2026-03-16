"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const generative_ai_1 = require("@google/generative-ai");
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
// Verificar conexión de IA al iniciar (opcional)
async function checkAIConnection() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        console.log('ℹ️  GOOGLE_GEMINI_API_KEY no configurada - usando resumen local inteligente');
        console.log('   💡 Obtén tu API key gratis en: https://makersuite.google.com/app/apikey');
        return false;
    }
    try {
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        await model.generateContent('test');
        console.log('✅ IA conectada correctamente (Google Gemini)');
        return true;
    }
    catch (error) {
        console.log('ℹ️  IA no disponible - usando resumen local inteligente (gratis)');
        if (error.message?.includes('API_KEY')) {
            console.log('   ⚠️  Verifica que tu GOOGLE_GEMINI_API_KEY sea válida');
        }
        return false;
    }
}
app_1.app.listen(PORT, async () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
    await checkAIConnection();
});
