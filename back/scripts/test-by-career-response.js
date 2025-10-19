const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testByCareerResponse() {
  console.log('🔍 Simulando la respuesta del endpoint /by-career/1...');
  
  try {
    const careerId = '1';
    
    // 1) Traer profesores activos de la carrera
    const { data: profesBase, error: profesErr } = await supabase
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
      .eq('carrera_id', careerId);

    if (profesErr) {
      console.error('❌ Error obteniendo profesores:', profesErr);
      return;
    }

    console.log(`✅ Profesores encontrados: ${profesBase?.length || 0}`);

    const profesorIds = (profesBase || []).map(p => p.id);
    
    // 2) Traer asignaciones y cursos
    let asignaciones = [];
    try {
      const { data: asignData, error: asignError } = await supabase
        .from('asignaciones_profesor')
        .select(`
          id,
          profesor_id,
          curso_id,
          activa
        `)
        .in('profesor_id', profesorIds)
        .eq('activa', true);
      
      if (asignError) {
        console.warn('⚠️ Error obteniendo asignaciones:', asignError);
      } else {
        asignaciones = asignData || [];
        console.log(`✅ Asignaciones encontradas: ${asignaciones.length}`);
      }
    } catch (e) {
      console.warn('⚠️ Error en asignaciones:', e);
    }

    // 3) Traer cursos
    let cursos = [];
    try {
      const cursoIds = [...new Set(asignaciones.map(a => a.curso_id))];
      if (cursoIds.length > 0) {
        const { data: cursosData, error: cursosError } = await supabase
          .from('cursos')
          .select('*')
          .in('id', cursoIds)
          .eq('activo', true);
        
        if (cursosError) {
          console.warn('⚠️ Error obteniendo cursos:', cursosError);
        } else {
          cursos = cursosData || [];
          console.log(`✅ Cursos encontrados: ${cursos.length}`);
        }
      }
    } catch (e) {
      console.warn('⚠️ Error en cursos:', e);
    }

    const cursoById = new Map((cursos || []).map(c => [c.id, c]));

    // 4) Cargar nombre de la carrera
    let carreraNombre = null;
    try {
      const { data: carreraData } = await supabase
        .from('carreras')
        .select('id,nombre')
        .eq('id', careerId)
        .single();
      carreraNombre = carreraData?.nombre || null;
    } catch {}

    const asignacionesByProfesor = new Map();
    (asignaciones || []).forEach(a => {
      const list = asignacionesByProfesor.get(a.profesor_id) || [];
      list.push(a);
      asignacionesByProfesor.set(a.profesor_id, list);
    });

    // 5) Construir la respuesta final (igual que el endpoint)
    const result = (profesBase || []).map(p => {
      const asigns = asignacionesByProfesor.get(p.id) || [];
      
      const cursosProf = asigns
        .map(a => {
          const curso = cursoById.get(a.curso_id);
          if (curso) {
            return {
              ...curso,
              calificacion_promedio: null
            };
          }
          return null;
        })
        .filter(Boolean);
      
      return {
        id: p.id,
        usuario_id: p.usuario_id,
        codigo_profesor: p.codigo_profesor || null,
        carrera_id: p.carrera_id,
        carrera_nombre: carreraNombre,
        nombre: p.usuarios?.nombre || '',
        apellido: p.usuarios?.apellido || '',
        email: p.usuarios?.email || '',
        activo: p.activo,
        cursos: cursosProf  // ← Aquí está la clave: 'cursos', no 'courses'
      };
    });

    console.log('\n📋 Estructura de respuesta del endpoint /by-career/1:');
    console.log('=====================================');
    
    result.forEach((profesor, index) => {
      console.log(`\n${index + 1}. Profesor: ${profesor.nombre} ${profesor.apellido}`);
      console.log(`   - ID: ${profesor.id}`);
      console.log(`   - Email: ${profesor.email}`);
      console.log(`   - Carrera: ${profesor.carrera_nombre} (ID: ${profesor.carrera_id})`);
      console.log(`   - Cursos (${profesor.cursos.length}):`);
      
      if (profesor.cursos.length > 0) {
        profesor.cursos.forEach((curso, cursoIndex) => {
          console.log(`     ${cursoIndex + 1}. ${curso.nombre} (${curso.codigo}) - ID: ${curso.id}`);
        });
      } else {
        console.log('     (Sin cursos asignados)');
      }
    });

    console.log('\n🔍 Resumen:');
    console.log(`- Total profesores: ${result.length}`);
    console.log(`- Total cursos únicos: ${new Set(result.flatMap(p => p.cursos.map(c => c.id))).size}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testByCareerResponse();
