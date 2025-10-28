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

async function verificarSistema() {
  try {
    console.log('🔍 Verificando sistema de decanos...');
    
    // 1. Verificar usuario Celopez
    console.log('📋 Paso 1: Verificando usuario Celopez...');
    
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id, email, nombre, apellido, tipo_usuario, activo')
      .eq('email', 'celopez@udemedellin.edu.co')
      .single();

    if (usuarioError) {
      throw new Error(`Error buscando usuario: ${usuarioError.message}`);
    }

    if (!usuario) {
      throw new Error('Usuario celopez@udemedellin.edu.co no encontrado');
    }

    console.log(`✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido} (ID: ${usuario.id})`);
    console.log(`   - Tipo: ${usuario.tipo_usuario}`);
    console.log(`   - Activo: ${usuario.activo}`);

    // 2. Verificar roles del usuario
    console.log('📋 Paso 2: Verificando roles del usuario...');
    
    const { data: roles, error: rolesError } = await supabase
      .from('usuario_roles')
      .select('rol, activo, fecha_asignacion')
      .eq('usuario_id', usuario.id)
      .eq('activo', true);

    if (rolesError) {
      throw new Error(`Error buscando roles: ${rolesError.message}`);
    }

    if (!roles || roles.length === 0) {
      throw new Error('Usuario no tiene roles asignados');
    }

    console.log(`✅ Roles encontrados: ${roles.length}`);
    roles.forEach(role => {
      console.log(`   - ${role.rol} (asignado: ${role.fecha_asignacion})`);
    });

    // 3. Verificar carreras disponibles
    console.log('📋 Paso 3: Verificando carreras disponibles...');
    
    const { data: carreras, error: carrerasError } = await supabase
      .from('carreras')
      .select('id, nombre')
      .limit(5);

    if (carrerasError) {
      console.warn(`⚠️ Error buscando carreras: ${carrerasError.message}`);
    } else {
      console.log(`✅ Carreras encontradas: ${carreras?.length || 0}`);
      carreras?.forEach(carrera => {
        console.log(`   - ${carrera.nombre} (ID: ${carrera.id})`);
      });
    }

    // 4. Verificar profesores
    console.log('📋 Paso 4: Verificando profesores...');
    
    const { data: profesores, error: profesoresError } = await supabase
      .from('profesores')
      .select('id, usuario_id, carrera_id, activo')
      .eq('activo', true)
      .limit(5);

    if (profesoresError) {
      console.warn(`⚠️ Error buscando profesores: ${profesoresError.message}`);
    } else {
      console.log(`✅ Profesores encontrados: ${profesores?.length || 0}`);
    }

    console.log('\n🎉 ¡Sistema verificado exitosamente!');
    console.log('📧 Usuario: celopez@udemedellin.edu.co');
    console.log('👑 Roles:', roles.map(r => r.rol).join(', '));
    console.log('🏛️ Carreras:', carreras?.length || 0);
    console.log('👨‍🏫 Profesores:', profesores?.length || 0);
    console.log('\n🔗 El sistema está listo para usar');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    process.exit(1);
  }
}

// Ejecutar la verificación
verificarSistema();
