#!/usr/bin/env node

/**
 * Script para verificar la estructura de la tabla evaluaciones
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Las variables de entorno no están configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarEstructuraEvaluaciones() {
  console.log('🔍 Verificando estructura de la tabla evaluaciones...\n');

  try {
    // Verificar conexión
    console.log('🔍 Verificando conexión...');
    const { data: testData, error: testError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (testError) {
      throw new Error(`Error de conexión: ${testError.message}`);
    }
    console.log('✅ Conexión exitosa\n');

    // Verificar si la tabla evaluaciones existe
    console.log('🔍 Verificando si la tabla evaluaciones existe...');
    const { data: evaluaciones, error: evaluacionesError } = await supabase
      .from('evaluaciones')
      .select('*')
      .limit(1);

    if (evaluacionesError) {
      console.error(`❌ Error accediendo a la tabla evaluaciones: ${evaluacionesError.message}`);
      console.log('\n🔧 Posibles soluciones:');
      console.log('   1. La tabla evaluaciones no existe');
      console.log('   2. Verifica que el nombre de la tabla sea correcto');
      console.log('   3. Verifica que tengas permisos para acceder a la tabla');
      return;
    }

    console.log('✅ La tabla evaluaciones existe');

    // Verificar estructura de la tabla
    console.log('\n🔍 Verificando estructura de la tabla...');
    const { data: estructura, error: estructuraError } = await supabase
      .from('evaluaciones')
      .select('*')
      .limit(1);

    if (estructuraError) {
      console.error(`❌ Error obteniendo estructura: ${estructuraError.message}`);
    } else {
      console.log('✅ Estructura de la tabla evaluaciones:');
      if (estructura.length > 0) {
        const columnas = Object.keys(estructura[0]);
        columnas.forEach((columna, index) => {
          console.log(`   ${index + 1}. ${columna}`);
        });
      } else {
        console.log('   La tabla está vacía, no se puede determinar la estructura');
      }
    }

    // Verificar datos existentes
    console.log('\n🔍 Verificando datos existentes...');
    const { data: datosExistentes, error: datosError } = await supabase
      .from('evaluaciones')
      .select('*')
      .limit(5);

    if (datosError) {
      console.error(`❌ Error obteniendo datos: ${datosError.message}`);
    } else {
      console.log(`✅ Datos existentes: ${datosExistentes.length} registros`);
      if (datosExistentes.length > 0) {
        console.log('📊 Muestra de datos:');
        datosExistentes.forEach((dato, index) => {
          console.log(`   ${index + 1}. ID: ${dato.id}`);
          Object.keys(dato).forEach(key => {
            if (key !== 'id') {
              console.log(`      ${key}: ${dato[key]}`);
            }
          });
        });
      }
    }

    // Verificar total de registros
    const { data: total, error: totalError } = await supabase
      .from('evaluaciones')
      .select('id', { count: 'exact' });

    if (!totalError) {
      console.log(`\n📊 Total de evaluaciones: ${total.length}`);
    }

  } catch (error) {
    console.error('\n❌ Error verificando estructura:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarEstructuraEvaluaciones();
}

module.exports = { verificarEstructuraEvaluaciones };







