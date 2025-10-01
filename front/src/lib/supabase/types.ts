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
      
    };
  };
}