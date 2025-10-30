#!/usr/bin/env node

/**
 * Script para verificar que los datos del dashboard estén funcionando
 * Este script verifica que existan los datos necesarios para mostrar
 * información en el dashboard del profesor
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase - usar valores por defecto para desarrollo
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

console.log('🔧 Script para verificar datos del dashboard');
console.log('⚠️  IMPORTANTE: Este script usa valores hardcodeados');
console.log('   Para usarlo, edita las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
console.log('   en este archivo con los valores de tu proyecto de Supabase\n');

if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-service-role')) {
  console.error('❌ Error: Las variables de configuración no están configuradas');
  console.error('');
  console.error('🔧 Para solucionarlo:');
  console.error('   1. Edita este archivo (verificar-datos-dashboard.js)');
  console.error('   2. Reemplaza SUPABASE_URL con tu URL de Supabase');
  console.error('   3. Reemplaza SUPABASE_SERVICE_ROLE_KEY con tu service role key');
  console.error('');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDatosDashboard() {
  console.log('🔍 Verificando datos del dashboard...\n');

  try {
    // Verificar conexión
    console.log('🔍 Verificando conexión a la base de datos...');
    const { data: testData, error: testError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (testError) {
      throw new Error(`Error de conexión: ${testError.message}`);
    }
    console.log('✅ Conexión exitosa\n');

    // Verificar profesores
    console.log('👨‍🏫 Verificando profesores...');
    const { data: profesores, error: profesoresError } = await supabase
      .from('profesores')
      .select(`
        id,
        carrera_id,
        usuarios!inner(nombre, apellido, email)
      `)
      .eq('activo', true);

    if (profesoresError) {
      console.error(`❌ Error obteniendo profesores: ${profesoresError.message}`);
    } else {
      console.log(`✅ Profesores encontrados: ${profesores.length}`);
      if (profesores.length > 0) {
        console.log('📊 Muestra de profesores:');
        profesores.slice(0, 3).forEach((prof, index) => {
          console.log(`   ${index + 1}. ${prof.usuarios.nombre} ${prof.usuarios.apellido} (Carrera: ${prof.carrera_id})`);
        });
      }
    }

    // Verificar estudiantes
    console.log('\n👨‍🎓 Verificando estudiantes...');
    const { data: estudiantes, error: estudiantesError } = await supabase
      .from('estudiantes')
      .select('id')
      .eq('activo', true);

    if (estudiantesError) {
      console.error(`❌ Error obteniendo estudiantes: ${estudiantesError.message}`);
    } else {
      console.log(`✅ Estudiantes encontrados: ${estudiantes.length}`);
    }

    // Verificar cursos
    console.log('\n📚 Verificando cursos...');
    const { data: cursos, error: cursosError } = await supabase
      .from('cursos')
      .select('id, nombre, codigo')
      .eq('activo', true);

    if (cursosError) {
      console.error(`❌ Error obteniendo cursos: ${cursosError.message}`);
    } else {
      console.log(`✅ Cursos encontrados: ${cursos.length}`);
      if (cursos.length > 0) {
        console.log('📊 Muestra de cursos:');
        cursos.slice(0, 3).forEach((curso, index) => {
          console.log(`   ${index + 1}. ${curso.nombre} (${curso.codigo})`);
        });
      }
    }

    // Verificar grupos
    console.log('\n👥 Verificando grupos...');
    const { data: grupos, error: gruposError } = await supabase
      .from('grupos')
      .select('id, curso_id, numero_grupo')
      .eq('activo', true);

    if (gruposError) {
      console.error(`❌ Error obteniendo grupos: ${gruposError.message}`);
    } else {
      console.log(`✅ Grupos encontrados: ${grupos.length}`);
    }

    // Verificar evaluaciones
    console.log('\n📊 Verificando evaluaciones...');
    const { data: evaluaciones, error: evaluacionesError } = await supabase
      .from('evaluaciones')
      .select('id, calificacion_general, fecha_evaluacion, profesor_id')
      .limit(10);

    if (evaluacionesError) {
      console.error(`❌ Error obteniendo evaluaciones: ${evaluacionesError.message}`);
    } else {
      console.log(`✅ Evaluaciones encontradas: ${evaluaciones.length}`);
      if (evaluaciones.length > 0) {
        console.log('📊 Muestra de evaluaciones:');
        evaluaciones.slice(0, 3).forEach((eval, index) => {
          console.log(`   ${index + 1}. Calificación: ${eval.calificacion_general}, Fecha: ${eval.fecha_evaluacion}`);
        });
      }
    }

    // Verificar total de evaluaciones
    const { data: totalEvaluaciones, error: totalError } = await supabase
      .from('evaluaciones')
      .select('id', { count: 'exact' });

    if (!totalError) {
      console.log(`📊 Total de evaluaciones en la base de datos: ${totalEvaluaciones.length}`);
    }

    // Verificar estadísticas por profesor
    console.log('\n📈 Verificando estadísticas por profesor...');
    const { data: statsProfesores, error: statsError } = await supabase
      .from('evaluaciones')
      .select(`
        profesor_id,
        calificacion_general,
        profesores!inner(
          usuarios!inner(nombre, apellido)
        )
      `);

    if (!statsError && statsProfesores && statsProfesores.length > 0) {
      const statsPorProfesor = {};
      statsProfesores.forEach(eval => {
        const profId = eval.profesor_id;
        const nombre = `${eval.profesores.usuarios.nombre} ${eval.profesores.usuarios.apellido}`;
        
        if (!statsPorProfesor[profId]) {
          statsPorProfesor[profId] = {
            nombre,
            evaluaciones: [],
            promedio: 0
          };
        }
        statsPorProfesor[profId].evaluaciones.push(eval.calificacion_general);
      });

      console.log('📊 Estadísticas por profesor:');
      Object.values(statsPorProfesor).forEach(prof => {
        prof.promedio = (prof.evaluaciones.reduce((a, b) => a + b, 0) / prof.evaluaciones.length).toFixed(2);
        console.log(`   📊 ${prof.nombre}: ${prof.evaluaciones.length} evaluaciones, promedio: ${prof.promedio}`);
      });
    }

    // Resumen final
    console.log('\n📋 RESUMEN:');
    console.log(`   - Profesores: ${profesores?.length || 0}`);
    console.log(`   - Estudiantes: ${estudiantes?.length || 0}`);
    console.log(`   - Cursos: ${cursos?.length || 0}`);
    console.log(`   - Grupos: ${grupos?.length || 0}`);
    console.log(`   - Evaluaciones: ${totalEvaluaciones?.length || 0}`);

    if ((totalEvaluaciones?.length || 0) > 0) {
      console.log('\n✅ ¡El dashboard debería mostrar datos!');
      console.log('📋 Próximos pasos:');
      console.log('   1. Ve al dashboard del profesor en el frontend');
      console.log('   2. Verifica que aparezcan las estadísticas y gráficos');
      console.log('   3. Si aún no aparecen datos, revisa la consola del navegador');
    } else {
      console.log('\n❌ No hay evaluaciones en la base de datos');
      console.log('📋 Solución:');
      console.log('   1. Ejecuta el script: node scripts/insertar-datos-completos.js');
      console.log('   2. Luego vuelve a verificar con este script');
    }

  } catch (error) {
    console.error('\n❌ Error verificando datos del dashboard:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    console.error('   1. Verifica que las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configuradas');
    console.error('   2. Asegúrate de que la base de datos esté accesible');
    console.error('   3. Verifica que las tablas existan en la base de datos');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarDatosDashboard();
}

module.exports = { verificarDatosDashboard };








