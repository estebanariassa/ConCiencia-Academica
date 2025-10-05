"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const supabase_only_1 = require("../config/supabase-only");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const evaluacionSchema = zod_1.z.object({
    profesor_id: zod_1.z.string().uuid(),
    grupo_id: zod_1.z.number().int().positive(),
    periodo_id: zod_1.z.number().int().positive(),
    comentarios: zod_1.z.string().optional(),
    respuestas: zod_1.z.array(zod_1.z.object({
        pregunta_id: zod_1.z.number().int().positive(),
        respuesta_rating: zod_1.z.number().int().min(1).max(5).optional(),
        respuesta_texto: zod_1.z.string().optional(),
        respuesta_opcion: zod_1.z.string().optional()
    }))
});
// GET /evaluaciones - Listar evaluaciones del estudiante
router.get('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['estudiante']), async (req, res) => {
    try {
        const evaluaciones = await supabase_only_1.SupabaseDB.getEvaluationsByStudent(req.user.id);
        res.json(evaluaciones);
    }
    catch (error) {
        console.error('Error al obtener evaluaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// POST /evaluaciones - Crear nueva evaluación
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['estudiante']), async (req, res) => {
    try {
        const validatedData = evaluacionSchema.parse(req.body);
        // Verificar que el estudiante esté inscrito en el grupo
        const inscripcion = await supabase_only_1.SupabaseDB.findInscription(req.user.id, validatedData.grupo_id);
        if (!inscripcion) {
            return res.status(403).json({ error: 'No estás inscrito en este grupo' });
        }
        // Verificar que no exista una evaluación previa
        const evaluacionExistente = await supabase_only_1.SupabaseDB.findExistingEvaluation(req.user.id, validatedData.profesor_id, validatedData.grupo_id, validatedData.periodo_id);
        if (evaluacionExistente) {
            return res.status(400).json({ error: 'Ya has evaluado a este profesor en este grupo' });
        }
        // Crear evaluación con respuestas
        const evaluationData = {
            estudiante_id: req.user.id,
            profesor_id: validatedData.profesor_id,
            grupo_id: validatedData.grupo_id,
            periodo_id: validatedData.periodo_id,
            comentarios: validatedData.comentarios,
            completada: true,
            fecha_completada: new Date().toISOString()
        };
        const responses = validatedData.respuestas.map(respuesta => ({
            pregunta_id: respuesta.pregunta_id,
            respuesta_rating: respuesta.respuesta_rating,
            respuesta_texto: respuesta.respuesta_texto,
            respuesta_opcion: respuesta.respuesta_opcion
        }));
        const evaluacion = await supabase_only_1.SupabaseDB.createEvaluationWithResponses(evaluationData, responses);
        // Obtener la evaluación completa con relaciones
        const evaluacionCompleta = await supabase_only_1.SupabaseDB.getEvaluationWithRelations(evaluacion.id);
        res.status(201).json({
            message: 'Evaluación creada exitosamente',
            evaluacion: evaluacionCompleta
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
        }
        console.error('Error al crear evaluación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// GET /evaluaciones/preguntas - Obtener preguntas de evaluación
router.get('/preguntas', auth_1.authenticateToken, async (req, res) => {
    try {
        const preguntas = await supabase_only_1.SupabaseDB.getQuestionsWithCategories();
        res.json(preguntas);
    }
    catch (error) {
        console.error('Error al obtener preguntas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = router;
