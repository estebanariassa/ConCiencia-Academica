export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nombre: string;
          apellido: string;
          tipo_usuario: 'estudiante' | 'profesor' | 'coordinador' | 'admin';
          activo: boolean;
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          email: string;
          nombre: string;
          apellido: string;
          tipo_usuario: 'estudiante' | 'profesor' | 'coordinador' | 'admin';
          activo?: boolean;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nombre?: string;
          apellido?: string;
          tipo_usuario?: 'estudiante' | 'profesor' | 'coordinador' | 'admin';
          activo?: boolean;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
        };
      };
      carreras: {
        Row: {
          id: number;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          activa: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: number;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          activa?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: number;
          codigo?: string;
          nombre?: string;
          descripcion?: string | null;
          activa?: boolean;
          fecha_creacion?: string;
        };
      };
      departamentos: {
        Row: {
          id: number;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          activo: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: number;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          activo?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: number;
          codigo?: string;
          nombre?: string;
          descripcion?: string | null;
          activo?: boolean;
          fecha_creacion?: string;
        };
      };
      profesores: {
        Row: {
          id: string;
          usuario_id: string;
          departamento_id: number | null;
          codigo_profesor: string | null;
          telefono: string | null;
          fecha_ingreso: string | null;
          activo: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          departamento_id?: number | null;
          codigo_profesor?: string | null;
          telefono?: string | null;
          fecha_ingreso?: string | null;
          activo?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          departamento_id?: number | null;
          codigo_profesor?: string | null;
          telefono?: string | null;
          fecha_ingreso?: string | null;
          activo?: boolean;
          fecha_creacion?: string;
        };
      };
      estudiantes: {
        Row: {
          id: string;
          usuario_id: string;
          carrera_id: number;
          codigo_estudiante: string;
          semestre_actual: number;
          activo: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          carrera_id: number;
          codigo_estudiante: string;
          semestre_actual: number;
          activo?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          carrera_id?: number;
          codigo_estudiante?: string;
          semestre_actual?: number;
          activo?: boolean;
          fecha_creacion?: string;
        };
      };
      cursos: {
        Row: {
          id: number;
          codigo: string;
          nombre: string;
          creditos: number;
          descripcion: string | null;
          departamento_id: number | null;
          activo: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: number;
          codigo: string;
          nombre: string;
          creditos: number;
          descripcion?: string | null;
          departamento_id?: number | null;
          activo?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: number;
          codigo?: string;
          nombre?: string;
          creditos?: number;
          descripcion?: string | null;
          departamento_id?: number | null;
          activo?: boolean;
          fecha_creacion?: string;
        };
      };
      periodos_academicos: {
        Row: {
          id: number;
          codigo: string;
          nombre: string;
          fecha_inicio: string;
          fecha_fin: string;
          activo: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: number;
          codigo: string;
          nombre: string;
          fecha_inicio: string;
          fecha_fin: string;
          activo?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: number;
          codigo?: string;
          nombre?: string;
          fecha_inicio?: string;
          fecha_fin?: string;
          activo?: boolean;
          fecha_creacion?: string;
        };
      };
      grupos: {
        Row: {
          id: number;
          curso_id: number;
          periodo_id: number;
          numero_grupo: string;
          horario: string | null;
          aula: string | null;
          cupo_maximo: number;
          activo: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: number;
          curso_id: number;
          periodo_id: number;
          numero_grupo: string;
          horario?: string | null;
          aula?: string | null;
          cupo_maximo?: number;
          activo?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: number;
          curso_id?: number;
          periodo_id?: number;
          numero_grupo?: string;
          horario?: string | null;
          aula?: string | null;
          cupo_maximo?: number;
          activo?: boolean;
          fecha_creacion?: string;
        };
      };
      inscripciones: {
        Row: {
          id: number;
          estudiante_id: string;
          grupo_id: number;
          fecha_inscripcion: string;
          activa: boolean;
        };
        Insert: {
          id?: number;
          estudiante_id: string;
          grupo_id: number;
          fecha_inscripcion?: string;
          activa?: boolean;
        };
        Update: {
          id?: number;
          estudiante_id?: string;
          grupo_id?: number;
          fecha_inscripcion?: string;
          activa?: boolean;
        };
      };
      asignaciones_profesor: {
        Row: {
          id: number;
          profesor_id: string;
          grupo_id: number;
          fecha_asignacion: string;
          activa: boolean;
        };
        Insert: {
          id?: number;
          profesor_id: string;
          grupo_id: number;
          fecha_asignacion?: string;
          activa?: boolean;
        };
        Update: {
          id?: number;
          profesor_id?: string;
          grupo_id?: number;
          fecha_asignacion?: string;
          activa?: boolean;
        };
      };
      categorias_pregunta: {
        Row: {
          id: number;
          nombre: string;
          descripcion: string | null;
          orden: number;
          activa: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: number;
          nombre: string;
          descripcion?: string | null;
          orden: number;
          activa?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: number;
          nombre?: string;
          descripcion?: string | null;
          orden?: number;
          activa?: boolean;
          fecha_creacion?: string;
        };
      };
      preguntas_evaluacion: {
        Row: {
          id: number;
          categoria_id: number;
          texto_pregunta: string;
          descripcion: string | null;
          tipo_pregunta: 'rating' | 'texto' | 'opcion_multiple';
          opciones: any | null;
          obligatoria: boolean;
          orden: number;
          activa: boolean;
          fecha_creacion: string;
        };
        Insert: {
          id?: number;
          categoria_id: number;
          texto_pregunta: string;
          descripcion?: string | null;
          tipo_pregunta: 'rating' | 'texto' | 'opcion_multiple';
          opciones?: any | null;
          obligatoria?: boolean;
          orden: number;
          activa?: boolean;
          fecha_creacion?: string;
        };
        Update: {
          id?: number;
          categoria_id?: number;
          texto_pregunta?: string;
          descripcion?: string | null;
          tipo_pregunta?: 'rating' | 'texto' | 'opcion_multiple';
          opciones?: any | null;
          obligatoria?: boolean;
          orden?: number;
          activa?: boolean;
          fecha_creacion?: string;
        };
      };
      evaluaciones: {
        Row: {
          id: string;
          estudiante_id: string;
          profesor_id: string;
          grupo_id: number;
          periodo_id: number;
          completada: boolean;
          comentarios: string | null;
          calificacion_promedio: number | null;
          fecha_inicio: string;
          fecha_completada: string | null;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          estudiante_id: string;
          profesor_id: string;
          grupo_id: number;
          periodo_id: number;
          completada?: boolean;
          comentarios?: string | null;
          calificacion_promedio?: number | null;
          fecha_inicio?: string;
          fecha_completada?: string | null;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          estudiante_id?: string;
          profesor_id?: string;
          grupo_id?: number;
          periodo_id?: number;
          completada?: boolean;
          comentarios?: string | null;
          calificacion_promedio?: number | null;
          fecha_inicio?: string;
          fecha_completada?: string | null;
          fecha_creacion?: string;
        };
      };
      respuestas_evaluacion: {
        Row: {
          id: string;
          evaluacion_id: string;
          pregunta_id: number;
          respuesta_rating: number | null;
          respuesta_texto: string | null;
          respuesta_opcion: string | null;
          fecha_respuesta: string;
        };
        Insert: {
          id?: string;
          evaluacion_id: string;
          pregunta_id: number;
          respuesta_rating?: number | null;
          respuesta_texto?: string | null;
          respuesta_opcion?: string | null;
          fecha_respuesta?: string;
        };
        Update: {
          id?: string;
          evaluacion_id?: string;
          pregunta_id?: number;
          respuesta_rating?: number | null;
          respuesta_texto?: string | null;
          respuesta_opcion?: string | null;
          fecha_respuesta?: string;
        };
      };
      notificaciones: {
        Row: {
          id: string;
          usuario_id: string;
          titulo: string;
          mensaje: string;
          tipo: 'info' | 'warning' | 'success' | 'error';
          leida: boolean;
          enlace: string | null;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          titulo: string;
          mensaje: string;
          tipo: 'info' | 'warning' | 'success' | 'error';
          leida?: boolean;
          enlace?: string | null;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          titulo?: string;
          mensaje?: string;
          tipo?: 'info' | 'warning' | 'success' | 'error';
          leida?: boolean;
          enlace?: string | null;
          fecha_creacion?: string;
        };
      };
    };
  };
}