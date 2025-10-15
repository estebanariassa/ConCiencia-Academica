-- =====================================================
-- AGREGAR EMILCY COMO COORDINADORA-PROFESORA
-- =====================================================
-- Script para crear a Emilcy como coordinadora de Ingeniería de Sistemas
-- que también es profesora
-- IMPORTANTE: Ejecuta primero add-multiple-roles-system.sql

BEGIN;

-- =====================================================
-- 1. CREAR EMILCY COMO COORDINADORA-PROFESORA
-- =====================================================

-- Crear a Emilcy como coordinadora de Ingeniería de Sistemas
SELECT crear_coordinador_profesor(
  'emilcy.coordinadora@udem.edu.co',
  'Password123!',
  'Emilcy',
  'Coordinadora',
  'PROF006',
  1, -- ID de Ingeniería de Sistemas
  'Ingeniería de Sistemas'
);

COMMIT;

-- =====================================================
-- 2. VERIFICACIÓN
-- =====================================================

-- Ver a Emilcy creada
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
  p.codigo as codigo_profesor
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id AND ur.activo = true
JOIN coordinadores c ON u.id = c.usuario_id AND c.activo = true
LEFT JOIN carreras car ON c.carrera_id = car.id
LEFT JOIN profesores p ON u.id = p.usuario_id
WHERE u.email = 'emilcy.coordinadora@udem.edu.co'
GROUP BY u.id, u.email, u.nombre, u.apellido, u.tipo_usuario, c.carrera_id, car.nombre, c.departamento, p.codigo;

-- Ver roles asignados a Emilcy
SELECT 
  u.nombre,
  u.apellido,
  u.email,
  ur.rol,
  ur.activo,
  ur.fecha_asignacion
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
WHERE u.email = 'emilcy.coordinadora@udem.edu.co'
ORDER BY ur.rol;

-- =====================================================
-- 3. CONSULTAS ADICIONALES
-- =====================================================

-- Ver todos los profesores de Ingeniería de Sistemas (incluyendo coordinadores)
SELECT 
  u.id,
  u.nombre,
  u.apellido,
  u.email,
  p.codigo as codigo_profesor,
  CASE 
    WHEN c.usuario_id IS NOT NULL THEN 'Coordinadora-Profesora'
    ELSE 'Profesor'
  END as tipo_profesor,
  c.departamento
FROM usuarios u
JOIN profesores p ON u.id = p.usuario_id
LEFT JOIN coordinadores c ON u.id = c.usuario_id AND c.activo = true
WHERE u.activo = true 
  AND p.activo = true
  AND (c.carrera_id = 1 OR c.carrera_id IS NULL) -- Ingeniería de Sistemas o sin carrera específica
ORDER BY u.nombre;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 
-- 1. Emilcy ahora puede iniciar sesión como docente
-- 2. Aparecerá en la lista de profesores de Ingeniería de Sistemas
-- 3. Tendrá acceso tanto al dashboard de coordinadora como al de profesora
-- 4. Puede evaluar otros profesores (como coordinadora) y ser evaluada (como profesora)
-- 5. El sistema detectará automáticamente sus roles múltiples
-- 
-- =====================================================

