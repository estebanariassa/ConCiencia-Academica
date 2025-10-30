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

async function investigarEstructuraMaterias() {
  try {
    console.log('🔍 Investigando estructura de materias y profesores...');
    
    // 1. Ver estructura de la tabla cursos
    console.log('📋 Paso 1: Estructura de la tabla cursos...');
    const { data: cursos, error: cursosError } = await supabase
      .from('cursos')
      .select('*')
      .limit(3);

    if (cursosError) {
      console.error('❌ Error consultando cursos:', cursosError);
    } else {
      console.log('✅ Estructura de cursos:', cursos);
    }

    // 2. Buscar tablas que puedan relacionar profesores con materias
    console.log('\n📋 Paso 2: Buscando relaciones profesor-materia...');
    
    // Intentar diferentes nombres de tablas posibles
    const posiblesTablas = [
      'profesor_materias',
      'profesor_cursos', 
      'materias_profesor',
      'cursos_profesor',
      'asignaciones',
      'asignaciones_profesor',
      'profesor_asignaciones',
      'materias',
      'asignaturas',
      'profesor_asignaturas',
      'asignaturas_profesor'
    ];

    for (const tabla of posiblesTablas) {
      try {
        const { data: testData, error: testError } = await supabase
          .from(tabla)
          .select('*')
          .limit(1);
        
        if (!testError && testData) {
          console.log(`✅ Tabla encontrada: ${tabla}`);
          console.log(`   Estructura:`, testData[0]);
        }
      } catch (e) {
        // Tabla no existe, continuar
      }
    }

    // 3. Verificar si hay alguna columna en profesores que relacione con materias
    console.log('\n📋 Paso 3: Verificando estructura de profesores...');
    const { data: profesores, error: profesoresError } = await supabase
      .from('profesores')
      .select('*')
      .limit(2);

    if (profesoresError) {
      console.error('❌ Error consultando profesores:', profesoresError);
    } else {
      console.log('✅ Estructura de profesores:', profesores);
    }

    // 4. Buscar en todas las tablas que contengan "profesor" o "materia"
    console.log('\n📋 Paso 4: Buscando tablas relacionadas...');
    
    // Lista de tablas conocidas del sistema
    const tablasConocidas = [
      'usuarios',
      'profesores', 
      'estudiantes',
      'carreras',
      'cursos',
      'evaluaciones',
      'respuestas_evaluacion',
      'coordinadores',
      'usuario_roles'
    ];

    for (const tabla of tablasConocidas) {
      try {
        const { data: estructura, error: estructuraError } = await supabase
          .from(tabla)
          .select('*')
          .limit(1);
        
        if (!estructuraError && estructura && estructura.length > 0) {
          const columnas = Object.keys(estructura[0]);
          const columnasRelevantes = columnas.filter(col => 
            col.includes('profesor') || 
            col.includes('materia') || 
            col.includes('curso') ||
            col.includes('asignatura')
          );
          
          if (columnasRelevantes.length > 0) {
            console.log(`✅ ${tabla}:`, columnasRelevantes);
          }
        }
      } catch (e) {
        console.log(`❌ Error consultando ${tabla}:`, e.message);
      }
    }

  } catch (error) {
    console.error('❌ Error durante la investigación:', error.message);
  }
}

// Ejecutar la investigación
investigarEstructuraMaterias();




