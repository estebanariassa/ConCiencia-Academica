const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Las variables de configuración no están configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigarEstructuraProfesores() {
  console.log('🔍 Investigando estructura de profesores...\n');

  try {
    // Ver estructura de la tabla profesores
    console.log('📊 Estructura de la tabla profesores:');
    const { data: profesores, error: profesoresError } = await supabase
      .from('profesores')
      .select('*')
      .limit(3);

    if (profesoresError) {
      console.error('❌ Error obteniendo profesores:', profesoresError);
    } else {
      console.log('✅ Profesores encontrados:', profesores?.length || 0);
      if (profesores && profesores.length > 0) {
        console.log('📋 Columnas disponibles:', Object.keys(profesores[0]));
        console.log('📄 Ejemplo de profesor:', profesores[0]);
      }
    }

    // Ver estructura de la tabla usuarios
    console.log('\n📊 Estructura de la tabla usuarios:');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(3);

    if (usuariosError) {
      console.error('❌ Error obteniendo usuarios:', usuariosError);
    } else {
      console.log('✅ Usuarios encontrados:', usuarios?.length || 0);
      if (usuarios && usuarios.length > 0) {
        console.log('📋 Columnas disponibles:', Object.keys(usuarios[0]));
        console.log('📄 Ejemplo de usuario:', usuarios[0]);
      }
    }

    // Ver relación profesores-usuarios
    console.log('\n📊 Relación profesores-usuarios:');
    const { data: profesoresConUsuarios, error: relError } = await supabase
      .from('profesores')
      .select(`
        id,
        usuario_id,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email
        )
      `)
      .limit(3);

    if (relError) {
      console.error('❌ Error en relación profesores-usuarios:', relError);
    } else {
      console.log('✅ Relación profesores-usuarios funciona');
      console.log('📄 Ejemplo:', profesoresConUsuarios?.[0]);
    }

    console.log('\n✅ Investigación completada!');

  } catch (error) {
    console.error('❌ Error en la investigación:', error);
  }
}

// Ejecutar la investigación
investigarEstructuraProfesores();




