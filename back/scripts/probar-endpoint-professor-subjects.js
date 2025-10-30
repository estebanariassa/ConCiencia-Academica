require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function probarEndpointProfessorSubjects() {
  console.log('🔍 Probando endpoint /api/teachers/professor-subjects...\n');

  try {
    // Simular la lógica del endpoint
    console.log('📊 1. Obteniendo carreras activas...');
    const { data: carreras, error: carrerasError } = await supabase
      .from('carreras')
      .select('id, nombre, codigo, activa')
      .eq('activa', true)
      .not('nombre', 'ilike', '%tronco%')
      .not('nombre', 'ilike', '%común%')
      .not('nombre', 'ilike', '%comun%');

    if (carrerasError) {
      console.error('❌ Error obteniendo carreras:', carrerasError);
      return;
    }

    console.log('✅ Carreras encontradas:', carreras?.length || 0);
    if (carreras && carreras.length > 0) {
      carreras.forEach(carrera => {
        console.log(`   - ${carrera.nombre} (ID: ${carrera.id})`);
      });
    }

    console.log('\n📊 2. Obteniendo profesores activos...');
    const { data: profesores, error: profesoresError } = await supabase
      .from('profesores')
      .select(`
        id,
        usuario_id,
        codigo_profesor,
        activo,
        carrera_id,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email
        )
      `)
      .eq('activo', true);

    if (profesoresError) {
      console.error('❌ Error obteniendo profesores:', profesoresError);
      return;
    }

    console.log('✅ Profesores encontrados:', profesores?.length || 0);
    if (profesores && profesores.length > 0) {
      profesores.forEach(profesor => {
        console.log(`   - ${profesor.usuarios?.nombre} ${profesor.usuarios?.apellido} (Carrera ID: ${profesor.carrera_id})`);
      });
    }

    console.log('\n📊 3. Obteniendo asignaciones de profesores...');
    const profesorIds = profesores?.map(p => p.id) || [];
    
    if (profesorIds.length === 0) {
      console.log('⚠️ No hay profesores para buscar asignaciones');
      return;
    }

    const { data: asignaciones, error: asignacionesError } = await supabase
      .from('asignaciones_profesor')
      .select(`
        id,
        profesor_id,
        curso_id,
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

    if (asignacionesError) {
      console.error('❌ Error obteniendo asignaciones:', asignacionesError);
      return;
    }

    console.log('✅ Asignaciones encontradas:', asignaciones?.length || 0);

    console.log('\n📊 4. Procesando datos por carrera...');
    const profesoresPorCarrera = {};
    const carrerasConDatos = [];

    for (const carrera of carreras || []) {
      const profesoresCarrera = profesores?.filter(p => p.carrera_id === carrera.id) || [];
      const profesoresConMaterias = [];

      for (const profesor of profesoresCarrera) {
        const materiasAsignadas = asignaciones?.filter(a => 
          a.profesor_id === profesor.id && 
          a.cursos?.activo === true
        ) || [];

        const materiasCarrera = materiasAsignadas.map(a => ({
          id: a.cursos.id,
          nombre: a.cursos.nombre,
          codigo: a.cursos.codigo
        }));

        profesoresConMaterias.push({
          id: profesor.id,
          nombre: `${profesor.usuarios?.nombre} ${profesor.usuarios?.apellido}`,
          email: profesor.usuarios?.email,
          codigo_profesor: profesor.codigo_profesor,
          carrera_id: profesor.carrera_id,
          carrera_nombre: carrera.nombre,
          materias_asignadas: materiasCarrera,
          total_materias_asignadas: materiasCarrera.length
        });
      }

      profesoresPorCarrera[carrera.id.toString()] = profesoresConMaterias;
      
      if (profesoresConMaterias.length > 0) {
        carrerasConDatos.push({
          id: carrera.id,
          nombre: carrera.nombre,
          codigo: carrera.codigo,
          activa: carrera.activa,
          total_profesores: profesoresConMaterias.length,
          total_materias: profesoresConMaterias.reduce((sum, p) => sum + p.total_materias_asignadas, 0)
        });
      }
    }

    console.log('\n📊 5. Resultado final:');
    console.log('✅ Carreras con datos:', carrerasConDatos.length);
    carrerasConDatos.forEach(carrera => {
      console.log(`   - ${carrera.nombre}: ${carrera.total_profesores} profesores, ${carrera.total_materias} materias`);
    });

    console.log('\n📊 6. Profesores por carrera:');
    Object.keys(profesoresPorCarrera).forEach(carreraId => {
      const profesores = profesoresPorCarrera[carreraId];
      const carrera = carreras?.find(c => c.id.toString() === carreraId);
      console.log(`\n   ${carrera?.nombre} (${profesores.length} profesores):`);
      profesores.forEach(profesor => {
        console.log(`     - ${profesor.nombre}: ${profesor.total_materias_asignadas} materias`);
        if (profesor.materias_asignadas.length > 0) {
          profesor.materias_asignadas.forEach(materia => {
            console.log(`       * ${materia.nombre} (${materia.codigo})`);
          });
        }
      });
    });

    const resultado = {
      carreras: carrerasConDatos,
      profesores_por_carrera: profesoresPorCarrera,
      total_carreras: carrerasConDatos.length,
      total_profesores: Object.values(profesoresPorCarrera).flat().length,
      total_materias: Object.values(profesoresPorCarrera).flat().reduce((sum, p) => sum + p.total_materias_asignadas, 0)
    };

    console.log('\n🎉 Endpoint simulado exitosamente!');
    console.log('📊 Resumen:', {
      carreras: resultado.total_carreras,
      profesores: resultado.total_profesores,
      materias: resultado.total_materias
    });

  } catch (error) {
    console.error('❌ Error en la simulación:', error);
  }
}

probarEndpointProfessorSubjects();




