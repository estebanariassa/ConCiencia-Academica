-- =====================================================
-- CONVERTIR PROFESOR EXISTENTE A COORDINADOR-PROFESOR
-- =====================================================
-- Este script convierte a Mauricio González de profesor a coordinador-profesor
-- IMPORTANTE: Ejecuta primero add-multiple-roles-system.sql

BEGIN;

-- =====================================================
-- 1. VERIFICAR USUARIO EXISTENTE
-- =====================================================

-- Buscar a Mauricio González en la base de datos
SELECT 
  u.id,
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario,
  u.activo,
  p.codigo as codigo_profesor,
  p.departamento,
  p.activo as profesor_activo
FROM usuarios u
LEFT JOIN profesores p ON u.id = p.usuario_id
WHERE LOWER(u.nombre) LIKE '%mauricio%' 
  AND LOWER(u.apellido) LIKE '%gonzalez%'
  OR LOWER(u.nombre) LIKE '%gonzalez%' 
  AND LOWER(u.apellido) LIKE '%mauricio%';

-- =====================================================
-- 2. CONVERTIR A COORDINADOR-PROFESOR
-- =====================================================

-- Asumir que encontramos el usuario con ID específico
-- Reemplaza el ID con el ID real de Mauricio González
-- (obtén el ID del SELECT anterior)

-- Ejemplo con ID = 1 (reemplaza con el ID real)
DO $$
DECLARE
  usuario_id INTEGER;
  carrera_id INTEGER := 1; -- ID de Ingeniería de Sistemas (ajusta según corresponda)
  departamento_nombre VARCHAR(100) := 'Ingeniería de Sistemas'; -- Ajusta según corresponda
BEGIN
  -- Buscar el ID de Mauricio González
  SELECT u.id INTO usuario_id
  FROM usuarios u
  WHERE LOWER(u.nombre) LIKE '%mauricio%' 
    AND LOWER(u.apellido) LIKE '%gonzalez%';
  
  IF usuario_id IS NULL THEN
    RAISE NOTICE 'Usuario Mauricio González no encontrado';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Convirtiendo usuario ID % a coordinador-profesor', usuario_id;
  
  -- 1. Asignar rol de coordinador (ya tiene rol de profesor)
  PERFORM asignar_rol_usuario(usuario_id, 'coordinador');
  
  -- 2. Crear registro en coordinadores
  INSERT INTO coordinadores (usuario_id, carrera_id, departamento, fecha_nombramiento, activo)
  VALUES (usuario_id, carrera_id, departamento_nombre, CURRENT_DATE, true)
  ON CONFLICT (usuario_id) 
  DO UPDATE SET 
    carrera_id = EXCLUDED.carrera_id,
    departamento = EXCLUDED.departamento,
    activo = true,
    updated_at = NOW();
  
  RAISE NOTICE 'Usuario convertido exitosamente a coordinador-profesor';
END $$;

-- =====================================================
-- 3. VERIFICACIÓN POST-CONVERSIÓN
-- =====================================================

-- Verificar que la conversión fue exitosa
SELECT 
  u.id,
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario as tipo_principal,
  ARRAY_AGG(ur.rol ORDER BY ur.rol) as roles_activos,
  c.carrera_id,
  car.nombre as carrera_nombre,
  c.departamento,
  c.fecha_nombramiento,
  p.codigo as codigo_profesor,
  p.departamento as departamento_profesor
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id AND ur.activo = true
LEFT JOIN coordinadores c ON u.id = c.usuario_id AND c.activo = true
LEFT JOIN carreras car ON c.carrera_id = car.id
LEFT JOIN profesores p ON u.id = p.usuario_id
WHERE LOWER(u.nombre) LIKE '%mauricio%' 
  AND LOWER(u.apellido) LIKE '%gonzalez%'
GROUP BY u.id, u.email, u.nombre, u.apellido, u.tipo_usuario, c.carrera_id, car.nombre, c.departamento, c.fecha_nombramiento, p.codigo, p.departamento;

-- Ver roles específicos
SELECT 
  u.nombre,
  u.apellido,
  ur.rol,
  ur.activo,
  ur.fecha_asignacion
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
WHERE LOWER(u.nombre) LIKE '%mauricio%' 
  AND LOWER(u.apellido) LIKE '%gonzalez%'
ORDER BY ur.rol;

COMMIT;

-- =====================================================
-- 4. SCRIPT ALTERNATIVO (SI CONOCES EL EMAIL EXACTO)
-- =====================================================

-- Si conoces el email exacto de Mauricio González, usa este script:
/*
DO $$
DECLARE
  usuario_id INTEGER;
  carrera_id INTEGER := 1; -- Ajusta según la carrera
  departamento_nombre VARCHAR(100) := 'Ingeniería de Sistemas'; -- Ajusta
BEGIN
  -- Buscar por email exacto
  SELECT u.id INTO usuario_id
  FROM usuarios u
  WHERE u.email = 'mauricio.gonzalez@udem.edu.co'; -- Reemplaza con el email real
  
  IF usuario_id IS NULL THEN
    RAISE NOTICE 'Usuario con email no encontrado';
    RETURN;
  END IF;
  
  -- Asignar rol de coordinador
  PERFORM asignar_rol_usuario(usuario_id, 'coordinador');
  
  -- Crear registro en coordinadores
  INSERT INTO coordinadores (usuario_id, carrera_id, departamento, fecha_nombramiento, activo)
  VALUES (usuario_id, carrera_id, departamento_nombre, CURRENT_DATE, true)
  ON CONFLICT (usuario_id) 
  DO UPDATE SET 
    carrera_id = EXCLUDED.carrera_id,
    departamento = EXCLUDED.departamento,
    activo = true,
    updated_at = NOW();
  
  RAISE NOTICE 'Usuario % convertido a coordinador-profesor', usuario_id;
END $$;
*/

-- =====================================================
-- 5. INSTRUCCIONES DE USO
-- =====================================================
-- 
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Revisa los resultados del SELECT de verificación
-- 3. Si no encuentra a Mauricio González, verifica:
--    - El nombre exacto en la base de datos
--    - Si está registrado como 'profesor' o 'docente'
--    - Si el usuario está activo
-- 4. Ajusta los valores de carrera_id y departamento según corresponda
-- 5. Si conoces el email exacto, usa el script alternativo
-- 
-- =====================================================




