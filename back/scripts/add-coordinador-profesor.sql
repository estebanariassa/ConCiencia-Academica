-- =====================================================
-- SCRIPT PARA AGREGAR COORDINADORES-PROFESORES
-- =====================================================
-- Este script crea coordinadores que también son profesores
-- IMPORTANTE: Ejecuta primero add-multiple-roles-system.sql

BEGIN;

-- =====================================================
-- 1. CREAR COORDINADORES-PROFESORES
-- =====================================================

-- Coordinador de Ingeniería de Sistemas
SELECT crear_coordinador_profesor(
  'coord.sistemas@udem.edu.co',
  'Password123!',
  'Carlos',
  'Mendoza',
  'PROF001',
  1, -- ID de Ingeniería de Sistemas
  'Ingeniería de Sistemas'
);

-- Coordinador de Ingeniería Industrial
SELECT crear_coordinador_profesor(
  'coord.industrial@udem.edu.co',
  'Password123!',
  'Ana',
  'Rodríguez',
  'PROF002',
  2, -- ID de Ingeniería Industrial
  'Ingeniería Industrial'
);

-- Coordinador de Ingeniería Civil
SELECT crear_coordinador_profesor(
  'coord.civil@udem.edu.co',
  'Password123!',
  'Luis',
  'Fernández',
  'PROF003',
  3, -- ID de Ingeniería Civil
  'Ingeniería Civil'
);

-- Coordinador de Ingeniería Electrónica
SELECT crear_coordinador_profesor(
  'coord.electronica@udem.edu.co',
  'Password123!',
  'María',
  'González',
  'PROF004',
  4, -- ID de Ingeniería Electrónica
  'Ingeniería Electrónica'
);

-- Coordinador de Ingeniería Mecánica
SELECT crear_coordinador_profesor(
  'coord.mecanica@udem.edu.co',
  'Password123!',
  'Roberto',
  'Silva',
  'PROF005',
  5, -- ID de Ingeniería Mecánica
  'Ingeniería Mecánica'
);

COMMIT;

-- =====================================================
-- 2. VERIFICACIÓN
-- =====================================================

-- Ver coordinadores creados
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
WHERE u.email LIKE 'coord.%@udem.edu.co'
GROUP BY u.id, u.email, u.nombre, u.apellido, u.tipo_usuario, c.carrera_id, car.nombre, c.departamento, p.codigo
ORDER BY u.nombre;

-- Ver roles asignados
SELECT 
  u.nombre,
  u.apellido,
  u.email,
  ur.rol,
  ur.activo,
  ur.fecha_asignacion
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
WHERE u.email LIKE 'coord.%@udem.edu.co'
ORDER BY u.nombre, ur.rol;

-- =====================================================
-- 3. EJEMPLO DE USO MANUAL
-- =====================================================

-- Para crear un coordinador-profesor manualmente:
-- 
-- 1. Crear usuario:
-- INSERT INTO usuarios (email, password, nombre, apellido, tipo_usuario, activo)
-- VALUES ('nuevo.coord@udem.edu.co', 'Password123!', 'Nombre', 'Apellido', 'profesor', true);
--
-- 2. Asignar roles:
-- SELECT asignar_rol_usuario((SELECT id FROM usuarios WHERE email = 'nuevo.coord@udem.edu.co'), 'profesor');
-- SELECT asignar_rol_usuario((SELECT id FROM usuarios WHERE email = 'nuevo.coord@udem.edu.co'), 'coordinador');
--
-- 3. Crear registro en coordinadores:
-- INSERT INTO coordinadores (usuario_id, carrera_id, departamento, activo)
-- VALUES (
--   (SELECT id FROM usuarios WHERE email = 'nuevo.coord@udem.edu.co'),
--   1, -- ID de la carrera
--   'Nombre del Departamento',
--   true
-- );

-- =====================================================
-- 4. CONSULTAS ÚTILES
-- =====================================================

-- Ver todos los coordinadores con información completa:
-- SELECT * FROM vista_coordinadores_completa;

-- Ver usuarios con múltiples roles:
-- SELECT * FROM vista_usuarios_roles WHERE total_roles > 1;

-- Verificar si un usuario específico tiene rol de coordinador:
-- SELECT usuario_tiene_rol(1, 'coordinador');

-- Obtener todos los roles de un usuario:
-- SELECT * FROM obtener_roles_usuario(1);

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 
-- 1. Los coordinadores pueden hacer login y acceder a ambos dashboards
-- 2. El sistema detectará automáticamente sus roles múltiples
-- 3. Tendrán permisos tanto de profesor como de coordinador
-- 4. Pueden evaluar profesores (como coordinador) y ser evaluados (como profesor)
-- 5. El dashboard principal será el de coordinador (mayor prioridad)
-- 
-- =====================================================



