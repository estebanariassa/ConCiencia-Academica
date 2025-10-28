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

async function simularEndpointFaculty() {
  try {
    console.log('🔍 Simulando endpoint /teachers/faculty...');
    
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

    // 2. Obtener profesores de cada carrera
    console.log('📋 Paso 2: Obteniendo profesores por carrera...');
    
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
        profesoresPorCarrera[carrera.id] = (profesores || []).map((p) => ({
          id: p.id,
          usuario_id: p.usuario_id,
          codigo_profesor: p.codigo_profesor || null,
          carrera_id: p.carrera_id,
          carrera_nombre: carrera.nombre,
          departamento: 'Sin departamento', // Campo fijo ya que no existe en la tabla
          nombre: p.usuarios?.nombre || '',
          apellido: p.usuarios?.apellido || '',
          email: p.usuarios?.email || '',
          activo: p.activo
        }));
        
        console.log(`✅ ${carrera.nombre}: ${profesoresPorCarrera[carrera.id].length} profesores`);
        profesoresPorCarrera[carrera.id].forEach(prof => {
          console.log(`   - ${prof.nombre} ${prof.apellido} (${prof.email})`);
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

    console.log('\n📊 Resumen del endpoint /teachers/faculty:');
    console.log(`✅ Total carreras: ${result.carreras.length}`);
    console.log(`✅ Total profesores: ${result.total_profesores}`);
    
    console.log('\n📋 Detalle por carrera:');
    result.carreras.forEach(carrera => {
      console.log(`   - ${carrera.nombre}: ${carrera.total_profesores} profesores`);
    });

    console.log('\n🎉 ¡Simulación del endpoint completada exitosamente!');
    console.log('🔗 El endpoint /teachers/faculty debería funcionar correctamente');

  } catch (error) {
    console.error('❌ Error durante la simulación:', error.message);
    process.exit(1);
  }
}

// Ejecutar la simulación
simularEndpointFaculty();
