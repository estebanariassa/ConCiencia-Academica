const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProfesoresSistemas() {
  console.log('🔍 Debug: Buscando profesores de Ingeniería de Sistemas (carrera_id = 1)');
  
  try {
    // 1. Verificar que la carrera existe
    console.log('\n1. Verificando carrera...');
    const { data: carrera, error: carreraError } = await supabase
      .from('carreras')
      .select('id, nombre, codigo, activa')
      .eq('id', 1)
      .single();
    
    if (carreraError) {
      console.error('❌ Error obteniendo carrera:', carreraError);
    } else {
      console.log('✅ Carrera encontrada:', carrera);
    }
    
    // 2. Buscar profesores de la carrera
    console.log('\n2. Buscando profesores de la carrera...');
    const { data: profesores, error: profesError } = await supabase
      .from('profesores')
      .select(`
        id,
        usuario_id,
        activo,
        codigo_profesor,
        carrera_id,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email,
          activo
        )
      `)
      .eq('activo', true)
      .eq('usuarios.activo', true)
      .eq('carrera_id', 1);
    
    if (profesError) {
      console.error('❌ Error obteniendo profesores:', profesError);
    } else {
      console.log(`✅ Profesores encontrados: ${profesores?.length || 0}`);
      if (profesores && profesores.length > 0) {
        profesores.forEach((prof, index) => {
          console.log(`  ${index + 1}. ${prof.usuarios?.nombre} ${prof.usuarios?.apellido} (${prof.usuarios?.email}) - ID: ${prof.id}`);
        });
      }
    }
    
    // 3. Buscar todos los profesores para comparar
    console.log('\n3. Buscando TODOS los profesores para comparar...');
    const { data: todosProfesores, error: todosError } = await supabase
      .from('profesores')
      .select(`
        id,
        usuario_id,
        activo,
        codigo_profesor,
        carrera_id,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email,
          activo
        )
      `)
      .eq('activo', true)
      .eq('usuarios.activo', true);
    
    if (todosError) {
      console.error('❌ Error obteniendo todos los profesores:', todosError);
    } else {
      console.log(`✅ Total de profesores activos: ${todosProfesores?.length || 0}`);
      if (todosProfesores && todosProfesores.length > 0) {
        console.log('📋 Lista de todos los profesores:');
        todosProfesores.forEach((prof, index) => {
          console.log(`  ${index + 1}. ${prof.usuarios?.nombre} ${prof.usuarios?.apellido} - Carrera ID: ${prof.carrera_id} - Email: ${prof.usuarios?.email}`);
        });
      }
    }
    
    // 4. Verificar asignaciones de cursos
    console.log('\n4. Verificando asignaciones de cursos...');
    if (profesores && profesores.length > 0) {
      const profesorIds = profesores.map(p => p.id);
      console.log('🔍 IDs de profesores para buscar asignaciones:', profesorIds);
      
      const { data: asignaciones, error: asignError } = await supabase
        .from('asignaciones_profesor')
        .select(`
          id,
          profesor_id,
          curso_id,
          activa,
          cursos:cursos(
            id,
            nombre,
            codigo,
            carrera_id,
            activo
          )
        `)
        .in('profesor_id', profesorIds)
        .eq('activa', true);
      
      if (asignError) {
        console.error('❌ Error obteniendo asignaciones:', asignError);
      } else {
        console.log(`✅ Asignaciones encontradas: ${asignaciones?.length || 0}`);
        if (asignaciones && asignaciones.length > 0) {
          asignaciones.forEach((asig, index) => {
            console.log(`  ${index + 1}. Profesor ID: ${asig.profesor_id} - Curso: ${asig.cursos?.nombre} (${asig.cursos?.codigo}) - Carrera: ${asig.cursos?.carrera_id}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

debugProfesoresSistemas();
