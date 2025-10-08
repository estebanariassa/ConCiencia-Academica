"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseDB = exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}
// Cliente de Supabase con permisos de administrador
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});
// Funciones de base de datos usando Supabase
class SupabaseDB {
    // Usuarios
    static async createUser(userData) {
        const { data, error } = await exports.supabaseAdmin
            .from('usuarios')
            .insert([userData])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    static async findUserByEmail(email) {
        const { data, error } = await exports.supabaseAdmin
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();
        if (error && error.code !== 'PGRST116')
            throw error; // PGRST116 = no rows returned
        return data;
    }
    static async findUserById(id) {
        const { data, error } = await exports.supabaseAdmin
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116')
            throw error;
        return data;
    }
    static async updateUser(id, updates) {
        const { data, error } = await exports.supabaseAdmin
            .from('usuarios')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    static async countUsers() {
        const { count, error } = await exports.supabaseAdmin
            .from('usuarios')
            .select('*', { count: 'exact', head: true });
        if (error)
            throw error;
        return count || 0;
    }
    // Evaluaciones
    static async createEvaluation(evaluationData) {
        const { data, error } = await exports.supabaseAdmin
            .from('evaluaciones')
            .insert([evaluationData])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    // Preguntas de evaluación
    static async getEvaluationQuestions() {
        const { data, error } = await exports.supabaseAdmin
            .from('preguntas_evaluacion')
            .select('*')
            .eq('activa', true)
            .order('orden');
        if (error)
            throw error;
        return data;
    }
    // Respuestas de evaluación
    static async createEvaluationResponse(responseData) {
        const { data, error } = await exports.supabaseAdmin
            .from('respuestas_evaluacion')
            .insert([responseData])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    static async getEvaluationResponses(evaluationId) {
        const { data, error } = await exports.supabaseAdmin
            .from('respuestas_evaluacion')
            .select('*')
            .eq('evaluacion_id', evaluationId);
        if (error)
            throw error;
        return data;
    }
    // Profesores
    static async getProfessors() {
        const { data, error } = await exports.supabaseAdmin
            .from('profesores')
            .select(`
        *,
        usuario:usuarios(*)
      `)
            .eq('activo', true);
        if (error)
            throw error;
        return data;
    }
    // Estudiantes
    static async getStudents() {
        const { data, error } = await exports.supabaseAdmin
            .from('estudiantes')
            .select(`
        *,
        usuario:usuarios(*),
        carrera:carreras(*)
      `)
            .eq('activo', true);
        if (error)
            throw error;
        return data;
    }
    // Grupos
    static async getGroups() {
        const { data, error } = await exports.supabaseAdmin
            .from('grupos')
            .select(`
        *,
        curso:cursos(*),
        periodo:periodos_academicos(*)
      `)
            .eq('activo', true);
        if (error)
            throw error;
        return data;
    }
    // Carreras
    static async getCareers() {
        const { data, error } = await exports.supabaseAdmin
            .from('carreras')
            .select('*')
            .eq('activa', true);
        if (error)
            throw error;
        return data;
    }
    // Cursos
    static async getCourses() {
        const { data, error } = await exports.supabaseAdmin
            .from('cursos')
            .select('*')
            .eq('activo', true);
        if (error)
            throw error;
        return data;
    }
    // Períodos académicos
    static async getAcademicPeriods() {
        const { data, error } = await exports.supabaseAdmin
            .from('periodos_academicos')
            .select('*')
            .eq('activo', true);
        if (error)
            throw error;
        return data;
    }
    // Inscripciones
    static async findInscription(studentId, groupId) {
        const { data, error } = await exports.supabaseAdmin
            .from('inscripciones')
            .select('*')
            .eq('estudiante_id', studentId)
            .eq('grupo_id', groupId)
            .eq('activa', true)
            .single();
        if (error && error.code !== 'PGRST116')
            throw error;
        return data;
    }
    // Evaluaciones con relaciones
    static async getEvaluationsByStudent(studentId) {
        const { data, error } = await exports.supabaseAdmin
            .from('evaluaciones')
            .select(`
        *,
        profesor:profesores(
          *,
          usuario:usuarios(nombre, apellido)
        ),
        grupo:grupos(
          *,
          curso:cursos(*),
          periodo:periodos_academicos(*)
        ),
        respuestas_evaluacion(
          *,
          pregunta:preguntas_evaluacion(*)
        )
      `)
            .eq('estudiante_id', studentId)
            .order('fecha_creacion', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    static async findExistingEvaluation(studentId, profesorId, groupId, periodoId) {
        const { data, error } = await exports.supabaseAdmin
            .from('evaluaciones')
            .select('*')
            .eq('estudiante_id', studentId)
            .eq('profesor_id', profesorId)
            .eq('grupo_id', groupId)
            .eq('periodo_id', periodoId)
            .single();
        if (error && error.code !== 'PGRST116')
            throw error;
        return data;
    }
    static async createEvaluationWithResponses(evaluationData, responses) {
        // Crear evaluación
        const { data: evaluation, error: evalError } = await exports.supabaseAdmin
            .from('evaluaciones')
            .insert([evaluationData])
            .select()
            .single();
        if (evalError)
            throw evalError;
        // Crear respuestas si existen
        if (responses.length > 0) {
            const responsesWithEvaluationId = responses.map(response => ({
                ...response,
                evaluacion_id: evaluation.id
            }));
            const { error: respError } = await exports.supabaseAdmin
                .from('respuestas_evaluacion')
                .insert(responsesWithEvaluationId);
            if (respError)
                throw respError;
        }
        return evaluation;
    }
    static async getEvaluationWithRelations(evaluationId) {
        const { data, error } = await exports.supabaseAdmin
            .from('evaluaciones')
            .select(`
        *,
        profesor:profesores(
          *,
          usuario:usuarios(nombre, apellido)
        ),
        grupo:grupos(
          *,
          curso:cursos(*),
          periodo:periodos_academicos(*)
        ),
        respuestas_evaluacion(
          *,
          pregunta:preguntas_evaluacion(*)
        )
      `)
            .eq('id', evaluationId)
            .single();
        if (error)
            throw error;
        return data;
    }
    // Preguntas con categorías
    static async getQuestionsWithCategories() {
        const { data, error } = await exports.supabaseAdmin
            .from('preguntas_evaluacion')
            .select(`
        *,
        categoria:categorias_pregunta(*)
      `)
            .eq('activa', true)
            .order('categoria_id', { ascending: true })
            .order('orden', { ascending: true });
        if (error)
            throw error;
        return data;
    }
    // Crear profesor
    static async createProfessor(professorData) {
        const { data, error } = await exports.supabaseAdmin
            .from('profesores')
            .insert([{
                usuario_id: professorData.usuario_id,
                codigo: professorData.codigo || null,
                departamento: professorData.departamento || null,
                activo: professorData.activo !== undefined ? professorData.activo : true
            }])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    // Crear estudiante
    static async createStudent(studentData) {
        const { data, error } = await exports.supabaseAdmin
            .from('estudiantes')
            .insert([{
                usuario_id: studentData.usuario_id,
                codigo: studentData.codigo || null,
                carrera_id: studentData.carrera_id || null,
                semestre: studentData.semestre || null,
                activo: studentData.activo !== undefined ? studentData.activo : true
            }])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    // Crear usuario con inserción automática en tabla específica
    static async createUserWithType(userData) {
        // Crear usuario primero
        const user = await this.createUser({
            email: userData.email,
            password: userData.password,
            nombre: userData.nombre,
            apellido: userData.apellido,
            tipo_usuario: userData.tipo_usuario
        });
        // Insertar en tabla específica según el tipo
        if (userData.tipo_usuario === 'profesor' || userData.tipo_usuario === 'docente') {
            await this.createProfessor({
                usuario_id: user.id,
                codigo: userData.codigo_profesor,
                departamento: userData.departamento
            });
        }
        else if (userData.tipo_usuario === 'estudiante') {
            await this.createStudent({
                usuario_id: user.id,
                codigo: userData.codigo_estudiante,
                carrera_id: userData.carrera_id,
                semestre: userData.semestre
            });
        }
        return user;
    }
}
exports.SupabaseDB = SupabaseDB;
SupabaseDB.supabaseAdmin = exports.supabaseAdmin;
exports.default = SupabaseDB;
