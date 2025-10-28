require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function probarEndpointCompleto() {
  console.log('🔍 Probando endpoint completo de evaluación...\n');

  try {
    // 1. Obtener un estudiante con su usuario
    const { data: estudiantes } = await supabase
      .from('estudiantes')
      .select(`
        id,
        usuario_id,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email,
          tipo_usuario
        )
      `)
      .limit(1);

    if (!estudiantes || estudiantes.length === 0) {
      console.log('❌ No hay estudiantes disponibles');
      return;
    }

    const estudiante = estudiantes[0];
    console.log('👤 Estudiante:', estudiante.usuarios.nombre, estudiante.usuarios.apellido);

    // 2. Obtener un profesor
    const { data: profesores } = await supabase
      .from('profesores')
      .select(`
        id,
        usuarios:usuarios(
          id,
          nombre,
          apellido,
          email
        )
      `)
      .limit(1);

    if (!profesores || profesores.length === 0) {
      console.log('❌ No hay profesores disponibles');
      return;
    }

    const profesor = profesores[0];
    console.log('👨‍🏫 Profesor:', profesor.usuarios.nombre, profesor.usuarios.apellido);

    // 3. Obtener un grupo diferente
    const { data: grupos } = await supabase
      .from('grupos')
      .select(`
        id,
        numero_grupo,
        cursos:cursos(
          id,
          nombre,
          codigo
        )
      `)
      .limit(3);

    if (!grupos || grupos.length === 0) {
      console.log('❌ No hay grupos disponibles');
      return;
    }

    // Usar un grupo que no haya sido evaluado por este estudiante
    let grupoSeleccionado = null;
    for (const grupo of grupos) {
      const { data: evaluacionExistente } = await supabase
        .from('evaluaciones')
        .select('id')
        .eq('estudiante_id', estudiante.id)
        .eq('profesor_id', profesor.id)
        .eq('grupo_id', grupo.id)
        .eq('periodo_id', 1)
        .maybeSingle();

      if (!evaluacionExistente) {
        grupoSeleccionado = grupo;
        break;
      }
    }

    if (!grupoSeleccionado) {
      console.log('⚠️ Todos los grupos ya han sido evaluados por este estudiante');
      // Usar el primer grupo disponible
      grupoSeleccionado = grupos[0];
    }

    console.log('📚 Grupo:', grupoSeleccionado.numero_grupo, grupoSeleccionado.cursos.nombre);

    // 4. Obtener preguntas activas
    const { data: preguntas } = await supabase
      .from('preguntas_evaluacion')
      .select('id, texto_pregunta, tipo_pregunta')
      .eq('activa', true)
      .limit(5);

    if (!preguntas || preguntas.length === 0) {
      console.log('❌ No hay preguntas activas disponibles');
      return;
    }

    console.log('❓ Preguntas disponibles:', preguntas.length);

    // 5. Simular datos de evaluación como los enviaría el frontend
    const evaluationPayload = {
      teacherId: profesor.id,
      courseId: grupoSeleccionado.cursos.id,
      groupId: grupoSeleccionado.id,
      overallRating: 4.2,
      comments: 'Evaluación de prueba del endpoint completo',
      answers: preguntas.map((pregunta, index) => {
        const answer = {
          questionId: pregunta.id,
          rating: 4 + (index % 2) // Alternar entre 4 y 5
        };

        // Agregar respuesta de texto si es tipo texto
        if (pregunta.tipo_pregunta === 'texto') {
          answer.textAnswer = `Comentario para pregunta ${index + 1}`;
        }

        return answer;
      })
    };

    console.log('\n📝 Simulando petición POST /teachers/evaluations...');
    console.log('📄 Payload:', JSON.stringify(evaluationPayload, null, 2));

    // 6. Simular la lógica del endpoint
    console.log('\n🔄 Ejecutando lógica del endpoint...');

    // Verificar que el usuario es estudiante (simulado)
    if (estudiante.usuarios.tipo_usuario !== 'estudiante') {
      console.log('❌ Usuario no es estudiante');
      return;
    }

    console.log('✅ Usuario es estudiante');

    // Verificar evaluación existente
    const { data: existingEvaluation } = await supabase
      .from('evaluaciones')
      .select('id')
      .eq('profesor_id', evaluationPayload.teacherId)
      .eq('estudiante_id', estudiante.id)
      .eq('grupo_id', evaluationPayload.groupId)
      .eq('periodo_id', 1)
      .maybeSingle();

    if (existingEvaluation) {
      console.log('⚠️ Ya existe una evaluación para esta combinación');
      console.log('   Esto es normal si el estudiante ya evaluó este profesor en este grupo');
    } else {
      console.log('✅ No hay evaluación existente, procediendo...');

      // Crear evaluación
      const evaluationData = {
        profesor_id: evaluationPayload.teacherId,
        estudiante_id: estudiante.id,
        grupo_id: evaluationPayload.groupId,
        periodo_id: 1,
        completada: true,
        comentarios: evaluationPayload.comments,
        calificacion_promedio: evaluationPayload.overallRating,
        fecha_completada: new Date().toISOString()
      };

      const { data: evaluacion, error: evalError } = await supabase
        .from('evaluaciones')
        .insert(evaluationData)
        .select('id')
        .single();

      if (evalError) {
        console.error('❌ Error creando evaluación:', evalError);
        return;
      }

      console.log('✅ Evaluación creada:', evaluacion.id);

      // Guardar respuestas
      const respuestasData = evaluationPayload.answers.map((answer) => {
        const responseData = {
          evaluacion_id: evaluacion.id,
          pregunta_id: answer.questionId
        };

        if (answer.rating !== null && answer.rating !== undefined) {
          responseData.respuesta_rating = answer.rating;
        }

        if (answer.textAnswer !== null && answer.textAnswer !== undefined && answer.textAnswer.trim() !== '') {
          responseData.respuesta_texto = answer.textAnswer.trim();
        }

        return responseData;
      }).filter((response) => response.respuesta_rating !== undefined || response.respuesta_texto !== undefined);

      const { error: respError } = await supabase
        .from('respuestas_evaluacion')
        .insert(respuestasData);

      if (respError) {
        console.error('❌ Error guardando respuestas:', respError);
      } else {
        console.log('✅ Respuestas guardadas:', respuestasData.length);
      }

      console.log('\n🎉 Evaluación completada exitosamente!');
      console.log('📊 Resumen:');
      console.log('   - Evaluación ID:', evaluacion.id);
      console.log('   - Calificación promedio:', evaluationPayload.overallRating);
      console.log('   - Respuestas guardadas:', respuestasData.length);
      console.log('   - Comentarios:', evaluationPayload.comments);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

probarEndpointCompleto();



