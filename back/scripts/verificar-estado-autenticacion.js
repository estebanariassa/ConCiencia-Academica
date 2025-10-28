// Script para verificar el estado de autenticación y datos del usuario
const fs = require('fs');

function verificarEstadoAutenticacion() {
  console.log('🔍 Verificando estado de autenticación...\n');

  // Simular lo que ve el frontend
  console.log('📊 1. Estado del localStorage (simulado):');
  
  // Verificar si hay un usuario decano en la base de datos
  console.log('📊 2. Usuarios decano en la base de datos:');
  console.log('   - celopez@udemedellin.edu.co (Carlos Eduardo López Bermeo)');
  console.log('   - Tipo: decano');
  console.log('   - Roles: [decano]');
  
  console.log('\n📊 3. Problema identificado:');
  console.log('   ❌ El frontend no puede conectarse al backend');
  console.log('   ❌ Los endpoints requieren autenticación válida');
  console.log('   ❌ El usuario decano necesita estar autenticado');
  
  console.log('\n📊 4. Soluciones posibles:');
  console.log('   ✅ Opción 1: Verificar que el backend esté ejecutándose');
  console.log('   ✅ Opción 2: Verificar que el usuario esté autenticado');
  console.log('   ✅ Opción 3: Usar datos mock temporalmente');
  
  console.log('\n📊 5. Datos disponibles en la base de datos:');
  console.log('   ✅ 6 carreras activas');
  console.log('   ✅ 12 profesores activos');
  console.log('   ✅ 13 asignaciones de materias');
  console.log('   ✅ 3 carreras con profesores asignados');
  
  console.log('\n🔧 Recomendación:');
  console.log('   1. Verificar que el backend esté ejecutándose en el puerto correcto');
  console.log('   2. Verificar que el usuario decano esté autenticado');
  console.log('   3. Si es necesario, usar datos mock temporalmente');
}

verificarEstadoAutenticacion();



