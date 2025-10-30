require('dotenv').config();
const axios = require('axios');

async function probarEndpointReal() {
  console.log('🔍 Probando endpoint real /api/teachers/professor-subjects...\n');

  try {
    // Primero intentar sin autenticación para ver si responde
    console.log('📊 1. Probando sin autenticación...');
    try {
      const response = await axios.get('http://localhost:3000/api/teachers/professor-subjects');
      console.log('✅ Respuesta sin auth:', response.status, response.data);
    } catch (error) {
      console.log('❌ Error sin auth:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Intentar con token de prueba
    console.log('\n📊 2. Probando con token de prueba...');
    try {
      const response = await axios.get('http://localhost:3000/api/teachers/professor-subjects', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Respuesta con token:', response.status, response.data);
    } catch (error) {
      console.log('❌ Error con token:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Probar otros endpoints para verificar conectividad
    console.log('\n📊 3. Probando otros endpoints...');
    try {
      const response = await axios.get('http://localhost:3000/api/teachers/careers');
      console.log('✅ Endpoint /careers funciona:', response.status);
    } catch (error) {
      console.log('❌ Error en /careers:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Verificar si el servidor está respondiendo
    console.log('\n📊 4. Verificando conectividad del servidor...');
    try {
      const response = await axios.get('http://localhost:3000/health');
      console.log('✅ Servidor responde:', response.status);
    } catch (error) {
      console.log('❌ Servidor no responde:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

probarEndpointReal();




