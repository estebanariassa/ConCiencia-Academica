const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variables de entorno para pruebas...\n');

// Configuración para desarrollo local
const envContent = `# Base de datos local para pruebas
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/conciencia_academica"

# JWT para desarrollo
JWT_SECRET="dev_secret_key_for_testing_only"

# Servidor
PORT=3000
NODE_ENV=development

# Supabase (configurar con tus credenciales reales)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
`;

const envPath = path.join(__dirname, '.env');

try {
  // Verificar si ya existe un .env
  if (fs.existsSync(envPath)) {
    console.log('ℹ️  El archivo .env ya existe');
    console.log('📝 Contenido actual:');
    console.log(fs.readFileSync(envPath, 'utf8'));
    console.log('\n💡 Si necesitas actualizar las credenciales, edita el archivo .env manualmente');
  } else {
    // Crear archivo .env
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado con configuración de desarrollo');
    console.log('📝 Contenido:');
    console.log(envContent);
  }
  
  console.log('\n🔍 Para usar Supabase real:');
  console.log('1. Ve a tu proyecto en https://supabase.com');
  console.log('2. Copia la URL del proyecto y la Service Role Key');
  console.log('3. Actualiza las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
  console.log('4. Actualiza DATABASE_URL con la URL de conexión de Supabase');
  
  console.log('\n🚀 Para ejecutar las pruebas:');
  console.log('npm run test:connection  # Probar conexiones');
  console.log('npm run test:login       # Probar flujo de login');
  console.log('npm run dev              # Iniciar servidor con pruebas automáticas');
  
} catch (error) {
  console.error('❌ Error configurando .env:', error.message);
  process.exit(1);
}
