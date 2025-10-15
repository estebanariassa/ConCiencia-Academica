-- =====================================================
-- SCRIPT RÁPIDO PARA CREAR A EMILCY
-- =====================================================
-- Este script crea a Emilcy como coordinadora-profesora
-- Ejecutar directamente en Supabase SQL Editor

-- 1. Verificar si Emilcy ya existe
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
WHERE u.email = 'emilcy.coordinadora@udem.edu.co'
GROUP BY u.id, u.email, u.nombre, u.apellido, u.tipo_usuario, u.activo;

-- 2. Si no existe, crear a Emilcy
INSERT INTO usuarios (email, password, nombre, apellido, tipo_usuario, activo)
VALUES ('emilcy.coordinadora@udem.edu.co', 'Password123!', 'Emilcy', 'Coordinadora', 'profesor', true)
ON CONFLICT (email) DO NOTHING;

-- 3. Obtener el ID de Emilcy
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
    
    RAISE NOTICE '✅ Emilcy creada/actualizada exitosamente con ID: %', emilcy_id;
  ELSE
    RAISE NOTICE '❌ Error: No se pudo crear a Emilcy';
  END IF;
END $$;

-- 4. Verificar que Emilcy fue creada correctamente
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
WHERE u.email = 'emilcy.coordinadora@udem.edu.co'
GROUP BY u.id, u.email, u.nombre, u.apellido, u.tipo_usuario, u.activo, p.codigo, c.departamento;

-- 5. Ver todos los profesores de Ingeniería de Sistemas
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

