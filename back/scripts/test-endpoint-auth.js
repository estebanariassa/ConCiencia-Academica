const jwt = require('jsonwebtoken');
require('dotenv').config();

// Simular un token JWT para Emilcy
const payload = {
  userId: 'emilcy-user-id', // Esto debería ser el ID real de Emilcy
  email: 'ejhernandez@udemedellin.edu.co',
  tipo_usuario: 'coordinador'
};

const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '24h' });

console.log('🔑 Token generado para Emilcy:');
console.log(token);
console.log('\n🔍 Payload del token:');
console.log(JSON.stringify(payload, null, 2));

console.log('\n📋 Para probar el endpoint, usa este comando:');
console.log(`curl -X GET "http://localhost:3000/api/teachers/by-career/1" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json"`);
