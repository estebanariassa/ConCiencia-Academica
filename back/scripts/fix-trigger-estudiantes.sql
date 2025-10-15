-- =====================================================
-- CORREGIR TRIGGER PARA ESTUDIANTES
-- =====================================================
-- Arregla el trigger que falla al insertar estudiantes

-- Función corregida para manejar carrera_id en estudiantes
CREATE OR REPLACE FUNCTION insert_user_type_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar en tabla específica según tipo_usuario
  CASE NEW.tipo_usuario
    WHEN 'estudiante' THEN
      -- Insertar en estudiantes con carrera_id por defecto (tronco común)
      IF NOT EXISTS (SELECT 1 FROM estudiantes WHERE usuario_id = NEW.id) THEN
        INSERT INTO estudiantes (usuario_id, carrera_id, codigo_estudiante, activo)
        VALUES (NEW.id, 8, 'EST' || SUBSTRING(NEW.id::TEXT, 1, 8), true);
      ELSE
        UPDATE estudiantes 
        SET activo = true, carrera_id = 8
        WHERE usuario_id = NEW.id;
      END IF;
        
    WHEN 'profesor', 'docente' THEN
      -- Insertar en profesores
      IF NOT EXISTS (SELECT 1 FROM profesores WHERE usuario_id = NEW.id) THEN
        INSERT INTO profesores (usuario_id, activo)
        VALUES (NEW.id, true);
      ELSE
        UPDATE profesores 
        SET activo = true
        WHERE usuario_id = NEW.id;
      END IF;
        
    WHEN 'coordinador' THEN
      -- Insertar en coordinadores
      IF NOT EXISTS (SELECT 1 FROM coordinadores WHERE usuario_id = NEW.id) THEN
        INSERT INTO coordinadores (usuario_id, activo)
        VALUES (NEW.id, true);
      ELSE
        UPDATE coordinadores 
        SET activo = true
        WHERE usuario_id = NEW.id;
      END IF;
        
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar que el trigger esté funcionando
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'usuarios'
ORDER BY trigger_name;

-- =====================================================
-- INFORMACIÓN
-- =====================================================
-- 
-- ✅ Trigger corregido para estudiantes
-- 🎓 Los estudiantes se crean con carrera_id = 8 (Tronco común)
-- 🔄 Pueden cambiar de carrera cuando se inscriban en cursos específicos
-- 
-- =====================================================
