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

async function investigarAsignacionesProfesor() {
  try {
    console.log('🔍 Investigando tabla asignaciones_profesor...');
    
    // 1. Ver estructura completa de asignaciones_profesor
    console.log('📋 Paso 1: Estructura de asignaciones_profesor...');
    const { data: asignaciones, error: asignacionesError } = await supabase
      .from('asignaciones_profesor')
      .select('*')
      .limit(5);

    if (asignacionesError) {
      console.error('❌ Error consultando asignaciones:', asignacionesError);
    } else {
      console.log('✅ Estructura de asignaciones_profesor:', asignaciones);
    }

    // 2. Obtener profesores con sus materias asignadas
    console.log('\n📋 Paso 2: Profesores con sus materias asignadas...');
    
    const { data: profesoresConMaterias, error: profesoresError } = await supabase
      .from('profesores')
      .select(`
        id,
        codigo_profesor,
        carrera_id,
        usuarios:usuarios(
          nombre,
          apellido,
          email
        ),
        asignaciones_profesor:asignaciones_profesor(
          curso_id,
          activa,
          cursos:cursos(
            id,
            nombre,
            codigo,
            creditos
          )
        )
      `)
      .eq('activo', true)
      .eq('usuarios.activo', true)
      .eq('asignaciones_profesor.activa', true)
      .limit(3);

    if (profesoresError) {
      console.error('❌ Error consultando profesores con materias:', profesoresError);
    } else {
      console.log('✅ Profesores con materias asignadas:', profesoresConMaterias);
    }

    // 3. Verificar si hay grupos relacionados
    console.log('\n📋 Paso 3: Verificando tabla grupos...');
    try {
      const { data: grupos, error: gruposError } = await supabase
        .from('grupos')
        .select('*')
        .limit(3);
      
      if (!gruposError) {
        console.log('✅ Estructura de grupos:', grupos);
      }
    } catch (e) {
      console.log('❌ Tabla grupos no encontrada');
    }

    // 4. Contar asignaciones por profesor
    console.log('\n📋 Paso 4: Contando asignaciones por profesor...');
    const { data: conteoAsignaciones, error: conteoError } = await supabase
      .from('asignaciones_profesor')
      .select('profesor_id')
      .eq('activa', true);

    if (!conteoError) {
      const conteoPorProfesor = {};
      conteoAsignaciones.forEach(asig => {
        conteoPorProfesor[asig.profesor_id] = (conteoPorProfesor[asig.profesor_id] || 0) + 1;
      });
      
      console.log('✅ Asignaciones por profesor:', conteoPorProfesor);
    }

  } catch (error) {
    console.error('❌ Error durante la investigación:', error.message);
  }
}

// Ejecutar la investigación
investigarAsignacionesProfesor();



