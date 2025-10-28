require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verificarEstructuraRespuestas() {
  console.log('📊 Verificando estructura real de respuestas_evaluacion:');
  
  // Intentar insertar un registro de prueba para ver qué columnas acepta
  const datosPrueba = {
    evaluacion_id: '141c6076-f1ae-4777-80ff-b7682d99f974', // ID de evaluación existente
    pregunta_id: 1,
    respuesta: 'Prueba de respuesta'
  };
  
  console.log('🔍 Intentando insertar con columna "respuesta":');
  const { error: error1 } = await supabase
    .from('respuestas_evaluacion')
    .insert(datosPrueba);
    
  if (error1) {
    console.log('❌ Error con "respuesta":', error1.message);
  } else {
    console.log('✅ Columna "respuesta" funciona');
  }
  
  // Probar con respuesta_texto
  const datosPrueba2 = {
    evaluacion_id: '141c6076-f1ae-4777-80ff-b7682d99f974',
    pregunta_id: 2,
    respuesta_texto: 'Prueba de respuesta_texto'
  };
  
  console.log('\n🔍 Intentando insertar con columna "respuesta_texto":');
  const { error: error2 } = await supabase
    .from('respuestas_evaluacion')
    .insert(datosPrueba2);
    
  if (error2) {
    console.log('❌ Error con "respuesta_texto":', error2.message);
  } else {
    console.log('✅ Columna "respuesta_texto" funciona');
  }
  
  // Probar con calificacion
  const datosPrueba3 = {
    evaluacion_id: '141c6076-f1ae-4777-80ff-b7682d99f974',
    pregunta_id: 3,
    calificacion: 4
  };
  
  console.log('\n🔍 Intentando insertar con columna "calificacion":');
  const { error: error3 } = await supabase
    .from('respuestas_evaluacion')
    .insert(datosPrueba3);
    
  if (error3) {
    console.log('❌ Error con "calificacion":', error3.message);
  } else {
    console.log('✅ Columna "calificacion" funciona');
  }
  
  // Verificar qué se insertó realmente
  console.log('\n📋 Verificando datos insertados:');
  const { data: respuestas, error: selectError } = await supabase
    .from('respuestas_evaluacion')
    .select('*')
    .eq('evaluacion_id', '141c6076-f1ae-4777-80ff-b7682d99f974');
    
  if (selectError) {
    console.error('❌ Error consultando:', selectError);
  } else {
    console.log('✅ Respuestas encontradas:', respuestas?.length || 0);
    if (respuestas && respuestas.length > 0) {
      console.log('📄 Estructura real:', Object.keys(respuestas[0]));
      console.log('📄 Datos:', respuestas);
    }
  }
}

verificarEstructuraRespuestas();



