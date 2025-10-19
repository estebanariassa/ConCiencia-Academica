const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTeacherCourses() {
  console.log('🔍 Probando la lógica de cursos de profesores...');
  
  try {
    // 1. Obtener un profesor de ejemplo
    console.log('\n1. Obteniendo profesores de ejemplo...');
    const { data: profesores, error: profesError } = await supabase
      .from('profesores')
      .select(`
        id,
        usuario_id,
        activo,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email
        )
      `)
      .eq('activo', true)
      .limit(3);

    if (profesError) {
      console.error('❌ Error obteniendo profesores:', profesError);
      return;
    }

    console.log(`✅ Profesores encontrados: ${profesores?.length || 0}`);
    
    if (!profesores || profesores.length === 0) {
      console.log('⚠️ No hay profesores activos para probar');
      return;
    }

    // 2. Probar con cada profesor
    for (const profesor of profesores) {
      console.log(`\n2. Probando con profesor: ${profesor.usuarios?.nombre} ${profesor.usuarios?.apellido}`);
      console.log(`   - Profesor ID: ${profesor.id}`);
      console.log(`   - Usuario ID: ${profesor.usuario_id}`);
      console.log(`   - Email: ${profesor.usuarios?.email}`);

      // 3. Obtener asignaciones del profesor
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
            creditos,
            descripcion,
            activo,
            carrera_id,
            carreras:carreras(
              id,
              nombre,
              codigo
            )
          )
        `)
        .eq('profesor_id', profesor.id)
        .eq('activa', true);

      if (asignError) {
        console.error('❌ Error obteniendo asignaciones:', asignError);
        continue;
      }

      // 4. Filtrar cursos activos
      const cursos = (asignaciones || [])
        .filter(asig => asig.cursos && asig.cursos.activo)
        .map(asig => ({
          id: asig.cursos.id,
          nombre: asig.cursos.nombre,
          codigo: asig.cursos.codigo,
          creditos: asig.cursos.creditos,
          carrera: asig.cursos.carreras
        }));

      console.log(`   - Asignaciones activas: ${asignaciones?.length || 0}`);
      console.log(`   - Cursos activos: ${cursos.length}`);
      
      if (cursos.length > 0) {
        console.log('   - Lista de cursos:');
        cursos.forEach((curso, index) => {
          console.log(`     ${index + 1}. ${curso.nombre} (${curso.codigo}) - ${curso.creditos} créditos - ${curso.carrera?.nombre || 'Sin carrera'}`);
        });
      } else {
        console.log('   - ⚠️ Este profesor no tiene cursos asignados');
      }
    }

    // 5. Probar con un usuario que no es profesor
    console.log('\n3. Probando con usuario que no es profesor...');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, email, tipo_usuario')
      .neq('tipo_usuario', 'profesor')
      .limit(1);

    if (usuariosError) {
      console.error('❌ Error obteniendo usuarios:', usuariosError);
    } else if (usuarios && usuarios.length > 0) {
      const usuario = usuarios[0];
      console.log(`   - Usuario: ${usuario.nombre} ${usuario.apellido} (${usuario.tipo_usuario})`);
      
      // Verificar si tiene registro en profesores
      const { data: profesorCheck } = await supabase
        .from('profesores')
        .select('id')
        .eq('usuario_id', usuario.id)
        .eq('activo', true)
        .single();

      if (profesorCheck) {
        console.log('   - ✅ Tiene registro en profesores');
      } else {
        console.log('   - ⚠️ No tiene registro en profesores (debería retornar array vacío)');
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testTeacherCourses();
