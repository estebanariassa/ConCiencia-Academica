"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseClient_1 = require("../config/supabaseClient");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
// Función para generar token seguro
function generateResetToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
// Función para generar fecha de expiración (1 hora)
function generateExpirationDate() {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    return expirationDate.toISOString();
}
// Endpoint para solicitar reset de contraseña
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        // Validar que se proporcione el email
        if (!email) {
            return res.status(400).json({
                error: 'El correo electrónico es requerido'
            });
        }
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Formato de correo electrónico inválido'
            });
        }
        console.log('🔐 Solicitando reset de contraseña para:', email);
        // Verificar que el usuario existe
        const { data: user, error: userError } = await supabaseClient_1.supabaseAdmin
            .from('usuarios')
            .select('id, email, nombre, apellido')
            .eq('email', email)
            .eq('activo', true)
            .single();
        if (userError || !user) {
            console.log('❌ Usuario no encontrado:', email);
            // Por seguridad, no revelamos si el email existe o no
            return res.status(200).json({
                message: 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace de recuperación'
            });
        }
        console.log('✅ Usuario encontrado:', user);
        // Generar token de reset
        const resetToken = generateResetToken();
        const expiresAt = generateExpirationDate();
        // Guardar token en la base de datos
        const { error: tokenError } = await supabaseClient_1.supabaseAdmin
            .from('password_reset_tokens')
            .insert({
            email: email,
            token: resetToken,
            expires_at: expiresAt,
            used: false
        });
        if (tokenError) {
            console.error('❌ Error al guardar token de reset:', tokenError);
            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
        // En un entorno de producción, aquí enviarías el email
        // Por ahora, solo logueamos el token para desarrollo
        console.log('📧 Token de reset generado:', resetToken);
        console.log('🔗 Enlace de reset:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/forgot-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
        // TODO: Implementar envío de email real
        // await sendPasswordResetEmail(user.email, user.nombre, resetToken)
        res.status(200).json({
            message: 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace de recuperación',
            // Solo en desarrollo
            ...(process.env.NODE_ENV === 'development' && {
                resetToken,
                resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/forgot-password?token=${resetToken}&email=${encodeURIComponent(email)}`
            })
        });
    }
    catch (error) {
        console.error('❌ Error en forgot-password:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});
// Endpoint para validar token de reset
router.get('/validate-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({
                error: 'El correo electrónico es requerido'
            });
        }
        console.log('🔐 Validando token de reset:', token, 'para:', email);
        // Buscar el token en la base de datos
        const { data: tokenData, error: tokenError } = await supabaseClient_1.supabaseAdmin
            .from('password_reset_tokens')
            .select('*')
            .eq('token', token)
            .eq('email', email)
            .eq('used', false)
            .single();
        if (tokenError || !tokenData) {
            console.log('❌ Token no encontrado o ya usado:', token);
            return res.status(400).json({
                error: 'Token inválido o ya utilizado'
            });
        }
        // Verificar si el token ha expirado
        const now = new Date();
        const expirationDate = new Date(tokenData.expires_at);
        if (now > expirationDate) {
            console.log('❌ Token expirado:', token);
            return res.status(400).json({
                error: 'El token ha expirado. Solicita uno nuevo.'
            });
        }
        console.log('✅ Token válido:', token);
        res.status(200).json({
            message: 'Token válido',
            valid: true
        });
    }
    catch (error) {
        console.error('❌ Error en validate-reset-token:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});
// Endpoint para resetear la contraseña
router.post('/reset-password', async (req, res) => {
    try {
        const { token, email, newPassword, confirmPassword } = req.body;
        // Validar datos requeridos
        if (!token || !email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                error: 'Todos los campos son requeridos'
            });
        }
        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                error: 'Las contraseñas no coinciden'
            });
        }
        // Validar fortaleza de la contraseña
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        if (newPassword.length < minLength) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 8 caracteres'
            });
        }
        if (!hasUpperCase) {
            return res.status(400).json({
                error: 'La contraseña debe contener al menos una letra mayúscula'
            });
        }
        if (!hasLowerCase) {
            return res.status(400).json({
                error: 'La contraseña debe contener al menos una letra minúscula'
            });
        }
        if (!hasNumbers) {
            return res.status(400).json({
                error: 'La contraseña debe contener al menos un número'
            });
        }
        if (!hasSpecialChar) {
            return res.status(400).json({
                error: 'La contraseña debe contener al menos un carácter especial'
            });
        }
        console.log('🔐 Reseteando contraseña para:', email);
        // Buscar y validar el token
        const { data: tokenData, error: tokenError } = await supabaseClient_1.supabaseAdmin
            .from('password_reset_tokens')
            .select('*')
            .eq('token', token)
            .eq('email', email)
            .eq('used', false)
            .single();
        if (tokenError || !tokenData) {
            console.log('❌ Token no encontrado o ya usado:', token);
            return res.status(400).json({
                error: 'Token inválido o ya utilizado'
            });
        }
        // Verificar si el token ha expirado
        const now = new Date();
        const expirationDate = new Date(tokenData.expires_at);
        if (now > expirationDate) {
            console.log('❌ Token expirado:', token);
            return res.status(400).json({
                error: 'El token ha expirado. Solicita uno nuevo.'
            });
        }
        // Verificar que el usuario existe
        const { data: user, error: userError } = await supabaseClient_1.supabaseAdmin
            .from('usuarios')
            .select('id, email')
            .eq('email', email)
            .eq('activo', true)
            .single();
        if (userError || !user) {
            console.log('❌ Usuario no encontrado:', email);
            return res.status(400).json({
                error: 'Usuario no encontrado'
            });
        }
        // Hashear la nueva contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
        // Actualizar la contraseña del usuario
        const { error: updateError } = await supabaseClient_1.supabaseAdmin
            .from('usuarios')
            .update({
            password: hashedPassword,
            updated_at: new Date().toISOString()
        })
            .eq('id', user.id);
        if (updateError) {
            console.error('❌ Error al actualizar contraseña:', updateError);
            return res.status(500).json({
                error: 'Error al actualizar la contraseña'
            });
        }
        // Marcar el token como usado
        const { error: markUsedError } = await supabaseClient_1.supabaseAdmin
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('id', tokenData.id);
        if (markUsedError) {
            console.error('❌ Error al marcar token como usado:', markUsedError);
            // No es crítico, solo logueamos el error
        }
        console.log('✅ Contraseña actualizada exitosamente para:', email);
        res.status(200).json({
            message: 'Contraseña actualizada exitosamente'
        });
    }
    catch (error) {
        console.error('❌ Error en reset-password:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});
exports.default = router;
