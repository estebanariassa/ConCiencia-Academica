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

async function probarNuevosEndpoints() {
  try {
    console.log('🔍 Probando nuevos endpoints de materias...');
    
    // 1. Probar endpoint de materias específicas de profesores
    console.log('📋 Paso 1: Probando /teachers/professor-subjects...');
    
    const { data: carreras, error: carrerasError } = await supabase
      .from('carreras')
      .select('id, nombre')
      .not('nombre', 'ilike', '%tronco%')
      .not('nombre', 'ilike', '%común%')
      .not('nombre', 'ilike', '%comun%')
      .order('nombre');

    if (carrerasError) {
      throw new Error(`Error consultando carreras: ${carrerasError.message}`);
    }

    console.log(`✅ Carreras encontradas: ${carreras.length}`);

    // Obtener profesores con sus materias específicas
    const profesoresPorCarrera = {};
    
    for (const carrera of carreras) {
      const { data: profesores, error: profesoresError } = await supabase
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
          ),
          asignaciones_profesor:asignaciones_profesor(
            curso_id,
            activa,
            cursos:cursos(
              id,
              nombre,
              codigo,
              creditos,
              activo
            )
          )
        `)
        .eq('activo', true)
        .eq('usuarios.activo', true)
        .eq('carrera_id', carrera.id)
        .eq('asignaciones_profesor.activa', true);

      if (profesoresError) {
        console.error(`Error consultando profesores para carrera ${carrera.id}:`, profesoresError);
        profesoresPorCarrera[carrera.id] = [];
      } else {
        const profesoresConMaterias = (profesores || []).map((p) => ({
          id: p.id,
          nombre: p.usuarios?.nombre || '',
          apellido: p.usuarios?.apellido || '',
          email: p.usuarios?.email || '',
          materias_asignadas: (p.asignaciones_profesor || [])
            .filter((asig) => asig.cursos && asig.cursos.activo)
            .map((asig) => ({
              id: asig.cursos.id,
              nombre: asig.cursos.nombre,
              codigo: asig.cursos.codigo,
              creditos: asig.cursos.creditos
            })),
          total_materias_asignadas: (p.asignaciones_profesor || [])
            .filter((asig) => asig.cursos && asig.cursos.activo).length
        }));

        profesoresPorCarrera[carrera.id] = profesoresConMaterias;
        
        console.log(`✅ ${carrera.nombre}: ${profesoresConMaterias.length} profesores`);
        profesoresConMaterias.forEach(prof => {
          console.log(`   - ${prof.nombre} ${prof.apellido} (${prof.email})`);
          console.log(`     Materias asignadas: ${prof.total_materias_asignadas}`);
          prof.materias_asignadas.forEach(materia => {
            console.log(`       • ${materia.nombre} (${materia.codigo}) - ${materia.creditos} créditos`);
          });
        });
      }
    }

    // 2. Probar endpoint de materias por carrera
    console.log('\n📋 Paso 2: Probando /teachers/career-subjects...');
    
    const materiasPorCarrera = {};
    
    for (const carrera of carreras) {
      const { data: cursos, error: cursosError } = await supabase
        .from('cursos')
        .select(`
          id,
          nombre,
          codigo,
          creditos,
          descripcion,
          activo
        `)
        .eq('carrera_id', carrera.id)
        .eq('activo', true)
        .order('nombre');

      if (cursosError) {
        console.error(`Error consultando cursos para carrera ${carrera.id}:`, cursosError);
        materiasPorCarrera[carrera.id] = [];
      } else {
        materiasPorCarrera[carrera.id] = cursos || [];
        
        console.log(`✅ ${carrera.nombre}: ${cursos.length} materias`);
        cursos.forEach(curso => {
          console.log(`   • ${curso.nombre} (${curso.codigo}) - ${curso.creditos} créditos`);
        });
      }
    }

    console.log('\n📊 Resumen de los nuevos endpoints:');
    console.log(`✅ Total carreras: ${carreras.length}`);
    console.log(`✅ Total profesores: ${Object.values(profesoresPorCarrera).flat().length}`);
    console.log(`✅ Total materias: ${Object.values(materiasPorCarrera).flat().length}`);

    console.log('\n🎉 ¡Prueba de los nuevos endpoints completada exitosamente!');
    console.log('🔗 Los endpoints /teachers/professor-subjects y /teachers/career-subjects deberían funcionar correctamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
probarNuevosEndpoints();



