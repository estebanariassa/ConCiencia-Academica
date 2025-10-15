-- =====================================================
-- TRIGGER PARA AUTO-INSERTAR EN TABLA PROFESORES
-- =====================================================
-- Este trigger automáticamente inserta en la tabla profesores
-- cuando se registra un usuario con tipo_usuario = 'profesor'

-- 1. Función del trigger
CREATE OR REPLACE FUNCTION auto_insertar_profesor()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo insertar si el tipo_usuario es 'profesor' o 'docente'
  IF NEW.tipo_usuario IN ('profesor', 'docente') THEN
    -- Insertar en tabla profesores si no existe
    INSERT INTO profesores (usuario_id, activo)
    VALUES (NEW.id, true)
    ON CONFLICT (usuario_id) DO UPDATE SET
      activo = true,
      updated_at = NOW();
    
    -- También insertar en usuario_roles si existe la tabla
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuario_roles') THEN
      INSERT INTO usuario_roles (usuario_id, rol, activo, fecha_asignacion)
      VALUES (NEW.id, 'profesor', true, NOW())
      ON CONFLICT (usuario_id, rol) DO UPDATE SET
        activo = true,
        fecha_asignacion = NOW();
    END IF;
    
    RAISE NOTICE '✅ Usuario % insertado automáticamente en tabla profesores', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear el trigger
DROP TRIGGER IF EXISTS trigger_auto_profesor ON usuarios;
CREATE TRIGGER trigger_auto_profesor
  AFTER INSERT ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION auto_insertar_profesor();

-- 3. Función para actualizar (cuando se cambia tipo_usuario)
CREATE OR REPLACE FUNCTION auto_update_profesor()
RETURNS TRIGGER AS $$
BEGIN
  -- Si cambió de no-profesor a profesor
  IF OLD.tipo_usuario NOT IN ('profesor', 'docente') 
     AND NEW.tipo_usuario IN ('profesor', 'docente') THEN
    
    -- Insertar en profesores
    INSERT INTO profesores (usuario_id, activo)
    VALUES (NEW.id, true)
    ON CONFLICT (usuario_id) DO UPDATE SET
      activo = true,
      updated_at = NOW();
    
    -- Insertar rol en usuario_roles si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuario_roles') THEN
      INSERT INTO usuario_roles (usuario_id, rol, activo, fecha_asignacion)
      VALUES (NEW.id, 'profesor', true, NOW())
      ON CONFLICT (usuario_id, rol) DO UPDATE SET
        activo = true,
        fecha_asignacion = NOW();
    END IF;
    
    RAISE NOTICE '✅ Usuario % actualizado a profesor automáticamente', NEW.email;
    
  -- Si cambió de profesor a no-profesor
  ELSIF OLD.tipo_usuario IN ('profesor', 'docente') 
        AND NEW.tipo_usuario NOT IN ('profesor', 'docente') THEN
    
    -- Desactivar en profesores
    UPDATE profesores 
    SET activo = false, updated_at = NOW()
    WHERE usuario_id = NEW.id;
    
    -- Desactivar rol en usuario_roles si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuario_roles') THEN
      UPDATE usuario_roles 
      SET activo = false
      WHERE usuario_id = NEW.id AND rol = 'profesor';
    END IF;
    
    RAISE NOTICE '✅ Usuario % desactivado como profesor', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger de actualización
DROP TRIGGER IF EXISTS trigger_auto_update_profesor ON usuarios;
CREATE TRIGGER trigger_auto_update_profesor
  AFTER UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_profesor();

-- 5. Migrar usuarios existentes que sean profesores pero no estén en la tabla profesores
INSERT INTO profesores (usuario_id, activo)
SELECT u.id, true
FROM usuarios u
WHERE u.tipo_usuario IN ('profesor', 'docente')
  AND u.activo = true
  AND NOT EXISTS (
    SELECT 1 FROM profesores p WHERE p.usuario_id = u.id
  )
ON CONFLICT (usuario_id) DO UPDATE SET
  activo = true,
  updated_at = NOW();

-- 6. Verificación
SELECT 
  u.id,
  u.email,
  u.nombre,
  u.apellido,
  u.tipo_usuario,
  p.activo as profesor_activo,
  CASE 
    WHEN p.usuario_id IS NOT NULL THEN '✅ En tabla profesores'
    ELSE '❌ FALTA en tabla profesores'
  END as estado
FROM usuarios u
LEFT JOIN profesores p ON p.usuario_id = u.id
WHERE u.tipo_usuario IN ('profesor', 'docente')
ORDER BY u.nombre;

-- 7. Prueba del trigger (opcional - descomenta para probar)
/*
-- Insertar un usuario de prueba
INSERT INTO usuarios (email, password, nombre, apellido, tipo_usuario, activo)
VALUES ('test.profesor@udem.edu.co', 'Password123!', 'Test', 'Profesor', 'profesor', true);

-- Verificar que se insertó automáticamente en profesores
SELECT u.email, p.activo 
FROM usuarios u 
LEFT JOIN profesores p ON p.usuario_id = u.id 
WHERE u.email = 'test.profesor@udem.edu.co';

-- Limpiar prueba (opcional)
DELETE FROM profesores WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'test.profesor@udem.edu.co');
DELETE FROM usuarios WHERE email = 'test.profesor@udem.edu.co';
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 
-- 1. El trigger se ejecuta automáticamente al INSERT/UPDATE en usuarios
-- 2. Solo afecta usuarios con tipo_usuario = 'profesor' o 'docente'
-- 3. Si la tabla usuario_roles existe, también maneja los roles múltiples
-- 4. Migra automáticamente usuarios existentes que falten en profesores
-- 5. Maneja tanto activación como desactivación de profesores
-- 
-- =====================================================
