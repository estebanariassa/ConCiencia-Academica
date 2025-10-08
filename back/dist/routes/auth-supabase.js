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
    tipo_usuario: zod_1.z.enum(['estudiante', 'profesor', 'docente', 'coordinador', 'admin']),
    password: zod_1.z.string().min(6),
    // Campos opcionales para profesores
    codigo_profesor: zod_1.z.string().optional(),
    departamento: zod_1.z.string().optional(),
    // Campos opcionales para estudiantes
    codigo_estudiante: zod_1.z.string().optional(),
    carrera_id: zod_1.z.number().optional(),
    semestre: zod_1.z.string().optional()
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
        // Crear usuario con inserción automática en tabla específica
        const user = await supabase_only_1.SupabaseDB.createUserWithType({
            email: validatedData.email,
            password: hashedPassword,
            nombre: validatedData.nombre,
            apellido: validatedData.apellido,
            tipo_usuario: validatedData.tipo_usuario,
            // Campos para profesores
            codigo_profesor: validatedData.codigo_profesor,
            departamento: validatedData.departamento,
            // Campos para estudiantes
            codigo_estudiante: validatedData.codigo_estudiante,
            carrera_id: validatedData.carrera_id,
            semestre: validatedData.semestre
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
        console.log(`🔍 Intentando login para: ${validatedData.email}`);
        // Buscar usuario
        const user = await supabase_only_1.SupabaseDB.findUserByEmail(validatedData.email);
        if (!user) {
            console.log(`❌ Usuario no encontrado: ${validatedData.email}`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        if (!user.activo) {
            console.log(`❌ Usuario inactivo: ${validatedData.email}`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        console.log(`✅ Usuario encontrado: ${user.nombre} ${user.apellido} (${user.tipo_usuario})`);
        // Verificar contraseña
        let isValidPassword = false;
        // Primero intentar con bcrypt (contraseña hasheada)
        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
            isValidPassword = await bcrypt_1.default.compare(validatedData.password, user.password);
            console.log(`🔐 Verificación con bcrypt: ${isValidPassword}`);
        }
        else {
            // Si no está hasheada, comparar en texto plano (para compatibilidad)
            isValidPassword = user.password === validatedData.password;
            console.log(`🔐 Verificación en texto plano: ${isValidPassword}`);
            // Si la contraseña es correcta pero no está hasheada, la hasheamos automáticamente
            if (isValidPassword) {
                console.log(`🔧 Hasheando contraseña para: ${validatedData.email}`);
                const hashedPassword = await bcrypt_1.default.hash(validatedData.password, 10);
                // Actualizar la contraseña hasheada en la base de datos
                try {
                    await supabase_only_1.SupabaseDB.updateUser(user.id, { password: hashedPassword });
                    console.log(`✅ Contraseña hasheada y actualizada para: ${validatedData.email}`);
                }
                catch (updateError) {
                    console.error(`⚠️ Error actualizando contraseña hasheada:`, updateError);
                    // Continuar con el login aunque no se haya actualizado
                }
            }
        }
        if (!isValidPassword) {
            console.log(`❌ Contraseña incorrecta para: ${validatedData.email}`);
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
// GET /auth/me - Obtener información del usuario actual
router.get('/me', async (req, res) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de autorización requerido' });
        }
        const token = authHeader.substring(7); // Remover 'Bearer '
        // Verificar y decodificar el token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Buscar el usuario en la base de datos
        const user = await supabase_only_1.SupabaseDB.findUserByEmail(decoded.email);
        if (!user || !user.activo) {
            return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
        }
        // Devolver información del usuario (sin la contraseña)
        res.json({
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            tipo_usuario: user.tipo_usuario,
            activo: user.activo,
            created_at: user.created_at
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expirado' });
        }
        console.error('Error en /auth/me:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// POST /auth/create-user - Crear usuario con hash automático (para administradores)
router.post('/create-user', async (req, res) => {
    try {
        const { email, password, nombre, apellido, tipo_usuario, 
        // Campos opcionales para profesores
        codigo_profesor, departamento, 
        // Campos opcionales para estudiantes
        codigo_estudiante, carrera_id, semestre } = req.body;
        // Validación básica
        if (!email || !password || !nombre || !apellido || !tipo_usuario) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        // Verificar si el usuario ya existe
        const existingUser = await supabase_only_1.SupabaseDB.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        // Hash automático de la contraseña
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Crear usuario con inserción automática en tabla específica
        const user = await supabase_only_1.SupabaseDB.createUserWithType({
            email,
            password: hashedPassword,
            nombre,
            apellido,
            tipo_usuario,
            // Campos para profesores
            codigo_profesor,
            departamento,
            // Campos para estudiantes
            codigo_estudiante,
            carrera_id,
            semestre
        });
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                tipo_usuario: user.tipo_usuario,
                activo: user.activo
            },
            loginCredentials: {
                email: email,
                password: password // Mostrar la contraseña original para referencia
            }
        });
    }
    catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = router;
