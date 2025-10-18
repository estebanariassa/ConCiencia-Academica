export interface Database {
  public: {
    Tables: {
      evaluacion: {
        Row: {
          id: number;
          correo_profesor: string;
          id_curso: number;
          grupo: string;
          correo_estudiante: string;
          respuestas: any;
          comentarios: string | null;
          id_carrera: number;
          semestre: string;
          fecha_evaluacion: string;
        };
        Insert: {
          id?: number;
          correo_profesor: string;
          id_curso: number;
          grupo: string;
          correo_estudiante: string;
          respuestas: any;
          comentarios?: string | null;
          id_carrera: number;
          semestre: string;
          fecha_evaluacion?: string;
        };
        Update: {
          id?: number;
          correo_profesor?: string;
          id_curso?: number;
          grupo?: string;
          correo_estudiante?: string;
          respuestas?: any;
          comentarios?: string | null;
          id_carrera?: number;
          semestre?: string;
          fecha_evaluacion?: string;
        };
      };
      preguntas_evaluacion: {
        Row: {
          id: number;
          categoria_id: number;
          texto_pregunta: string;
          descripcion: string | null;
          tipo_pregunta: string;
          opciones: any | null;
          obligatoria: boolean;
          orden: number;
          activa: boolean;
          id_carrera: number | null;
        };
        Insert: {
          id?: number;
          categoria_id: number;
          texto_pregunta: string;
          descripcion?: string | null;
          tipo_pregunta: string;
          opciones?: any | null;
          obligatoria?: boolean;
          orden: number;
          activa?: boolean;
          id_carrera?: number | null;
        };
        Update: {
          id?: number;
          categoria_id?: number;
          texto_pregunta?: string;
          descripcion?: string | null;
          tipo_pregunta?: string;
          opciones?: any | null;
          obligatoria?: boolean;
          orden?: number;
          activa?: boolean;
          id_carrera?: number | null;
        };
      };
      
    };
  };
}