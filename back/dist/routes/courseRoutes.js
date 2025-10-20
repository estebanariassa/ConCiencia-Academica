"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_only_1 = require("../config/supabase-only");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /courses/by-career/:careerId - Obtener todos los cursos de una carrera específica
router.get('/by-career/:careerId', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { careerId } = req.params;
        console.log('🔍 [/courses/by-career] Request received', { userId: user?.id, careerId });
        // Verificar que el usuario sea coordinador
        if (!user.roles?.includes('coordinador') && user.tipo_usuario !== 'coordinador') {
            return res.status(403).json({ error: 'Acceso denegado. Solo coordinadores pueden ver esta información.' });
        }
        // Obtener todos los cursos de la carrera (activos e inactivos)
        const { data: cursos, error: cursosError } = await supabase_only_1.SupabaseDB.supabaseAdmin
            .from('cursos')
            .select(`
        id,
        nombre,
        codigo,
        creditos,
        descripcion,
        activo,
        carrera_id,
        carreras:carreras(
          id,
          nombre,
          codigo
        )
      `)
            .eq('carrera_id', careerId)
            .order('nombre');
        if (cursosError) {
            console.error('Error consultando cursos por carrera_id:', cursosError);
            return res.status(500).json({ error: 'Error obteniendo cursos por carrera', details: cursosError });
        }
        console.log(`✅ Cursos encontrados para carrera ${careerId}:`, cursos?.length || 0);
        res.json(cursos || []);
    }
    catch (error) {
        console.error('❌ Error en /courses/by-career:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = router;
