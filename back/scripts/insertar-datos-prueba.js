#!/usr/bin/env node

/**
 * Script para insertar datos de prueba de evaluaciones
 * Este script ejecuta el SQL que inserta evaluaciones de prueba para que el dashboard del profesor
 * muestre información en lugar de estar vacío
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-service-role-key')) {
  console.error('❌ Error: Configura las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Puedes obtenerlas desde tu proyecto de Supabase en Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarSQL(sql) {
  try {
    console.log('🔍 Ejecutando SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      throw error;
    }
    
    console.log('✅ SQL ejecutado correctamente');
    return data;
  } catch (error) {
    console.error('❌ Error en ejecutarSQL:', error);
    throw error;
  }
}

async function insertarDatosPrueba() {
  console.log('🚀 Iniciando inserción de datos de prueba de evaluaciones...\n');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'insertar-datos-prueba-evaluaciones.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Archivo SQL leído correctamente');
    console.log('📊 Contenido del archivo:', sql.length, 'caracteres\n');

    // Ejecutar el SQL
    await ejecutarSQL(sql);
    
    console.log('\n✅ ¡Datos de prueba insertados correctamente!');
    console.log('🎉 Ahora el dashboard del profesor debería mostrar información');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Ve al dashboard del profesor en el frontend');
    console.log('   2. Verifica que aparezcan las estadísticas y gráficos');
    console.log('   3. Los datos mostrados son de prueba y ficticios');
    
  } catch (error) {
    console.error('\n❌ Error insertando datos de prueba:', error);
    console.error('\n🔧 Posibles soluciones:');
    console.error('   1. Verifica que las variables de entorno estén configuradas');
    console.error('   2. Asegúrate de que la base de datos esté accesible');
    console.error('   3. Verifica que existan profesores, estudiantes y cursos en la BD');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  insertarDatosPrueba();
}

module.exports = { insertarDatosPrueba };









