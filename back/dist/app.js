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
const resultados_1 = __importDefault(require("./routes/resultados"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
// Rutas
exports.app.use('/auth', auth_supabase_1.default);
exports.app.use('/evaluaciones', evaluaciones_1.default);
exports.app.use('/resultados', resultados_1.default);
exports.app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
