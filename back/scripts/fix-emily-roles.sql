-- =====================================================
-- ARREGLAR ROLES DE EMILY
-- =====================================================
-- Asigna el rol de estudiante a Emily en la tabla usuario_roles

-- 1. Verificar si Emily tiene roles asignados
SELECT 
  'Roles actuales de Emily' as tipo,
  ur.rol,
  ur.activo,
  ur.fecha_asignacion
FROM usuario_roles ur
JOIN usuarios u ON u.id = ur.usuario_id
WHERE u.email = 'egomez109@soyudemedellin.edu.co';

-- 2. Asignar rol de estudiante a Emily si no lo tiene
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Obtener ID de Emily
  SELECT id INTO user_id 
  FROM usuarios 
  WHERE email = 'egomez109@soyudemedellin.edu.co';
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario Emily no encontrado';
  END IF;
  
  -- Insertar rol de estudiante si no existe
  IF NOT EXISTS (
    SELECT 1 FROM usuario_roles 
    WHERE usuario_id = user_id AND rol = 'estudiante'
  ) THEN
    INSERT INTO usuario_roles (usuario_id, rol, activo, fecha_asignacion)
    VALUES (user_id, 'estudiante', true, NOW());
    
    RAISE NOTICE '✅ Rol de estudiante asignado a Emily';
  ELSE
    RAISE NOTICE 'ℹ️ Emily ya tiene el rol de estudiante';
  END IF;
END $$;

-- 3. Verificar que el rol se asignó correctamente
SELECT 
  'Roles después de la corrección' as tipo,
  ur.rol,
  ur.activo,
  ur.fecha_asignacion
FROM usuario_roles ur
JOIN usuarios u ON u.id = ur.usuario_id
WHERE u.email = 'egomez109@soyudemedellin.edu.co';

-- 4. Verificar el dashboard que debería tener Emily
SELECT 
  'Dashboard de Emily' as tipo,
  CASE 
    WHEN ur.rol = 'estudiante' THEN '/dashboard-estudiante'
    WHEN ur.rol = 'profesor' THEN '/dashboard-profesor'
    WHEN ur.rol = 'coordinador' THEN '/dashboard-coordinador'
    WHEN ur.rol = 'admin' THEN '/dashboard-admin'
    ELSE '/dashboard'
  END as dashboard_path
FROM usuario_roles ur
JOIN usuarios u ON u.id = ur.usuario_id
WHERE u.email = 'egomez109@soyudemedellin.edu.co'
  AND ur.activo = true;

-- =====================================================
-- INFORMACIÓN
-- =====================================================
-- 
-- ✅ Emily ahora debería tener el rol 'estudiante'
-- ✅ Su dashboard debería ser '/dashboard-estudiante'
-- ✅ Al hacer login, debería ir al dashboard correcto
-- 
-- =====================================================
