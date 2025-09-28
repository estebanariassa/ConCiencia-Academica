import { supabase } from './supabaseClient';

// Configuración de la base de datos
export const dbConfig = {
  // Configuraciones generales
  maxConnections: 20,
  connectionTimeout: 30000,
  
  // Configuraciones específicas de Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY,
  }
};

// Función para verificar la conexión a la base de datos
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error de conexión a la base de datos:', error);
      return false;
    }
    
    console.log('✅ Conexión a la base de datos exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
};

// Función para obtener estadísticas de la base de datos
export const getDatabaseStats = async () => {
  try {
    const [usuarios, evaluaciones, cursos] = await Promise.all([
      supabase.from('usuarios').select('count', { count: 'exact' }),
      supabase.from('evaluaciones').select('count', { count: 'exact' }),
      supabase.from('cursos').select('count', { count: 'exact' })
    ]);

    return {
      totalUsuarios: usuarios.count || 0,
      totalEvaluaciones: evaluaciones.count || 0,
      totalCursos: cursos.count || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
};

export default supabase;
