const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando URL de conexión de base de datos...\n');

console.log('📋 Para obtener la URL de conexión correcta de Supabase:');
console.log('1. Ve a https://supabase.com y inicia sesión');
console.log('2. Selecciona tu proyecto: kwwcglvezbrxhkzudknh');
console.log('3. Ve a Settings > Database');
console.log('4. Busca la sección "Connection string"');
console.log('5. Selecciona "URI" y copia la URL completa');
console.log('6. La URL debería verse así:');
console.log('   postgresql://postgres:[YOUR-PASSWORD]@db.kwwcglvezbrxhkzudknh.supabase.co:5432/postgres\n');

console.log('💡 Alternativamente, puedes usar la URL de conexión directa:');
console.log('   postgresql://postgres:Morchis302!@db.kwwcglvezbrxhkzudknh.supabase.co:5432/postgres\n');

console.log('🔍 Verificando configuración actual...');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  let databaseUrl = '';
  
  lines.forEach(line => {
    if (line.startsWith('DATABASE_URL=')) {
      databaseUrl = line.split('=')[1];
    }
  });
  
  console.log('📊 DATABASE_URL actual:', databaseUrl);
  
  if (databaseUrl.includes('[Morchis302!]')) {
    console.log('\n⚠️  La URL contiene un placeholder');
    console.log('   Necesitas reemplazar [Morchis302!] con la contraseña real');
    console.log('\n🔧 Para corregir:');
    console.log('1. Edita el archivo .env');
    console.log('2. Cambia la línea DATABASE_URL por:');
    console.log('   DATABASE_URL=postgresql://postgres:Morchis302!@db.kwwcglvezbrxhkzudknh.supabase.co:5432/postgres');
  } else {
    console.log('\n✅ La URL parece estar configurada correctamente');
  }
} else {
  console.log('❌ No se encontró el archivo .env');
}

console.log('\n🚀 Después de corregir la URL, ejecuta:');
console.log('npm run test:login  # Probar conexión de Prisma');
console.log('npm run dev         # Iniciar servidor');
