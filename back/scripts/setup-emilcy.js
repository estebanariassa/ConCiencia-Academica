#!/usr/bin/env node

/**
 * Script para configurar a Emilcy como coordinadora-profesora
 * Este script ejecuta los scripts SQL necesarios para crear el sistema de roles múltiples
 * y agregar a Emilcy como coordinadora de Ingeniería de Sistemas
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-service-role-key')) {
  console.error('❌ Error: Configura las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Puedes encontrarlas en tu proyecto de Supabase en Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filePath) {
  try {
    console.log(`📄 Leyendo archivo: ${filePath}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    console.log(`🚀 Ejecutando script SQL...`);
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error(`❌ Error ejecutando ${filePath}:`, error);
      return false;
    }
    
    console.log(`✅ Script ejecutado exitosamente: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error leyendo archivo ${filePath}:`, error);
    return false;
  }
}

async function executeSQL(sql) {
  try {
    console.log(`🚀 Ejecutando SQL...`);
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`❌ Error ejecutando SQL:`, error);
      return false;
    }
    
    console.log(`✅ SQL ejecutado exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error ejecutando SQL:`, error);
    return false;
  }
}

async function verificarEmilcy() {
  try {
    console.log('🔍 Verificando si Emilcy ya existe...');
    
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        email,
        nombre,
        apellido,
        tipo_usuario,
        activo,
        usuario_roles!inner(rol, activo),
        coordinadores!inner(activo, carrera_id, departamento),
        profesores!inner(activo, codigo)
      `)
      .eq('email', 'emilcy.coordinadora@udem.edu.co')
      .eq('activo', true);

    if (error) {
      console.error('❌ Error verificando Emilcy:', error);
      return false;
    }

    if (usuarios && usuarios.length > 0) {
      const emilcy = usuarios[0];
      console.log('✅ Emilcy ya existe en el sistema:');
      console.log(`   📧 Email: ${emilcy.email}`);
      console.log(`   👤 Nombre: ${emilcy.nombre} ${emilcy.apellido}`);
      console.log(`   🎭 Roles: ${emilcy.usuario_roles.map(r => r.rol).join(', ')}`);
      console.log(`   🏢 Departamento: ${emilcy.coordinadores[0]?.departamento || 'N/A'}`);
      console.log(`   📚 Código Profesor: ${emilcy.profesores[0]?.codigo || 'N/A'}`);
      return true;
    }

    console.log('ℹ️  Emilcy no existe aún, será creada...');
    return false;
  } catch (error) {
    console.error('❌ Error verificando Emilcy:', error);
    return false;
  }
}

async function crearEmilcy() {
  try {
    console.log('👩‍💼 Creando a Emilcy como coordinadora-profesora...');
    
    // SQL para crear a Emilcy usando la función existente
    const sql = `
      -- Crear a Emilcy como coordinadora de Ingeniería de Sistemas
      SELECT crear_coordinador_profesor(
        'emilcy.coordinadora@udem.edu.co',
        'Password123!',
        'Emilcy',
        'Coordinadora',
        'PROF006',
        1, -- ID de Ingeniería de Sistemas
        'Ingeniería de Sistemas'
      );
    `;
    
    const success = await executeSQL(sql);
    return success;
  } catch (error) {
    console.error('❌ Error creando Emilcy:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando configuración de Emilcy como coordinadora-profesora...\n');
  
  try {
    // 1. Verificar si Emilcy ya existe
    const emilcyExiste = await verificarEmilcy();
    
    if (emilcyExiste) {
      console.log('\n✅ Emilcy ya está configurada correctamente en el sistema.');
      console.log('   Puede iniciar sesión con:');
      console.log('   📧 Email: emilcy.coordinadora@udem.edu.co');
      console.log('   🔑 Contraseña: Password123!');
      console.log('   🎭 Roles disponibles: Coordinadora y Profesora');
      return;
    }
    
    // 2. Crear a Emilcy
    console.log('\n👩‍💼 Creando a Emilcy...');
    const emilcyCreada = await crearEmilcy();
    
    if (!emilcyCreada) {
      console.error('❌ Error creando a Emilcy. Verifica que el sistema de roles múltiples esté instalado.');
      return;
    }
    
    // 3. Verificar que Emilcy fue creada correctamente
    console.log('\n🔍 Verificando creación de Emilcy...');
    const verificacion = await verificarEmilcy();
    
    if (verificacion) {
      console.log('\n🎉 ¡Emilcy configurada exitosamente!');
      console.log('\n📋 Información de acceso:');
      console.log('   📧 Email: emilcy.coordinadora@udem.edu.co');
      console.log('   🔑 Contraseña: Password123!');
      console.log('   🎭 Roles: Coordinadora y Profesora');
      console.log('   🏢 Departamento: Ingeniería de Sistemas');
      console.log('   📚 Código Profesor: PROF006');
      
      console.log('\n🎯 Funcionalidades disponibles:');
      console.log('   ✅ Puede iniciar sesión como docente');
      console.log('   ✅ Aparecerá en la lista de profesores');
      console.log('   ✅ Puede acceder al dashboard de coordinadora');
      console.log('   ✅ Puede acceder al dashboard de profesora');
      console.log('   ✅ Puede evaluar otros profesores (como coordinadora)');
      console.log('   ✅ Puede ser evaluada (como profesora)');
      
      console.log('\n🔐 Para iniciar sesión:');
      console.log('   1. Ve a la página de login');
      console.log('   2. Selecciona "Docente" como tipo de usuario');
      console.log('   3. Ingresa las credenciales de Emilcy');
      console.log('   4. El sistema detectará sus roles múltiples y te permitirá elegir');
      console.log('   5. Selecciona "Docente" para acceder como profesora');
    } else {
      console.error('❌ Error verificando la creación de Emilcy');
    }
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error);
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, verificarEmilcy, crearEmilcy };

