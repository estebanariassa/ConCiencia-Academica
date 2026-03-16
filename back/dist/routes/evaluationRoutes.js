"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const evaluationController_1 = require("../controllers/evaluationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Aplicar autenticación a todas las rutas
router.use(auth_1.authenticateToken);
/**
 * @route GET /api/evaluations/questions/career/:carreraId?
 * @desc Obtener preguntas de evaluación por carrera
 * @access Private
 */
router.get('/questions/career/:carreraId?', evaluationController_1.EvaluationController.getQuestionsByCareer);
/**
 * @route GET /api/evaluations/questions
 * @desc Obtener todas las preguntas de evaluación activas
 * @access Private
 */
router.get('/questions', evaluationController_1.EvaluationController.getAllQuestions);
/**
 * @route POST /api/evaluations/questions
 * @desc Crear una nueva pregunta de evaluación
 * @access Private (Admin/Coordinador)
 */
router.post('/questions', evaluationController_1.EvaluationController.createQuestion);
/**
 * @route PUT /api/evaluations/questions/:id
 * @desc Actualizar una pregunta de evaluación
 * @access Private (Admin/Coordinador)
 */
router.put('/questions/:id', evaluationController_1.EvaluationController.updateQuestion);
/**
 * @route DELETE /api/evaluations/questions/:id
 * @desc Desactivar una pregunta de evaluación
 * @access Private (Admin/Coordinador)
 */
router.delete('/questions/:id', evaluationController_1.EvaluationController.deactivateQuestion);
/**
 * @route GET /api/evaluations/questions/category/:categoriaId/career/:carreraId?
 * @desc Obtener preguntas por categoría y carrera
 * @access Private
 */
router.get('/questions/category/:categoriaId/career/:carreraId?', evaluationController_1.EvaluationController.getQuestionsByCategoryAndCareer);
exports.default = router;
