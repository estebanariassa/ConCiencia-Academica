const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Supabase para pruebas...\n');

console.log('📋 Para obtener las credenciales de Supabase:');
console.log('1. Ve a https://supabase.com y inicia sesión');
console.log('2. Selecciona tu proyecto: kwwcglvezbrxhkzudknh');
console.log('3. Ve a Settings > API');
console.log('4. Copia la "service_role" key (NO la anon key)');
console.log('5. La URL ya está configurada: https://kwwcglvezbrxhkzudknh.supabase.co\n');

console.log('💡 Una vez que tengas la service_role key:');
console.log('1. Edita el archivo .env');
console.log('2. Reemplaza el valor de SUPABASE_SERVICE_ROLE_KEY con tu clave real');
console.log('3. Ejecuta: npm run test:supabase-direct\n');

console.log('🔍 Verificando configuración actual...');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  let supabaseUrl = '';
  let supabaseKey = '';
  
  lines.forEach(line => {
    if (line.startsWith('SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  });
  
  console.log('✅ SUPABASE_URL:', supabaseUrl);
  console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', supabaseKey.substring(0, 20) + '...');
  
  if (supabaseKey.includes('placeholder')) {
    console.log('\n⚠️  La Service Role Key es un placeholder');
    console.log('   Necesitas reemplazarla con la clave real de Supabase');
  } else {
    console.log('\n✅ La Service Role Key parece ser real');
  }
} else {
  console.log('❌ No se encontró el archivo .env');
}

console.log('\n🚀 Comandos disponibles:');
console.log('npm run test:supabase-direct  # Probar conexión a Supabase');
console.log('npm run dev                   # Iniciar servidor con pruebas automáticas');
console.log('npm run test:local            # Probar con base de datos local (si tienes Docker)');
