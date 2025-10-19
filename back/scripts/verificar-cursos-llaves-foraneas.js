const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarCursosLlavesForaneas() {
  console.log('🔍 Verificando estructura y datos de la tabla cursos...');
  
  try {
    // 1. Obtener todos los cursos con sus relaciones
    console.log('\n1. Obteniendo todos los cursos con relaciones...');
    const { data: cursos, error: cursosError } = await supabase
      .from('cursos')
      .select(`
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
          codigo,
          activa
        )
      `)
      .order('id');

    if (cursosError) {
      console.error('❌ Error obteniendo cursos:', cursosError);
      return;
    }

    console.log(`✅ Total de cursos encontrados: ${cursos?.length || 0}`);

    // 2. Mostrar estructura de la tabla cursos
    console.log('\n2. Estructura de la tabla cursos:');
    console.log('=====================================');
    if (cursos && cursos.length > 0) {
      const primerCurso = cursos[0];
      console.log('Columnas disponibles:');
      Object.keys(primerCurso).forEach(col => {
        console.log(`  - ${col}: ${typeof primerCurso[col]}`);
      });
    }

    // 3. Mostrar todos los cursos con sus relaciones
    console.log('\n3. Lista completa de cursos:');
    console.log('=====================================');
    if (cursos && cursos.length > 0) {
      cursos.forEach((curso, index) => {
        console.log(`\n${index + 1}. Curso: ${curso.nombre}`);
        console.log(`   - ID: ${curso.id}`);
        console.log(`   - Código: ${curso.codigo}`);
        console.log(`   - Créditos: ${curso.creditos}`);
        console.log(`   - Activo: ${curso.activo}`);
        console.log(`   - Carrera ID: ${curso.carrera_id}`);
        if (curso.carreras) {
          console.log(`   - Carrera: ${curso.carreras.nombre} (${curso.carreras.codigo})`);
        } else {
          console.log(`   - Carrera: ❌ NO ENCONTRADA (carrera_id: ${curso.carrera_id})`);
        }
        if (curso.descripcion) {
          console.log(`   - Descripción: ${curso.descripcion.substring(0, 100)}...`);
        }
      });
    }

    // 4. Verificar integridad referencial
    console.log('\n4. Verificando integridad referencial:');
    console.log('=====================================');
    
    // Obtener todas las carreras
    const { data: carreras, error: carrerasError } = await supabase
      .from('carreras')
      .select('id, nombre, codigo, activa')
      .order('id');

    if (carrerasError) {
      console.error('❌ Error obteniendo carreras:', carrerasError);
    } else {
      console.log(`✅ Total de carreras: ${carreras?.length || 0}`);
      
      // Verificar cursos con carrera_id inválido
      const carreraIds = new Set((carreras || []).map(c => c.id));
      const cursosConCarreraInvalida = (cursos || []).filter(c => c.carrera_id && !carreraIds.has(c.carrera_id));
      
      if (cursosConCarreraInvalida.length > 0) {
        console.log(`\n⚠️ Cursos con carrera_id inválido (${cursosConCarreraInvalida.length}):`);
        cursosConCarreraInvalida.forEach(curso => {
          console.log(`   - ${curso.nombre} (ID: ${curso.id}) - carrera_id: ${curso.carrera_id} ❌`);
        });
      } else {
        console.log('✅ Todos los cursos tienen carrera_id válido');
      }

      // Verificar cursos sin carrera_id
      const cursosSinCarrera = (cursos || []).filter(c => !c.carrera_id);
      if (cursosSinCarrera.length > 0) {
        console.log(`\n⚠️ Cursos sin carrera_id (${cursosSinCarrera.length}):`);
        cursosSinCarrera.forEach(curso => {
          console.log(`   - ${curso.nombre} (ID: ${curso.id}) - carrera_id: NULL`);
        });
      } else {
        console.log('✅ Todos los cursos tienen carrera_id asignado');
      }
    }

    // 5. Estadísticas por carrera
    console.log('\n5. Estadísticas por carrera:');
    console.log('=====================================');
    if (carreras && cursos) {
      carreras.forEach(carrera => {
        const cursosDeCarrera = cursos.filter(c => c.carrera_id === carrera.id);
        console.log(`\n${carrera.nombre} (${carrera.codigo}):`);
        console.log(`   - Total cursos: ${cursosDeCarrera.length}`);
        console.log(`   - Cursos activos: ${cursosDeCarrera.filter(c => c.activo).length}`);
        console.log(`   - Cursos inactivos: ${cursosDeCarrera.filter(c => !c.activo).length}`);
        
        if (cursosDeCarrera.length > 0) {
          console.log(`   - Lista de cursos:`);
          cursosDeCarrera.forEach(curso => {
            console.log(`     • ${curso.nombre} (${curso.codigo}) - ${curso.activo ? 'Activo' : 'Inactivo'}`);
          });
        }
      });
    }

    // 6. Verificar asignaciones de profesores
    console.log('\n6. Verificando asignaciones de profesores:');
    console.log('=====================================');
    
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
          carrera_id
        )
      `)
      .eq('activa', true);

    if (asignError) {
      console.error('❌ Error obteniendo asignaciones:', asignError);
    } else {
      console.log(`✅ Total de asignaciones activas: ${asignaciones?.length || 0}`);
      
      // Agrupar por carrera
      const asignacionesPorCarrera = {};
      (asignaciones || []).forEach(asig => {
        if (asig.cursos && asig.cursos.carrera_id) {
          const carreraId = asig.cursos.carrera_id;
          if (!asignacionesPorCarrera[carreraId]) {
            asignacionesPorCarrera[carreraId] = [];
          }
          asignacionesPorCarrera[carreraId].push(asig);
        }
      });

      Object.keys(asignacionesPorCarrera).forEach(carreraId => {
        const carrera = carreras?.find(c => c.id == carreraId);
        const asigns = asignacionesPorCarrera[carreraId];
        console.log(`\n${carrera?.nombre || `Carrera ID ${carreraId}`}:`);
        console.log(`   - Asignaciones activas: ${asigns.length}`);
        
        // Contar cursos únicos
        const cursosUnicos = new Set(asigns.map(a => a.curso_id));
        console.log(`   - Cursos únicos con profesores: ${cursosUnicos.size}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarCursosLlavesForaneas();
