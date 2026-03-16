"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_only_1 = require("../config/supabase-only");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
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
