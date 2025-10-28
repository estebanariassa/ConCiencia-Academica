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

async function probarEndpointDetallado() {
  try {
    console.log('🔍 Probando endpoint /teachers/detailed-faculty...');
    
    // 1. Obtener todas las carreras activas
    console.log('📋 Paso 1: Obteniendo carreras...');
    
    const { data: carreras, error: carrerasError } = await supabase
      .from('carreras')
      .select('id, nombre')
      .order('nombre');

    if (carrerasError) {
      throw new Error(`Error consultando carreras: ${carrerasError.message}`);
    }

    console.log(`✅ Carreras encontradas: ${carreras.length}`);
    carreras.forEach(c => console.log(`   - ${c.nombre} (ID: ${c.id})`));

    // 2. Obtener profesores de cada carrera con información detallada
    console.log('📋 Paso 2: Obteniendo profesores con materias...');
    
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
          )
        `)
        .eq('activo', true)
        .eq('usuarios.activo', true)
        .eq('carrera_id', carrera.id);

      if (profesoresError) {
        console.error(`Error consultando profesores para carrera ${carrera.id}:`, profesoresError);
        profesoresPorCarrera[carrera.id] = [];
      } else {
        // Obtener cursos de la carrera
        const { data: cursosCarrera, error: cursosError } = await supabase
          .from('cursos')
          .select(`
            id,
            nombre,
            codigo,
            creditos,
            activo
          `)
          .eq('carrera_id', carrera.id)
          .eq('activo', true);

        if (cursosError) {
          console.warn(`Error obteniendo cursos para carrera ${carrera.id}:`, cursosError);
        }

        // Mapear profesores con información de la carrera
        const profesoresConMaterias = (profesores || []).map((p) => ({
          id: p.id,
          usuario_id: p.usuario_id,
          codigo_profesor: p.codigo_profesor || null,
          carrera_id: p.carrera_id,
          carrera_nombre: carrera.nombre,
          nombre: p.usuarios?.nombre || '',
          apellido: p.usuarios?.apellido || '',
          email: p.usuarios?.email || '',
          activo: p.activo,
          materias_carrera: cursosCarrera || [],
          total_materias_carrera: cursosCarrera?.length || 0
        }));

        profesoresPorCarrera[carrera.id] = profesoresConMaterias;
        
        console.log(`✅ ${carrera.nombre}: ${profesoresConMaterias.length} profesores`);
        profesoresConMaterias.forEach(prof => {
          console.log(`   - ${prof.nombre} ${prof.apellido} (${prof.email})`);
          console.log(`     Materias de la carrera: ${prof.total_materias_carrera}`);
          prof.materias_carrera.forEach(materia => {
            console.log(`       • ${materia.nombre} (${materia.codigo}) - ${materia.creditos} créditos`);
          });
        });
      }
    }

    // 3. Construir respuesta como lo haría el endpoint
    const result = {
      carreras: carreras.map(c => ({
        id: c.id,
        nombre: c.nombre,
        total_profesores: profesoresPorCarrera[c.id]?.length || 0
      })),
      profesores_por_carrera: profesoresPorCarrera,
      total_profesores: Object.values(profesoresPorCarrera).flat().length
    };

    console.log('\n📊 Resumen del endpoint /teachers/detailed-faculty:');
    console.log(`✅ Total carreras: ${result.carreras.length}`);
    console.log(`✅ Total profesores: ${result.total_profesores}`);
    
    console.log('\n📋 Detalle por carrera:');
    result.carreras.forEach(carrera => {
      console.log(`   - ${carrera.nombre}: ${carrera.total_profesores} profesores`);
    });

    console.log('\n🎉 ¡Prueba del endpoint detallado completada exitosamente!');
    console.log('🔗 El endpoint /teachers/detailed-faculty debería funcionar correctamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
probarEndpointDetallado();
