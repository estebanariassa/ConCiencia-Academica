"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationController = void 0;
const evaluationService_1 = require("../services/evaluationService");
class EvaluationController {
    /**
     * Obtener preguntas de evaluación por carrera
     */
    static async getQuestionsByCareer(req, res) {
        try {
            const { carreraId } = req.params;
            const carreraIdNumber = carreraId ? parseInt(carreraId) : undefined;
            const questions = await evaluationService_1.EvaluationService.getQuestionsByCareer(carreraIdNumber);
            res.json({
                success: true,
                data: questions,
                message: 'Preguntas obtenidas exitosamente'
            });
        }
        catch (error) {
            console.error('Error en getQuestionsByCareer:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las preguntas de evaluación'
            });
        }
    }
    /**
     * Obtener todas las preguntas de evaluación activas
     */
    static async getAllQuestions(req, res) {
        try {
            const questions = await evaluationService_1.EvaluationService.getAllActiveQuestions();
            res.json({
                success: true,
                data: questions,
                message: 'Preguntas obtenidas exitosamente'
            });
        }
        catch (error) {
            console.error('Error en getAllQuestions:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las preguntas de evaluación'
            });
        }
    }
    /**
     * Crear una nueva pregunta de evaluación
     */
    static async createQuestion(req, res) {
        try {
            const { categoria_id, texto_pregunta, descripcion, tipo_pregunta, opciones, obligatoria, orden, id_carrera } = req.body;
            // Validaciones básicas
            if (!categoria_id || !texto_pregunta || !tipo_pregunta || orden === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos incompletos',
                    message: 'Faltan campos requeridos: categoria_id, texto_pregunta, tipo_pregunta, orden'
                });
            }
            const newQuestion = await evaluationService_1.EvaluationService.createQuestion({
                categoria_id,
                texto_pregunta,
                descripcion,
                tipo_pregunta,
                opciones,
                obligatoria: obligatoria || false,
                orden,
                id_carrera
            });
            res.status(201).json({
                success: true,
                data: newQuestion,
                message: 'Pregunta creada exitosamente'
            });
        }
        catch (error) {
            console.error('Error en createQuestion:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo crear la pregunta de evaluación'
            });
        }
    }
    /**
     * Actualizar una pregunta de evaluación
     */
    static async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID requerido',
                    message: 'Se requiere el ID de la pregunta'
                });
            }
            const updatedQuestion = await evaluationService_1.EvaluationService.updateQuestion(parseInt(id), updateData);
            res.json({
                success: true,
                data: updatedQuestion,
                message: 'Pregunta actualizada exitosamente'
            });
        }
        catch (error) {
            console.error('Error en updateQuestion:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo actualizar la pregunta de evaluación'
            });
        }
    }
    /**
     * Desactivar una pregunta de evaluación
     */
    static async deactivateQuestion(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'ID requerido',
                    message: 'Se requiere el ID de la pregunta'
                });
            }
            const success = await evaluationService_1.EvaluationService.deactivateQuestion(parseInt(id));
            if (success) {
                res.json({
                    success: true,
                    message: 'Pregunta desactivada exitosamente'
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Error interno del servidor',
                    message: 'No se pudo desactivar la pregunta'
                });
            }
        }
        catch (error) {
            console.error('Error en deactivateQuestion:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo desactivar la pregunta de evaluación'
            });
        }
    }
    /**
     * Obtener preguntas por categoría y carrera
     */
    static async getQuestionsByCategoryAndCareer(req, res) {
        try {
            const { categoriaId, carreraId } = req.params;
            const carreraIdNumber = carreraId ? parseInt(carreraId) : undefined;
            if (!categoriaId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de categoría requerido',
                    message: 'Se requiere el ID de la categoría'
                });
            }
            const questions = await evaluationService_1.EvaluationService.getQuestionsByCategoryAndCareer(parseInt(categoriaId), carreraIdNumber);
            res.json({
                success: true,
                data: questions,
                message: 'Preguntas obtenidas exitosamente'
            });
        }
        catch (error) {
            console.error('Error en getQuestionsByCategoryAndCareer:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las preguntas de evaluación'
            });
        }
    }
}
exports.EvaluationController = EvaluationController;
exports.default = EvaluationController;
