require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Las variables de configuración no están configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function probarEvaluacion() {
  console.log('🔍 Probando el flujo de evaluación...\n');

  try {
    // 1. Verificar estructura de tabla respuestas_evaluacion
    console.log('📊 1. Verificando estructura de respuestas_evaluacion:');
    const { data: respuestas, error: respError } = await supabase
      .from('respuestas_evaluacion')
      .select('*')
      .limit(1);

    if (respError) {
      console.error('❌ Error consultando respuestas_evaluacion:', respError);
      console.log('🔧 Posible problema: La tabla no existe o tiene estructura incorrecta');
    } else {
      console.log('✅ Tabla respuestas_evaluacion existe');
      if (respuestas && respuestas.length > 0) {
        console.log('📋 Columnas:', Object.keys(respuestas[0]));
      } else {
        console.log('📋 Tabla vacía - esto es normal si no hay evaluaciones');
      }
    }

    // 2. Verificar estructura de tabla preguntas_evaluacion
    console.log('\n📊 2. Verificando estructura de preguntas_evaluacion:');
    const { data: preguntas, error: pregError } = await supabase
      .from('preguntas_evaluacion')
      .select('*')
      .limit(3);

    if (pregError) {
      console.error('❌ Error consultando preguntas_evaluacion:', pregError);
    } else {
      console.log('✅ Preguntas encontradas:', preguntas?.length || 0);
      if (preguntas && preguntas.length > 0) {
        console.log('📋 Columnas:', Object.keys(preguntas[0]));
        console.log('📄 Ejemplo:', preguntas[0]);
      }
    }

    // 3. Verificar estudiantes disponibles
    console.log('\n📊 3. Verificando estudiantes disponibles:');
    const { data: estudiantes, error: estError } = await supabase
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
      .limit(3);

    if (estError) {
      console.error('❌ Error consultando estudiantes:', estError);
    } else {
      console.log('✅ Estudiantes encontrados:', estudiantes?.length || 0);
      if (estudiantes && estudiantes.length > 0) {
        console.log('📄 Ejemplo:', estudiantes[0]);
      }
    }

    // 4. Verificar profesores disponibles
    console.log('\n📊 4. Verificando profesores disponibles:');
    const { data: profesores, error: profError } = await supabase
      .from('profesores')
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
      .limit(3);

      if (profError) {
        console.error('❌ Error consultando profesores:', profError);
      } else {
        console.log('✅ Profesores encontrados:', profesores?.length || 0);
        if (profesores && profesores.length > 0) {
          console.log('📄 Ejemplo:', profesores[0]);
        }
      }

    // 5. Verificar grupos disponibles
    console.log('\n📊 5. Verificando grupos disponibles:');
    const { data: grupos, error: grupError } = await supabase
      .from('grupos')
      .select(`
        id,
        curso_id,
        numero_grupo,
        cursos:cursos(
          id,
          nombre,
          codigo,
          carrera_id
        )
      `)
      .limit(3);

    if (grupError) {
      console.error('❌ Error consultando grupos:', grupError);
    } else {
      console.log('✅ Grupos encontrados:', grupos?.length || 0);
      if (grupos && grupos.length > 0) {
        console.log('📄 Ejemplo:', grupos[0]);
      }
    }

    // 6. Simular una evaluación completa
    console.log('\n📊 6. Simulando evaluación completa:');
    
    if (estudiantes && estudiantes.length > 0 && profesores && profesores.length > 0 && grupos && grupos.length > 0) {
      const estudiante = estudiantes[0];
      const profesor = profesores[0];
      const grupo = grupos[0];

      console.log('🎯 Datos de prueba:');
      console.log('   Estudiante:', estudiante.usuarios?.nombre, estudiante.usuarios?.apellido);
      console.log('   Profesor:', profesor.usuarios?.nombre, profesor.usuarios?.apellido);
      console.log('   Grupo:', grupo.numero_grupo, grupo.cursos?.nombre);

      // Simular datos de evaluación
      const evaluationData = {
        profesor_id: profesor.id,
        estudiante_id: estudiante.id,
        grupo_id: grupo.id,
        periodo_id: 1,
        completada: true,
        comentarios: 'Evaluación de prueba',
        calificacion_promedio: 4.5,
        fecha_completada: new Date().toISOString()
      };

      console.log('📝 Datos de evaluación a insertar:', evaluationData);

      // Intentar insertar evaluación
      const { data: evaluacion, error: evalError } = await supabase
        .from('evaluaciones')
        .insert(evaluationData)
        .select('id')
        .single();

      if (evalError) {
        console.error('❌ Error insertando evaluación:', evalError);
      } else {
        console.log('✅ Evaluación insertada exitosamente:', evaluacion);

        // Si hay preguntas, simular respuestas
        if (preguntas && preguntas.length > 0) {
          const respuestasData = preguntas.slice(0, 2).map((pregunta, index) => ({
            evaluacion_id: evaluacion.id,
            pregunta_id: pregunta.id,
            calificacion: 4 + index, // Simular calificaciones
            respuesta_texto: `Respuesta de prueba para pregunta ${index + 1}`
          }));

          console.log('📝 Datos de respuestas a insertar:', respuestasData);

          const { error: respError } = await supabase
            .from('respuestas_evaluacion')
            .insert(respuestasData);

          if (respError) {
            console.error('❌ Error insertando respuestas:', respError);
          } else {
            console.log('✅ Respuestas insertadas exitosamente');
          }
        }
      }
    } else {
      console.log('⚠️ No hay suficientes datos para simular evaluación');
    }

    console.log('\n✅ Prueba completada!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
probarEvaluacion();
