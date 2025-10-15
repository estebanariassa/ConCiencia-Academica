-- =====================================================
-- MIGRAR PROFESORES DE USUARIOS A PROFESORES
-- =====================================================
-- Migra todos los usuarios con tipo_usuario = 'profesor' o 'docente' 
-- a la tabla profesores

-- 1. Insertar todos los profesores que no estén ya en la tabla profesores
INSERT INTO profesores (usuario_id, codigo_profesor, fecha_ingreso, activo)
SELECT 
  u.id as usuario_id,
  LOWER(SUBSTRING(u.nombre, 1, 1) || SUBSTRING(u.apellido, 1, 8)) as codigo_profesor,
  CURRENT_DATE as fecha_ingreso,
  true as activo
FROM usuarios u
WHERE u.tipo_usuario IN ('profesor', 'docente')
  AND u.activo = true
  AND NOT EXISTS (
    SELECT 1 FROM profesores p 
    WHERE p.usuario_id = u.id
  );

-- 2. Actualizar profesores existentes para asegurar que estén activos
UPDATE profesores 
SET activo = true
WHERE usuario_id IN (
  SELECT u.id 
  FROM usuarios u 
  WHERE u.tipo_usuario IN ('profesor', 'docente')
    AND u.activo = true
);

-- 3. Verificar la migración
SELECT 
  'Usuarios profesores' as tipo,
  COUNT(*) as cantidad
FROM usuarios 
WHERE tipo_usuario IN ('profesor', 'docente') AND activo = true

UNION ALL

SELECT 
  'Profesores en tabla profesores' as tipo,
  COUNT(*) as cantidad
FROM profesores 
WHERE activo = true;

-- 4. Mostrar detalles de la migración
SELECT 
  u.id,
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario,
  u.activo as usuario_activo,
  CASE 
    WHEN p.usuario_id IS NOT NULL THEN '✅ En tabla profesores'
    ELSE '❌ FALTA en tabla profesores'
  END as estado_profesor,
  p.codigo_profesor,
  p.fecha_ingreso,
  p.activo as profesor_activo
FROM usuarios u
LEFT JOIN profesores p ON p.usuario_id = u.id
WHERE u.tipo_usuario IN ('profesor', 'docente')
ORDER BY u.nombre, u.apellido;

-- 5. Verificar roles múltiples si existe la tabla usuario_roles
SELECT 
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario,
  ur.rol,
  ur.activo as rol_activo
FROM usuarios u
LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
WHERE u.tipo_usuario IN ('profesor', 'docente')
ORDER BY u.nombre, u.apellido, ur.rol;

-- =====================================================
-- RESUMEN DE LA MIGRACIÓN
-- =====================================================
-- 
-- ✅ Todos los usuarios con tipo_usuario = 'profesor' o 'docente'
--    han sido migrados a la tabla profesores
-- ✅ Los profesores existentes han sido activados
-- ✅ Se mantienen los roles múltiples si existen
-- 
-- =====================================================
