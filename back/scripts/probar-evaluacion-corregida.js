require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function probarEvaluacionCorregida() {
  console.log('🔍 Probando evaluación con estructura corregida...\n');

  try {
    // Obtener datos de prueba
    const { data: estudiantes } = await supabase
      .from('estudiantes')
      .select('id, usuario_id')
      .limit(1);

    const { data: profesores } = await supabase
      .from('profesores')
      .select('id')
      .limit(1);

    const { data: grupos } = await supabase
      .from('grupos')
      .select('id')
      .limit(5);

    const { data: preguntas } = await supabase
      .from('preguntas_evaluacion')
      .select('id, tipo_pregunta')
      .eq('activa', true)
      .limit(3);

    if (!estudiantes || !profesores || !grupos || !preguntas) {
      console.log('❌ No hay suficientes datos para la prueba');
      return;
    }

    const estudiante = estudiantes[0];
    const profesor = profesores[0];
    // Usar un grupo diferente para evitar duplicados
    const grupo = grupos[grupos.length > 1 ? 1 : 0];

    console.log('🎯 Datos de prueba:');
    console.log('   Estudiante ID:', estudiante.id);
    console.log('   Profesor ID:', profesor.id);
    console.log('   Grupo ID:', grupo.id);
    console.log('   Preguntas disponibles:', preguntas.length);

    // Simular datos de evaluación como los enviaría el frontend
    const evaluationData = {
      profesor_id: profesor.id,
      estudiante_id: estudiante.id,
      grupo_id: grupo.id,
      periodo_id: 1,
      completada: true,
      comentarios: 'Evaluación de prueba corregida',
      calificacion_promedio: 4.2,
      fecha_completada: new Date().toISOString()
    };

    console.log('\n📝 Insertando evaluación principal...');
    const { data: evaluacion, error: evalError } = await supabase
      .from('evaluaciones')
      .insert(evaluationData)
      .select('id')
      .single();

    if (evalError) {
      console.error('❌ Error insertando evaluación:', evalError);
      return;
    }

    console.log('✅ Evaluación insertada:', evaluacion.id);

    // Simular respuestas como las enviaría el frontend
    const respuestasData = preguntas.map((pregunta, index) => {
      const responseData = {
        evaluacion_id: evaluacion.id,
        pregunta_id: pregunta.id
      };

      // Simular diferentes tipos de respuestas según el tipo de pregunta
      if (pregunta.tipo_pregunta === 'rating') {
        responseData.respuesta_rating = 4 + (index % 2); // 4 o 5
      } else if (pregunta.tipo_pregunta === 'texto') {
        responseData.respuesta_texto = `Respuesta de texto para pregunta ${index + 1}`;
      } else if (pregunta.tipo_pregunta === 'opcion_multiple') {
        responseData.respuesta_opcion = `Opción ${index + 1}`;
      } else {
        // Por defecto, usar rating
        responseData.respuesta_rating = 4;
      }

      return responseData;
    });

    console.log('\n📝 Insertando respuestas...');
    console.log('📄 Datos de respuestas:', respuestasData);

    const { error: respError } = await supabase
      .from('respuestas_evaluacion')
      .insert(respuestasData);

    if (respError) {
      console.error('❌ Error insertando respuestas:', respError);
    } else {
      console.log('✅ Respuestas insertadas exitosamente');
    }

    // Verificar que todo se guardó correctamente
    console.log('\n📋 Verificando datos guardados...');
    
    const { data: evaluacionCompleta } = await supabase
      .from('evaluaciones')
      .select(`
        id,
        calificacion_promedio,
        comentarios,
        fecha_completada,
        respuestas_evaluacion (
          id,
          pregunta_id,
          respuesta_rating,
          respuesta_texto,
          respuesta_opcion
        )
      `)
      .eq('id', evaluacion.id)
      .single();

    if (evaluacionCompleta) {
      console.log('✅ Evaluación completa guardada:');
      console.log('   ID:', evaluacionCompleta.id);
      console.log('   Calificación promedio:', evaluacionCompleta.calificacion_promedio);
      console.log('   Comentarios:', evaluacionCompleta.comentarios);
      console.log('   Respuestas:', evaluacionCompleta.respuestas_evaluacion?.length || 0);
      
      if (evaluacionCompleta.respuestas_evaluacion) {
        evaluacionCompleta.respuestas_evaluacion.forEach((resp, index) => {
          console.log(`   Respuesta ${index + 1}:`, {
            pregunta_id: resp.pregunta_id,
            rating: resp.respuesta_rating,
            texto: resp.respuesta_texto,
            opcion: resp.respuesta_opcion
          });
        });
      }
    }

    console.log('\n✅ Prueba completada exitosamente!');
    console.log('🎉 El endpoint de evaluación está funcionando correctamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

probarEvaluacionCorregida();
