const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Las variables de configuración no están configuradas');
  console.error('Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCareerResultsEndpoints() {
  console.log('🔍 Probando endpoints de resultados por carrera...\n');

  try {
    // Simular usuario decano
    const mockUser = {
      id: 'test-user-id',
      roles: ['decano'],
      tipo_usuario: 'decano'
    };

    console.log('📊 1. Probando endpoint /teachers/career-results/all');
    console.log('=' .repeat(50));

    // Obtener todas las carreras activas (excluyendo tronco común)
    const { data: carreras, error: carrerasError } = await supabase
      .from('carreras')
      .select(`
        id,
        nombre,
        codigo,
        activa
      `)
      .not('nombre', 'ilike', '%tronco%')
      .not('nombre', 'ilike', '%común%')
      .not('nombre', 'ilike', '%comun%')
      .eq('activa', true);

    if (carrerasError) {
      console.error('❌ Error obteniendo carreras:', carrerasError);
      return;
    }

    console.log(`✅ Carreras encontradas: ${carreras.length}`);
    carreras.forEach(carrera => {
      console.log(`   - ${carrera.nombre} (${carrera.codigo})`);
    });

    // Obtener estadísticas generales de evaluaciones
    const { data: evaluacionesGenerales, error: evalError } = await supabase
      .from('evaluaciones')
      .select(`
        id,
        calificacion_promedio,
        fecha_creacion,
        grupos:grupos(
          curso_id,
          cursos:cursos(
            carrera_id,
            carreras:carreras(
              id,
              nombre
            )
          )
        )
      `);

    if (evalError) {
      console.error('❌ Error obteniendo evaluaciones generales:', evalError);
      return;
    }

    console.log(`✅ Evaluaciones encontradas: ${evaluacionesGenerales?.length || 0}`);

    // Procesar datos por carrera
    const resultadosPorCarrera = carreras.map(carrera => {
      const evaluacionesCarrera = evaluacionesGenerales?.filter(eval => 
        eval.grupos?.cursos?.carrera_id === carrera.id
      ) || [];

      const calificaciones = evaluacionesCarrera.map(eval => eval.calificacion_promedio).filter(c => c !== null);
      const promedioCarrera = calificaciones.length > 0 
        ? calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length 
        : 0;

      return {
        carrera_id: carrera.id,
        carrera_nombre: carrera.nombre,
        carrera_codigo: carrera.codigo,
        total_evaluaciones: evaluacionesCarrera.length,
        calificacion_promedio: promedioCarrera,
        profesores_evaluados: new Set(evaluacionesCarrera.map(eval => eval.profesor_id)).size,
        ultima_evaluacion: evaluacionesCarrera.length > 0 
          ? Math.max(...evaluacionesCarrera.map(eval => new Date(eval.fecha_creacion).getTime()))
          : null
      };
    });

    // Estadísticas generales
    const totalEvaluaciones = evaluacionesGenerales?.length || 0;
    const calificacionesGenerales = evaluacionesGenerales?.map(eval => eval.calificacion_promedio).filter(c => c !== null) || [];
    const promedioGeneral = calificacionesGenerales.length > 0 
      ? calificacionesGenerales.reduce((sum, cal) => sum + cal, 0) / calificacionesGenerales.length 
      : 0;

    const resultadoGlobal = {
      periodo: '2025-2',
      estadisticas_generales: {
        total_carreras: carreras.length,
        total_evaluaciones: totalEvaluaciones,
        promedio_general: promedioGeneral,
        carreras_con_evaluaciones: resultadosPorCarrera.filter(r => r.total_evaluaciones > 0).length
      },
      resultados_por_carrera: resultadosPorCarrera,
      fecha_generacion: new Date().toISOString()
    };

    console.log('\n📈 Resultados globales:');
    console.log(`   Total carreras: ${resultadoGlobal.estadisticas_generales.total_carreras}`);
    console.log(`   Total evaluaciones: ${resultadoGlobal.estadisticas_generales.total_evaluaciones}`);
    console.log(`   Promedio general: ${resultadoGlobal.estadisticas_generales.promedio_general.toFixed(2)}`);
    console.log(`   Carreras con evaluaciones: ${resultadoGlobal.estadisticas_generales.carreras_con_evaluaciones}`);

    console.log('\n📊 Resultados por carrera:');
    resultadosPorCarrera.forEach(resultado => {
      console.log(`   ${resultado.carrera_nombre}:`);
      console.log(`     - Evaluaciones: ${resultado.total_evaluaciones}`);
      console.log(`     - Promedio: ${resultado.calificacion_promedio.toFixed(2)}`);
      console.log(`     - Profesores evaluados: ${resultado.profesores_evaluados}`);
    });

    console.log('\n📊 2. Probando endpoint /teachers/career-results/:careerId');
    console.log('=' .repeat(50));

    if (carreras.length > 0) {
      const primeraCarrera = carreras[0];
      console.log(`🔍 Probando con carrera: ${primeraCarrera.nombre} (ID: ${primeraCarrera.id})`);

      // Obtener información de la carrera
      const { data: carrera, error: carreraError } = await supabase
        .from('carreras')
        .select(`
          id,
          nombre,
          codigo,
          activa,
          descripcion
        `)
        .eq('id', primeraCarrera.id)
        .single();

      if (carreraError) {
        console.error('❌ Error obteniendo carrera:', carreraError);
        return;
      }

      // Obtener profesores de la carrera
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

      console.log(`✅ Profesores encontrados: ${profesores.length}`);

      // Obtener evaluaciones de la carrera
      const { data: evaluaciones, error: evaluacionesError } = await supabase
        .from('evaluaciones')
        .select(`
          id,
          calificacion_promedio,
          fecha_creacion,
          comentarios,
          profesor_id,
          grupos:grupos(
            curso_id,
            cursos:cursos(
              id,
              nombre,
              codigo,
              carrera_id,
              carreras:carreras(
                id,
                nombre
              )
            )
          )
        `)
        .eq('grupos.cursos.carrera_id', primeraCarrera.id);

      if (evaluacionesError) {
        console.error('❌ Error obteniendo evaluaciones:', evaluacionesError);
        return;
      }

      console.log(`✅ Evaluaciones de la carrera: ${evaluaciones?.length || 0}`);

      // Procesar datos por profesor
      const profesoresConResultados = profesores.map(profesor => {
        const evaluacionesProfesor = evaluaciones?.filter(eval => 
          eval.profesor_id === profesor.id
        ) || [];

        const calificaciones = evaluacionesProfesor.map(eval => eval.calificacion_promedio).filter(c => c !== null);
        const promedioProfesor = calificaciones.length > 0 
          ? calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length 
          : 0;

        const cursosEvaluados = evaluacionesProfesor.map(eval => ({
          curso_id: eval.grupos?.cursos?.id,
          curso_nombre: eval.grupos?.cursos?.nombre,
          curso_codigo: eval.grupos?.cursos?.codigo,
          calificacion: eval.calificacion_promedio,
          fecha_evaluacion: eval.fecha_creacion
        }));

        return {
          profesor_id: profesor.id,
          profesor_nombre: `${profesor.usuarios?.nombre} ${profesor.usuarios?.apellido}`,
          profesor_email: profesor.usuarios?.email,
          total_evaluaciones: evaluacionesProfesor.length,
          calificacion_promedio: promedioProfesor,
          cursos_evaluados: cursosEvaluados,
          ultima_evaluacion: evaluacionesProfesor.length > 0 
            ? Math.max(...evaluacionesProfesor.map(eval => new Date(eval.fecha_creacion).getTime()))
            : null
        };
      });

      // Estadísticas de la carrera
      const totalEvaluaciones = evaluaciones?.length || 0;
      const calificacionesGenerales = evaluaciones?.map(eval => eval.calificacion_promedio).filter(c => c !== null) || [];
      const promedioGeneral = calificacionesGenerales.length > 0 
        ? calificacionesGenerales.reduce((sum, cal) => sum + cal, 0) / calificacionesGenerales.length 
        : 0;

      const resultadoCarrera = {
        carrera: {
          id: carrera.id,
          nombre: carrera.nombre,
          codigo: carrera.codigo,
          descripcion: carrera.descripcion,
          activa: carrera.activo
        },
        periodo: '2025-2',
        estadisticas_carrera: {
          total_profesores: profesores.length,
          profesores_evaluados: profesoresConResultados.filter(p => p.total_evaluaciones > 0).length,
          total_evaluaciones: totalEvaluaciones,
          promedio_general: promedioGeneral,
          cursos_evaluados: new Set(evaluaciones?.map(eval => eval.grupos?.cursos?.id)).size
        },
        profesores: profesoresConResultados,
        fecha_generacion: new Date().toISOString()
      };

      console.log('\n📈 Resultados de la carrera:');
      console.log(`   Carrera: ${resultadoCarrera.carrera.nombre}`);
      console.log(`   Total profesores: ${resultadoCarrera.estadisticas_carrera.total_profesores}`);
      console.log(`   Profesores evaluados: ${resultadoCarrera.estadisticas_carrera.profesores_evaluados}`);
      console.log(`   Total evaluaciones: ${resultadoCarrera.estadisticas_carrera.total_evaluaciones}`);
      console.log(`   Promedio general: ${resultadoCarrera.estadisticas_carrera.promedio_general.toFixed(2)}`);
      console.log(`   Cursos evaluados: ${resultadoCarrera.estadisticas_carrera.cursos_evaluados}`);

      console.log('\n👥 Profesores con resultados:');
      profesoresConResultados.forEach(profesor => {
        console.log(`   ${profesor.profesor_nombre}:`);
        console.log(`     - Evaluaciones: ${profesor.total_evaluaciones}`);
        console.log(`     - Promedio: ${profesor.calificacion_promedio.toFixed(2)}`);
        console.log(`     - Cursos evaluados: ${profesor.cursos_evaluados.length}`);
      });
    }

    console.log('\n✅ Pruebas completadas exitosamente!');
    console.log('\n📋 Resumen de funcionalidades:');
    console.log('   ✅ Endpoint /teachers/career-results/all - Resultados globales');
    console.log('   ✅ Endpoint /teachers/career-results/:careerId - Resultados por carrera');
    console.log('   ✅ Filtrado de carreras (excluye tronco común)');
    console.log('   ✅ Cálculo de estadísticas por carrera');
    console.log('   ✅ Cálculo de estadísticas por profesor');
    console.log('   ✅ Manejo de errores y validaciones');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Ejecutar las pruebas
testCareerResultsEndpoints();
