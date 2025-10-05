-- =====================================================
-- TRIGGER PARA HASH AUTOMÁTICO DE CONTRASEÑAS
-- =====================================================
-- Este script crea un trigger que automáticamente hashea
-- las contraseñas cuando se insertan o actualizan usuarios
-- directamente en la base de datos.

-- 1. Crear función para hashear contraseñas
CREATE OR REPLACE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo hashear si la contraseña no está ya hasheada
  -- (las contraseñas hasheadas empiezan con $2b$ o $2a$)
  IF NEW.password NOT LIKE '$2b$%' AND NEW.password NOT LIKE '$2a$%' THEN
    -- Hashear la contraseña usando pgcrypto
    NEW.password := crypt(NEW.password, gen_salt('bf', 10));
  END IF;
  
  -- Asegurar que el usuario esté activo por defecto
  IF NEW.activo IS NULL THEN
    NEW.activo := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger para INSERT
DROP TRIGGER IF EXISTS trigger_hash_password_insert ON usuarios;
CREATE TRIGGER trigger_hash_password_insert
  BEFORE INSERT ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION hash_password();

-- 3. Crear trigger para UPDATE
DROP TRIGGER IF EXISTS trigger_hash_password_update ON usuarios;
CREATE TRIGGER trigger_hash_password_update
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION hash_password();

-- 4. Función para verificar si una contraseña está hasheada
CREATE OR REPLACE FUNCTION is_password_hashed(password_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN password_text LIKE '$2b$%' OR password_text LIKE '$2a$%';
END;
$$ LANGUAGE plpgsql;

-- 5. Función para verificar contraseña (para login)
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, hashed_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Si la contraseña almacenada no está hasheada, comparar en texto plano
  IF NOT is_password_hashed(hashed_password) THEN
    RETURN input_password = hashed_password;
  END IF;
  
  -- Si está hasheada, usar crypt para verificar
  RETURN crypt(input_password, hashed_password) = hashed_password;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
-- 
-- 1. Ejecuta este script en tu base de datos Supabase:
--    - Ve a SQL Editor en Supabase Dashboard
--    - Pega este script completo
--    - Ejecuta el script
--
-- 2. Después de ejecutar el script:
--    - Puedes insertar usuarios directamente en la tabla 'usuarios'
--    - Las contraseñas se hashearán automáticamente
--    - Los usuarios se activarán automáticamente
--
-- 3. Ejemplo de inserción directa:
--    INSERT INTO usuarios (email, password, nombre, apellido, tipo_usuario)
--    VALUES ('nuevo@example.com', 'MiPassword123!', 'Juan', 'Pérez', 'estudiante');
--
-- 4. La contraseña 'MiPassword123!' se hasheará automáticamente
--    y el usuario podrá hacer login inmediatamente.
--
-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- 
-- Para verificar que funciona:
-- SELECT email, password, activo FROM usuarios WHERE email = 'nuevo@example.com';
--
-- Deberías ver:
-- - password: algo como '$2b$10$...' (hasheada)
-- - activo: true
--
-- =====================================================
