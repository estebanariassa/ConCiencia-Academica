const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function debugProfessorIssue() {
  try {
    console.log('🔍 Debugging professor issue...\n');

    // 1. Primero necesitamos hacer login para obtener el token
    console.log('1. Making login request...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'profesor@test.com', // Usar un email de profesor existente
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained\n');

    // 2. Llamar al endpoint de debug
    console.log('2. Calling debug endpoint...');
    const debugResponse = await axios.get(`${API_BASE}/teachers/debug-professors`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Debug response received:');
    console.log(JSON.stringify(debugResponse.data, null, 2));

    // 3. Probar el endpoint de teacher-id
    console.log('\n3. Testing teacher-id endpoint...');
    try {
      const teacherIdResponse = await axios.get(`${API_BASE}/teachers/teacher-id`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Teacher ID response:', teacherIdResponse.data);
    } catch (error) {
      console.log('❌ Teacher ID error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugProfessorIssue();
