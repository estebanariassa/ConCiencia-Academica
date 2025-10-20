"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_supabase_1 = __importDefault(require("./routes/auth-supabase"));
const evaluaciones_1 = __importDefault(require("./routes/evaluaciones"));
const evaluationRoutes_1 = __importDefault(require("./routes/evaluationRoutes"));
const resultados_1 = __importDefault(require("./routes/resultados"));
const teachers_1 = __importDefault(require("./routes/teachers"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
// Rutas
exports.app.use('/api/auth', auth_supabase_1.default);
exports.app.use('/api/evaluaciones', evaluaciones_1.default);
exports.app.use('/api/evaluations', evaluationRoutes_1.default);
exports.app.use('/api/resultados', resultados_1.default);
exports.app.use('/api/teachers', teachers_1.default);
exports.app.use('/api/courses', courseRoutes_1.default);
exports.app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
