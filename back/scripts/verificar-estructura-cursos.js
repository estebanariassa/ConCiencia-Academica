const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase usando variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function verificarEstructuraCursos() {
  try {
    console.log('🔍 Verificando estructura de la tabla cursos...');
    
    // Obtener algunos registros de cursos para ver la estructura
    const { data: cursos, error: cursosError } = await supabase
      .from('cursos')
      .select('*')
      .limit(5);

    if (cursosError) {
      console.error('❌ Error consultando cursos:', cursosError);
      return;
    }

    console.log('✅ Estructura de la tabla cursos:');
    if (cursos && cursos.length > 0) {
      console.log('📋 Columnas disponibles:', Object.keys(cursos[0]));
      console.log('📋 Ejemplo de registro:', cursos[0]);
    } else {
      console.log('⚠️ No hay registros en la tabla cursos');
    }

    // También verificar si hay alguna tabla relacionada con profesores y cursos
    console.log('\n🔍 Verificando otras tablas relacionadas...');
    
    // Intentar con diferentes nombres de columnas
    const posiblesColumnas = ['profesor_id', 'profesor', 'teacher_id', 'teacher', 'docente_id', 'docente'];
    
    for (const columna of posiblesColumnas) {
      try {
        const { data: testData, error: testError } = await supabase
          .from('cursos')
          .select(`id, ${columna}`)
          .limit(1);
        
        if (!testError) {
          console.log(`✅ Columna encontrada: ${columna}`);
        }
      } catch (e) {
        console.log(`❌ Columna no encontrada: ${columna}`);
      }
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

// Ejecutar la verificación
verificarEstructuraCursos();



