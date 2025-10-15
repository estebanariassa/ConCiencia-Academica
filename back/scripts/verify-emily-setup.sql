-- =====================================================
-- VERIFICAR CONFIGURACIÓN DE EMILY
-- =====================================================
-- Verifica que Emily esté correctamente configurada

-- 1. Verificar usuario Emily
SELECT 
  'Usuario Emily' as tipo,
  u.id,
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario,
  u.activo
FROM usuarios u
WHERE u.email = 'egomez109@soyudemedellin.edu.co';

-- 2. Verificar registro en estudiantes
SELECT 
  'Registro en estudiantes' as tipo,
  e.id,
  e.usuario_id,
  e.carrera_id,
  e.codigo_estudiante,
  e.activo
FROM estudiantes e
JOIN usuarios u ON u.id = e.usuario_id
WHERE u.email = 'egomez109@soyudemedellin.edu.co';

-- 3. Verificar roles si existe la tabla usuario_roles
SELECT 
  'Roles de Emily' as tipo,
  ur.rol,
  ur.activo,
  ur.fecha_asignacion
FROM usuario_roles ur
JOIN usuarios u ON u.id = ur.usuario_id
WHERE u.email = 'egomez109@soyudemedellin.edu.co';

-- 4. Verificar carrera asignada
SELECT 
  'Carrera de Emily' as tipo,
  c.id,
  c.nombre,
  c.codigo,
  c.activa
FROM carreras c
JOIN estudiantes e ON e.carrera_id = c.id
JOIN usuarios u ON u.id = e.usuario_id
WHERE u.email = 'egomez109@soyudemedellin.edu.co';

-- =====================================================
-- RESUMEN
-- =====================================================
-- 
-- ✅ Si todos los queries devuelven datos, Emily está bien configurada
-- ❌ Si algún query no devuelve datos, hay un problema de configuración
-- 
-- =====================================================
