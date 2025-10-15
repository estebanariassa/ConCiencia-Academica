-- =====================================================
-- SCRIPT PARA ARREGLAR ROLES DE USUARIOS
-- =====================================================
-- Este script permite arreglar los roles de usuarios existentes
-- y crear a Emilcy si es necesario

-- 1. Verificar usuarios existentes con email similar a Emilcy
SELECT 
  u.id,
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario,
  u.activo,
  ARRAY_AGG(ur.rol ORDER BY ur.rol) as roles_activos
FROM usuarios u
LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id AND ur.activo = true
WHERE u.email LIKE '%emilcy%' OR u.email LIKE '%ejhernandez%'
GROUP BY u.id, u.email, u.nombre, u.apellido, u.tipo_usuario, u.activo;

-- 2. Opción A: Agregar rol de profesor al usuario actual (ejhernandez)
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Buscar usuario con email ejhernandez
  SELECT id INTO user_id FROM usuarios WHERE email = 'ejhernandez@udemedellin.edu.co';
  
  IF user_id IS NOT NULL THEN
    -- Asignar rol de profesor
    INSERT INTO usuario_roles (usuario_id, rol, activo, fecha_asignacion)
    VALUES (user_id, 'profesor', true, NOW())
    ON CONFLICT (usuario_id, rol) DO UPDATE SET activo = true;
    
    -- Crear registro en profesores si no existe
    INSERT INTO profesores (usuario_id, codigo, activo)
    VALUES (user_id, 'PROF007', true)
    ON CONFLICT (usuario_id) DO UPDATE SET activo = true;
    
    RAISE NOTICE '✅ Rol de profesor agregado al usuario ejhernandez con ID: %', user_id;
  ELSE
    RAISE NOTICE '❌ Usuario ejhernandez no encontrado';
  END IF;
END $$;

-- 3. Opción B: Crear a Emilcy con email específico
INSERT INTO usuarios (email, password, nombre, apellido, tipo_usuario, activo)
VALUES ('emilcy.coordinadora@udem.edu.co', 'Password123!', 'Emilcy', 'Coordinadora', 'profesor', true)
ON CONFLICT (email) DO NOTHING;

-- 4. Configurar roles para Emilcy
DO $$
DECLARE
  emilcy_id UUID;
BEGIN
  -- Obtener ID de Emilcy
  SELECT id INTO emilcy_id FROM usuarios WHERE email = 'emilcy.coordinadora@udem.edu.co';
  
  IF emilcy_id IS NOT NULL THEN
    -- Asignar rol de profesor
    INSERT INTO usuario_roles (usuario_id, rol, activo, fecha_asignacion)
    VALUES (emilcy_id, 'profesor', true, NOW())
    ON CONFLICT (usuario_id, rol) DO UPDATE SET activo = true;
    
    -- Asignar rol de coordinador
    INSERT INTO usuario_roles (usuario_id, rol, activo, fecha_asignacion)
    VALUES (emilcy_id, 'coordinador', true, NOW())
    ON CONFLICT (usuario_id, rol) DO UPDATE SET activo = true;
    
    -- Crear registro en profesores
    INSERT INTO profesores (usuario_id, codigo, activo)
    VALUES (emilcy_id, 'PROF006', true)
    ON CONFLICT (usuario_id) DO UPDATE SET activo = true;
    
    -- Crear registro en coordinadores
    INSERT INTO coordinadores (usuario_id, carrera_id, departamento, activo)
    VALUES (emilcy_id, 1, 'Ingeniería de Sistemas', true)
    ON CONFLICT (usuario_id) DO UPDATE SET activo = true;
    
    RAISE NOTICE '✅ Emilcy configurada exitosamente con ID: %', emilcy_id;
  ELSE
    RAISE NOTICE '❌ Error: No se pudo configurar a Emilcy';
  END IF;
END $$;

-- 5. Verificar resultados
SELECT 
  u.id,
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario,
  u.activo,
  ARRAY_AGG(ur.rol ORDER BY ur.rol) as roles_activos,
  p.codigo as codigo_profesor,
  c.departamento
FROM usuarios u
LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id AND ur.activo = true
LEFT JOIN profesores p ON u.id = p.usuario_id AND p.activo = true
LEFT JOIN coordinadores c ON u.id = c.usuario_id AND c.activo = true
WHERE u.email IN ('ejhernandez@udemedellin.edu.co', 'emilcy.coordinadora@udem.edu.co')
GROUP BY u.id, u.email, u.nombre, u.apellido, u.tipo_usuario, u.activo, p.codigo, c.departamento
ORDER BY u.email;

-- 6. Ver todos los profesores de Ingeniería de Sistemas
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

