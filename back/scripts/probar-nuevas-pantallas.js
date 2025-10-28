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

async function probarNuevasPantallas() {
  try {
    console.log('🔍 Probando datos para las nuevas pantallas...');
    
    // 1. Datos para CareerSubjectsPage
    console.log('📋 Paso 1: Datos para CareerSubjectsPage...');
    
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
      }
    }

    console.log(`✅ CareerSubjectsPage: ${carreras.length} carreras, ${Object.values(materiasPorCarrera).flat().length} materias totales`);

    // 2. Datos para ProfessorsPage
    console.log('\n📋 Paso 2: Datos para ProfessorsPage...');
    
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
          codigo_profesor: p.codigo_profesor || null,
          carrera_id: p.carrera_id,
          carrera_nombre: carrera.nombre,
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
      }
    }

    const totalProfesores = Object.values(profesoresPorCarrera).flat().length;
    const totalMateriasAsignadas = Object.values(profesoresPorCarrera).flat().reduce((total, prof) => total + (prof.total_materias_asignadas || 0), 0);

    console.log(`✅ ProfessorsPage: ${totalProfesores} profesores, ${totalMateriasAsignadas} materias asignadas`);

    // 3. Resumen de estadísticas
    console.log('\n📊 Resumen de estadísticas para las nuevas pantallas:');
    console.log(`✅ Total carreras: ${carreras.length}`);
    console.log(`✅ Total materias disponibles: ${Object.values(materiasPorCarrera).flat().length}`);
    console.log(`✅ Total profesores: ${totalProfesores}`);
    console.log(`✅ Total materias asignadas: ${totalMateriasAsignadas}`);
    console.log(`✅ Promedio materias por carrera: ${Math.round(Object.values(materiasPorCarrera).flat().length / carreras.length)}`);
    console.log(`✅ Promedio materias por profesor: ${totalProfesores > 0 ? Math.round(totalMateriasAsignadas / totalProfesores * 10) / 10 : 0}`);

    console.log('\n🎉 ¡Datos para las nuevas pantallas verificados exitosamente!');
    console.log('🔗 Las páginas CareerSubjectsPage y ProfessorsPage deberían funcionar correctamente');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    process.exit(1);
  }
}

// Ejecutar la verificación
probarNuevasPantallas();



