"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    tipo_usuario: zod_1.z.enum(['estudiante', 'profesor', 'docente', 'coordinador', 'admin', 'decano']),
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
        // Obtener roles múltiples del usuario
        const { RoleService } = await Promise.resolve().then(() => __importStar(require('../services/roleService')));
        const roles = await RoleService.obtenerRolesUsuario(user.id);
        console.log(`🎭 Roles del usuario: ${roles.join(', ')}`);
        // Verificar tipo de usuario válido (tanto en tipo_usuario como en roles)
        const validUserTypes = ['estudiante', 'profesor', 'docente', 'coordinador', 'admin', 'decano'];
        const tieneRolValido = validUserTypes.includes(user.tipo_usuario) ||
            roles.some(rol => validUserTypes.includes(rol));
        if (!tieneRolValido) {
            console.log(`❌ Tipo de usuario inválido: ${user.tipo_usuario}, roles: ${roles.join(', ')}`);
            return res.status(401).json({ error: 'Tipo de usuario no válido' });
        }
        // Si el usuario tiene múltiples roles, devolver información para selección
        if (roles.length > 1) {
            console.log(`🎭 Usuario con múltiples roles: ${user.nombre} ${user.apellido}, roles: ${roles.join(', ')}`);
            return res.status(200).json({
                message: 'Usuario con múltiples roles detectado',
                user: {
                    id: user.id,
                    email: user.email,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    tipo_usuario: user.tipo_usuario,
                    roles: roles,
                    multiple_roles: true
                },
                available_roles: roles,
                requires_role_selection: true
            });
        }
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
        // Determinar el dashboard basado en roles múltiples
        const dashboard = await RoleService.obtenerDashboardUsuario(user.id);
        const permisos = await RoleService.obtenerPermisosUsuario(user.id);
        // Adjuntar información de coordinador (carrera_id) si aplica
        let coordinadorInfo = null;
        try {
            if (roles.includes('coordinador')) {
                console.log('🔍 Usuario es coordinador, buscando info...');
                const { RoleService } = await Promise.resolve().then(() => __importStar(require('../services/roleService')));
                const info = await RoleService.obtenerCoordinadorPorUsuario(user.id);
                console.log('🔍 Info coordinador obtenida:', info);
                if (info) {
                    coordinadorInfo = { carrera_id: info.carrera_id ?? null };
                    console.log('🔍 coordinadorInfo asignado:', coordinadorInfo);
                }
                else {
                    console.log('❌ No se encontró info del coordinador para usuario:', user.id);
                }
            }
        }
        catch (e) {
            console.warn('❌ Error obteniendo info del coordinador:', e);
        }
        // Adjuntar información de decano (facultad_id) si aplica
        let decanoInfo = null;
        try {
            if (roles.includes('decano')) {
                console.log('🔍 Usuario es decano, buscando info...');
                const { RoleService } = await Promise.resolve().then(() => __importStar(require('../services/roleService')));
                const info = await RoleService.obtenerDecanoPorUsuario(user.id);
                console.log('🔍 Info decano obtenida:', info);
                if (info) {
                    decanoInfo = {
                        facultad_id: info.facultad_id ?? null,
                        facultad_nombre: info.facultades?.nombre ?? null,
                        fecha_nombramiento: info.fecha_nombramiento
                    };
                    console.log('🔍 decanoInfo asignado:', decanoInfo);
                }
                else {
                    console.log('❌ No se encontró info del decano para usuario:', user.id);
                }
            }
        }
        catch (e) {
            console.warn('❌ Error obteniendo info del decano:', e);
        }
        console.log(`📍 Dashboard asignado: ${dashboard}`);
        console.log(`🔑 Permisos: ${permisos.join(', ')}`);
        // Determinar el tipo de usuario para la respuesta
        let userTypeDisplay = user.tipo_usuario;
        let userRole = user.tipo_usuario;
        // Normalizar 'docente' a 'profesor' para compatibilidad
        if (user.tipo_usuario === 'docente') {
            userTypeDisplay = 'profesor';
            userRole = 'profesor';
        }
        // Información adicional según los roles del usuario
        let additionalInfo = {
            dashboard: dashboard,
            permissions: permisos,
            roles: roles,
            role_description: roles.length > 1 ?
                `Usuario con múltiples roles: ${roles.join(', ')}` :
                `Usuario con rol: ${roles[0] || user.tipo_usuario}`
        };
        if (coordinadorInfo) {
            additionalInfo.coordinador = coordinadorInfo;
        }
        if (decanoInfo) {
            additionalInfo.decano = decanoInfo;
        }
        // Información específica por rol principal
        if (roles.includes('admin')) {
            additionalInfo.role_description = 'Administrador del sistema';
        }
        else if (roles.includes('decano')) {
            additionalInfo.role_description = 'Decano de la facultad';
        }
        else if (roles.includes('coordinador')) {
            additionalInfo.role_description = 'Coordinador del sistema';
        }
        else if (roles.includes('profesor') || roles.includes('docente')) {
            additionalInfo.role_description = 'Profesor/Docente del sistema';
        }
        else if (roles.includes('estudiante')) {
            additionalInfo.role_description = 'Estudiante del sistema';
        }
        console.log(`🎉 Login exitoso para ${userTypeDisplay}: ${user.email}`);
        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                tipo_usuario: user.tipo_usuario,
                user_type: userTypeDisplay,
                user_role: userRole,
                ...additionalInfo
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
// POST /auth/login-with-role - Login con rol específico
router.post('/login-with-role', async (req, res) => {
    try {
        const { email, password, selectedRole } = req.body;
        console.log(`🔍 Login con rol específico para: ${email}, rol: ${selectedRole}`);
        // Buscar usuario
        const user = await supabase_only_1.SupabaseDB.findUserByEmail(email);
        if (!user) {
            console.log(`❌ Usuario no encontrado: ${email}`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        if (!user.activo) {
            console.log(`❌ Usuario inactivo: ${email}`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Obtener roles múltiples del usuario
        const { RoleService } = await Promise.resolve().then(() => __importStar(require('../services/roleService')));
        const roles = await RoleService.obtenerRolesUsuario(user.id);
        // Verificar que el usuario tiene el rol seleccionado
        if (!roles.includes(selectedRole)) {
            console.log(`❌ Usuario no tiene el rol seleccionado: ${selectedRole}, roles disponibles: ${roles.join(', ')}`);
            return res.status(401).json({ error: 'Rol no válido para este usuario' });
        }
        // Verificar contraseña
        let isValidPassword = false;
        // Primero intentar con bcrypt (contraseña hasheada)
        if (user.password && user.password.startsWith('$2')) {
            isValidPassword = await bcrypt_1.default.compare(password, user.password);
        }
        else {
            // Fallback para contraseñas en texto plano (solo para desarrollo)
            isValidPassword = user.password === password;
        }
        if (!isValidPassword) {
            console.log(`❌ Contraseña incorrecta para: ${email}`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            selectedRole: selectedRole
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        // Determinar dashboard basado en el rol seleccionado
        let dashboard = '/dashboard';
        switch (selectedRole) {
            case 'estudiante':
                dashboard = '/dashboard-estudiante';
                break;
            case 'profesor':
            case 'docente':
                dashboard = '/dashboard-profesor';
                break;
            case 'coordinador':
                dashboard = '/dashboard-coordinador';
                break;
            case 'decano':
                dashboard = '/dashboard-decano';
                break;
            case 'admin':
                dashboard = '/dashboard-admin';
                break;
        }
        console.log(`✅ Login exitoso con rol ${selectedRole} para: ${user.nombre} ${user.apellido}`);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                tipo_usuario: user.tipo_usuario,
                roles: roles,
                selected_role: selectedRole,
                dashboard: dashboard
            }
        });
    }
    catch (error) {
        console.error('Error en login con rol:', error);
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
        // Determinar el tipo de usuario para la respuesta
        let userTypeDisplay = user.tipo_usuario;
        let userRole = user.tipo_usuario;
        // Normalizar 'docente' a 'profesor' para compatibilidad
        if (user.tipo_usuario === 'docente') {
            userTypeDisplay = 'profesor';
            userRole = 'profesor';
        }
        // Información adicional según el tipo de usuario
        let additionalInfo = {};
        switch (user.tipo_usuario) {
            case 'estudiante':
                additionalInfo = {
                    dashboard: '/dashboard-estudiante',
                    permissions: ['view_evaluations', 'submit_evaluations'],
                    role_description: 'Estudiante del sistema'
                };
                break;
            case 'profesor':
            case 'docente':
                additionalInfo = {
                    dashboard: '/dashboard-profesor',
                    permissions: ['view_evaluations', 'create_evaluations', 'view_reports'],
                    role_description: 'Profesor/Docente del sistema'
                };
                break;
            case 'coordinador':
                additionalInfo = {
                    dashboard: '/dashboard-coordinador',
                    permissions: ['view_evaluations', 'create_evaluations', 'view_reports', 'manage_users'],
                    role_description: 'Coordinador académico'
                };
                break;
            case 'admin':
                additionalInfo = {
                    dashboard: '/dashboard-admin',
                    permissions: ['all'],
                    role_description: 'Administrador del sistema'
                };
                break;
        }
        // Devolver información del usuario (sin la contraseña)
        res.json({
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            tipo_usuario: user.tipo_usuario,
            user_type: userTypeDisplay,
            user_role: userRole,
            activo: user.activo,
            created_at: user.created_at,
            ...additionalInfo
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
