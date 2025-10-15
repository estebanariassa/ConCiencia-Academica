const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function convertirMauricioACoordinador() {
  try {
    console.log('🔍 Buscando a Mauricio González...');
    
    // Buscar usuario por email o nombre
    const { data: usuarios, error: searchError } = await supabase
      .from('usuarios')
      .select('*')
      .or('email.ilike.%mauricio%, nombre.ilike.%mauricio%, apellido.ilike.%gonzalez%')
      .eq('activo', true);

    if (searchError) {
      console.error('❌ Error buscando usuario:', searchError);
      return;
    }

    if (!usuarios || usuarios.length === 0) {
      console.log('❌ No se encontró a Mauricio González');
      return;
    }

    console.log(`✅ Encontrados ${usuarios.length} usuarios:`);
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombre} ${usuario.apellido} (${usuario.email}) - ${usuario.tipo_usuario}`);
    });

    // Buscar específicamente a Mauricio González
    const mauricio = usuarios.find(u => 
      u.nombre.toLowerCase().includes('mauricio') && 
      u.apellido.toLowerCase().includes('gonzalez')
    );

    if (!mauricio) {
      console.log('❌ No se encontró específicamente a Mauricio González');
      return;
    }

    console.log(`\n🎯 Usuario encontrado: ${mauricio.nombre} ${mauricio.apellido} (ID: ${mauricio.id})`);

    // 1. Asignar rol de coordinador
    console.log('\n📝 Asignando rol de coordinador...');
    const { error: rolError } = await supabase
      .from('usuario_roles')
      .upsert({
        usuario_id: mauricio.id, // Ya es UUID
        rol: 'coordinador',
        activo: true,
        fecha_asignacion: new Date().toISOString()
      }, {
        onConflict: 'usuario_id,rol'
      });

    if (rolError) {
      console.error('❌ Error asignando rol:', rolError);
      return;
    }

    console.log('✅ Rol de coordinador asignado');

    // 2. Crear registro en coordinadores
    console.log('\n📝 Creando registro en tabla coordinadores...');
    const { error: coordinadorError } = await supabase
      .from('coordinadores')
      .upsert({
        usuario_id: mauricio.id,
        carrera_id: 1, // Asumiendo carrera de Ingeniería de Sistemas
        departamento: 'Ingeniería de Sistemas',
        fecha_nombramiento: new Date().toISOString().split('T')[0],
        activo: true
      }, {
        onConflict: 'usuario_id'
      });

    if (coordinadorError) {
      console.error('❌ Error creando coordinador:', coordinadorError);
      return;
    }

    console.log('✅ Registro de coordinador creado');

    // 3. Verificar roles actuales
    console.log('\n🔍 Verificando roles actuales...');
    const { data: roles, error: rolesError } = await supabase
      .from('usuario_roles')
      .select('rol')
      .eq('usuario_id', mauricio.id)
      .eq('activo', true);

    if (rolesError) {
      console.error('❌ Error obteniendo roles:', rolesError);
      return;
    }

    console.log('✅ Roles actuales:', roles.map(r => r.rol).join(', '));

    // 4. Verificar registro de coordinador
    console.log('\n🔍 Verificando registro de coordinador...');
    const { data: coordinador, error: coordError } = await supabase
      .from('coordinadores')
      .select('*')
      .eq('usuario_id', mauricio.id)
      .single();

    if (coordError) {
      console.error('❌ Error obteniendo coordinador:', coordError);
      return;
    }

    console.log('✅ Registro de coordinador:', coordinador);

    console.log('\n🎉 ¡Conversión completada exitosamente!');
    console.log(`📧 Mauricio González (${mauricio.email}) ahora es coordinador-profesor`);
    console.log('🔑 Puede hacer login como coordinador y acceder al dashboard de coordinador');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la conversión
convertirMauricioACoordinador();
