#!/usr/bin/env node

/**
 * Script para verificar y configurar el coordinador David
 * Este script verifica si David está configurado correctamente como coordinador
 * y le asigna una carrera si no la tiene
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase - usar valores por defecto para desarrollo
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

console.log('🔧 Script para verificar coordinador David');
console.log('⚠️  IMPORTANTE: Este script usa valores hardcodeados');
console.log('   Para usarlo, edita las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
console.log('   en este archivo con los valores de tu proyecto de Supabase\n');

if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-service-role')) {
  console.error('❌ Error: Las variables de configuración no están configuradas');
  console.error('');
  console.error('🔧 Para solucionarlo:');
  console.error('   1. Edita este archivo (verificar-coordinador-david.js)');
  console.error('   2. Reemplaza SUPABASE_URL con tu URL de Supabase');
  console.error('   3. Reemplaza SUPABASE_SERVICE_ROLE_KEY con tu service role key');
  console.error('');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarCoordinadorDavid() {
  console.log('🔍 Verificando coordinador David...\n');

  try {
    // Verificar conexión
    console.log('🔍 Verificando conexión a la base de datos...');
    const { data: testData, error: testError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (testError) {
      throw new Error(`Error de conexión: ${testError.message}`);
    }
    console.log('✅ Conexión exitosa\n');

    // Buscar usuarios con nombre David
    console.log('🔍 Buscando usuarios con nombre David...');
    const { data: usuariosDavid, error: usuariosError } = await supabase
      .from('usuarios')
      .select(`
        id,
        email,
        nombre,
        apellido,
        tipo_usuario,
        activo
      `)
      .ilike('nombre', '%david%')
      .eq('activo', true);

    if (usuariosError) {
      throw new Error(`Error buscando usuarios David: ${usuariosError.message}`);
    }

    console.log(`✅ Usuarios David encontrados: ${usuariosDavid.length}`);
    usuariosDavid.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nombre} ${user.apellido} (${user.email}) - ${user.tipo_usuario}`);
    });

    if (usuariosDavid.length === 0) {
      console.log('❌ No se encontraron usuarios con nombre David');
      return;
    }

    // Verificar roles de cada David
    for (const usuario of usuariosDavid) {
      console.log(`\n🔍 Verificando roles de ${usuario.nombre} ${usuario.apellido}...`);
      
      const { data: roles, error: rolesError } = await supabase
        .from('usuario_roles')
        .select('rol')
        .eq('usuario_id', usuario.id)
        .eq('activo', true);

      if (rolesError) {
        console.warn(`⚠️ Error obteniendo roles: ${rolesError.message}`);
      } else {
        const rolesList = roles.map(r => r.rol);
        console.log(`   Roles: ${rolesList.join(', ')}`);
      }

      // Verificar si es coordinador
      const { data: coordinador, error: coordinadorError } = await supabase
        .from('coordinadores')
        .select(`
          id,
          carrera_id,
          departamento,
          activo,
          carreras!inner(nombre, codigo)
        `)
        .eq('usuario_id', usuario.id)
        .eq('activo', true)
        .single();

      if (coordinadorError) {
        console.log(`   ❌ No es coordinador o error: ${coordinadorError.message}`);
      } else {
        console.log(`   ✅ Es coordinador de: ${coordinador.carreras.nombre} (ID: ${coordinador.carrera_id})`);
      }

      // Verificar si es profesor
      const { data: profesor, error: profesorError } = await supabase
        .from('profesores')
        .select(`
          id,
          carrera_id,
          activo,
          carreras!inner(nombre, codigo)
        `)
        .eq('usuario_id', usuario.id)
        .eq('activo', true)
        .single();

      if (profesorError) {
        console.log(`   ❌ No es profesor o error: ${profesorError.message}`);
      } else {
        console.log(`   ✅ Es profesor de: ${profesor.carreras.nombre} (ID: ${profesor.carrera_id})`);
      }
    }

    // Mostrar todas las carreras disponibles
    console.log('\n🔍 Carreras disponibles:');
    const { data: carreras, error: carrerasError } = await supabase
      .from('carreras')
      .select('id, nombre, codigo, activa')
      .eq('activa', true)
      .order('nombre');

    if (carrerasError) {
      console.warn(`⚠️ Error obteniendo carreras: ${carrerasError.message}`);
    } else {
      carreras.forEach(carrera => {
        console.log(`   ${carrera.id}. ${carrera.nombre} (${carrera.codigo})`);
      });
    }

    // Mostrar coordinadores existentes
    console.log('\n🔍 Coordinadores existentes:');
    const { data: coordinadores, error: coordinadoresError } = await supabase
      .from('coordinadores')
      .select(`
        id,
        carrera_id,
        departamento,
        activo,
        usuarios!inner(nombre, apellido, email),
        carreras!inner(nombre, codigo)
      `)
      .eq('activo', true);

    if (coordinadoresError) {
      console.warn(`⚠️ Error obteniendo coordinadores: ${coordinadoresError.message}`);
    } else {
      coordinadores.forEach(coord => {
        console.log(`   ${coord.usuarios.nombre} ${coord.usuarios.apellido} (${coord.usuarios.email}) - ${coord.carreras.nombre}`);
      });
    }

    console.log('\n📋 Recomendaciones:');
    console.log('   1. Si David no es coordinador, necesita ser creado como coordinador');
    console.log('   2. Si es coordinador pero no tiene carrera asignada, necesita una carrera');
    console.log('   3. Si es coordinador pero no tiene rol en usuario_roles, necesita el rol');
    console.log('   4. Verifica que tenga el rol "coordinador" en la tabla usuario_roles');

  } catch (error) {
    console.error('\n❌ Error verificando coordinador David:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    console.error('   1. Verifica que las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configuradas');
    console.error('   2. Asegúrate de que la base de datos esté accesible');
    console.error('   3. Verifica que existan usuarios con nombre David en la BD');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarCoordinadorDavid();
}

module.exports = { verificarCoordinadorDavid };







