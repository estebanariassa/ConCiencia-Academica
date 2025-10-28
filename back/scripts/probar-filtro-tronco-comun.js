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

async function probarFiltroTroncoComun() {
  try {
    console.log('🔍 Probando filtro para excluir "Tronco común"...');
    
    // 1. Obtener todas las carreras (sin filtro)
    console.log('📋 Paso 1: Obteniendo todas las carreras (sin filtro)...');
    
    const { data: todasLasCarreras, error: todasError } = await supabase
      .from('carreras')
      .select('id, nombre')
      .order('nombre');

    if (todasError) {
      throw new Error(`Error consultando todas las carreras: ${todasError.message}`);
    }

    console.log(`✅ Todas las carreras encontradas: ${todasLasCarreras.length}`);
    todasLasCarreras.forEach(c => console.log(`   - ${c.nombre} (ID: ${c.id})`));

    // 2. Obtener carreras con filtro (excluyendo tronco común)
    console.log('\n📋 Paso 2: Obteniendo carreras con filtro (excluyendo tronco común)...');
    
    const { data: carrerasFiltradas, error: filtradasError } = await supabase
      .from('carreras')
      .select('id, nombre')
      .not('nombre', 'ilike', '%tronco%')
      .not('nombre', 'ilike', '%común%')
      .not('nombre', 'ilike', '%comun%')
      .order('nombre');

    if (filtradasError) {
      throw new Error(`Error consultando carreras filtradas: ${filtradasError.message}`);
    }

    console.log(`✅ Carreras filtradas encontradas: ${carrerasFiltradas.length}`);
    carrerasFiltradas.forEach(c => console.log(`   - ${c.nombre} (ID: ${c.id})`));

    // 3. Verificar que se excluyó "Tronco común"
    const troncoComun = todasLasCarreras.find(c => 
      c.nombre.toLowerCase().includes('tronco') || 
      c.nombre.toLowerCase().includes('común') ||
      c.nombre.toLowerCase().includes('comun')
    );

    const troncoComunFiltrado = carrerasFiltradas.find(c => 
      c.nombre.toLowerCase().includes('tronco') || 
      c.nombre.toLowerCase().includes('común') ||
      c.nombre.toLowerCase().includes('comun')
    );

    console.log('\n📊 Resultado del filtro:');
    if (troncoComun) {
      console.log(`✅ "Tronco común" encontrado en todas las carreras: ${troncoComun.nombre}`);
    } else {
      console.log('⚠️ "Tronco común" no encontrado en todas las carreras');
    }

    if (troncoComunFiltrado) {
      console.log(`❌ ERROR: "Tronco común" aún aparece después del filtro: ${troncoComunFiltrado.nombre}`);
    } else {
      console.log('✅ "Tronco común" correctamente excluido del filtro');
    }

    console.log(`\n📈 Resumen:`);
    console.log(`   - Total carreras: ${todasLasCarreras.length}`);
    console.log(`   - Carreras filtradas: ${carrerasFiltradas.length}`);
    console.log(`   - Carreras excluidas: ${todasLasCarreras.length - carrerasFiltradas.length}`);

    console.log('\n🎉 ¡Prueba del filtro completada exitosamente!');
    console.log('🔗 El filtro debería excluir "Tronco común" de los endpoints');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
probarFiltroTroncoComun();



