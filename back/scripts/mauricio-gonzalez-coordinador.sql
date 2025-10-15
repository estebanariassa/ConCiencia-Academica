-- =====================================================
-- CONVERTIR MAURICIO GONZÁLEZ A COORDINADOR-PROFESOR
-- =====================================================
-- Script específico para convertir a Mauricio González
-- IMPORTANTE: Ejecuta primero add-multiple-roles-system.sql

BEGIN;

-- =====================================================
-- 1. BUSCAR Y CONVERTIR MAURICIO GONZÁLEZ
-- =====================================================

DO $$
DECLARE
  usuario_id INTEGER;
  carrera_id INTEGER := 1; -- Ingeniería de Sistemas (ajusta si es otra carrera)
  departamento_nombre VARCHAR(100) := 'Ingeniería de Sistemas';
BEGIN
  -- Buscar a Mauricio González
  SELECT u.id INTO usuario_id
  FROM usuarios u
  WHERE (
    (LOWER(u.nombre) LIKE '%mauricio%' AND LOWER(u.apellido) LIKE '%gonzalez%') OR
    (LOWER(u.nombre) LIKE '%gonzalez%' AND LOWER(u.apellido) LIKE '%mauricio%') OR
    (LOWER(u.nombre) LIKE '%mauricio%' AND LOWER(u.apellido) LIKE '%gonzález%') OR
    (LOWER(u.nombre) LIKE '%gonzález%' AND LOWER(u.apellido) LIKE '%mauricio%')
  )
  AND u.activo = true
  AND (u.tipo_usuario = 'profesor' OR u.tipo_usuario = 'docente')
  LIMIT 1;
  
  IF usuario_id IS NULL THEN
    RAISE NOTICE '❌ Mauricio González no encontrado como profesor activo';
    RAISE NOTICE 'Verifica que:';
    RAISE NOTICE '1. El nombre esté escrito correctamente';
    RAISE NOTICE '2. Esté registrado como profesor/docente';
    RAISE NOTICE '3. El usuario esté activo';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuario encontrado con ID: %', usuario_id;
  
  -- Asignar rol de coordinador
  PERFORM asignar_rol_usuario(usuario_id, 'coordinador');
  RAISE NOTICE '✅ Rol de coordinador asignado';
  
  -- Crear registro en coordinadores
  INSERT INTO coordinadores (usuario_id, carrera_id, departamento, fecha_nombramiento, activo)
  VALUES (usuario_id, carrera_id, departamento_nombre, CURRENT_DATE, true)
  ON CONFLICT (usuario_id) 
  DO UPDATE SET 
    carrera_id = EXCLUDED.carrera_id,
    departamento = EXCLUDED.departamento,
    activo = true,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Registro de coordinador creado/actualizado';
  RAISE NOTICE '🎉 Mauricio González ahora es coordinador-profesor';
  
END $$;

COMMIT;

-- =====================================================
-- 2. VERIFICACIÓN COMPLETA
-- =====================================================

-- Ver información completa del usuario convertido
SELECT 
  u.id,
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario as tipo_principal,
  u.activo as usuario_activo,
  ARRAY_AGG(ur.rol ORDER BY ur.rol) as roles_activos,
  COUNT(ur.rol) as total_roles,
  c.carrera_id,
  car.nombre as carrera_nombre,
  c.departamento as departamento_coordinador,
  c.fecha_nombramiento,
  c.activo as coordinador_activo,
  p.codigo as codigo_profesor,
  p.departamento as departamento_profesor,
  p.activo as profesor_activo
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id AND ur.activo = true
LEFT JOIN coordinadores c ON u.id = c.usuario_id AND c.activo = true
LEFT JOIN carreras car ON c.carrera_id = car.id
LEFT JOIN profesores p ON u.id = p.usuario_id
WHERE (
  (LOWER(u.nombre) LIKE '%mauricio%' AND LOWER(u.apellido) LIKE '%gonzalez%') OR
  (LOWER(u.nombre) LIKE '%gonzalez%' AND LOWER(u.apellido) LIKE '%mauricio%') OR
  (LOWER(u.nombre) LIKE '%mauricio%' AND LOWER(u.apellido) LIKE '%gonzález%') OR
  (LOWER(u.nombre) LIKE '%gonzález%' AND LOWER(u.apellido) LIKE '%mauricio%')
)
GROUP BY u.id, u.email, u.nombre, u.apellido, u.tipo_usuario, u.activo, c.carrera_id, car.nombre, c.departamento, c.fecha_nombramiento, c.activo, p.codigo, p.departamento, p.activo;

-- Ver roles específicos
SELECT 
  u.nombre,
  u.apellido,
  u.email,
  ur.rol,
  ur.activo,
  ur.fecha_asignacion
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
WHERE (
  (LOWER(u.nombre) LIKE '%mauricio%' AND LOWER(u.apellido) LIKE '%gonzalez%') OR
  (LOWER(u.nombre) LIKE '%gonzalez%' AND LOWER(u.apellido) LIKE '%mauricio%') OR
  (LOWER(u.nombre) LIKE '%mauricio%' AND LOWER(u.apellido) LIKE '%gonzález%') OR
  (LOWER(u.nombre) LIKE '%gonzález%' AND LOWER(u.apellido) LIKE '%mauricio%')
)
ORDER BY ur.rol;

-- =====================================================
-- 3. INFORMACIÓN DE ACCESO
-- =====================================================

-- Mostrar información de login y dashboards
SELECT 
  u.nombre,
  u.apellido,
  u.email,
  'Password actual del usuario' as password_info,
  CASE 
    WHEN 'admin' = ANY(ARRAY_AGG(ur.rol)) THEN '/dashboard-admin'
    WHEN 'coordinador' = ANY(ARRAY_AGG(ur.rol)) THEN '/dashboard-coordinador'
    WHEN 'profesor' = ANY(ARRAY_AGG(ur.rol)) OR 'docente' = ANY(ARRAY_AGG(ur.rol)) THEN '/dashboard-profesor'
    WHEN 'estudiante' = ANY(ARRAY_AGG(ur.rol)) THEN '/dashboard-estudiante'
    ELSE '/dashboard'
  END as dashboard_principal,
  ARRAY_AGG(ur.rol ORDER BY ur.rol) as roles_disponibles
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id AND ur.activo = true
WHERE (
  (LOWER(u.nombre) LIKE '%mauricio%' AND LOWER(u.apellido) LIKE '%gonzalez%') OR
  (LOWER(u.nombre) LIKE '%gonzalez%' AND LOWER(u.apellido) LIKE '%mauricio%') OR
  (LOWER(u.nombre) LIKE '%mauricio%' AND LOWER(u.apellido) LIKE '%gonzález%') OR
  (LOWER(u.nombre) LIKE '%gonzález%' AND LOWER(u.apellido) LIKE '%mauricio%')
)
GROUP BY u.id, u.nombre, u.apellido, u.email;

-- =====================================================
-- 4. INSTRUCCIONES POST-CONVERSIÓN
-- =====================================================
-- 
-- ✅ CONVERSIÓN COMPLETADA
-- 
-- Mauricio González ahora tiene:
-- • Rol de Profesor (mantenido)
-- • Rol de Coordinador (agregado)
-- • Acceso al Dashboard de Coordinador (principal)
-- • Acceso al Dashboard de Profesor (secundario)
-- • Permisos de ambos roles
-- 
-- Para acceder al sistema:
-- 1. Usar su email y contraseña actual
-- 2. Será redirigido al Dashboard de Coordinador
-- 3. Puede acceder al Dashboard de Profesor desde el menú
-- 
-- Permisos disponibles:
-- • Como Profesor: Ver evaluaciones, crear evaluaciones, ver reportes
-- • Como Coordinador: Todo lo anterior + gestionar usuarios, gestionar departamento
-- 
-- =====================================================




