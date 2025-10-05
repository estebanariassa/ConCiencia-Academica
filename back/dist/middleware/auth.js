"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_only_1 = require("../config/supabase-only");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Verificar que el usuario existe y está activo
        const user = await supabase_only_1.SupabaseDB.findUserById(decoded.userId);
        if (!user || !user.activo) {
            return res.status(401).json({ error: 'Usuario no válido o inactivo' });
        }
        req.user = {
            id: user.id,
            email: user.email,
            tipo_usuario: user.tipo_usuario
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        if (!roles.includes(req.user.tipo_usuario)) {
            return res.status(403).json({ error: 'Permisos insuficientes' });
        }
        next();
    };
};
exports.requireRole = requireRole;
