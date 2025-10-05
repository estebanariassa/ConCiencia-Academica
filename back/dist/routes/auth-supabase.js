"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const supabase_only_1 = require("../config/supabase-only");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    nombre: zod_1.z.string().min(2),
    apellido: zod_1.z.string().min(2),
    tipo_usuario: zod_1.z.enum(['estudiante', 'profesor', 'coordinador', 'admin']),
    password: zod_1.z.string().min(6)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        // Verificar si el usuario ya existe
        const existingUser = await supabase_only_1.SupabaseDB.findUserByEmail(validatedData.email);
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        // Hash de la contraseña
        const hashedPassword = await bcrypt_1.default.hash(validatedData.password, 10);
        // Crear usuario
        const user = await supabase_only_1.SupabaseDB.createUser({
            email: validatedData.email,
            password: hashedPassword,
            nombre: validatedData.nombre,
            apellido: validatedData.apellido,
            tipo_usuario: validatedData.tipo_usuario,
        });
        // Generar JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, tipo_usuario: user.tipo_usuario }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                tipo_usuario: user.tipo_usuario
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
        }
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        // Buscar usuario
        const user = await supabase_only_1.SupabaseDB.findUserByEmail(validatedData.email);
        if (!user || !user.activo) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Verificar contraseña
        const isValidPassword = await bcrypt_1.default.compare(validatedData.password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Generar JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, tipo_usuario: user.tipo_usuario }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                tipo_usuario: user.tipo_usuario
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
        }
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = router;
