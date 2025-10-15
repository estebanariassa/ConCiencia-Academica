-- =====================================================
-- AGREGAR EMILY ANDREA GÓMEZ HERNÁNDEZ COMO ESTUDIANTE
-- =====================================================
-- Estudiante de Ingeniería Civil
-- Email: egomez109@soyudemedellin.edu.co

-- 1. Verificar/crear carrera de Ingeniería Civil
INSERT INTO carreras (id, nombre, codigo, activa)
VALUES (3, 'Ingeniería Civil', 'CIV', true)
ON CONFLICT (id) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  codigo = EXCLUDED.codigo,
  activa = true;

-- 2. Crear usuario Emily
INSERT INTO usuarios (email, password, nombre, apellido, tipo_usuario, activo)
VALUES (
  'egomez109@soyudemedellin.edu.co',
  'Password123!',
  'Emily Andrea',
  'Gómez Hernández',
  'estudiante',
  true
)
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  tipo_usuario = 'estudiante',
  activo = true;

-- 3. Obtener ID del usuario y crear registro en estudiantes
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Obtener ID del usuario
  SELECT id INTO user_id 
  FROM usuarios 
  WHERE email = 'egomez109@soyudemedellin.edu.co';
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Error: No se pudo encontrar el usuario Emily';
  END IF;
  
  -- Insertar en estudiantes (SIN carrera_id - los estudiantes no tienen carrera directa)
  INSERT INTO estudiantes (usuario_id, activo)
  VALUES (user_id, true)
  ON CONFLICT (usuario_id) DO UPDATE SET
    activo = true,
    updated_at = NOW();
  
  -- Asignar rol de estudiante en usuario_roles si existe la tabla
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuario_roles') THEN
    INSERT INTO usuario_roles (usuario_id, rol, activo, fecha_asignacion)
    VALUES (user_id, 'estudiante', true, NOW())
    ON CONFLICT (usuario_id, rol) DO UPDATE SET
      activo = true,
      fecha_asignacion = NOW();
  END IF;
  
  RAISE NOTICE '✅ Emily Andrea Gómez Hernández creada exitosamente como estudiante';
  RAISE NOTICE '   📧 Email: egomez109@soyudemedellin.edu.co';
  RAISE NOTICE '   🔑 Contraseña: Password123!';
  RAISE NOTICE '   🎓 Tipo: Estudiante (carrera se asigna por cursos)';
END $$;

-- 4. Verificación
SELECT 
  u.id,
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario,
  u.activo as usuario_activo,
  e.activo as estudiante_activo,
  CASE 
    WHEN e.usuario_id IS NOT NULL THEN '✅ Registrada como estudiante'
    ELSE '❌ FALTA registro de estudiante'
  END as estado
FROM usuarios u
LEFT JOIN estudiantes e ON e.usuario_id = u.id
WHERE u.email = 'egomez109@soyudemedellin.edu.co';

-- 5. Verificar roles si existe la tabla usuario_roles
SELECT 
  u.email,
  u.nombre,
  u.apellido,
  ur.rol,
  ur.activo,
  ur.fecha_asignacion
FROM usuarios u
LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
WHERE u.email = 'egomez109@soyudemedellin.edu.co'
ORDER BY ur.rol;

-- =====================================================
-- INFORMACIÓN DE ACCESO PARA EMILY
-- =====================================================
-- 
-- 📧 Email: egomez109@soyudemedellin.edu.co
-- 🔑 Contraseña: Password123!
-- 🎓 Tipo: Estudiante
-- 📚 Carrera: Se asigna por cursos (Ingeniería Civil = ID 3)
-- ✅ Estado: Activa
-- 
-- NOTA: La carrera se asigna cuando Emily se inscriba en cursos
-- de Ingeniería Civil (carrera_id = 3) o del tronco común (carrera_id = 8)
-- 
-- =====================================================
