const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Las variables de configuración no están configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigarEstructuraEvaluaciones() {
  console.log('🔍 Investigando estructura de evaluaciones...\n');

  try {
    // 1. Ver estructura de la tabla evaluaciones
    console.log('📊 1. Estructura de la tabla evaluaciones:');
    const { data: evaluaciones, error: evalError } = await supabase
      .from('evaluaciones')
      .select('*')
      .limit(3);

    if (evalError) {
      console.error('❌ Error obteniendo evaluaciones:', evalError);
    } else {
      console.log('✅ Evaluaciones encontradas:', evaluaciones?.length || 0);
      if (evaluaciones && evaluaciones.length > 0) {
        console.log('📋 Columnas disponibles:', Object.keys(evaluaciones[0]));
        console.log('📄 Ejemplo de evaluación:', evaluaciones[0]);
      }
    }

    // 2. Ver estructura de la tabla cursos
    console.log('\n📊 2. Estructura de la tabla cursos:');
    const { data: cursos, error: cursosError } = await supabase
      .from('cursos')
      .select('*')
      .limit(3);

    if (cursosError) {
      console.error('❌ Error obteniendo cursos:', cursosError);
    } else {
      console.log('✅ Cursos encontrados:', cursos?.length || 0);
      if (cursos && cursos.length > 0) {
        console.log('📋 Columnas disponibles:', Object.keys(cursos[0]));
        console.log('📄 Ejemplo de curso:', cursos[0]);
      }
    }

    // 3. Ver estructura de la tabla grupos
    console.log('\n📊 3. Estructura de la tabla grupos:');
    const { data: grupos, error: gruposError } = await supabase
      .from('grupos')
      .select('*')
      .limit(3);

    if (gruposError) {
      console.error('❌ Error obteniendo grupos:', gruposError);
    } else {
      console.log('✅ Grupos encontrados:', grupos?.length || 0);
      if (grupos && grupos.length > 0) {
        console.log('📋 Columnas disponibles:', Object.keys(grupos[0]));
        console.log('📄 Ejemplo de grupo:', grupos[0]);
      }
    }

    // 4. Ver estructura de la tabla asignaciones_profesor
    console.log('\n📊 4. Estructura de la tabla asignaciones_profesor:');
    const { data: asignaciones, error: asignError } = await supabase
      .from('asignaciones_profesor')
      .select('*')
      .limit(3);

    if (asignError) {
      console.error('❌ Error obteniendo asignaciones:', asignError);
    } else {
      console.log('✅ Asignaciones encontradas:', asignaciones?.length || 0);
      if (asignaciones && asignaciones.length > 0) {
        console.log('📋 Columnas disponibles:', Object.keys(asignaciones[0]));
        console.log('📄 Ejemplo de asignación:', asignaciones[0]);
      }
    }

    // 5. Intentar relaciones específicas
    console.log('\n📊 5. Probando relaciones específicas:');
    
    // Evaluaciones con grupos
    const { data: evalGrupos, error: evalGruposError } = await supabase
      .from('evaluaciones')
      .select(`
        id,
        calificacion_promedio,
        fecha_creacion,
        grupos:grupos(
          id,
          curso_id,
          cursos:cursos(
            id,
            nombre,
            carrera_id,
            carreras:carreras(
              id,
              nombre
            )
          )
        )
      `)
      .limit(2);

    if (evalGruposError) {
      console.error('❌ Error en relación evaluaciones-grupos:', evalGruposError);
    } else {
      console.log('✅ Relación evaluaciones-grupos funciona');
      console.log('📄 Ejemplo:', evalGrupos?.[0]);
    }

    // Evaluaciones con cursos directamente
    const { data: evalCursos, error: evalCursosError } = await supabase
      .from('evaluaciones')
      .select(`
        id,
        calificacion_promedio,
        fecha_creacion,
        curso_id,
        cursos:cursos(
          id,
          nombre,
          carrera_id,
          carreras:carreras(
            id,
            nombre
          )
        )
      `)
      .limit(2);

    if (evalCursosError) {
      console.error('❌ Error en relación evaluaciones-cursos:', evalCursosError);
    } else {
      console.log('✅ Relación evaluaciones-cursos funciona');
      console.log('📄 Ejemplo:', evalCursos?.[0]);
    }

    console.log('\n✅ Investigación completada!');

  } catch (error) {
    console.error('❌ Error en la investigación:', error);
  }
}

// Ejecutar la investigación
investigarEstructuraEvaluaciones();



